/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

const path = require('path');
const which = require('which');
const execa = require('execa');
const { CordovaError, events } = require('cordova-common');
const fs = require('fs-extra');
const plist = require('plist');
const util = require('util');

const check_reqs = require('./check_reqs');
const projectFile = require('./projectFile');

const buildConfigProperties = [
    'codeSignIdentity',
    'provisioningProfile',
    'developmentTeam',
    'packageType',
    'buildFlag',
    'iCloudContainerEnvironment',
    'automaticProvisioning',
    'authenticationKeyPath',
    'authenticationKeyID',
    'authenticationKeyIssuerID'
];

// These are regular expressions to detect if the user is changing any of the built-in xcodebuildArgs
/* eslint-disable no-useless-escape */
const buildFlagMatchers = {
    workspace: /^\-workspace\s*(.*)/,
    scheme: /^\-scheme\s*(.*)/,
    configuration: /^\-configuration\s*(.*)/,
    sdk: /^\-sdk\s*(.*)/,
    destination: /^\-destination\s*(.*)/,
    archivePath: /^\-archivePath\s*(.*)/,
    configuration_build_dir: /^(CONFIGURATION_BUILD_DIR=.*)/,
    shared_precomps_dir: /^(SHARED_PRECOMPS_DIR=.*)/
};
/* eslint-enable no-useless-escape */

/**
 * Creates a project object (see projectFile.js/parseProjectFile) from
 * a project path and name
 *
 * @param {*} projectPath
 * @param {*} projectName
 */
function createProjectObject (projectPath, projectName) {
    const locations = {
        root: projectPath,
        pbxproj: path.join(projectPath, `${projectName}.xcodeproj`, 'project.pbxproj')
    };

    return projectFile.parse(locations);
}

/**
 * Returns a promise that resolves to the default simulator target; the logic here
 * matches what `cordova emulate ios` does.
 *
 * The return object has two properties: `name` (the Xcode destination name),
 * `identifier` (the simctl identifier), and `simIdentifier` (essentially the cordova emulate target)
 *
 * @return {Promise}
 */
function getDefaultSimulatorTarget () {
    events.emit('log', 'Select last emulator from list as default.');
    return require('./listEmulatorBuildTargets').run()
        .then(emulators => {
            let targetEmulator;
            if (emulators.length > 0) {
                targetEmulator = emulators[0];
            }
            emulators.forEach(emulator => {
                if (emulator.name.indexOf('iPhone') === 0) {
                    targetEmulator = emulator;
                }
            });
            return targetEmulator;
        });
}

/** @returns {Promise<void>} */
module.exports.run = function (buildOpts) {
    const projectPath = this.root;
    let emulatorTarget = '';
    let projectName = '';

    buildOpts = buildOpts || {};

    if (buildOpts.debug && buildOpts.release) {
        return Promise.reject(new CordovaError('Cannot specify "debug" and "release" options together.'));
    }

    if (buildOpts.device && buildOpts.emulator) {
        return Promise.reject(new CordovaError('Cannot specify "device" and "emulator" options together.'));
    }

    if (buildOpts.buildConfig) {
        if (!fs.existsSync(buildOpts.buildConfig)) {
            return Promise.reject(new CordovaError(`Build config file does not exist: ${buildOpts.buildConfig}`));
        }
        events.emit('log', `Reading build config file: ${path.resolve(buildOpts.buildConfig)}`);
        const contents = fs.readFileSync(buildOpts.buildConfig, 'utf-8');
        const buildConfig = JSON.parse(contents.replace(/^\ufeff/, '')); // Remove BOM
        if (buildConfig.ios) {
            const buildType = buildOpts.release ? 'release' : 'debug';
            const config = buildConfig.ios[buildType];
            if (config) {
                buildConfigProperties.forEach(key => {
                    buildOpts[key] = buildOpts[key] || config[key];
                });
            }
        }
    }

    return require('./listDevices').run()
        .then(devices => {
            if (devices.length > 0 && !(buildOpts.emulator)) {
                // we also explicitly set device flag in options as we pass
                // those parameters to other api (build as an example)
                buildOpts.device = true;
                return check_reqs.check_ios_deploy();
            }
        }).then(() => {
            // CB-12287: Determine the device we should target when building for a simulator
            if (!buildOpts.device) {
                let newTarget = buildOpts.target || '';

                if (newTarget) {
                    // only grab the device name, not the runtime specifier
                    newTarget = newTarget.split(',')[0];
                }
                // a target was given to us, find the matching Xcode destination name
                const promise = require('./listEmulatorBuildTargets').targetForSimIdentifier(newTarget);
                return promise.then(theTarget => {
                    if (!theTarget) {
                        return getDefaultSimulatorTarget().then(defaultTarget => {
                            emulatorTarget = defaultTarget.name;
                            events.emit('warn', `No simulator found for "${newTarget}. Falling back to the default target.`);
                            events.emit('log', `Building for "${emulatorTarget}" Simulator (${defaultTarget.identifier}, ${defaultTarget.simIdentifier}).`);
                            return emulatorTarget;
                        });
                    } else {
                        emulatorTarget = theTarget.name;
                        events.emit('log', `Building for "${emulatorTarget}" Simulator (${theTarget.identifier}, ${theTarget.simIdentifier}).`);
                        return emulatorTarget;
                    }
                });
            }
        })
        .then(() => check_reqs.run())
        .then(() => findXCodeProjectIn(projectPath))
        .then(name => {
            projectName = name;
            let extraConfig = '';
            if (buildOpts.codeSignIdentity) {
                extraConfig += `CODE_SIGN_IDENTITY = ${buildOpts.codeSignIdentity}\n`;
                extraConfig += `CODE_SIGN_IDENTITY[sdk=iphoneos*] = ${buildOpts.codeSignIdentity}\n`;
            }
            if (buildOpts.provisioningProfile) {
                if (typeof buildOpts.provisioningProfile === 'string') {
                    extraConfig += `PROVISIONING_PROFILE = ${buildOpts.provisioningProfile}\n`;
                } else {
                    const keys = Object.keys(buildOpts.provisioningProfile);
                    extraConfig += `PROVISIONING_PROFILE = ${buildOpts.provisioningProfile[keys[0]]}\n`;
                }
            }
            if (buildOpts.developmentTeam) {
                extraConfig += `DEVELOPMENT_TEAM = ${buildOpts.developmentTeam}\n`;
            }

            function writeCodeSignStyle (value) {
                const project = createProjectObject(projectPath, projectName);

                events.emit('verbose', `Set CODE_SIGN_STYLE Build Property to ${value}.`);
                project.xcode.updateBuildProperty('CODE_SIGN_STYLE', value);
                events.emit('verbose', `Set ProvisioningStyle Target Attribute to ${value}.`);
                project.xcode.addTargetAttribute('ProvisioningStyle', value);

                project.write();
            }

            if (buildOpts.provisioningProfile) {
                events.emit('verbose', 'ProvisioningProfile build option set, changing project settings to Manual.');
                writeCodeSignStyle('Manual');
            } else if (buildOpts.automaticProvisioning) {
                events.emit('verbose', 'ProvisioningProfile build option NOT set, changing project settings to Automatic.');
                writeCodeSignStyle('Automatic');
            }

            return fs.writeFile(path.join(projectPath, 'cordova/build-extras.xcconfig'), extraConfig, 'utf-8');
        }).then(() => {
            const configuration = buildOpts.release ? 'Release' : 'Debug';

            events.emit('log', `Building project: ${path.join(projectPath, `${projectName}.xcworkspace`)}`);
            events.emit('log', `\tConfiguration: ${configuration}`);
            events.emit('log', `\tPlatform: ${buildOpts.device ? 'device' : 'emulator'}`);
            events.emit('log', `\tTarget: ${emulatorTarget}`);

            const buildOutputDir = path.join(projectPath, 'build', `${configuration}-${(buildOpts.device ? 'iphoneos' : 'iphonesimulator')}`);

            // remove the build output folder before building
            fs.removeSync(buildOutputDir);

            const xcodebuildArgs = getXcodeBuildArgs(projectName, projectPath, configuration, emulatorTarget, buildOpts);
            return execa('xcodebuild', xcodebuildArgs, { cwd: projectPath, stdio: 'inherit' });
        }).then(() => {
            if (!buildOpts.device || buildOpts.noSign) {
                return;
            }

            const project = createProjectObject(projectPath, projectName);
            const bundleIdentifier = project.getPackageName();
            const exportOptions = { ...buildOpts.exportOptions, compileBitcode: false, method: 'development' };

            if (buildOpts.packageType) {
                exportOptions.method = buildOpts.packageType;
            }

            if (buildOpts.iCloudContainerEnvironment) {
                exportOptions.iCloudContainerEnvironment = buildOpts.iCloudContainerEnvironment;
            }

            if (buildOpts.developmentTeam) {
                exportOptions.teamID = buildOpts.developmentTeam;
            }

            if (buildOpts.provisioningProfile && bundleIdentifier) {
                if (typeof buildOpts.provisioningProfile === 'string') {
                    exportOptions.provisioningProfiles = { [bundleIdentifier]: String(buildOpts.provisioningProfile) };
                } else {
                    events.emit('log', 'Setting multiple provisioning profiles for signing');
                    exportOptions.provisioningProfiles = buildOpts.provisioningProfile;
                }
                exportOptions.signingStyle = 'manual';
            }

            if (buildOpts.codeSignIdentity) {
                exportOptions.signingCertificate = buildOpts.codeSignIdentity;
            }

            const exportOptionsPlist = plist.build(exportOptions);
            const exportOptionsPath = path.join(projectPath, 'exportOptions.plist');

            const configuration = buildOpts.release ? 'Release' : 'Debug';
            const buildOutputDir = path.join(projectPath, 'build', `${configuration}-iphoneos`);

            function checkSystemRuby () {
                const ruby_cmd = which.sync('ruby', { nothrow: true });

                if (ruby_cmd !== '/usr/bin/ruby') {
                    events.emit('warn', 'Non-system Ruby in use. This may cause packaging to fail.\n' +
                  'If you use RVM, please run `rvm use system`.\n' +
                  'If you use chruby, please run `chruby system`.');
                }
            }

            function packageArchive () {
                const xcodearchiveArgs = getXcodeArchiveArgs(projectName, projectPath, buildOutputDir, exportOptionsPath, buildOpts);
                return execa('xcodebuild', xcodearchiveArgs, { cwd: projectPath, stdio: 'inherit' });
            }

            return fs.writeFile(exportOptionsPath, exportOptionsPlist, 'utf-8')
                .then(checkSystemRuby)
                .then(packageArchive);
        })
        .then(() => {}); // resolve to undefined
};

/**
 * Searches for first XCode project in specified folder
 * @param  {String} projectPath Path where to search project
 * @return {Promise}            Promise either fulfilled with project name or rejected
 */
function findXCodeProjectIn (projectPath) {
    // 'Searching for Xcode project in ' + projectPath);
    const xcodeProjFiles = fs.readdirSync(projectPath).filter(name => path.extname(name) === '.xcodeproj');

    if (xcodeProjFiles.length === 0) {
        return Promise.reject(new CordovaError(`No Xcode project found in ${projectPath}`));
    }
    if (xcodeProjFiles.length > 1) {
        events.emit('warn', `Found multiple .xcodeproj directories in \n${projectPath}\nUsing first one`);
    }

    const projectName = path.basename(xcodeProjFiles[0], '.xcodeproj');
    return Promise.resolve(projectName);
}

module.exports.findXCodeProjectIn = findXCodeProjectIn;

/**
 * Returns array of arguments for xcodebuild
 * @param  {String}  projectName    Name of xcode project
 * @param  {String}  projectPath    Path to project file. Will be used to set CWD for xcodebuild
 * @param  {String}  configuration  Configuration name: debug|release
 * @param  {String}  emulatorTarget Target for emulator (rather than default)
 * @param  {Object}  buildConfig    The build configuration options
 * @return {Array}                  Array of arguments that could be passed directly to spawn method
 */
function getXcodeBuildArgs (projectName, projectPath, configuration, emulatorTarget, buildConfig = {}) {
    let options;
    let buildActions;
    let settings;
    const buildFlags = buildConfig.buildFlag;
    const customArgs = {};
    customArgs.otherFlags = [];

    if (buildFlags) {
        if (typeof buildFlags === 'string' || buildFlags instanceof String) {
            parseBuildFlag(buildFlags, customArgs);
        } else { // buildFlags is an Array of strings
            buildFlags.forEach(flag => {
                parseBuildFlag(flag, customArgs);
            });
        }
    }

    if (buildConfig.device) {
        options = [
            '-workspace', customArgs.workspace || `${projectName}.xcworkspace`,
            '-scheme', customArgs.scheme || projectName,
            '-configuration', customArgs.configuration || configuration,
            '-destination', customArgs.destination || 'generic/platform=iOS',
            '-archivePath', customArgs.archivePath || `${projectName}.xcarchive`
        ];
        buildActions = ['archive'];
        settings = [];

        if (customArgs.configuration_build_dir) {
            settings.push(customArgs.configuration_build_dir);
        }

        if (customArgs.shared_precomps_dir) {
            settings.push(customArgs.shared_precomps_dir);
        }

        // Add other matched flags to otherFlags to let xcodebuild present an appropriate error.
        // This is preferable to just ignoring the flags that the user has passed in.
        if (customArgs.sdk) {
            customArgs.otherFlags = customArgs.otherFlags.concat(['-sdk', customArgs.sdk]);
        }

        if (buildConfig.automaticProvisioning) {
            options.push('-allowProvisioningUpdates');
        }
        if (buildConfig.authenticationKeyPath) {
            options.push('-authenticationKeyPath', buildConfig.authenticationKeyPath);
        }
        if (buildConfig.authenticationKeyID) {
            options.push('-authenticationKeyID', buildConfig.authenticationKeyID);
        }
        if (buildConfig.authenticationKeyIssuerID) {
            options.push('-authenticationKeyIssuerID', buildConfig.authenticationKeyIssuerID);
        }
    } else { // emulator
        options = [
            '-workspace', customArgs.workspace || `${projectName}.xcworkspace`,
            '-scheme', customArgs.scheme || projectName,
            '-configuration', customArgs.configuration || configuration,
            '-sdk', customArgs.sdk || 'iphonesimulator',
            '-destination', customArgs.destination || `platform=iOS Simulator,name=${emulatorTarget}`
        ];
        buildActions = ['build'];
        settings = [`SYMROOT=${path.join(projectPath, 'build')}`];

        if (customArgs.configuration_build_dir) {
            settings.push(customArgs.configuration_build_dir);
        }

        if (customArgs.shared_precomps_dir) {
            settings.push(customArgs.shared_precomps_dir);
        }

        // Add other matched flags to otherFlags to let xcodebuild present an appropriate error.
        // This is preferable to just ignoring the flags that the user has passed in.
        if (customArgs.archivePath) {
            customArgs.otherFlags = customArgs.otherFlags.concat(['-archivePath', customArgs.archivePath]);
        }
    }

    return options.concat(buildActions).concat(settings).concat(customArgs.otherFlags);
}

/**
 * Returns array of arguments for xcodebuild
 * @param  {String}  projectName        Name of xcode project
 * @param  {String}  projectPath        Path to project file. Will be used to set CWD for xcodebuild
 * @param  {String}  outputPath         Output directory to contain the IPA
 * @param  {String}  exportOptionsPath  Path to the exportOptions.plist file
 * @param  {Object}  buildConfig        Build configuration options
 * @return {Array}                      Array of arguments that could be passed directly to spawn method
 */
function getXcodeArchiveArgs (projectName, projectPath, outputPath, exportOptionsPath, buildConfig = {}) {
    const options = [];

    if (buildConfig.automaticProvisioning) {
        options.push('-allowProvisioningUpdates');
    }
    if (buildConfig.authenticationKeyPath) {
        options.push('-authenticationKeyPath', buildConfig.authenticationKeyPath);
    }
    if (buildConfig.authenticationKeyID) {
        options.push('-authenticationKeyID', buildConfig.authenticationKeyID);
    }
    if (buildConfig.authenticationKeyIssuerID) {
        options.push('-authenticationKeyIssuerID', buildConfig.authenticationKeyIssuerID);
    }

    return [
        '-exportArchive',
        '-archivePath', `${projectName}.xcarchive`,
        '-exportOptionsPlist', exportOptionsPath,
        '-exportPath', outputPath
    ].concat(options);
}

function parseBuildFlag (buildFlag, args) {
    let matched;
    for (const key in buildFlagMatchers) {
        const found = buildFlag.match(buildFlagMatchers[key]);
        if (found) {
            matched = true;
            // found[0] is the whole match, found[1] is the first match in parentheses.
            args[key] = found[1];
            events.emit('warn', util.format('Overriding xcodebuildArg: %s', buildFlag));
        }
    }

    if (!matched) {
        // If the flag starts with a '-' then it is an xcodebuild built-in option or a
        // user-defined setting. The regex makes sure that we don't split a user-defined
        // setting that is wrapped in quotes.
        /* eslint-disable no-useless-escape */
        if (buildFlag[0] === '-' && !buildFlag.match(/^.*=(\".*\")|(\'.*\')$/)) {
            args.otherFlags = args.otherFlags.concat(buildFlag.split(' '));
            events.emit('warn', util.format('Adding xcodebuildArg: %s', buildFlag.split(' ')));
        } else {
            args.otherFlags.push(buildFlag);
            events.emit('warn', util.format('Adding xcodebuildArg: %s', buildFlag));
        }
    }
}
