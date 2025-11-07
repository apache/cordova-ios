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

function findAvailableRuntimes (runtimes) {
    const availableRuntimes = {};

    // The key "availability" was renamed to "isAvailable" in newer Xcode versions
    runtimes.forEach(({ name, availability, isAvailable }) => {
        availableRuntimes[name] = availability
            ? availability === '(available)'
            : isAvailable;
    });

    return availableRuntimes;
}

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

            if (!availableOnly || availableRuntimes[normalizedRuntimeName]) {
                runtimes[devicePropertyValue].push(normalizedRuntimeName);
            }
        }
    }

    return runtimes;
}

module.exports = {
    findAvailableRuntimes,
    fetchSimCtlList,
    filterDeviceName,
    fixRuntimeName,
    findRuntimesGroupByDeviceProperty
};
