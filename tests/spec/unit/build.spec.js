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

var path = require('path');
var rewire = require('rewire');
var build = rewire('../../../bin/templates/scripts/cordova/lib/build');

describe('build', function () {
    let emitSpy;
    var testProjectPath = path.join('/test', 'project', 'path');

    beforeEach(function () {
        // Events spy
        emitSpy = jasmine.createSpy('emitSpy');
        build.__set__('events', {
            emit: emitSpy
        });
    });

    describe('getXcodeBuildArgs method', function () {

        var getXcodeBuildArgs = build.__get__('getXcodeBuildArgs');
        build.__set__('__dirname', path.join('/test', 'dir'));

        it('should generate appropriate args if a single buildFlag is passed in', function () {
            var isDevice = true;
            var buildFlags = '';

            var args = getXcodeBuildArgs('TestProjectName', testProjectPath, 'TestConfiguration', isDevice, buildFlags);
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
                'CONFIGURATION_BUILD_DIR=' + path.join(testProjectPath, 'build', 'device'),
                'SHARED_PRECOMPS_DIR=' + path.join(testProjectPath, 'build', 'sharedpch')
            ]);
            expect(args.length).toEqual(13);
        });

        it('should generate appropriate args if buildFlags are passed in', function () {
            var isDevice = true;
            var buildFlags = [
                '-workspace TestWorkspaceFlag',
                '-scheme TestSchemeFlag',
                '-configuration TestConfigurationFlag',
                '-destination TestDestinationFlag',
                '-archivePath TestArchivePathFlag',
                'CONFIGURATION_BUILD_DIR=TestConfigBuildDirFlag',
                'SHARED_PRECOMPS_DIR=TestSharedPrecompsDirFlag'
            ];

            var args = getXcodeBuildArgs('TestProjectName', testProjectPath, 'TestConfiguration', isDevice, buildFlags);
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

        it('should generate appropriate args for device', function () {
            var isDevice = true;
            var args = getXcodeBuildArgs('TestProjectName', testProjectPath, 'TestConfiguration', isDevice, null);
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
                'CONFIGURATION_BUILD_DIR=' + path.join(testProjectPath, 'build', 'device'),
                'SHARED_PRECOMPS_DIR=' + path.join(testProjectPath, 'build', 'sharedpch')
            ]);
            expect(args.length).toEqual(13);
        });

        it('should generate appropriate args for simulator', function () {
            var isDevice = false;
            var args = getXcodeBuildArgs('TestProjectName', testProjectPath, 'TestConfiguration', isDevice, null, 'iPhone 5s');
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
                'CONFIGURATION_BUILD_DIR=' + path.join(testProjectPath, 'build', 'emulator'),
                'SHARED_PRECOMPS_DIR=' + path.join(testProjectPath, 'build', 'sharedpch')
            ]);
            expect(args.length).toEqual(13);
        });

        it('should add matched flags that are not overriding for device', function () {
            var isDevice = true;
            var buildFlags = '-sdk TestSdkFlag';

            var args = getXcodeBuildArgs('TestProjectName', testProjectPath, 'TestConfiguration', isDevice, buildFlags);
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
                'CONFIGURATION_BUILD_DIR=' + path.join(testProjectPath, 'build', 'device'),
                'SHARED_PRECOMPS_DIR=' + path.join(testProjectPath, 'build', 'sharedpch'),
                '-sdk',
                'TestSdkFlag'
            ]);
            expect(args.length).toEqual(15);
        });

        it('should add matched flags that are not overriding for simulator', function () {
            var isDevice = false;
            var buildFlags = '-archivePath TestArchivePathFlag';

            var args = getXcodeBuildArgs('TestProjectName', testProjectPath, 'TestConfiguration', isDevice, buildFlags, 'iPhone 5s');
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
                'CONFIGURATION_BUILD_DIR=' + path.join(testProjectPath, 'build', 'emulator'),
                'SHARED_PRECOMPS_DIR=' + path.join(testProjectPath, 'build', 'sharedpch'),
                '-archivePath',
                'TestArchivePathFlag'
            ]);
            expect(args.length).toEqual(15);
        });

        it('should generate appropriate args for automatic provisioning', function () {
            var isDevice = true;
            var args = getXcodeBuildArgs('TestProjectName', testProjectPath, 'TestConfiguration', isDevice, null, null, true);
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
                'CONFIGURATION_BUILD_DIR=' + path.join(testProjectPath, 'build', 'device'),
                'SHARED_PRECOMPS_DIR=' + path.join(testProjectPath, 'build', 'sharedpch')
            ]);
            expect(args.length).toEqual(14);
        });
    });

    describe('getXcodeArchiveArgs method', function () {

        var getXcodeArchiveArgs = build.__get__('getXcodeArchiveArgs');

        it('should generate the appropriate arguments', function () {
            var archiveArgs = getXcodeArchiveArgs('TestProjectName', testProjectPath, '/test/output/path', '/test/export/options/path');
            expect(archiveArgs[0]).toEqual('-exportArchive');
            expect(archiveArgs[1]).toEqual('-archivePath');
            expect(archiveArgs[2]).toEqual('TestProjectName.xcarchive');
            expect(archiveArgs[3]).toEqual('-exportOptionsPlist');
            expect(archiveArgs[4]).toEqual('/test/export/options/path');
            expect(archiveArgs[5]).toEqual('-exportPath');
            expect(archiveArgs[6]).toEqual('/test/output/path');
            expect(archiveArgs.length).toEqual(7);
        });

        it('should generate the appropriate arguments for automatic provisioning', function () {
            var archiveArgs = getXcodeArchiveArgs('TestProjectName', testProjectPath, '/test/output/path', '/test/export/options/path', true);
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

    describe('parseBuildFlag method', function () {

        var parseBuildFlag = build.__get__('parseBuildFlag');

        it('should detect a workspace change', function () {
            var buildFlag = '-workspace MyTestWorkspace';
            var args = { 'otherFlags': [] };
            parseBuildFlag(buildFlag, args);
            expect(args.workspace).toEqual('MyTestWorkspace');
            expect(args.otherFlags.length).toEqual(0);
        });
        it('should detect a scheme change', function () {
            var buildFlag = '-scheme MyTestScheme';
            var args = { 'otherFlags': [] };
            parseBuildFlag(buildFlag, args);
            expect(args.scheme).toEqual('MyTestScheme');
            expect(args.otherFlags.length).toEqual(0);
        });
        it('should detect a configuration change', function () {
            var buildFlag = '-configuration MyTestConfiguration';
            var args = { 'otherFlags': [] };
            parseBuildFlag(buildFlag, args);
            expect(args.configuration).toEqual('MyTestConfiguration');
            expect(args.otherFlags.length).toEqual(0);
        });
        it('should detect an sdk change', function () {
            var buildFlag = '-sdk NotARealSDK';
            var args = { 'otherFlags': [] };
            parseBuildFlag(buildFlag, args);
            expect(args.sdk).toEqual('NotARealSDK');
            expect(args.otherFlags.length).toEqual(0);
        });
        it('should detect a destination change', function () {
            var buildFlag = '-destination MyTestDestination';
            var args = { 'otherFlags': [] };
            parseBuildFlag(buildFlag, args);
            expect(args.destination).toEqual('MyTestDestination');
            expect(args.otherFlags.length).toEqual(0);
        });
        it('should detect an archivePath change', function () {
            var buildFlag = '-archivePath MyTestArchivePath';
            var args = { 'otherFlags': [] };
            parseBuildFlag(buildFlag, args);
            expect(args.archivePath).toEqual('MyTestArchivePath');
            expect(args.otherFlags.length).toEqual(0);
        });
        it('should detect a configuration_build_dir change', function () {
            var buildFlag = 'CONFIGURATION_BUILD_DIR=/path/to/fake/config/build/dir';
            var args = { 'otherFlags': [] };
            parseBuildFlag(buildFlag, args);
            expect(args.configuration_build_dir).toEqual('CONFIGURATION_BUILD_DIR=/path/to/fake/config/build/dir');
            expect(args.otherFlags.length).toEqual(0);
        });
        it('should detect a shared_precomps_dir change', function () {
            var buildFlag = 'SHARED_PRECOMPS_DIR=/path/to/fake/shared/precomps/dir';
            var args = { 'otherFlags': [] };
            parseBuildFlag(buildFlag, args);
            expect(args.shared_precomps_dir).toEqual('SHARED_PRECOMPS_DIR=/path/to/fake/shared/precomps/dir');
            expect(args.otherFlags.length).toEqual(0);
        });
        it('should parse arbitrary build settings', function () {
            var buildFlag = 'MY_ARBITRARY_BUILD_SETTING=ValueOfArbitraryBuildSetting';
            var args = { 'otherFlags': [] };
            parseBuildFlag(buildFlag, args);
            expect(args.otherFlags[0]).toEqual('MY_ARBITRARY_BUILD_SETTING=ValueOfArbitraryBuildSetting');
            expect(args.otherFlags.length).toEqual(1);
        });
        it('should parse userdefaults', function () {
            var buildFlag = '-myuserdefault=TestUserDefaultValue';
            var args = { 'otherFlags': [] };
            parseBuildFlag(buildFlag, args);
            expect(args.otherFlags[0]).toEqual('-myuserdefault=TestUserDefaultValue');
            expect(args.otherFlags.length).toEqual(1);
        });
        it('should parse settings with a space', function () {
            var buildFlag = '-anotherxcodebuildsetting withASpace';
            var args = { 'otherFlags': [] };
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
            build.__set__('require', () => {
                return {
                    run: () => Promise.resolve(mockedEmulators)
                };
            });

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

            expect(rejectSpy).toHaveBeenCalledWith('No Xcode project found in ' + fakePath);
        });

        it('should emit finding multiple Xcode projects', () => {
            shellLsSpy.and.returnValue(['Test1.xcodeproj', 'Test2.xcodeproj']);

            findXCodeProjectIn(fakePath);

            // Emit
            let actualEmit = emitSpy.calls.argsFor(0)[1];
            expect(emitSpy).toHaveBeenCalled();
            expect(actualEmit).toContain('Found multiple .xcodeproj directories in');

            // Resolve
            let actualResolve = resolveSpy.calls.argsFor(0)[0];
            expect(resolveSpy).toHaveBeenCalled();
            expect(actualResolve).toContain('Test1');
        });

        it('should detect and return only one projects', () => {
            shellLsSpy.and.returnValue(['Test1.xcodeproj']);

            findXCodeProjectIn(fakePath);

            // Emit
            expect(emitSpy).not.toHaveBeenCalled();

            // Resolve
            let actualResolve = resolveSpy.calls.argsFor(0)[0];
            expect(resolveSpy).toHaveBeenCalled();
            expect(actualResolve).toContain('Test1');
        });
    });
});
