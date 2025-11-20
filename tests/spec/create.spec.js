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
const path = require('node:path');
const tmp = require('tmp');
const xcode = require('xcode');
const { ConfigParser } = require('cordova-common');
const create = require('../../lib/create');

tmp.setGracefulCleanup();

function makeTempDir () {
    const tempdir = tmp.dirSync({ unsafeCleanup: true });
    return path.join(tempdir.name, `cordova-ios-create-test-${Date.now()}`);
}

const templateConfigXmlPath = path.join(__dirname, '..', '..', 'templates', 'project', 'App', 'config.xml');

/**
 * Verifies that some of the project file exists. Not all will be tested.
 * E.g. App's resource directory, xcodeproj, xcworkspace, and CordovaLib.
 *
 * @param {String} tmpDir
 * @param {String} projectName
 */
function verifyProjectFiles (tmpDir, projectName, linked) {
    expect(fs.existsSync(path.join(tmpDir, 'App'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'App.xcodeproj'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'App.xcworkspace'))).toBe(true);

    const pbxproj = path.join(tmpDir, 'App.xcodeproj', 'project.pbxproj');
    const xcodeproj = xcode.project(pbxproj);
    xcodeproj.parseSync();

    const packageLoc = path.dirname(require.resolve('../../package.json'));
    const relativeLink = path.relative(tmpDir, packageLoc).replaceAll(path.sep, path.posix.sep);
    const relativePath = path.posix.join('packages', 'cordova-ios');

    let foundRef = false;
    const pkgRefs = xcodeproj.hash.project.objects.XCLocalSwiftPackageReference;
    for (const [key, ref] of Object.entries(pkgRefs)) {
        if (key.endsWith('_COMMENT')) {
            continue;
        }

        if (ref.relativePath.match(/\/cordova-ios/)) {
            foundRef = true;
            if (linked) {
                expect(ref.relativePath).toMatch(relativeLink);
            } else {
                expect(ref.relativePath).toMatch(relativePath);
            }
            break;
        }
    }
    expect(foundRef).toBeTruthy();
}

/**
 * Verifies that the set bundle id matches with the expected.
 *
 * @param {String} tmpDir
 * @param {String} projectName
 * @param {String} expectedBundleIdentifier
 */
function verifyProjectBundleIdentifier (tmpDir, projectName, expectedBundleIdentifier) {
    const pbxproj = path.join(tmpDir, 'App.xcodeproj', 'project.pbxproj');
    const xcodeproj = xcode.project(pbxproj);
    xcodeproj.parseSync();

    const actualBundleIdentifier = xcodeproj.getBuildProperty('PRODUCT_BUNDLE_IDENTIFIER', undefined, 'App');
    expect(actualBundleIdentifier).toBe(`"${expectedBundleIdentifier}"`);

    const actualBundleName = xcodeproj.getBuildProperty('PRODUCT_NAME', undefined, 'App');
    expect(actualBundleName).toBe(`"${projectName}"`);
}

function verifyProjectDeploymentTarget (tmpDir, expectedTarget) {
    const pbxproj = path.join(tmpDir, 'App.xcodeproj', 'project.pbxproj');
    const xcodeproj = xcode.project(pbxproj);
    xcodeproj.parseSync();

    const actualDeploymentTarget = xcodeproj.getBuildProperty('IPHONEOS_DEPLOYMENT_TARGET');
    expect(actualDeploymentTarget).toBe(expectedTarget);
}

/**
 * Runs various project creation checks.
 *
 * @param {String} tmpDir
 * @param {String} packageName
 * @param {String} projectName
 * @returns {Promise}
 */
async function verifyCreatedProject (tmpDir, packageName, projectName, link = false, configFile = templateConfigXmlPath) {
    const configXml = new ConfigParser(configFile);

    await create.createProject(tmpDir, packageName, projectName, { link }, configXml)
        .then(() => verifyProjectFiles(tmpDir, projectName, link))
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

    it('should create project with linked CordovaLib', () => {
        const packageName = 'com.test.app3';
        const projectName = 'testcreatelink';
        return verifyCreatedProject(tmpDir, packageName, projectName, true);
    });

    it('should copy config.xml into the newly created project', () => {
        const configPath = path.join(__dirname, 'fixtures', 'test-config-3.xml');
        const packageName = 'org.apache.cordova.hellocordova.ios';
        const projectName = 'Hello Cordova';

        return verifyCreatedProject(tmpDir, packageName, projectName, false, configPath)
            .then(() => verifyProjectDeploymentTarget(tmpDir, '15.0'));
    });
});
