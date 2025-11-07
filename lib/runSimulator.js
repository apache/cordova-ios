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

const path = require('node:path');
const fs = require('node:fs');
const { events } = require('cordova-common');
const bplist = require('bplist-parser');
const plist = require('plist');
const simctl = require('simctl');

const {
    fetchSimCtlList,
    findAvailableRuntimes,
    filterDeviceName,
    fixRuntimeName,
    findRuntimesGroupByDeviceProperty
} = require('./simctlHelper');

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
        if (!availableRuntimes[normalizedRuntimeName]) {
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
        events.emmit('warn', `--devicetypeid was not specified, using first available device: ${device.name}.`);
        return device;
    }

    const [
        deviceTypeRaw = null,
        runtimeRaw = null
    ] = deviceTypeId ? deviceTypeId.split(',') : [];

    const deviceType = (function normalizeDeviceType (dt) {
        const prefix = 'com.apple.CoreSimulator.SimDeviceType.';
        dt = dt.trim();
        return dt.includes(prefix) ? dt : `${prefix}${dt}`;
    })(deviceTypeRaw);

    // Find the devicename from the devicetype
    const foundedDeviceType = list.devicetypes.find(d => d.identifier === deviceType);
    if (!foundedDeviceType) {
        throw new Error(`'Device type "${deviceType}" could not be found.`);
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

        const device = list.devices[deviceGroup].find(device => {
            const deviceName = filterDeviceName(device.name).toLowerCase();
            const targetName = filterDeviceName(deviceName).toLowerCase();
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

module.exports.launch = async function (data) {
    const { appPath, deviceTypeId, logPath } = data;

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

        // log device information
        events.emit('verbose', `device.name: ${device.name}`);
        events.emit('verbose', `device.runtime: ${device.runtime}`);
        events.emit('verbose', `device.id: ${device.id}`);

        // so now we have the deviceid, we can proceed
        const waitForDebugger = false;

        simctl.extensions.start(device.id);
        simctl.install(device.id, appPath);
        simctl.launch(waitForDebugger, device.id, appIdentifier, []);
        simctl.extensions.log(device.id, logPath);

        if (logPath) {
            events.emit('log', `Log Path: ${path.resolve(logPath)}`);
        }

        process.exit(0);
    });
};
