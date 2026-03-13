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

const childProcess = require('node:child_process');
const devicectl = require('devicectl');

/**
 * Gets list of available iOS devices for deployment.
 * @return {Promise} Promise fulfilled with list of available iOS devices.
 */
function listDevices () {
    const availableDevices = listFromDeviceCtl();
    const connectedDevices = listFromUSB();

    // We prefer devicectl for newer devices, so filter out any duplicate
    // devices from the ioreg list.
    // Sadly the UDID format is very slightly different between the two...
    const targets = availableDevices.map(d => d.target.replace('-', ''));
    const devices = [].concat(availableDevices, connectedDevices.filter(d => !targets.includes(d.target)));

    return Promise.resolve(devices.map(d => `${d.target} ${d.name}`));
}

function listFromDeviceCtl () {
    const result = devicectl.list().json.result.devices;

    return result
        .filter((d) => d.connectionProperties.transportType === 'wired')
        .map((d) => ({
            target: d.hardwareProperties.udid,
            name: `${d.deviceProperties.name} (${d.hardwareProperties.marketingName}, ${d.deviceProperties.osVersionNumber})`
        }));
}

const DEVICE_REGEX = /-o (iPhone|iPad|iPod)@.*?"USB Serial Number" = "([^"]*)"/gs;
function listFromUSB () {
    const result = childProcess.spawnSync('ioreg', ['-p', 'IOUSB', '-l'], { encoding: 'utf8' });

    return [...result.stdout.matchAll(DEVICE_REGEX)].map((m) => ({
        target: m.pop(),
        name: m.slice(1).reverse().join(' ')
    }));
}

exports.run = listDevices;
