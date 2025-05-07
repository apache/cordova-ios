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
const rewire = require('rewire');

const list_devices = rewire('../../../../lib/listDevices');

const sampleData = fs.readFileSync(path.resolve(__dirname, '../fixtures/sample-ioreg-output.txt'), 'utf-8');

describe('cordova/lib/listDevices', () => {
    describe('run method', () => {
        let execaSpy;

        beforeEach(() => {
            execaSpy = jasmine.createSpy('execa').and.resolveTo({ stdout: sampleData });
            list_devices.__set__('execa', execaSpy);
        });

        it('should trim and split standard output and return as array', () => {
            return list_devices.run()
                .then(results => {
                    expect(execaSpy).toHaveBeenCalledWith('ioreg', ['-p', 'IOUSB', '-l']);
                    expect(results).toEqual([
                        'THE_IPHONE_SERIAL iPhone',
                        'THE_IPAD_SERIAL iPad'
                    ]);
                });
        });
    });
});
