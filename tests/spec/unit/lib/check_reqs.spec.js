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
var checkReqs = rewire('../../../../bin/templates/scripts/cordova/lib/check_reqs');

describe('check_reqs', function () {
    describe('checkTool method', () => {
        const originalVersion = checkReqs.__get__('versions');
        let shellWhichSpy;
        let rejectSpy;
        let resolveSpy;
        let getToolVersionSpy;

        beforeEach(() => {
            // Shell Spy
            shellWhichSpy = jasmine.createSpy('shellWhichSpy');
            checkReqs.__set__('shell', {
                which: shellWhichSpy
            });

            // Q Spy
            rejectSpy = jasmine.createSpy('rejectSpy');
            resolveSpy = jasmine.createSpy('resolveSpy');
            checkReqs.__set__('Q', {
                reject: rejectSpy,
                resolve: resolveSpy
            });

            // Versions Spy
            getToolVersionSpy = jasmine.createSpy('rejectSpy');
        });

        it('should not have found tool.', () => {
            shellWhichSpy.and.returnValue(false);
            const checkTool = checkReqs.__get__('checkTool');

            checkTool('node', '1.0.0');

            expect(rejectSpy).toHaveBeenCalledWith(jasmine.stringMatching(/^node was not found./));
        });

        it('should throw error because version is not following semver-notated.', (done) => {
            shellWhichSpy.and.returnValue('/bin/node');
            const checkTool = checkReqs.__get__('checkTool');

            checkReqs.__set__('versions', {
                get_tool_version: getToolVersionSpy.and.returnValue(new Promise((resolve) => {
                    return resolve('1.0.0');
                }).catch((error) => { console.log(error); })),
                compareVersions: originalVersion.compareVersions
            });

            checkTool('node', 'v1.0.0').catch((error) => {
                expect(error).toEqual('Version should contain only numbers and dots');
                done();
            });
        });

        it('should resolve passing back tool version.', (done) => {
            shellWhichSpy.and.returnValue('/bin/node');
            const checkTool = checkReqs.__get__('checkTool');

            checkReqs.__set__('versions', {
                get_tool_version: getToolVersionSpy.and.returnValue(new Promise((resolve) => {
                    return resolve('1.0.0');
                })),
                compareVersions: originalVersion.compareVersions
            });

            checkTool('node', '1.0.0').then(() => {
                let actual = resolveSpy.calls.argsFor(0)[0];
                expect(actual).toEqual({ version: '1.0.0' });
                done();
            });
        });

        it('should reject because tool does not meet minimum requirement.', (done) => {
            shellWhichSpy.and.returnValue('/bin/node');
            const checkTool = checkReqs.__get__('checkTool');

            checkReqs.__set__('versions', {
                get_tool_version: getToolVersionSpy.and.returnValue(new Promise((resolve) => {
                    return resolve('1.0.0');
                })),
                compareVersions: originalVersion.compareVersions
            });

            checkTool('node', '1.0.1').then(() => {
                let actual = rejectSpy.calls.argsFor(0)[0];
                expect(actual).toContain('version 1.0.1 or greater');
                expect(actual).toContain('you have version 1.0.0');
                done();
            });
        });
    });
});
