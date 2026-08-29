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

const fs = require('node:fs');
const path = require('node:path');
const childProcess = require('node:child_process');
const devicectl = require('devicectl');

const list_devices = require('../../lib/listDevices');

const sampleData = fs.readFileSync(path.resolve(__dirname, 'fixtures/sample-ioreg-output.txt'), 'utf-8');

const sampleDevicectl = {
    result: {
        devices: [
            {
                deviceProperties: {
                    name: 'test_iPad',
                    osBuildUpdate: '23D127',
                    osVersionNumber: '26.3'
                },
                connectionProperties: {
                    transportType: 'wired'
                },
                hardwareProperties: {
                    deviceType: 'iPad',
                    marketingName: 'iPad mini (6th generation)',
                    platform: 'iOS',
                    productType: 'iPad14,1',
                    thinningProductType: 'iPad14,1',
                    udid: 'IPAD-MINI_UDID'
                },
                identifier: '8F721AAF-DEDC-4D98-9098-AEF2E78DAA36'
            },
            {
                deviceProperties: {
                    name: 'test_iPad2',
                    osBuildUpdate: '23D127',
                    osVersionNumber: '26.3'
                },
                connectionProperties: {
                    transportType: 'localNetwork'
                },
                hardwareProperties: {
                    deviceType: 'iPad',
                    marketingName: 'iPad mini (6th generation)',
                    platform: 'iOS',
                    productType: 'iPad14,1',
                    thinningProductType: 'iPad14,1',
                    udid: 'IPAD_MINI_2_UDID'
                },
                identifier: '4F3355A3-505E-4533-B36A-3DB1C902D1C4'
            }
        ]
    }
};

describe('listDevices', () => {
    describe('run method', () => {
        let spawnMock;
        beforeEach(function () {
            spawnMock = spyOn(childProcess, 'spawnSync');
        });

        it('should trim and split standard output and return as array', () => {
            spawnMock.and.returnValue({ stdout: sampleData });
            spyOn(devicectl, 'list').and.returnValue({ json: sampleDevicectl });

            return list_devices.run()
                .then(results => {
                    expect(spawnMock).toHaveBeenCalledWith('ioreg', ['-p', 'IOUSB', '-l'], { encoding: 'utf8' });

                    expect(results).toEqual([
                        'IPAD-MINI_UDID test_iPad (iPad mini (6th generation), 26.3)',
                        'THE_IPHONE_SERIAL iPhone',
                        'THE_IPAD_SERIAL iPad'
                    ]);
                });
        });
    });
});
