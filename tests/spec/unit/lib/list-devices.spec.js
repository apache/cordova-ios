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

const fs = require('fs-extra');
const path = require('path');
const execa = require('execa');
const list_devices = require('../../../../bin/templates/scripts/cordova/lib/listDevices');

const sampleData = fs.readFileSync(path.resolve(__dirname, '../fixtures/sample-ioreg-output.txt'), 'utf-8');

describe('cordova/lib/listDevices', () => {
    describe('run method', () => {
        beforeEach(() => {
            spyOn(execa, 'command').and.returnValue(Promise.resolve({ stdout: sampleData }));
        });

        it('should trim and split standard output and return as array', () => {
            return list_devices.run()
                .then(results => {
                    expect(execa.command).toHaveBeenCalledWith('ioreg -p IOUSB -l');
                    expect(results.includes('THE_IPHONE_SERIAL iPhone')).toBe(true);
                    expect(results.includes('THE_IPAD_SERIAL iPad')).toBe(true);
                });
        });
    });
});
