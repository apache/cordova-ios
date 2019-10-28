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

            checkTool('node', 'a.b.c').catch(err => {
                expect(err).toEqual(new TypeError('Invalid Version: a.b.c'));
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

    describe('check_cocoapods method', () => {
        let toolsChecker;
        beforeEach(() => {
            toolsChecker = jasmine.createSpy('toolsChecker')
                .and.returnValue(Promise.resolve({}));
        });

        it('should resolve when on an unsupported platform', () => {
            checkReqs.__set__({
                os_platform_is_supported: () => false
            });

            return checkReqs.check_cocoapods(toolsChecker).then(toolOptions => {
                expect(toolsChecker).not.toHaveBeenCalled();
                expect(toolOptions.ignore).toBeDefined();
                expect(toolOptions.ignoreMessage).toBeDefined();
            });
        });

        it('should resolve when toolsChecker resolves', () => {
            checkReqs.__set__({
                os_platform_is_supported: () => true
            });
            spyOn(shell, 'exec').and.returnValue({ code: 1 });

            return checkReqs.check_cocoapods(toolsChecker).then(() => {
                expect(shell.exec).toHaveBeenCalled();
            });
        });

        it('should reject when toolsChecker rejects', () => {
            checkReqs.__set__({
                os_platform_is_supported: () => true
            });
            const testError = new Error();
            toolsChecker.and.callFake(() => Promise.reject(testError));

            return checkReqs.check_cocoapods(toolsChecker).then(
                () => fail('Expected promise to be rejected'),
                err => expect(err).toBe(testError)
            );
        });
    });
});
