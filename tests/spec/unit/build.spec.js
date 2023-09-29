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

const path = require('path');
const fs = require('fs-extra');
const rewire = require('rewire');
const { CordovaError, events } = require('cordova-common');
const build = rewire('../../../lib/build');

describe('build', () => {
    const testProjectPath = path.join('/test', 'project', 'path');

    describe('getXcodeBuildArgs method', () => {
        const getXcodeBuildArgs = build.__get__('getXcodeBuildArgs');
        build.__set__('__dirname', path.join('/test', 'dir'));

        it('should generate appropriate args if a single buildFlag is passed in', () => {
            const args = getXcodeBuildArgs('TestProjectName', testProjectPath, 'TestConfiguration', '', { device: true, buildFlag: '' });
            expect(args).toEqual([
                '-workspace',
                'TestProjectName.xcworkspace',
                '-scheme',
                'TestProjectName',
                '-configuration',
                'TestConfiguration',
                '-destination',
                'generic/platform=iOS',
                '-archivePath',
                'TestProjectName.xcarchive',
                'archive'
            ]);
            expect(args.length).toEqual(11);
        });

        it('should generate appropriate args if buildFlags are passed in', () => {
            const buildFlags = [
                '-workspace TestWorkspaceFlag',
                '-scheme TestSchemeFlag',
                '-configuration TestConfigurationFlag',
                '-destination TestDestinationFlag',
                '-archivePath TestArchivePathFlag',
                'CONFIGURATION_BUILD_DIR=TestConfigBuildDirFlag',
                'SHARED_PRECOMPS_DIR=TestSharedPrecompsDirFlag'
            ];

            const args = getXcodeBuildArgs('TestProjectName', testProjectPath, 'TestConfiguration', '', { device: true, buildFlag: buildFlags });
            expect(args).toEqual([
                '-workspace',
                'TestWorkspaceFlag',
                '-scheme',
                'TestSchemeFlag',
                '-configuration',
                'TestConfigurationFlag',
                '-destination',
                'TestDestinationFlag',
                '-archivePath',
                'TestArchivePathFlag',
                'archive',
                'CONFIGURATION_BUILD_DIR=TestConfigBuildDirFlag',
                'SHARED_PRECOMPS_DIR=TestSharedPrecompsDirFlag'
            ]);
            expect(args.length).toEqual(13);
        });

        it('should generate appropriate args for device', () => {
            const args = getXcodeBuildArgs('TestProjectName', testProjectPath, 'TestConfiguration', '', { device: true });
            expect(args).toEqual([
                '-workspace',
                'TestProjectName.xcworkspace',
                '-scheme',
                'TestProjectName',
                '-configuration',
                'TestConfiguration',
                '-destination',
                'generic/platform=iOS',
                '-archivePath',
                'TestProjectName.xcarchive',
                'archive'
            ]);
            expect(args.length).toEqual(11);
        });

        it('should generate appropriate args for simulator', () => {
            const args = getXcodeBuildArgs('TestProjectName', testProjectPath, 'TestConfiguration', 'iPhone 5s', { device: false });
            expect(args).toEqual([
                '-workspace',
                'TestProjectName.xcworkspace',
                '-scheme',
                'TestProjectName',
                '-configuration',
                'TestConfiguration',
                '-sdk',
                'iphonesimulator',
                '-destination',
                'platform=iOS Simulator,name=iPhone 5s',
                'build',
                `SYMROOT=${path.join(testProjectPath, 'build')}`
            ]);
            expect(args.length).toEqual(12);
        });

        it('should generate appropriate args for simulator if buildFlags are passed in', () => {
            const buildFlags = [
                '-workspace TestWorkspaceFlag',
                '-scheme TestSchemeFlag',
                '-configuration TestConfigurationFlag',
                '-destination TestDestinationFlag',
                '-archivePath TestArchivePathFlag',
                'CONFIGURATION_BUILD_DIR=TestConfigBuildDirFlag',
                'SHARED_PRECOMPS_DIR=TestSharedPrecompsDirFlag'
            ];

            const args = getXcodeBuildArgs('TestProjectName', testProjectPath, 'TestConfiguration', 'iPhone 5s', { device: false, buildFlag: buildFlags });
            expect(args).toEqual([
                '-workspace',
                'TestWorkspaceFlag',
                '-scheme',
                'TestSchemeFlag',
                '-configuration',
                'TestConfigurationFlag',
                '-sdk',
                'iphonesimulator',
                '-destination',
                'TestDestinationFlag',
                'build',
                `SYMROOT=${path.join(testProjectPath, 'build')}`,
                'CONFIGURATION_BUILD_DIR=TestConfigBuildDirFlag',
                'SHARED_PRECOMPS_DIR=TestSharedPrecompsDirFlag',
                '-archivePath',
                'TestArchivePathFlag'
            ]);
            expect(args.length).toEqual(16);
        });

        it('should add matched flags that are not overriding for device', () => {
            const buildFlags = '-sdk TestSdkFlag';

            const args = getXcodeBuildArgs('TestProjectName', testProjectPath, 'TestConfiguration', '', { device: true, buildFlag: buildFlags });
            expect(args).toEqual([
                '-workspace',
                'TestProjectName.xcworkspace',
                '-scheme',
                'TestProjectName',
                '-configuration',
                'TestConfiguration',
                '-destination',
                'generic/platform=iOS',
                '-archivePath',
                'TestProjectName.xcarchive',
                'archive',
                '-sdk',
                'TestSdkFlag'
            ]);
            expect(args.length).toEqual(13);
        });

        it('should add matched flags that are not overriding for simulator', () => {
            const buildFlags = '-archivePath TestArchivePathFlag';

            const args = getXcodeBuildArgs('TestProjectName', testProjectPath, 'TestConfiguration', 'iPhone 5s', { device: false, buildFlag: buildFlags });
            expect(args).toEqual([
                '-workspace',
                'TestProjectName.xcworkspace',
                '-scheme',
                'TestProjectName',
                '-configuration',
                'TestConfiguration',
                '-sdk',
                'iphonesimulator',
                '-destination',
                'platform=iOS Simulator,name=iPhone 5s',
                'build',
                `SYMROOT=${path.join(testProjectPath, 'build')}`,
                '-archivePath',
                'TestArchivePathFlag'
            ]);
            expect(args.length).toEqual(14);
        });

        it('should generate appropriate args for automatic provisioning', () => {
            const buildOpts = {
                device: true,
                automaticProvisioning: true,
                authenticationKeyPath: '/tmp/asc-key.p8',
                authenticationKeyID: '12345',
                authenticationKeyIssuerID: '00000000-0000-0000-0000-000000000000'
            };

            const args = getXcodeBuildArgs('TestProjectName', testProjectPath, 'TestConfiguration', '', buildOpts);
            expect(args).toEqual([
                '-workspace',
                'TestProjectName.xcworkspace',
                '-scheme',
                'TestProjectName',
                '-configuration',
                'TestConfiguration',
                '-destination',
                'generic/platform=iOS',
                '-archivePath',
                'TestProjectName.xcarchive',
                '-allowProvisioningUpdates',
                '-authenticationKeyPath',
                '/tmp/asc-key.p8',
                '-authenticationKeyID',
                '12345',
                '-authenticationKeyIssuerID',
                '00000000-0000-0000-0000-000000000000',
                'archive'
            ]);
            expect(args.length).toEqual(18);
        });
    });

    describe('getXcodeArchiveArgs method', () => {
        const getXcodeArchiveArgs = build.__get__('getXcodeArchiveArgs');

        it('should generate the appropriate arguments', () => {
            const archiveArgs = getXcodeArchiveArgs('TestProjectName', testProjectPath, '/test/output/path', '/test/export/options/path');
            expect(archiveArgs[0]).toEqual('-exportArchive');
            expect(archiveArgs[1]).toEqual('-archivePath');
            expect(archiveArgs[2]).toEqual('TestProjectName.xcarchive');
            expect(archiveArgs[3]).toEqual('-exportOptionsPlist');
            expect(archiveArgs[4]).toEqual('/test/export/options/path');
            expect(archiveArgs[5]).toEqual('-exportPath');
            expect(archiveArgs[6]).toEqual('/test/output/path');
            expect(archiveArgs.length).toEqual(7);
        });

        it('should generate the appropriate arguments for automatic provisioning', () => {
            const buildOpts = {
                automaticProvisioning: true,
                authenticationKeyPath: '/tmp/asc-key.p8',
                authenticationKeyID: '12345',
                authenticationKeyIssuerID: '00000000-0000-0000-0000-000000000000'
            };

            const archiveArgs = getXcodeArchiveArgs('TestProjectName', testProjectPath, '/test/output/path', '/test/export/options/path', buildOpts);
            expect(archiveArgs[0]).toEqual('-exportArchive');
            expect(archiveArgs[1]).toEqual('-archivePath');
            expect(archiveArgs[2]).toEqual('TestProjectName.xcarchive');
            expect(archiveArgs[3]).toEqual('-exportOptionsPlist');
            expect(archiveArgs[4]).toEqual('/test/export/options/path');
            expect(archiveArgs[5]).toEqual('-exportPath');
            expect(archiveArgs[6]).toEqual('/test/output/path');
            expect(archiveArgs[7]).toEqual('-allowProvisioningUpdates');
            expect(archiveArgs[8]).toEqual('-authenticationKeyPath');
            expect(archiveArgs[9]).toEqual('/tmp/asc-key.p8');
            expect(archiveArgs[10]).toEqual('-authenticationKeyID');
            expect(archiveArgs[11]).toEqual('12345');
            expect(archiveArgs[12]).toEqual('-authenticationKeyIssuerID');
            expect(archiveArgs[13]).toEqual('00000000-0000-0000-0000-000000000000');
            expect(archiveArgs.length).toEqual(14);
        });
    });

    describe('parseBuildFlag method', () => {
        const parseBuildFlag = build.__get__('parseBuildFlag');

        it('should detect a workspace change', () => {
            const buildFlag = '-workspace MyTestWorkspace';
            const args = { otherFlags: [] };
            parseBuildFlag(buildFlag, args);
            expect(args.workspace).toEqual('MyTestWorkspace');
            expect(args.otherFlags.length).toEqual(0);
        });
        it('should detect a scheme change', () => {
            const buildFlag = '-scheme MyTestScheme';
            const args = { otherFlags: [] };
            parseBuildFlag(buildFlag, args);
            expect(args.scheme).toEqual('MyTestScheme');
            expect(args.otherFlags.length).toEqual(0);
        });
        it('should detect a configuration change', () => {
            const buildFlag = '-configuration MyTestConfiguration';
            const args = { otherFlags: [] };
            parseBuildFlag(buildFlag, args);
            expect(args.configuration).toEqual('MyTestConfiguration');
            expect(args.otherFlags.length).toEqual(0);
        });
        it('should detect an sdk change', () => {
            const buildFlag = '-sdk NotARealSDK';
            const args = { otherFlags: [] };
            parseBuildFlag(buildFlag, args);
            expect(args.sdk).toEqual('NotARealSDK');
            expect(args.otherFlags.length).toEqual(0);
        });
        it('should detect a destination change', () => {
            const buildFlag = '-destination MyTestDestination';
            const args = { otherFlags: [] };
            parseBuildFlag(buildFlag, args);
            expect(args.destination).toEqual('MyTestDestination');
            expect(args.otherFlags.length).toEqual(0);
        });
        it('should detect an archivePath change', () => {
            const buildFlag = '-archivePath MyTestArchivePath';
            const args = { otherFlags: [] };
            parseBuildFlag(buildFlag, args);
            expect(args.archivePath).toEqual('MyTestArchivePath');
            expect(args.otherFlags.length).toEqual(0);
        });
        it('should detect a configuration_build_dir change', () => {
            const buildFlag = 'CONFIGURATION_BUILD_DIR=/path/to/fake/config/build/dir';
            const args = { otherFlags: [] };
            parseBuildFlag(buildFlag, args);
            expect(args.configuration_build_dir).toEqual('CONFIGURATION_BUILD_DIR=/path/to/fake/config/build/dir');
            expect(args.otherFlags.length).toEqual(0);
        });
        it('should detect a shared_precomps_dir change', () => {
            const buildFlag = 'SHARED_PRECOMPS_DIR=/path/to/fake/shared/precomps/dir';
            const args = { otherFlags: [] };
            parseBuildFlag(buildFlag, args);
            expect(args.shared_precomps_dir).toEqual('SHARED_PRECOMPS_DIR=/path/to/fake/shared/precomps/dir');
            expect(args.otherFlags.length).toEqual(0);
        });
        it('should parse arbitrary build settings', () => {
            const buildFlag = 'MY_ARBITRARY_BUILD_SETTING=ValueOfArbitraryBuildSetting';
            const args = { otherFlags: [] };
            parseBuildFlag(buildFlag, args);
            expect(args.otherFlags[0]).toEqual('MY_ARBITRARY_BUILD_SETTING=ValueOfArbitraryBuildSetting');
            expect(args.otherFlags.length).toEqual(1);
        });
        it('should parse userdefaults', () => {
            const buildFlag = '-myuserdefault=TestUserDefaultValue';
            const args = { otherFlags: [] };
            parseBuildFlag(buildFlag, args);
            expect(args.otherFlags[0]).toEqual('-myuserdefault=TestUserDefaultValue');
            expect(args.otherFlags.length).toEqual(1);
        });
        it('should parse settings with a space', () => {
            const buildFlag = '-anotherxcodebuildsetting withASpace';
            const args = { otherFlags: [] };
            parseBuildFlag(buildFlag, args);
            expect(args.otherFlags[0]).toEqual('-anotherxcodebuildsetting');
            expect(args.otherFlags[1]).toEqual('withASpace');
            expect(args.otherFlags.length).toEqual(2);
        });
    });

    describe('run method', () => {
        beforeEach(() => {
            spyOn(Promise, 'reject');
        });

        it('should not accept debug and release options together', () => {
            build.run({
                debug: true,
                release: true
            });

            expect(Promise.reject).toHaveBeenCalledWith(new CordovaError('Cannot specify "debug" and "release" options together.'));
        });

        it('should not accept device and emulator options together', () => {
            build.run({
                device: true,
                emulator: true
            });

            expect(Promise.reject).toHaveBeenCalledWith(new CordovaError('Cannot specify "device" and "emulator" options together.'));
        });

        it('should reject when build config file missing', () => {
            spyOn(fs, 'existsSync').and.returnValue(false);

            const buildConfig = './some/config/path';
            build.run({ buildConfig: './some/config/path' });

            expect(Promise.reject).toHaveBeenCalledWith(new CordovaError(`Build config file does not exist: ${buildConfig}`));
        });
    });

    describe('getDefaultSimulatorTarget method', () => {
        it('should find iPhone X as the default simulator target.', () => {
            const mockedEmulators = [{
                name: 'iPhone 7',
                identifier: 'com.apple.CoreSimulator.SimDeviceType.iPhone-7',
                simIdentifier: 'iPhone-7'
            },
            {
                name: 'iPhone 8',
                identifier: 'com.apple.CoreSimulator.SimDeviceType.iPhone-8',
                simIdentifier: 'iPhone-8'
            },
            {
                name: 'iPhone X',
                identifier: 'com.apple.CoreSimulator.SimDeviceType.iPhone-X',
                simIdentifier: 'iPhone-X'
            }];

            // This method will require a module that supports the run method.
            build.__set__('require', () => ({
                run: () => Promise.resolve(mockedEmulators)
            }));

            const getDefaultSimulatorTarget = build.__get__('getDefaultSimulatorTarget');

            return getDefaultSimulatorTarget().then(actual => {
                expect(actual).toEqual({
                    name: 'iPhone X',
                    identifier: 'com.apple.CoreSimulator.SimDeviceType.iPhone-X',
                    simIdentifier: 'iPhone-X'
                });
            });
        });
    });

    describe('findXCodeProjectIn method', () => {
        const fakePath = '/path/foobar';
        let buildRequire;

        beforeEach(() => {
            // rewire causes some issues so for these tests, we will require instead.
            buildRequire = require('../../../lib/build');
            spyOn(events, 'emit');
        });

        it('should find not find Xcode project', () => {
            spyOn(fs, 'readdirSync').and.returnValue(['README.md']);
            return buildRequire.findXCodeProjectIn(fakePath).then(
                () => {},
                (error) => {
                    expect(error.message).toBe(`No Xcode project found in ${fakePath}`);
                }
            );
        });

        it('should emit finding multiple Xcode projects', () => {
            spyOn(fs, 'readdirSync').and.returnValue(['Test1.xcodeproj', 'Test2.xcodeproj']);
            return buildRequire.findXCodeProjectIn(fakePath).then(
                (projectName) => {
                    expect(events.emit).toHaveBeenCalledWith(jasmine.any(String), jasmine.stringMatching(/Found multiple .xcodeproj directories in/));
                    expect(projectName).toBe('Test1');
                }
            );
        });

        it('should detect and return only one projects', () => {
            spyOn(fs, 'readdirSync').and.returnValue(['Test1.xcodeproj']);
            return buildRequire.findXCodeProjectIn(fakePath).then(
                (projectName) => {
                    expect(events.emit).not.toHaveBeenCalled();
                    expect(projectName).toBe('Test1');
                }
            );
        });
    });
});
