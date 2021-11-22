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

const semver = require('semver');
const versions = require('../../../lib/versions');

// These tests can not run on windows.
if (process.platform === 'darwin') {
    describe('versions', () => {
        describe('get_apple_ios_version method', () => {
            it('should have found ios version.', () => {
                return versions.get_apple_ios_version().then(version => {
                    expect(version).not.toBeUndefined();
                });
            }, 10000);
        });

        describe('get_apple_osx_version method', () => {
            it('should have found osx version.', () => {
                return versions.get_apple_osx_version().then(version => {
                    expect(version).not.toBeUndefined();
                });
            });
        });

        describe('get_tool_version method', () => {
            it('should not have found tool by name.', () => {
                return versions.get_tool_version('unknown').then(
                    () => fail('expected promise rejection'),
                    error => expect(error.message).toContain('is not valid tool name')
                );
            }, 10000);

            it('should find xcodebuild version.', () => {
                return versions.get_tool_version('xcodebuild').then((version) => {
                    expect(version).not.toBe(undefined);
                });
            }, 10000);

            it('should find ios-sim version.', () => {
                return versions.get_tool_version('ios-sim').then((version) => {
                    expect(version).not.toBe(undefined);
                });
            }, 10000);

            it('should find ios-deploy version.', () => {
                return versions.get_tool_version('ios-deploy').then((version) => {
                    expect(version).not.toBe(undefined);
                });
            }, 10000);

            it('should find pod version.', () => {
                return versions.get_tool_version('pod').then((version) => {
                    expect(version).not.toBe(undefined);
                });
            }, 20000); // The first invocation of `pod` can be quite slow
        });
    });
}

describe('versions', () => {
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
    });
});
