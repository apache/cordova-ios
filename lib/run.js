/*
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

const path = require('path');
const build = require('./build');
const execa = require('execa');
const { CordovaError, events } = require('cordova-common');
const check_reqs = require('./check_reqs');
const fs = require('fs-extra');

/** @returns {Promise<void>} */
module.exports.run = function (runOptions) {
    const projectPath = this.root;

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

    let useDevice = !!runOptions.device;

    return require('./listDevices').run()
        .then(devices => {
            if (devices.length > 0 && !(runOptions.emulator)) {
                useDevice = true;
                // we also explicitly set device flag in options as we pass
                // those parameters to other api (build as an example)
                runOptions.device = true;
                return check_reqs.check_ios_deploy();
            }
        }).then(() => {
            if (!runOptions.nobuild) {
                return build.run(runOptions);
            } else {
                return Promise.resolve();
            }
        }).then(() => build.findXCodeProjectIn(projectPath))
        .then(projectName => {
            let appPath = path.join(projectPath, 'build', 'emulator', `${projectName}.app`);
            const buildOutputDir = path.join(projectPath, 'build', 'device');

            // select command to run and arguments depending whether
            // we're running on device/emulator
            if (useDevice) {
                return module.exports.checkDeviceConnected()
                    .then(() => {
                        // Unpack IPA
                        const ipafile = path.join(buildOutputDir, `${projectName}.ipa`);

                        // unpack the existing platform/ios/build/device/appname.ipa (zipfile), will create a Payload folder
                        return execa('unzip', ['-o', '-qq', ipafile], { cwd: buildOutputDir, stdio: 'inherit' });
                    })
                    .then(() => {
                        // Uncompress IPA (zip file)
                        const appFileInflated = path.join(buildOutputDir, 'Payload', `${projectName}.app`);
                        const appFile = path.join(buildOutputDir, `${projectName}.app`);
                        const payloadFolder = path.join(buildOutputDir, 'Payload');

                        // delete the existing platform/ios/build/device/appname.app
                        fs.removeSync(appFile);
                        // move the platform/ios/build/device/Payload/appname.app to parent
                        fs.moveSync(appFileInflated, appFile);
                        // delete the platform/ios/build/device/Payload folder
                        fs.removeSync(payloadFolder);

                        return null;
                    })
                    .then(
                        () => {
                            appPath = path.join(projectPath, 'build', 'device', `${projectName}.app`);
                            let extraArgs = [];
                            if (runOptions.argv) {
                                // argv.slice(2) removes node and run.js, filterSupportedArgs removes the run.js args
                                extraArgs = module.exports.filterSupportedArgs(runOptions.argv.slice(2));
                            }
                            return module.exports.deployToDevice(appPath, runOptions.target, extraArgs);
                        },
                        // if device connection check failed use emulator then
                        () => module.exports.deployToSim(appPath, runOptions.target)
                    );
            } else {
                return module.exports.deployToSim(appPath, runOptions.target);
            }
        })
        .then(() => {}); // resolve to undefined
};

module.exports.filterSupportedArgs = filterSupportedArgs;
module.exports.checkDeviceConnected = checkDeviceConnected;
module.exports.deployToDevice = deployToDevice;
module.exports.deployToSim = deployToSim;
module.exports.startSim = startSim;
module.exports.listDevices = listDevices;
module.exports.listEmulators = listEmulators;

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
 * Deploy specified app package to ios-sim simulator
 * @param  {String} appPath Path to application package
 * @param  {String} target  Target device type
 * @return {Promise}        Resolves when deploy succeeds otherwise rejects
 */
async function deployToSim (appPath, target) {
    events.emit('log', 'Deploying to simulator');

    if (!target) {
        // Select target device for emulator (preferring iPhone Emulators)
        const emulators = await require('./listEmulatorImages').run();
        const iPhoneEmus = emulators.filter(emulator => emulator.startsWith('iPhone'));
        target = iPhoneEmus.concat(emulators)[0];
        events.emit('log', `No target specified for emulator. Deploying to "${target}" simulator.`);
    }

    return startSim(appPath, target);
}

function startSim (appPath, target) {
    const projectPath = path.join(path.dirname(appPath), '../..');
    const logPath = path.join(projectPath, 'cordova/console.log');
    const deviceTypeId = `com.apple.CoreSimulator.SimDeviceType.${target}`;

    const subprocess = execa(
        require.resolve('ios-sim/bin/ios-sim'),
        ['launch', appPath, '--devicetypeid', deviceTypeId, '--log', logPath, '--exit'],
        { cwd: projectPath }
    );

    // FIXME: data emitted is not necessarily a complete line
    subprocess.stderr.on('data', data => {
        events.emit('error', `[ios-sim] ${data}`);
    });
    subprocess.stdout.on('data', data => {
        events.emit('log', `[ios-sim] ${data}`);
    });

    subprocess.then(() => {
        events.emit('log', 'Simulator successfully started via `ios-sim`.');
    });

    return subprocess;
}

function listDevices () {
    return require('./listDevices').run()
        .then(devices => {
            events.emit('log', 'Available iOS Devices:');
            devices.forEach(device => {
                events.emit('log', `\t${device}`);
            });
        });
}

function listEmulators () {
    return require('./listEmulatorImages').run()
        .then(emulators => {
            events.emit('log', 'Available iOS Simulators:');
            emulators.forEach(emulator => {
                events.emit('log', `\t${emulator}`);
            });
        });
}
