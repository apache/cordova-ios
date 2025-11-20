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

const fs = require('node:fs');
const path = require('node:path');
const rewire = require('rewire');
const { CordovaError } = require('cordova-common');
const build = rewire('../../lib/build');

describe('build', () => {
    const testProjectPath = path.join('/test', 'project', 'path');

    describe('getXcodeBuildArgs method', () => {
        const getXcodeBuildArgs = build.__get__('getXcodeBuildArgs');
        build.__set__('__dirname', path.join('/test', 'dir'));

        it('should generate appropriate args if a single buildFlag is passed in', () => {
            const args = getXcodeBuildArgs(testProjectPath, 'TestConfiguration', '', { device: true, buildFlag: '' });
            expect(args).toEqual([
                '-workspace',
                'App.xcworkspace',
                '-scheme',
                'App',
                '-configuration',
                'TestConfiguration',
                '-destination',
                'generic/platform=iOS',
                '-archivePath',
                'App.xcarchive',
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
                'SHARED_PRECOMPS_DIR=TestSharedPrecompsDirFlag',
                'INFOPLIST_KEY_CFBundleDisplayName="My App Name"',
                '-resultBundlePath="/tmp/result bundle/file"'
            ];

            const args = getXcodeBuildArgs(testProjectPath, 'TestConfiguration', '', { device: true, buildFlag: buildFlags });
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
                'SHARED_PRECOMPS_DIR=TestSharedPrecompsDirFlag',
                'INFOPLIST_KEY_CFBundleDisplayName="My App Name"',
                '-resultBundlePath="/tmp/result bundle/file"'
            ]);
            expect(args.length).toEqual(15);
        });

        it('should generate appropriate args for device', () => {
            const args = getXcodeBuildArgs(testProjectPath, 'TestConfiguration', '', { device: true });
            expect(args).toEqual([
                '-workspace',
                'App.xcworkspace',
                '-scheme',
                'App',
                '-configuration',
                'TestConfiguration',
                '-destination',
                'generic/platform=iOS',
                '-archivePath',
                'App.xcarchive',
                'archive'
            ]);
            expect(args.length).toEqual(11);
        });

        it('should generate appropriate args for simulator', () => {
            const args = getXcodeBuildArgs(testProjectPath, 'TestConfiguration', 'iPhone 5s', { device: false });
            expect(args).toEqual([
                '-workspace',
                'App.xcworkspace',
                '-scheme',
                'App',
                '-configuration',
                'TestConfiguration',
                '-sdk',
                'iphonesimulator',
                '-destination',
                'platform=iOS Simulator,name=iPhone 5s',
                'build'
            ]);
            expect(args.length).toEqual(11);
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

            const args = getXcodeBuildArgs(testProjectPath, 'TestConfiguration', 'iPhone 5s', { device: false, buildFlag: buildFlags });
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
                'CONFIGURATION_BUILD_DIR=TestConfigBuildDirFlag',
                'SHARED_PRECOMPS_DIR=TestSharedPrecompsDirFlag',
                '-archivePath',
                'TestArchivePathFlag'
            ]);
            expect(args.length).toEqual(15);
        });

        it('should add matched flags that are not overriding for device', () => {
            const buildFlags = '-sdk TestSdkFlag';

            const args = getXcodeBuildArgs(testProjectPath, 'TestConfiguration', '', { device: true, buildFlag: buildFlags });
            expect(args).toEqual([
                '-workspace',
                'App.xcworkspace',
                '-scheme',
                'App',
                '-configuration',
                'TestConfiguration',
                '-destination',
                'generic/platform=iOS',
                '-archivePath',
                'App.xcarchive',
                'archive',
                '-sdk',
                'TestSdkFlag'
            ]);
            expect(args.length).toEqual(13);
        });

        it('should add matched flags that are not overriding for simulator', () => {
            const buildFlags = '-archivePath TestArchivePathFlag';

            const args = getXcodeBuildArgs(testProjectPath, 'TestConfiguration', 'iPhone 5s', { device: false, buildFlag: buildFlags });
            expect(args).toEqual([
                '-workspace',
                'App.xcworkspace',
                '-scheme',
                'App',
                '-configuration',
                'TestConfiguration',
                '-sdk',
                'iphonesimulator',
                '-destination',
                'platform=iOS Simulator,name=iPhone 5s',
                'build',
                '-archivePath',
                'TestArchivePathFlag'
            ]);
            expect(args.length).toEqual(13);
        });

        it('should generate appropriate args for automatic provisioning', () => {
            const buildOpts = {
                device: true,
                automaticProvisioning: true,
                authenticationKeyPath: '/tmp/asc-key.p8',
                authenticationKeyID: '12345',
                authenticationKeyIssuerID: '00000000-0000-0000-0000-000000000000'
            };

            const args = getXcodeBuildArgs(testProjectPath, 'TestConfiguration', '', buildOpts);
            expect(args).toEqual([
                '-workspace',
                'App.xcworkspace',
                '-scheme',
                'App',
                '-configuration',
                'TestConfiguration',
                '-destination',
                'generic/platform=iOS',
                '-archivePath',
                'App.xcarchive',
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

        it('should generate appropriate args for Catalyst macOS builds', () => {
            const buildOpts = {
                catalyst: true
            };

            const args = getXcodeBuildArgs(testProjectPath, 'TestConfiguration', '', buildOpts);
            expect(args).toEqual([
                '-workspace',
                'App.xcworkspace',
                '-scheme',
                'App',
                '-configuration',
                'TestConfiguration',
                '-destination',
                'generic/platform=macOS,variant=Mac Catalyst',
                'build'
            ]);
            expect(args.length).toEqual(9);
        });
    });

    describe('getXcodeArchiveArgs method', () => {
        const getXcodeArchiveArgs = build.__get__('getXcodeArchiveArgs');

        it('should generate the appropriate arguments', () => {
            const archiveArgs = getXcodeArchiveArgs(testProjectPath, '/test/output/path', '/test/export/options/path');
            expect(archiveArgs[0]).toEqual('-exportArchive');
            expect(archiveArgs[1]).toEqual('-archivePath');
            expect(archiveArgs[2]).toEqual('App.xcarchive');
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

            const archiveArgs = getXcodeArchiveArgs(testProjectPath, '/test/output/path', '/test/export/options/path', buildOpts);
            expect(archiveArgs[0]).toEqual('-exportArchive');
            expect(archiveArgs[1]).toEqual('-archivePath');
            expect(archiveArgs[2]).toEqual('App.xcarchive');
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

        it('should generate the appropriate arguments with build flag overrides', () => {
            const buildFlags = '-archivePath TestArchivePathFlag';

            const archiveArgs = getXcodeArchiveArgs(testProjectPath, '/test/output/path', '/test/export/options/path', { buildFlag: buildFlags });
            expect(archiveArgs[0]).toEqual('-exportArchive');
            expect(archiveArgs[1]).toEqual('-archivePath');
            expect(archiveArgs[2]).toEqual('TestArchivePathFlag');
            expect(archiveArgs[3]).toEqual('-exportOptionsPlist');
            expect(archiveArgs[4]).toEqual('/test/export/options/path');
            expect(archiveArgs[5]).toEqual('-exportPath');
            expect(archiveArgs[6]).toEqual('/test/output/path');
            expect(archiveArgs.length).toEqual(7);
        });

        it('should generate the appropriate arguments with build flag overrides', () => {
            const buildFlags = ['-archivePath TestArchivePathFlag', '-quiet'];

            const archiveArgs = getXcodeArchiveArgs(testProjectPath, '/test/output/path', '/test/export/options/path', { buildFlag: buildFlags });
            expect(archiveArgs[0]).toEqual('-exportArchive');
            expect(archiveArgs[1]).toEqual('-archivePath');
            expect(archiveArgs[2]).toEqual('TestArchivePathFlag');
            expect(archiveArgs[3]).toEqual('-exportOptionsPlist');
            expect(archiveArgs[4]).toEqual('/test/export/options/path');
            expect(archiveArgs[5]).toEqual('-exportPath');
            expect(archiveArgs[6]).toEqual('/test/output/path');
            expect(archiveArgs[7]).toEqual('-quiet');
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

    describe('parseOptions method', () => {
        const parseOptions = build.__get__('parseOptions');
        const buildConfigJson = {
            ios: {
                debug: {
                    codeSignIdentity: 'Apple Developer',
                    packageType: 'development'
                },
                release: {
                    codeSignIdentity: 'Apple Distribution',
                    packageType: 'app-store'
                }
            }
        };

        it('should not accept debug and release options together', () => {
            expect(() => {
                return parseOptions({ debug: true, release: true });
            }).toThrowError(CordovaError, 'Cannot specify "debug" and "release" options together.');
        });

        it('should not accept device and emulator options together', () => {
            expect(() => {
                return parseOptions({ device: true, emulator: true });
            }).toThrowError(CordovaError, 'Cannot specify "device" and "emulator" options together.');
        });

        it('should parse platform-specific options', () => {
            const opts = parseOptions({
                argv: ['--packageType', 'ad-hoc', '--developmentTeam=A1B2C3', '--automaticProvisioning'],
                packageType: 'enterprise'
            });

            expect(opts.automaticProvisioning).toBeTruthy();
            expect(opts.packageType).toEqual('ad-hoc');
            expect(opts.developmentTeam).toEqual('A1B2C3');
        });

        it('should not accept a build config file that does not exist', () => {
            spyOn(fs, 'existsSync').and.returnValue(false);
            const buildConfig = './some/config/path';

            expect(() => {
                return parseOptions({ buildConfig: './some/config/path' });
            }).toThrowError(CordovaError, `Build config file does not exist: ${buildConfig}`);
        });

        it('should accept an empty build config file', () => {
            spyOn(fs, 'existsSync').and.returnValue(true);
            spyOn(fs, 'readFileSync').and.returnValue('{"android":{}}');

            expect(() => {
                return parseOptions({ buildConfig: './some/config/path' });
            }).not.toThrowError(CordovaError);
        });

        it('should pull debug configuration from the specified build config file', () => {
            spyOn(fs, 'existsSync').and.returnValue(true);
            spyOn(fs, 'readFileSync').and.returnValue(JSON.stringify(buildConfigJson));

            const opts = parseOptions({ buildConfig: './some/config/path', packageType: 'enterprise' });

            expect(opts.codeSignIdentity).toEqual('Apple Developer');
            expect(opts.packageType).toEqual('enterprise');
        });

        it('should pull release configuration from the specified build config file', () => {
            spyOn(fs, 'existsSync').and.returnValue(true);
            spyOn(fs, 'readFileSync').and.returnValue(JSON.stringify(buildConfigJson));

            const opts = parseOptions({ release: true, buildConfig: './some/config/path' });

            expect(opts.codeSignIdentity).toEqual('Apple Distribution');
            expect(opts.packageType).toEqual('app-store');
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

        it('should handle the case of no simulators being available', () => {
            // This method will require a module that supports the run method.
            build.__set__('require', () => ({
                run: () => Promise.resolve([])
            }));

            const getDefaultSimulatorTarget = build.__get__('getDefaultSimulatorTarget');

            return getDefaultSimulatorTarget().then(sim => {
                return Promise.reject(new Error('Should not resolve if no simulators are present'));
            }, (err) => {
                expect(err).toBeInstanceOf(CordovaError);
            });
        });
    });
});
