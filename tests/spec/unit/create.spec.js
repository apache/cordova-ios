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
const os = require('node:os');
const path = require('node:path');
const xcode = require('xcode');
const create = require('../../../lib/create');

const makeTempDir = () => path.join(
    fs.realpathSync(os.tmpdir()),
    `cordova-ios-create-test-${Date.now()}`
);

/**
 * Verifies that some of the project file exists. Not all will be tested.
 * E.g. App's resource directory, xcodeproj, xcworkspace, and CordovaLib.
 *
 * @param {String} tmpDir
 * @param {String} projectName
 */
function verifyProjectFiles (tmpDir, projectName) {
    expect(fs.existsSync(path.join(tmpDir, projectName))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, `${projectName}.xcodeproj`))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, `${projectName}.xcworkspace`))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'CordovaLib'))).toBe(true);

    const pbxproj = path.join(tmpDir, `${projectName}.xcodeproj`, 'project.pbxproj');
    const pbxcontents = fs.readFileSync(pbxproj, 'utf-8');
    const regex = /(.+CordovaLib.xcodeproj.+PBXFileReference.+wrapper.pb-project.+)(path = .+?;)(.*)(sourceTree.+;)(.+)/;
    const line = pbxcontents.split(/\r?\n/).find(l => regex.test(l));

    expect(line).toMatch(/path = CordovaLib\/CordovaLib.xcodeproj;/);
}

/**
 * Verifies that the set bundle id matches with the expected.
 *
 * @param {String} tmpDir
 * @param {String} projectName
 * @param {String} expectedBundleIdentifier
 */
function verifyProjectBundleIdentifier (tmpDir, projectName, expectedBundleIdentifier) {
    const pbxproj = path.join(tmpDir, `${projectName}.xcodeproj`, 'project.pbxproj');
    const xcodeproj = xcode.project(pbxproj);
    xcodeproj.parseSync();
    const actualBundleIdentifier = xcodeproj.getBuildProperty('PRODUCT_BUNDLE_IDENTIFIER');
    expect(actualBundleIdentifier).toBe(`"${expectedBundleIdentifier}"`);
}

/**
 * Runs various project creation checks.
 *
 * @param {String} tmpDir
 * @param {String} packageName
 * @param {String} projectName
 * @returns {Promise}
 */
async function verifyCreatedProject (tmpDir, packageName, projectName) {
    await create.createProject(tmpDir, packageName, projectName, {}, undefined)
        .then(() => verifyProjectFiles(tmpDir, projectName))
        .then(() => verifyProjectBundleIdentifier(tmpDir, projectName, packageName));
}

describe('create', () => {
    let tmpDir;

    beforeEach(function () {
        tmpDir = makeTempDir();
    });

    afterEach(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it('should create project with ascii name, no spaces', () => {
        const packageName = 'com.test.app1';
        const projectName = 'testcreate';
        return verifyCreatedProject(tmpDir, packageName, projectName);
    });

    it('should create project with complicated name', () => {
        const packageName = 'com.test.app2';
        const projectName = '応応応応 hello & إثرا 用用用用';
        return verifyCreatedProject(tmpDir, packageName, projectName);
    });
});
