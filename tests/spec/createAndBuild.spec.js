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

const EventEmitter = require('node:events');
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
function verifyProjectFiles (tmpDir, projectName) {
    expect(fs.existsSync(path.join(tmpDir, 'App'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'App.xcodeproj'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'App.xcworkspace'))).toBe(true);
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

/**
 * Runs and expects for a successful build.
 *
 * @param {String} tmpDir
 * @returns {Promise}
 */
function verifyBuild (tmpDir) {
    // Allow test project to find the `cordova-ios` module
    fs.mkdirSync(path.join(tmpDir, 'node_modules'), { recursive: true });
    fs.symlinkSync(
        path.join(__dirname, '..', '..'),
        path.join(tmpDir, 'node_modules', 'cordova-ios'),
        'junction'
    );

    const events = new EventEmitter();
    const Api = require(path.join(tmpDir, 'cordova', 'Api.js'));
    const target = process.env.CDV_IOS_SIM?.replace(/\s/g, '-') ?? 'iPhone-16e';

    return expectAsync(new Api('ios', tmpDir, events).build({ emulator: true, buildFlag: ['-quiet'], target }))
        .toBeResolved();
}

/**
 * Runs various create and build checks.
 *
 * @param {String} tmpDir
 * @param {String} packageName
 * @param {String} projectName
 * @returns {Promise}
 */
async function verifyCreateAndBuild (tmpDir, packageName, projectName) {
    const configXml = new ConfigParser(templateConfigXmlPath);

    await create.createProject(tmpDir, packageName, projectName, {}, configXml)
        .then(() => verifyProjectFiles(tmpDir, projectName))
        .then(() => verifyProjectBundleIdentifier(tmpDir, projectName, packageName))
        .then(() => verifyBuild(tmpDir));
}

if (process.platform === 'darwin') {
    describe('create', () => {
        let tmpDir;

        beforeEach(function () {
            tmpDir = makeTempDir();
        });

        afterEach(() => {
            fs.rmSync(tmpDir, { recursive: true, force: true });
        });

        it('Test#001 : create project with ascii name, no spaces', () => {
            const packageName = 'com.test.app1';
            const projectName = 'testcreate';
            return verifyCreateAndBuild(tmpDir, packageName, projectName);
        }, 10 * 60 * 1000); // first build takes longer (probably cold caches)

        it('Test#002 : create project with complicated name', () => {
            const packageName = 'com.test.app2';
            const projectName = '応応応応 hello & إثرا 用用用用';
            return verifyCreateAndBuild(tmpDir, packageName, projectName);
        }, 5 * 60 * 1000);
    });
}
