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

const execa = require('execa');

/**
 * Gets list of connected iOS devices
 * @return {Promise} Promise fulfilled with list of available iOS devices
 */
function listDevices () {
    return execa.command('ioreg -p IOUSB -l')
        .then(({ stdout }) => {
            const deviceTypes = ['iPhone', 'iPad', 'iPod'];
            const detectedDevices = [];
            let targetDeviceType = null;

            stdout.split('\n').forEach(line => {
                if (!targetDeviceType) {
                    const detectedDevice = deviceTypes.filter(deviceType => line.includes(`-o ${deviceType}`));

                    if (detectedDevice.length) {
                        targetDeviceType = detectedDevice[0];
                    }
                } else if (targetDeviceType && line.includes('USB Serial Number')) {
                    const reuslt = line.match(/"USB Serial Number" = "(.*)"/);

                    if (reuslt && !detectedDevices.includes(reuslt[1])) {
                        detectedDevices.push(`${reuslt[1]} ${targetDeviceType}`);
                    }

                    targetDeviceType = null;
                }
            });

            return detectedDevices;
        });
}

exports.run = listDevices;
