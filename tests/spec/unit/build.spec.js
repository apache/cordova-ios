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
const rewire = require('rewire');
const build = rewire('../../../bin/templates/scripts/cordova/lib/build');

describe('build', () => {
    let emitSpy;
    const testProjectPath = path.join('/test', 'project', 'path');

    beforeEach(() => {
        // Events spy
        emitSpy = jasmine.createSpy('emitSpy');
        build.__set__('events', {
            emit: emitSpy
        });
    });

    describe('getXcodeBuildArgs method', () => {
        const getXcodeBuildArgs = build.__get__('getXcodeBuildArgs');
        build.__set__('__dirname', path.join('/test', 'dir'));

        it('should generate appropriate args if a single buildFlag is passed in', () => {
            const isDevice = true;
            const buildFlags = '';

            const args = getXcodeBuildArgs('TestProjectName', testProjectPath, 'TestConfiguration', isDevice, buildFlags);
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
                `CONFIGURATION_BUILD_DIR=${path.join(testProjectPath, 'build', 'device')}`,
                `SHARED_PRECOMPS_DIR=${path.join(testProjectPath, 'build', 'sharedpch')}`
            ]);
            expect(args.length).toEqual(13);
        });

        it('should generate appropriate args if buildFlags are passed in', () => {
            const isDevice = true;
            const buildFlags = [
                '-workspace TestWorkspaceFlag',
                '-scheme TestSchemeFlag',
                '-configuration TestConfigurationFlag',
                '-destination TestDestinationFlag',
                '-archivePath TestArchivePathFlag',
                'CONFIGURATION_BUILD_DIR=TestConfigBuildDirFlag',
                'SHARED_PRECOMPS_DIR=TestSharedPrecompsDirFlag'
            ];

            const args = getXcodeBuildArgs('TestProjectName', testProjectPath, 'TestConfiguration', isDevice, buildFlags);
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
            const isDevice = true;
            const args = getXcodeBuildArgs('TestProjectName', testProjectPath, 'TestConfiguration', isDevice, null);
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
                `CONFIGURATION_BUILD_DIR=${path.join(testProjectPath, 'build', 'device')}`,
                `SHARED_PRECOMPS_DIR=${path.join(testProjectPath, 'build', 'sharedpch')}`
            ]);
            expect(args.length).toEqual(13);
        });

        it('should generate appropriate args for simulator', () => {
            const isDevice = false;
            const args = getXcodeBuildArgs('TestProjectName', testProjectPath, 'TestConfiguration', isDevice, null, 'iPhone 5s');
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
                `CONFIGURATION_BUILD_DIR=${path.join(testProjectPath, 'build', 'emulator')}`,
                `SHARED_PRECOMPS_DIR=${path.join(testProjectPath, 'build', 'sharedpch')}`
            ]);
            expect(args.length).toEqual(13);
        });

        it('should add matched flags that are not overriding for device', () => {
            const isDevice = true;
            const buildFlags = '-sdk TestSdkFlag';

            const args = getXcodeBuildArgs('TestProjectName', testProjectPath, 'TestConfiguration', isDevice, buildFlags);
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
                `CONFIGURATION_BUILD_DIR=${path.join(testProjectPath, 'build', 'device')}`,
                `SHARED_PRECOMPS_DIR=${path.join(testProjectPath, 'build', 'sharedpch')}`,
                '-sdk',
                'TestSdkFlag'
            ]);
            expect(args.length).toEqual(15);
        });

        it('should add matched flags that are not overriding for simulator', () => {
            const isDevice = false;
            const buildFlags = '-archivePath TestArchivePathFlag';

            const args = getXcodeBuildArgs('TestProjectName', testProjectPath, 'TestConfiguration', isDevice, buildFlags, 'iPhone 5s');
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
                `CONFIGURATION_BUILD_DIR=${path.join(testProjectPath, 'build', 'emulator')}`,
                `SHARED_PRECOMPS_DIR=${path.join(testProjectPath, 'build', 'sharedpch')}`,
                '-archivePath',
                'TestArchivePathFlag'
            ]);
            expect(args.length).toEqual(15);
        });

        it('should generate appropriate args for automatic provisioning', () => {
            const isDevice = true;
            const args = getXcodeBuildArgs('TestProjectName', testProjectPath, 'TestConfiguration', isDevice, null, null, true);
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
                'archive',
                `CONFIGURATION_BUILD_DIR=${path.join(testProjectPath, 'build', 'device')}`,
                `SHARED_PRECOMPS_DIR=${path.join(testProjectPath, 'build', 'sharedpch')}`
            ]);
            expect(args.length).toEqual(14);
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
            const archiveArgs = getXcodeArchiveArgs('TestProjectName', testProjectPath, '/test/output/path', '/test/export/options/path', true);
            expect(archiveArgs[0]).toEqual('-exportArchive');
            expect(archiveArgs[1]).toEqual('-archivePath');
            expect(archiveArgs[2]).toEqual('TestProjectName.xcarchive');
            expect(archiveArgs[3]).toEqual('-exportOptionsPlist');
            expect(archiveArgs[4]).toEqual('/test/export/options/path');
            expect(archiveArgs[5]).toEqual('-exportPath');
            expect(archiveArgs[6]).toEqual('/test/output/path');
            expect(archiveArgs[7]).toEqual('-allowProvisioningUpdates');
            expect(archiveArgs.length).toEqual(8);
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

    describe('help method', () => {
        it('should log a bunch of options', () => {
            spyOn(console, 'log');
            spyOn(process, 'exit');

            build.help();
            expect(console.log).toHaveBeenCalledWith(jasmine.stringMatching(/^Usage:/));
        });
    });

    describe('run method', () => {
        let rejectSpy;

        beforeEach(() => {
            rejectSpy = jasmine.createSpy('reject');

            build.__set__('Q', {
                reject: rejectSpy
            });
        });

        it('should not accept debug and release options together', () => {
            build.run({
                debug: true,
                release: true
            });

            expect(rejectSpy).toHaveBeenCalledWith('Cannot specify "debug" and "release" options together.');
        });

        it('should not accept device and emulator options together', () => {
            build.run({
                device: true,
                emulator: true
            });

            expect(rejectSpy).toHaveBeenCalledWith('Cannot specify "device" and "emulator" options together.');
        });

        it('should reject when build config file missing', () => {
            const existsSyncSpy = jasmine.createSpy('existsSync').and.returnValue(false);
            build.__set__('fs', {
                existsSync: existsSyncSpy
            });

            build.run({
                buildConfig: './some/config/path'
            });

            expect(rejectSpy).toHaveBeenCalledWith(jasmine.stringMatching(/^Build config file does not exist:/));
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
        let findXCodeProjectIn;
        let shellLsSpy;
        let rejectSpy;
        let resolveSpy;
        const fakePath = '/path/foobar';

        beforeEach(() => {
            findXCodeProjectIn = build.__get__('findXCodeProjectIn');

            // Shell Spy
            shellLsSpy = jasmine.createSpy('shellLsSpy');
            build.__set__('shell', {
                ls: shellLsSpy
            });

            // Q Spy
            rejectSpy = jasmine.createSpy('rejectSpy');
            resolveSpy = jasmine.createSpy('resolveSpy');
            build.__set__('Q', {
                reject: rejectSpy,
                resolve: resolveSpy
            });
        });

        it('should find not find Xcode project', () => {
            shellLsSpy.and.returnValue(['README.md']);

            findXCodeProjectIn(fakePath);

            expect(rejectSpy).toHaveBeenCalledWith(`No Xcode project found in ${fakePath}`);
        });

        it('should emit finding multiple Xcode projects', () => {
            shellLsSpy.and.returnValue(['Test1.xcodeproj', 'Test2.xcodeproj']);

            findXCodeProjectIn(fakePath);

            // Emit
            const actualEmit = emitSpy.calls.argsFor(0)[1];
            expect(emitSpy).toHaveBeenCalled();
            expect(actualEmit).toContain('Found multiple .xcodeproj directories in');

            // Resolve
            const actualResolve = resolveSpy.calls.argsFor(0)[0];
            expect(resolveSpy).toHaveBeenCalled();
            expect(actualResolve).toContain('Test1');
        });

        it('should detect and return only one projects', () => {
            shellLsSpy.and.returnValue(['Test1.xcodeproj']);

            findXCodeProjectIn(fakePath);

            // Emit
            expect(emitSpy).not.toHaveBeenCalled();

            // Resolve
            const actualResolve = resolveSpy.calls.argsFor(0)[0];
            expect(resolveSpy).toHaveBeenCalled();
            expect(actualResolve).toContain('Test1');
        });
    });
});
