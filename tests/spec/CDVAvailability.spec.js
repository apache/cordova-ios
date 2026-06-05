/*
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
const semver = require('semver');
const VERSION = require(path.resolve(__dirname, '..', '..', 'package.json')).version;

const pkgVersion = semver.coerce(VERSION).version;
const versionDefine = `__CORDOVA_${pkgVersion.split('.').join('_')}`;

const headerPath = path.resolve(__dirname, '..', '..', 'CordovaLib', 'include', 'Cordova', 'CDVAvailability.h');

describe('CDVAvailability.h', () => {
    let headerText = '';

    beforeAll(() => {
        headerText = fs.readFileSync(headerPath, 'utf8');
    });

    it('should contain a definition for the current package version', () => {
        expect(headerText).toMatch(versionDefine);
    });

    it('should define the current version as CORDOVA_VERSION_MIN_REQUIRED', () => {
        const minRequired = `#define CORDOVA_VERSION_MIN_REQUIRED ${versionDefine}`;

        expect(headerText).toMatch(minRequired);
    });
});
