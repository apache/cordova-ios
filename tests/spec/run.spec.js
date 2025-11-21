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

const path = require('node:path');
const { CordovaError, events } = require('cordova-common');
const build = require('../../lib/build');
const check_reqs = require('../../lib/check_reqs');
const run = require('../../lib/run');
const projectFile = require('../../lib/projectFile');

describe('cordova/lib/run', () => {
    const testProjectPath = path.join('/test', 'project', 'path');

    beforeEach(() => {
        run.root = testProjectPath;
    });

    describe('runListDevices method', () => {
        beforeEach(() => {
            spyOn(events, 'emit');
            spyOn(run, 'execListDevices').and.returnValue(Promise.resolve(['iPhone Xs']));
            spyOn(run, 'execListEmulatorImages').and.returnValue(Promise.resolve(['iPhone 15 Simulator']));
        });

        it('should delegate to "listDevices" when the "runListDevices" method options param contains "options.device".', () => {
            return run.runListDevices({ options: { device: true } }).then(() => {
                expect(run.execListDevices).toHaveBeenCalled();
                expect(run.execListEmulatorImages).not.toHaveBeenCalled();

                expect(events.emit).toHaveBeenCalledWith('log', '\tiPhone Xs');
            });
        });

        it('should delegate to "listEmulators" when the "runListDevices" method options param contains "options.emulator".', () => {
            return run.runListDevices({ options: { emulator: true } }).then(() => {
                expect(run.execListDevices).not.toHaveBeenCalled();
                expect(run.execListEmulatorImages).toHaveBeenCalled();

                expect(events.emit).toHaveBeenCalledWith('log', '\tiPhone 15 Simulator');
            });
        });

        it('should delegate to both "listEmulators" and "listDevices" when the "runListDevices" method does not contain "options.device" or "options.emulator".', () => {
            return run.runListDevices().then(() => {
                expect(run.execListDevices).toHaveBeenCalled();
                expect(run.execListEmulatorImages).toHaveBeenCalled();

                expect(events.emit).toHaveBeenCalledWith('log', '\tiPhone Xs');
                expect(events.emit).toHaveBeenCalledWith('log', '\tiPhone 15 Simulator');
            });
        });
    });

    describe('run method', () => {
        const fakeXcodeProject = {
            xcode: {
                getBuildProperty (n, c, t) {
                    return 'ProjectName';
                }
            }
        };

        beforeEach(() => {
            spyOn(build, 'run').and.returnValue(Promise.resolve());
            spyOn(projectFile, 'parse').and.returnValue(fakeXcodeProject);
            spyOn(run, 'execListDevices').and.resolveTo([]);
            spyOn(run, 'execListEmulatorImages').and.resolveTo([]);
            spyOn(run, 'listDevices').and.resolveTo();
            spyOn(run, 'deployToMac').and.resolveTo();
            spyOn(run, 'deployToSim').and.resolveTo();
            spyOn(run, 'checkDeviceConnected').and.rejectWith(new Error('No Device Connected'));
        });

        describe('--list option', () => {
            beforeEach(() => {
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
        });

        it('should not accept device and emulator options together', () => {
            return expectAsync(run.run({ device: true, emulator: true }))
                .toBeRejectedWithError(CordovaError, 'Only one of "device"/"emulator" options should be specified');
        });

        it('should run on a simulator if --device is not specified and no device is connected', () => {
            return run.run({ }).then(() => {
                expect(run.deployToSim).toHaveBeenCalled();
                expect(build.run).toHaveBeenCalled();
            });
        });

        it('should try to run on a device if --device is not specified and a device is connected', () => {
            spyOn(check_reqs, 'check_ios_deploy');
            run.execListDevices.and.resolveTo(['iPhone 12 Plus']);

            return run.run({ }).then(() => {
                expect(run.checkDeviceConnected).toHaveBeenCalled();
                expect(build.run).toHaveBeenCalledWith(jasmine.objectContaining({ device: true }));
            });
        });

        it('should try to run on a device if --device is specified', () => {
            return run.run({ device: true }).then(() => {
                expect(run.checkDeviceConnected).toHaveBeenCalled();
                expect(build.run).toHaveBeenCalledWith(jasmine.objectContaining({ device: true }));
            });
        });

        it('should not run a build if --noBuild is passed', () => {
            return run.run({ emulator: true, nobuild: true }).then(() => {
                expect(build.run).not.toHaveBeenCalled();
            });
        });

        it('should try to launch the macOS Catalyst app bundle', () => {
            return run.run({ device: true, target: 'mac', release: true }).then(() => {
                expect(run.deployToMac).toHaveBeenCalledWith(path.join(testProjectPath, 'build', 'Release-maccatalyst', 'ProjectName.app'));
            });
        });
    });
});
