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

const {
    fetchSimCtlList,
    filterDeviceName,
    findRuntimesGroupByDeviceProperty
} = require('./simctlHelper');

/**
 * Returns a list of devices available for simulation
 *
 * @return {Promise}
 */
module.exports.run = async function () {
    const list = fetchSimCtlList();
    const deviceRuntimes = findRuntimesGroupByDeviceProperty(list, 'name', true, { lowerCase: true });
    const nameIdMap = {};

    for (const device of list.devicetypes) {
        nameIdMap[filterDeviceName(device.name).toLowerCase()] = device.identifier;
    }

    const results = [];

    /**
     * Removes "iOS" prefix from runtime.
     * Removes "com.apple.CoreSimulator.SimDeviceType." prefix from id.
     *
     * @param {string} devicename
     * @param {string} runtime
     */
    const remove = function (devicename, runtime) {
        const formattedId = nameIdMap[devicename].replace(/^com.apple.CoreSimulator.SimDeviceType./, '');
        const formattedRuntime = runtime.replace(/^iOS /, '');
        results.push(`${formattedId}, ${formattedRuntime}`);
    };

    for (const [deviceName, runtimes] of Object.entries(deviceRuntimes)) {
        const formattedDeviceName = filterDeviceName(deviceName).toLowerCase();

        if (!nameIdMap[formattedDeviceName]) {
            continue;
        }

        runtimes.forEach(runtime => remove(formattedDeviceName, runtime));
    }

    return results;
};
