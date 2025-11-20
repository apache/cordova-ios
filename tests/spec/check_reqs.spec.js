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

const process = require('node:process');
const which = require('which');
const checkReqs = require('../../lib/check_reqs');
const versions = require('../../lib/versions');

describe('check_ios_deploy', () => {
    beforeEach(() => {
        spyOn(which, 'sync').and.returnValue('/bin/ios-deploy');
        spyOn(versions, 'get_tool_version').and.resolveTo('1.13.0');
    });

    it('should not have found tool.', () => {
        which.sync.and.returnValue(false);

        return checkReqs.check_ios_deploy().then(
            () => fail('Expected promise to be rejected'),
            reason => expect(reason.message).toContain('ios-deploy was not found.')
        );
    });

    it('should resolve passing back tool version.', () => {
        return checkReqs.check_ios_deploy().then(result => {
            expect(result).toEqual({ version: '1.13.0' });
        });
    });

    it('should reject because tool does not meet minimum requirement.', () => {
        versions.get_tool_version.and.resolveTo('1.10.0');

        return checkReqs.check_ios_deploy().then(
            () => fail('Expected promise to be rejected'),
            reason => expect(reason.message).toContain('version 1.12.2 or greater, you have version 1.10.0')
        );
    });
});

describe('check_os', () => {
    describe('darwin', () => {
        beforeEach(() => {
            Object.defineProperty(process, 'platform', { value: 'darwin' });
        });

        afterEach(() => {
            delete process.platform;
        });

        it('should resolve with the platform name', () => {
            return checkReqs.check_os().then(result => {
                expect(result).toEqual('darwin');
            });
        });
    });

    describe('non-darwin', () => {
        beforeEach(() => {
            Object.defineProperty(process, 'platform', { value: 'linux' });
        });

        afterEach(() => {
            delete process.platform;
        });

        it('should reject with an error', () => {
            return checkReqs.check_os().then(
                () => fail('Expected promise to be rejected'),
                reason => expect(reason.message).toContain('iOS requires Apple')
            );
        });
    });
});
