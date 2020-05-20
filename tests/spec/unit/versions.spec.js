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
const versions = require('../../../bin/templates/scripts/cordova/lib/versions');

// These tests can not run on windows.
if (process.platform === 'darwin') {
    describe('versions', () => {
        beforeEach(() => {
            spyOn(console, 'log');
        });

        describe('get_apple_ios_version method', () => {
            it('should have found ios version.', () => {
                return versions.get_apple_ios_version().then(() => {
                    expect(console.log).not.toHaveBeenCalledWith(undefined);
                });
            }, 10000);
        });

        describe('get_apple_osx_version method', () => {
            it('should have found osx version.', () => {
                return versions.get_apple_osx_version().then(() => {
                    expect(console.log).not.toHaveBeenCalledWith(undefined);
                });
            });
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
