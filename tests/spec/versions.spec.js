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

const childProcess = require('node:child_process');
const semver = require('semver');
const versions = require('../../lib/versions');

const xcodeSdksOutput = `
DriverKit SDKs:
        DriverKit 25.2                  -sdk driverkit25.2

iOS SDKs:
        iOS 26.2                        -sdk iphoneos26.2

iOS Simulator SDKs:
        Simulator - iOS 26.2            -sdk iphonesimulator26.2

macOS SDKs:
        macOS 15.7                      -sdk macosx15.7

visionOS SDKs:
        visionOS 26.2                   -sdk xros26.2

visionOS Simulator SDKs:
        Simulator - visionOS 26.2       -sdk xrsimulator26.2
`;

describe('versions', () => {
    let spawnMock;

    beforeEach(() => {
        spawnMock = spyOn(childProcess, 'spawnSync');
    });

    describe('compareVersions method', () => {
        it('calls semver.compare, given valid semver', () => {
            const testVersions = ['1.0.0', '1.1.0'];
            spyOn(semver, 'compare');

            versions.compareVersions(...testVersions);
            expect(semver.compare).toHaveBeenCalledWith(
                ...testVersions.map(version =>
                    jasmine.objectContaining({ version })
                )
            );
        });

        it('handles pre-release identifiers', () => {
            expect(
                versions.compareVersions('1.0.0-rc.0', '1.0.0')
            ).toBe(-1);
        });

        it('handles non-semver versions', () => {
            expect(
                versions.compareVersions('10.1', '10')
            ).toBe(1);
        });

        it('does not handle pre-release identifiers on non-semver versions', () => {
            expect(
                versions.compareVersions('10.1-beta.1', '10.1')
            ).toBe(0);
        });

        it('throws when given an invalid version', () => {
            expect(() => versions.compareVersions('10.1', 'random string')).toThrowError(TypeError, 'Invalid Version: random string');
        });
    });

    describe('get_apple_ios_version', () => {
        it('should have found iOS version', () => {
            spawnMock.and.returnValue({ status: 0, stdout: xcodeSdksOutput });

            return versions.get_apple_ios_version().then(version => {
                expect(spawnMock).toHaveBeenCalledWith('xcodebuild', ['-showsdks'], jasmine.anything());
                expect(version).toEqual('26.2');
            });
        });

        it('should fail if iOS SDK cannot be found', () => {
            spawnMock.and.returnValue({ status: 0, stdout: '' });

            return versions.get_apple_ios_version().then(
                _ => fail(),
                err => expect(err.message).toMatch(/Could not determine iOS version/)
            );
        });

        it('should fail if the command return an error', () => {
            spawnMock.and.returnValue({ error: new Error('Bad Command') });

            return versions.get_apple_ios_version().then(
                _ => fail(),
                err => expect(err.message).toMatch(/Bad Command/)
            );
        });

        it('should fail if the command return a non-zero status code', () => {
            spawnMock.and.returnValue({ status: 1, stderr: 'Error message' });

            return versions.get_apple_ios_version().then(
                _ => fail(),
                err => expect(err.message).toMatch(/Error message/)
            );
        });

        it('should fail if xcodebuild cannot be found', () => {
            spawnMock.and.throwError(new Error('ENOENT'));

            return versions.get_apple_ios_version().then(
                _ => fail(),
                err => expect(err.message).toMatch(/ENOENT/)
            );
        });
    });

    describe('get_apple_osx_version', () => {
        it('should have found macOS version', () => {
            spawnMock.and.returnValue({ status: 0, stdout: xcodeSdksOutput });

            return versions.get_apple_osx_version().then(version => {
                expect(spawnMock).toHaveBeenCalledWith('xcodebuild', ['-showsdks'], jasmine.anything());
                expect(version).toEqual('15.7');
            });
        });

        it('should fail if macOS SDK cannot be found', () => {
            spawnMock.and.returnValue({ status: 0, stdout: '' });

            return versions.get_apple_osx_version().then(
                _ => fail(),
                err => expect(err.message).toMatch(/Could not determine macOS version/)
            );
        });
    });

    describe('get_tool_version', () => {
        it('should not have found tool by name.', () => {
            return versions.get_tool_version('unknown').then(
                _ => fail('expected promise rejection'),
                err => expect(err.message).toContain('is not valid tool name')
            );
        });

        describe('xcodebuild', () => {
            it('should find xcodebuild version', () => {
                spawnMock.and.returnValue({ status: 0, stdout: 'Xcode 16.4' });

                return versions.get_tool_version('xcodebuild').then((version) => {
                    expect(spawnMock).toHaveBeenCalledWith('xcodebuild', ['-version'], jasmine.anything());
                    expect(version).toEqual('16.4');
                });
            });

            it('should fail if the version cannot be parsed', () => {
                spawnMock.and.returnValue({ status: 0, stdout: 'Not a version' });

                return versions.get_tool_version('xcodebuild').then(
                    _ => fail(),
                    err => expect(err.message).toMatch(/Could not determine Xcode version/)
                );
            });
        });

        describe('ios-deploy', () => {
            it('should find ios-deploy version', () => {
                spawnMock.and.returnValue({ status: 0, stdout: '1.12.2' });

                return versions.get_tool_version('ios-deploy').then((version) => {
                    expect(spawnMock).toHaveBeenCalledWith('ios-deploy', ['--version'], jasmine.anything());
                    expect(version).toEqual('1.12.2');
                });
            });

            it('should fail if ios-deploy cannot be found', () => {
                spawnMock.and.throwError(new Error('ENOENT'));

                return versions.get_tool_version('ios-deploy').then(
                    _ => fail(),
                    err => expect(err.message).toMatch(/ENOENT/)
                );
            });
        });

        describe('pod', () => {
            it('should find ios-deploy version', () => {
                spawnMock.and.returnValue({ status: 0, stdout: '1.16.2' });

                return versions.get_tool_version('pod').then((version) => {
                    expect(spawnMock).toHaveBeenCalledWith('pod', ['--version'], jasmine.anything());
                    expect(version).toEqual('1.16.2');
                });
            });

            it('should fail if pod cannot be found', () => {
                spawnMock.and.throwError(new Error('ENOENT'));

                return versions.get_tool_version('pod').then(
                    _ => fail(),
                    err => expect(err.message).toMatch(/ENOENT/)
                );
            });
        });
    });
});
