/**
    Licensed to the Apache Software Foundation (ASF) under one
    or more contributor license agreements.  See the NOTICE file
    distributed with this work for additional information
    regarding copyright ownership.  The ASF licenses this file
    to you under the Apache License, Version 2.0 (the
    "License"); you may not use this file except in compliance
    with the License.  You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing,
    software distributed under the License is distributed on an
    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, either express or implied.  See the License for the
    specific language governing permissions and limitations
    under the License.
*/

const fs = require('node:fs');
const path = require('node:path');
const bplist = require('bplist-parser');
const plist = require('plist');
const execa = require('execa');
const { CordovaError, events } = require('cordova-common');
const build = require('./build');
const check_reqs = require('./check_reqs');
const projectFile = require('./projectFile');

const {
    getDeviceFromDeviceTypeId,
    startSimulator
} = require('./simctlHelper');

/** @returns {Promise<void>} */
module.exports.run = function (runOptions) {
    const projectPath = this.root;
    const locations = this.locations;

    // Validate args
    if (runOptions.device && runOptions.emulator) {
        return Promise.reject(new CordovaError('Only one of "device"/"emulator" options should be specified'));
    }

    // support for CB-8168 `cordova/run --list`
    if (runOptions.list) {
        if (runOptions.device) return module.exports.listDevices();
        if (runOptions.emulator) return module.exports.listEmulators();
        // if no --device or --emulator flag is specified, list both devices and emulators
        return module.exports.listDevices().then(() => module.exports.listEmulators());
    }

    const useCatalyst = runOptions.target && runOptions.target.match(/mac/i);
    let useDevice = !!runOptions.device && !useCatalyst;
    const configuration = runOptions.release ? 'Release' : 'Debug';

    return Promise.resolve()
        .then(() => {
            if (!runOptions.emulator && !useCatalyst) {
                return module.exports.execListDevices().then(devices => {
                    if (devices.length > 0) {
                        useDevice = true;

                        // we also explicitly set device flag in options as we pass
                        // those parameters to other api (build as an example)
                        runOptions.device = true;
                        return check_reqs.check_ios_deploy();
                    }
                });
            }
        })
        .then(() => {
            if (!runOptions.nobuild) {
                return build.run.call(this, runOptions);
            }
        })
        .then(() => {
            try {
                const project = projectFile.parse(locations);

                return project.xcode.getBuildProperty('PRODUCT_NAME', undefined, 'App').replace(/^"/, '').replace(/"$/, '');
            } catch (err) {
                return Promise.reject(new CordovaError(`Could not parse ${locations.pbxproj}: ${err}`));
            }
        })
        .then(productName => {
            // select command to run and arguments depending whether
            // we're running on device/catalyst/emulator
            if (useDevice) {
                const buildOutputDir = path.join(projectPath, 'build', `${configuration}-iphoneos`);
                const appPath = path.join(buildOutputDir, `${productName}.app`);

                return module.exports.checkDeviceConnected()
                    .then(() => {
                        // Unpack IPA
                        const ipafile = path.join(buildOutputDir, `${productName}.ipa`);

                        // unpack the existing platform/ios/build/device/appname.ipa (zipfile), will create a Payload folder
                        return execa('unzip', ['-o', '-qq', ipafile], { cwd: buildOutputDir, stdio: 'inherit' });
                    })
                    .then(() => {
                        // Uncompress IPA (zip file)
                        const appFileInflated = path.join(buildOutputDir, 'Payload', `${productName}.app`);
                        const payloadFolder = path.join(buildOutputDir, 'Payload');

                        // delete the existing platform/ios/build/device/appname.app
                        fs.rmSync(appPath, { recursive: true, force: true });
                        // move the platform/ios/build/device/Payload/appname.app to parent
                        fs.renameSync(appFileInflated, appPath);
                        // delete the platform/ios/build/device/Payload folder
                        fs.rmSync(payloadFolder, { recursive: true, force: true });

                        return null;
                    })
                    .then(
                        () => {
                            let extraArgs = [];
                            if (runOptions.argv) {
                                // argv.slice(2) removes node and run.js, filterSupportedArgs removes the run.js args
                                extraArgs = module.exports.filterSupportedArgs(runOptions.argv.slice(2));
                            }
                            return module.exports.deployToDevice(appPath, runOptions.target, extraArgs);
                        },
                        // if device connection check failed use emulator then
                        // This might fail due to being the wrong type of app bundle
                        () => module.exports.deployToSim(appPath, runOptions.target)
                    );
            } else if (useCatalyst) {
                const appPath = path.join(projectPath, 'build', `${configuration}-maccatalyst`, `${productName}.app`);
                return module.exports.deployToMac(appPath);
            } else {
                const appPath = path.join(projectPath, 'build', `${configuration}-iphonesimulator`, `${productName}.app`);
                return module.exports.deployToSim(appPath, runOptions.target);
            }
        })
        .then(() => {}); // resolve to undefined
};

module.exports.filterSupportedArgs = filterSupportedArgs;
module.exports.checkDeviceConnected = checkDeviceConnected;
module.exports.deployToDevice = deployToDevice;
module.exports.deployToMac = deployToMac;
module.exports.deployToSim = deployToSim;
module.exports.startSim = startSim;
module.exports.listDevices = listDevices;
module.exports.listEmulators = listEmulators;
module.exports.execListDevices = execListDevices;
module.exports.execListEmulatorImages = execListEmulatorImages;

/**
 * Filters the args array and removes supported args for the 'run' command.
 *
 * @return {Array} array with unsupported args for the 'run' command
 */
function filterSupportedArgs (args) {
    const filtered = [];
    const sargs = ['--device', '--emulator', '--nobuild', '--list', '--target', '--debug', '--release'];
    const re = new RegExp(sargs.join('|'));

    args.forEach(element => {
        // supported args not found, we add
        // we do a regex search because --target can be "--target=XXX"
        if (element.search(re) === -1) {
            filtered.push(element);
        }
    }, this);

    return filtered;
}

/**
 * Checks if any iOS device is connected
 * @return {Promise} Fullfilled when any device is connected, rejected otherwise
 */
function checkDeviceConnected () {
    return execa('ios-deploy', ['-c', '-t', '1'], { stdio: 'inherit' });
}

/**
 * Deploy specified app package to connected device
 * using ios-deploy command
 * @param  {String} appPath Path to application package
 * @return {Promise}        Resolves when deploy succeeds otherwise rejects
 */
function deployToDevice (appPath, target, extraArgs) {
    events.emit('log', 'Deploying to device');
    const args = ['--justlaunch', '-d', '-b', appPath];
    if (target) {
        args.push('-i', target);
    } else {
        args.push('--no-wifi');
    }
    return execa('ios-deploy', args.concat(extraArgs), { stdio: 'inherit' });
}

/**
 * Runs specified app package on the local macOS system.
 * @param  {String} appPath Path to application package
 * @return {Promise}        Resolves when deploy succeeds otherwise rejects
 */
function deployToMac (appPath) {
    events.emit('log', 'Deploying to local macOS system');
    return execa('open', [appPath], { stdio: 'inherit' });
}

/**
 * Deploy specified app package to simctl simulator
 * @param  {String} appPath Path to application package
 * @param  {String} target  Target device type
 * @return {Promise}        Resolves when deploy succeeds otherwise rejects
 */
async function deployToSim (appPath, target) {
    events.emit('log', 'Deploying to simulator');

    if (!target) {
        // Select target device for emulator (preferring iPhone Emulators)
        const emulators = await module.exports.execListEmulatorImages();
        const iPhoneEmus = emulators.filter(emulator => emulator.startsWith('iPhone'));
        target = iPhoneEmus.concat(emulators)[0];
        events.emit('log', `No target specified for emulator. Deploying to "${target}" simulator.`);
    }

    return module.exports.startSim(appPath, target);
}

async function startSim (appPath, target) {
    const projectPath = path.join(path.dirname(appPath), '../..');
    const logPath = path.join(projectPath, 'cordova/console.log');
    const deviceTypeId = `com.apple.CoreSimulator.SimDeviceType.${target}`;

    try {
        const infoPlistPath = path.join(appPath, 'Info.plist');
        if (!fs.existsSync(infoPlistPath)) {
            throw new Error(`${infoPlistPath} file not found.`);
        }

        bplist.parseFile(infoPlistPath, function (err, obj) {
            let appIdentifier;

            if (err) {
                obj = plist.parse(fs.readFileSync(infoPlistPath, 'utf8'));
                if (obj) {
                    appIdentifier = obj.CFBundleIdentifier;
                } else {
                    throw err;
                }
            } else {
                appIdentifier = obj[0].CFBundleIdentifier;
            }

            // get the deviceid from --devicetypeid
            // --devicetypeid is a string in the form "devicetype, runtime_version" (optional: runtime_version)
            const device = getDeviceFromDeviceTypeId(deviceTypeId);

            // so now we have the deviceid, we can proceed
            try {
                startSimulator(device, { appPath, appIdentifier, logPath, waitForDebugger: false });
            } catch (e) {
                events.emit('warn', `Failed to start simulator with error: "${e.message}"`);
            }

            if (logPath) {
                events.emit('log', `Log Path: ${path.resolve(logPath)}`);
            }

            process.exit(0);
        });
    } catch (e) {
        events.emit('warn', `Failed to launch simulator with error: ${e.message}`);
        process.exit(1);
    }
}

/* istanbul ignore next */
function execListDevices () {
    return require('./listDevices').run();
}

/* istanbul ignore next */
function execListEmulatorImages () {
    return require('./listEmulatorImages').run();
}

function listDevices () {
    return module.exports.execListDevices()
        .then(devices => {
            events.emit('log', 'Available iOS Devices:');
            devices.forEach(device => {
                events.emit('log', `\t${device}`);
            });
        });
}

function listEmulators () {
    return module.exports.execListEmulatorImages()
        .then(emulators => {
            events.emit('log', 'Available iOS Simulators:');
            emulators.forEach(emulator => {
                events.emit('log', `\t${emulator}`);
            });
        });
}

module.exports.runListDevices = async function (options = {}) {
    const { options: cliArgs = {} } = options;

    if (cliArgs?.device) {
        await module.exports.listDevices.call(this);
    } else if (cliArgs?.emulator) {
        await module.exports.listEmulators.call(this);
    } else {
        await module.exports.listDevices.call(this);
        await module.exports.listEmulators.call(this);
    }

    return true;
};
