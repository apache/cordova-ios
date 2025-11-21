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

const simctl = require('simctl');
const { events } = require('cordova-common');

const fetchSimCtlList = () => simctl.list().json;

/**
 * Replaces:
 *   - Hyphens in iPad Pro name which differ in "Device Types" and "Devices"
 *   - "ʀ" in "iPhone Xʀ" with "R"
 *
 * @param {string} deviceName
 * @returns {string}
 */
function filterDeviceName (deviceName) {
    if (/^iPad Pro/i.test(deviceName)) {
        return deviceName.replace(/-/g, ' ').trim();
    }

    if (deviceName.includes('ʀ')) {
        return deviceName.replace('ʀ', 'R');
    }

    return deviceName;
}

function fixRuntimeName (runtimeName) {
    // looking for format 'com.apple.CoreSimulator.SimRuntime.iOS-12-0'
    const pattern = /^com\.apple\.CoreSimulator\.SimRuntime\.(([a-zA-Z0-9]+)-(\S+))$/i;
    const match = pattern.exec(runtimeName);

    if (match) {
        const [, , os, version] = match;
        // all or nothing -- os, version will always have a value for match
        return `${os} ${version.replace('-', '.')}`;
    }

    return runtimeName;
}

/**
 * Filters out a list of avaialble runtimes.
 *
 * @param {Array} _ Collection of runtimes
 * @returns {Array}
 */
const findAvailableRuntimes = _ => _.filter(_ => _.isAvailable).map(_ => _.name);

/**
 * Finds and groups runtimes by device property.
 *
 * Example Output:
 * {
 *   "iPhone 6" : [ "iOS 8.2", "iOS 8.3"],
 *   "iPhone 6 Plus" : [ "iOS 8.2", "iOS 8.3"]
 * }
 *
 * @param {object} list
 * @param {string} deviceProperty
 * @param {boolean} availableOnly
 * @param {object} options
 * @returns {object}
 */
function findRuntimesGroupByDeviceProperty (list, deviceProperty, availableOnly, options = {}) {
    const runtimes = {};
    const availableRuntimes = findAvailableRuntimes(list.runtimes);

    for (const [deviceGroup, devices] of Object.entries(list.devices)) {
        // Normalizies the runtime name since deviceGroup can be either namespaced or human-readable.
        const normalizedRuntimeName = fixRuntimeName(deviceGroup);

        for (const device of devices) {
            let devicePropertyValue = device[deviceProperty];

            if (options.lowerCase) {
                devicePropertyValue = devicePropertyValue.toLowerCase();
            }

            if (!runtimes[devicePropertyValue]) {
                runtimes[devicePropertyValue] = [];
            }

            if (!availableOnly || availableRuntimes.includes(normalizedRuntimeName)) {
                runtimes[devicePropertyValue].push(normalizedRuntimeName);
            }
        }
    }

    return runtimes;
}

/**
 * Starts, installs and launches the app onto targeted simulator.
 *
 * @param {object} device
 * @param {object} options
 */
function startSimulator (device, options = {}) {
    if (!device?.id) {
        throw new Error('Missing device ID.');
    }

    if (!options?.appPath) {
        throw new Error('Missing app installation path.');
    }

    if (!options?.appIdentifier) {
        throw new Error('Missing app identifier for launch.');
    }

    if (!options?.logPath) {
        throw new Error('Missing log path for simulator output.');
    }

    events.emit('verbose', `device.name: ${device.name}`);
    events.emit('verbose', `device.runtime: ${device.runtime}`);
    events.emit('verbose', `device.id: ${device.id}`);

    simctl.extensions.start(device.id);
    simctl.install(device.id, options.appPath);
    simctl.launch(device.id, options.appIdentifier, [], {
        waitForDebugger: options?.waitForDebugger ?? false,
        stderr: options.logPath,
        stdout: options.logPath
    });
}

/**
 * Finds the first available device name, udid, and normalized runtime.
 *
 * Example result:
 *  {
 *      name : 'iPhone 6',
 *      id : 'A1193D97-F5EE-468D-9DBA-786F403766E6',
 *      runtime : 'iOS 8.3'
 *  }
 *
 * @param {object} list
 * @returns {object}
 */
function findFirstAvailableDevice (list) {
    const availableRuntimes = findAvailableRuntimes(list.runtimes);

    for (const [deviceGroup, devices] of Object.entries(list.devices)) {
        // Normalizies the runtime name since deviceGroup can be either namespaced or human-readable.
        const normalizedRuntimeName = fixRuntimeName(deviceGroup);

        // Skip when the runtime is not available.
        if (!availableRuntimes.includes(normalizedRuntimeName)) {
            continue;
        }

        const [firstDevice] = devices;
        if (firstDevice) {
            return {
                name: firstDevice.name,
                id: firstDevice.udid,
                runtime: normalizedRuntimeName
            };
        }
    }

    // Nothing was found so returning null values
    return { name: null, id: null, runtime: null };
}

/**
 * Find and return available runtime by device name.
 *
 * @param {object} list
 * @param {string} deviceName
 * @returns
 */
function findAvailableRuntime (list, deviceName) {
    deviceName = deviceName.toLowerCase();

    const allDeviceRuntimes = findRuntimesGroupByDeviceProperty(list, 'name', true, { lowerCase: true });
    const deviceRuntime = allDeviceRuntimes[filterDeviceName(deviceName)] || allDeviceRuntimes[deviceName];
    const foundRuntime = deviceRuntime && deviceRuntime.length > 0;

    if (!foundRuntime) {
        throw new Error(`No available runtimes could be found for "${deviceName}".`);
    }

    // return most modern runtime
    return deviceRuntime.sort().pop();
}

/**
 * Example result:
 *  {
 *      name : 'iPhone 6',
 *      id : 'A1193D97-F5EE-468D-9DBA-786F403766E6',
 *      runtime : 'iOS 8.3'
 *  }
 *
 * @param {string} deviceTypeId
 * @returns {object}
 */
function getDeviceFromDeviceTypeId (deviceTypeId = null) {
    const list = fetchSimCtlList();

    if (!deviceTypeId) {
        const device = findFirstAvailableDevice(list);
        events.emit('warn', `--devicetypeid was not specified, using first available device: ${device.name}.`);
        return device;
    }

    const [
        deviceTypeRaw = null,
        runtimeRaw = null
    ] = deviceTypeId?.split(',') ?? [];

    const deviceType = (function normalizeDeviceType (dt) {
        const prefix = 'com.apple.CoreSimulator.SimDeviceType.';
        dt = dt.trim();
        return dt.includes(prefix) ? dt : `${prefix}${dt}`;
    })(deviceTypeRaw);

    // Find the devicename from the devicetype
    const foundedDeviceType = list.devicetypes.find(d => d.identifier === deviceType);
    if (!foundedDeviceType) {
        throw new Error(`Device type "${deviceType}" could not be found.`);
    }
    const deviceName = foundedDeviceType.name;

    const runtime = (function (rt, deviceName) {
        rt = (rt || findAvailableRuntime(list, deviceName)).trim();
        return rt.includes('iOS') ? rt : `iOS ${rt}`;
    })(runtimeRaw, deviceName);

    // Will try to locate the device id by runtime and device name
    let deviceId = false;

    for (const deviceGroup of Object.keys(list.devices)) {
        const normalizedRuntimeName = fixRuntimeName(deviceGroup);

        // Skip if runtime doesn't match
        if (normalizedRuntimeName !== runtime) {
            continue;
        }

        const targetName = filterDeviceName(deviceName).toLowerCase();
        const device = list.devices[deviceGroup].find(device => {
            const deviceName = filterDeviceName(device.name).toLowerCase();
            return deviceName === targetName;
        });

        if (device) {
            deviceId = device.udid;
            break;
        }
    }

    if (!deviceId) {
        throw new Error(`Device id for device name "${deviceName}" and runtime "${runtime}" could not be found, or is not available.`);
    }

    return { name: deviceName, id: deviceId, runtime };
}

module.exports = {
    fetchSimCtlList,
    filterDeviceName,
    findRuntimesGroupByDeviceProperty,
    startSimulator,
    getDeviceFromDeviceTypeId
};
