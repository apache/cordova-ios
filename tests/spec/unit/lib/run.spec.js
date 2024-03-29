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

// Requiring lib/run below has some side effects, mainly,
// it ends up pulling in the ios-sim module and requiring the specific macOS
// environment bits that allow for interacting with iOS Simulators. On
// Windows+Linux we are bound to not-have-that.
if (process.platform === 'darwin') {
    const run = require('../../../../lib/run');

    describe('cordova/lib/run', () => {
        describe('--list option', () => {
            beforeEach(() => {
                spyOn(run, 'listDevices').and.returnValue(Promise.resolve());
                spyOn(run, 'listEmulators').and.returnValue(Promise.resolve());
            });
            it('should delegate to listDevices method if `options.device` specified', () => {
                return run.run({ list: true, device: true }).then(() => {
                    expect(run.listDevices).toHaveBeenCalled();
                    expect(run.listEmulators).not.toHaveBeenCalled();
                });
            });
            it('should delegate to listEmulators method if `options.device` specified', () => {
                return run.run({ list: true, emulator: true }).then(() => {
                    expect(run.listDevices).not.toHaveBeenCalled();
                    expect(run.listEmulators).toHaveBeenCalled();
                });
            });
            it('should delegate to both listEmulators and listDevices methods if neither `options.device` nor `options.emulator` are specified', () => {
                return run.run({ list: true }).then(() => {
                    expect(run.listDevices).toHaveBeenCalled();
                    expect(run.listEmulators).toHaveBeenCalled();
                });
            });

            it('should delegate to "listDevices" when the "runListDevices" method options param contains "options.device".', () => {
                return run.runListDevices({ options: { device: true } }).then(() => {
                    expect(run.listDevices).toHaveBeenCalled();
                    expect(run.listEmulators).not.toHaveBeenCalled();
                });
            });

            it('should delegate to "listDevices" when the "runListDevices" method options param contains "options.emulator".', () => {
                return run.runListDevices({ options: { emulator: true } }).then(() => {
                    expect(run.listDevices).not.toHaveBeenCalled();
                    expect(run.listEmulators).toHaveBeenCalled();
                });
            });

            it('should delegate to both "listEmulators" and "listDevices" when the "runListDevices" method does not contain "options.device" or "options.emulator".', () => {
                return run.runListDevices({ options: {} }).then(() => {
                    expect(run.listDevices).toHaveBeenCalled();
                    expect(run.listEmulators).toHaveBeenCalled();
                });
            });
        });
    });
}
