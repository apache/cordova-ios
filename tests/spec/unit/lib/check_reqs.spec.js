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

const rewire = require('rewire');
const shell = require('shelljs');
const versions = require('../../../../bin/templates/scripts/cordova/lib/versions');

describe('check_reqs', function () {
    let checkReqs;
    beforeEach(() => {
        checkReqs = rewire('../../../../bin/templates/scripts/cordova/lib/check_reqs');
    });

    describe('checkTool method', () => {
        let checkTool;

        beforeEach(() => {
            checkTool = checkReqs.__get__('checkTool');

            spyOn(shell, 'which').and.returnValue('/bin/node');
            spyOn(versions, 'get_tool_version').and.returnValue(Promise.resolve('1.0.0'));
        });

        it('should not have found tool.', () => {
            shell.which.and.returnValue(false);

            return checkTool('node', '1.0.0').then(
                () => fail('Expected promise to be rejected'),
                reason => expect(reason).toContain('node was not found.')
            );
        });

        it('should throw error because version is not following semver-notated.', () => {
            return checkTool('node', 'a.b.c').then(
                () => fail('Expected promise to be rejected'),
                err => expect(err).toEqual(new TypeError('Invalid Version: a.b.c'))
            );
        });

        it('should resolve passing back tool version.', () => {
            return checkTool('node', '1.0.0').then(result => {
                expect(result).toEqual({ version: '1.0.0' });
            });
        });

        it('should reject because tool does not meet minimum requirement.', () => {
            return checkTool('node', '1.0.1').then(
                () => fail('Expected promise to be rejected'),
                reason => expect(reason).toContain('version 1.0.1 or greater, you have version 1.0.0')
            );
        });
    });

    describe('check_cocoapods method', () => {
        let toolsChecker;
        beforeEach(() => {
            toolsChecker = jasmine.createSpy('toolsChecker')
                .and.returnValue(Promise.resolve({ version: '1.2.3' }));
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
