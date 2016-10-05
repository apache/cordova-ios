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
    var testProjectPath = path.join('/test', 'project', 'path');

    describe('getXcodeBuildArgs method', function() {

        var getXcodeBuildArgs = build.__get__('getXcodeBuildArgs');
        build.__set__('__dirname', path.join('/test', 'dir'));

        it('should generate appropriate args if a single buildFlag is passed in', function(done) {
            var isDevice = true;
            var buildFlags = '-xcconfig TestXcconfigFlag';

            var args = getXcodeBuildArgs('TestProjectName', testProjectPath, 'TestConfiguration', isDevice, buildFlags);
            expect(args[0]).toEqual('-xcconfig');
            expect(args[1]).toEqual('TestXcconfigFlag');
            expect(args[2]).toEqual('-project');
            expect(args[3]).toEqual('TestProjectName.xcodeproj');
            expect(args[4]).toEqual('ARCHS=armv7 arm64');
            expect(args[5]).toEqual('-target');
            expect(args[6]).toEqual('TestProjectName');
            expect(args[7]).toEqual('-configuration');
            expect(args[8]).toEqual('TestConfiguration');
            expect(args[9]).toEqual('-sdk');
            expect(args[10]).toEqual('iphoneos');
            expect(args[11]).toEqual('build');
            expect(args[12]).toEqual('VALID_ARCHS=armv7 arm64');
            expect(args[13]).toEqual('CONFIGURATION_BUILD_DIR=' + path.join(testProjectPath, 'build', 'device'));
            expect(args[14]).toEqual('SHARED_PRECOMPS_DIR=' + path.join(testProjectPath, 'build', 'sharedpch'));
            expect(args.length).toEqual(15);
            done();
        });

        it('should generate appropriate args if buildFlags are passed in', function(done) {
            var isDevice = true;
            var buildFlags = [
                '-xcconfig TestXcconfigFlag',
                '-project TestProjectFlag',
                'ARCHS=TestArchsFlag',
                '-target TestTargetFlag',
                '-configuration TestConfigurationFlag',
                '-sdk TestSdkFlag',
                'VALID_ARCHS=TestValidArchsFlag',
                'CONFIGURATION_BUILD_DIR=TestConfigBuildDirFlag',
                'SHARED_PRECOMPS_DIR=TestSharedPrecompsDirFlag'
            ];

            var args = getXcodeBuildArgs('TestProjectName', testProjectPath, 'TestConfiguration', isDevice, buildFlags);
            expect(args[0]).toEqual('-xcconfig');
            expect(args[1]).toEqual('TestXcconfigFlag');
            expect(args[2]).toEqual('-project');
            expect(args[3]).toEqual('TestProjectFlag');
            expect(args[4]).toEqual('ARCHS=TestArchsFlag');
            expect(args[5]).toEqual('-target');
            expect(args[6]).toEqual('TestTargetFlag');
            expect(args[7]).toEqual('-configuration');
            expect(args[8]).toEqual('TestConfigurationFlag');
            expect(args[9]).toEqual('-sdk');
            expect(args[10]).toEqual('TestSdkFlag');
            expect(args[11]).toEqual('build');
            expect(args[12]).toEqual('VALID_ARCHS=TestValidArchsFlag');
            expect(args[13]).toEqual('CONFIGURATION_BUILD_DIR=TestConfigBuildDirFlag');
            expect(args[14]).toEqual('SHARED_PRECOMPS_DIR=TestSharedPrecompsDirFlag');
            expect(args.length).toEqual(15);
            done();
        });

        it('should generate appropriate args for device', function(done) {
            var isDevice = true;
            var args = getXcodeBuildArgs('TestProjectName', testProjectPath, 'TestConfiguration', isDevice, null);
            expect(args[0]).toEqual('-xcconfig');
            expect(args[1]).toEqual(path.join('/test', 'build-testconfiguration.xcconfig'));
            expect(args[2]).toEqual('-project');
            expect(args[3]).toEqual('TestProjectName.xcodeproj');
            expect(args[4]).toEqual('ARCHS=armv7 arm64');
            expect(args[5]).toEqual('-target');
            expect(args[6]).toEqual('TestProjectName');
            expect(args[7]).toEqual('-configuration');
            expect(args[8]).toEqual('TestConfiguration');
            expect(args[9]).toEqual('-sdk');
            expect(args[10]).toEqual('iphoneos');
            expect(args[11]).toEqual('build');
            expect(args[12]).toEqual('VALID_ARCHS=armv7 arm64');
            expect(args[13]).toEqual('CONFIGURATION_BUILD_DIR=' + path.join(testProjectPath, 'build', 'device'));
            expect(args[14]).toEqual('SHARED_PRECOMPS_DIR=' + path.join(testProjectPath, 'build', 'sharedpch'));
            expect(args.length).toEqual(15);
            done();
        });

        it('should generate appropriate args for simulator', function(done) {
            var isDevice = false;
            var args = getXcodeBuildArgs('TestProjectName', testProjectPath, 'TestConfiguration', isDevice, null);
            expect(args[0]).toEqual('-xcconfig');
            expect(args[1]).toEqual(path.join('/test', 'build-testconfiguration.xcconfig'));
            expect(args[2]).toEqual('-project');
            expect(args[3]).toEqual('TestProjectName.xcodeproj');
            expect(args[4]).toEqual('ARCHS=x86_64 i386');
            expect(args[5]).toEqual('-target');
            expect(args[6]).toEqual('TestProjectName');
            expect(args[7]).toEqual('-configuration');
            expect(args[8]).toEqual('TestConfiguration');
            expect(args[9]).toEqual('-sdk');
            expect(args[10]).toEqual('iphonesimulator');
            expect(args[11]).toEqual('build');
            expect(args[12]).toEqual('VALID_ARCHS=x86_64 i386');
            expect(args[13]).toEqual('CONFIGURATION_BUILD_DIR=' + path.join(testProjectPath, 'build', 'emulator'));
            expect(args[14]).toEqual('SHARED_PRECOMPS_DIR=' + path.join(testProjectPath, 'build', 'sharedpch'));
            expect(args.length).toEqual(15);
            done();
        });
    });

    describe('getXcodeArchiveArgs method', function() {

        var getXcodeArchiveArgs = build.__get__('getXcodeArchiveArgs');

        it('should generate the appropriate arguments', function(done) {
            var archiveArgs = getXcodeArchiveArgs('TestProjectName', testProjectPath, '/test/output/path', '/test/export/options/path');
            expect(archiveArgs[0]).toEqual('-exportArchive');
            expect(archiveArgs[1]).toEqual('-archivePath');
            expect(archiveArgs[2]).toEqual('TestProjectName.xcarchive');
            expect(archiveArgs[3]).toEqual('-exportOptionsPlist');
            expect(archiveArgs[4]).toEqual('/test/export/options/path');
            expect(archiveArgs[5]).toEqual('-exportPath');
            expect(archiveArgs[6]).toEqual('/test/output/path');
            expect(archiveArgs.length).toEqual(7);
            done();
        });
    });

    describe('parseBuildFlag method', function() {

        var parseBuildFlag = build.__get__('parseBuildFlag');

        it('should detect an xcconfig change', function(done) {
            var buildFlag = '-xcconfig /path/to/config';
            var args = { 'otherFlags': [] };
            parseBuildFlag(buildFlag, args);
            expect(args.xcconfig).toEqual('/path/to/config');
            expect(args.otherFlags.length).toEqual(0);
            done();
        });
        it('should detect a project change', function(done) {
            var buildFlag = '-project MyTestProject';
            var args = { 'otherFlags': [] };
            parseBuildFlag(buildFlag, args);
            expect(args.project).toEqual('MyTestProject');
            expect(args.otherFlags.length).toEqual(0);
            done();
        });
        it('should detect an archs change', function(done) {
            var buildFlag = 'ARCHS=NotRealArchitectures';
            var args = { 'otherFlags': [] };
            parseBuildFlag(buildFlag, args);
            expect(args.archs).toEqual('ARCHS=NotRealArchitectures');
            expect(args.otherFlags.length).toEqual(0);
            done();
        });
        it('should detect a target change', function(done) {
            var buildFlag = '-target MyTestTarget';
            var args = { 'otherFlags': [] };
            parseBuildFlag(buildFlag, args);
            expect(args.target).toEqual('MyTestTarget');
            expect(args.otherFlags.length).toEqual(0);
            done();
        });
        it('should detect a configuration change', function(done) {
            var buildFlag = '-configuration MyTestConfiguration';
            var args = { 'otherFlags': [] };
            parseBuildFlag(buildFlag, args);
            expect(args.configuration).toEqual('MyTestConfiguration');
            expect(args.otherFlags.length).toEqual(0);
            done();
        });
        it('should detect an sdk change', function(done) {
            var buildFlag = '-sdk NotARealSDK';
            var args = { 'otherFlags': [] };
            parseBuildFlag(buildFlag, args);
            expect(args.sdk).toEqual('NotARealSDK');
            expect(args.otherFlags.length).toEqual(0);
            done();
        });
        it('should detect a valid_archs change', function(done) {
            var buildFlag = 'VALID_ARCHS=NotRealArchitectures';
            var args = { 'otherFlags': [] };
            parseBuildFlag(buildFlag, args);
            expect(args.valid_archs).toEqual('VALID_ARCHS=NotRealArchitectures');
            expect(args.otherFlags.length).toEqual(0);
            done();
        });
        it('should detect a configuration_build_dir change', function(done) {
            var buildFlag = 'CONFIGURATION_BUILD_DIR=/path/to/fake/config/build/dir';
            var args = { 'otherFlags': [] };
            parseBuildFlag(buildFlag, args);
            expect(args.configuration_build_dir).toEqual('CONFIGURATION_BUILD_DIR=/path/to/fake/config/build/dir');
            expect(args.otherFlags.length).toEqual(0);
            done();
        });
        it('should detect a shared_precomps_dir change', function(done) {
            var buildFlag = 'SHARED_PRECOMPS_DIR=/path/to/fake/shared/precomps/dir';
            var args = { 'otherFlags': [] };
            parseBuildFlag(buildFlag, args);
            expect(args.shared_precomps_dir).toEqual('SHARED_PRECOMPS_DIR=/path/to/fake/shared/precomps/dir');
            expect(args.otherFlags.length).toEqual(0);
            done();
        });
        it('should parse arbitrary build settings', function(done) {
            var buildFlag = 'MY_ARBITRARY_BUILD_SETTING=ValueOfArbitraryBuildSetting';
            var args = { 'otherFlags': [] };
            parseBuildFlag(buildFlag, args);
            expect(args.otherFlags[0]).toEqual('MY_ARBITRARY_BUILD_SETTING=ValueOfArbitraryBuildSetting');
            expect(args.otherFlags.length).toEqual(1);
            done();
        });
        it('should parse userdefaults', function(done) {
            var buildFlag = '-myuserdefault=TestUserDefaultValue';
            var args = { 'otherFlags': [] };
            parseBuildFlag(buildFlag, args);
            expect(args.otherFlags[0]).toEqual('-myuserdefault=TestUserDefaultValue');
            expect(args.otherFlags.length).toEqual(1);
            done();
        });
        it('should parse settings with a space', function(done) {
            var buildFlag = '-anotherxcodebuildsetting withASpace';
            var args = { 'otherFlags': [] };
            parseBuildFlag(buildFlag, args);
            expect(args.otherFlags[0]).toEqual('-anotherxcodebuildsetting');
            expect(args.otherFlags[1]).toEqual('withASpace');
            expect(args.otherFlags.length).toEqual(2);
            done();
        });
    });
});
