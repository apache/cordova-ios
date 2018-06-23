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

var rewire = require('rewire');
var versions = rewire('../../../bin/templates/scripts/cordova/lib/versions');

// These tests can not run on windows.
if (process.platform === 'darwin') {
    describe('versions', function () {
        describe('get_apple_ios_version method', () => {
            it('should have found ios version.', (done) => {
                let _console = versions.__get__('console');
                let logSpy = jasmine.createSpy('logSpy');
                versions.__set__('console', {log: logSpy});

                versions.get_apple_ios_version().then(() => {
                    expect(logSpy).not.toHaveBeenCalledWith(undefined);
                    versions.__set__('console', _console);
                    done();
                });
            });
        });

        describe('get_apple_osx_version method', () => {
            it('should have found osx version.', (done) => {
                let _console = versions.__get__('console');
                let logSpy = jasmine.createSpy('logSpy');
                versions.__set__('console', {log: logSpy});

                versions.get_apple_osx_version().then(() => {
                    expect(logSpy).not.toHaveBeenCalledWith(undefined);
                    versions.__set__('console', _console);
                    done();
                });
            });
        });

        describe('get_tool_version method', () => {
            it('should not have found tool by name.', (done) => {
                versions.get_tool_version('unknown').catch((error) => {
                    expect(error).toContain('is not valid tool name');
                    done();
                });
            });

            it('should find xcodebuild version.', (done) => {
                versions.get_tool_version('xcodebuild').then((version) => {
                    expect(version).not.toBe(undefined);
                    done();
                });
            });

            it('should find ios-sim version.', (done) => {
                versions.get_tool_version('ios-sim').then((version) => {
                    expect(version).not.toBe(undefined);
                    done();
                });
            });

            it('should find ios-deploy version.', (done) => {
                versions.get_tool_version('ios-deploy').then((version) => {
                    expect(version).not.toBe(undefined);
                    done();
                });
            });

            it('should find pod version.', (done) => {
                versions.get_tool_version('pod').then((version) => {
                    expect(version).not.toBe(undefined);
                    done();
                });
            });
        });
    });
}
