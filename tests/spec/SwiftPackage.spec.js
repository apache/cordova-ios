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
const SwiftPackage = require('../../lib/SwiftPackage.js').SwiftPackage;
const Api = require('../../lib/Api');
const EventEmitter = require('node:events').EventEmitter;
const ConfigParser = require('cordova-common').ConfigParser;
const PluginInfo = require('cordova-common').PluginInfo;
const Podfile_mod = require('../../lib/Podfile');
const PodsJson_mod = require('../../lib/PodsJson');

tmp.setGracefulCleanup();

const fixturePackage = fs.readFileSync(path.join(__dirname, 'fixtures', 'test-Package.swift'), 'utf-8');

describe('SwiftPackage', () => {
    let tmpDir;
    beforeEach(() => {
        tmpDir = tmp.dirSync();
    });

    afterEach(() => {
        fs.rmSync(tmpDir.name, { recursive: true, force: true });
    });

    it('should error if Package.swift file does not exist', () => {
        expect(() => {
            const _ = new SwiftPackage(tmpDir.name);
            expect(_).not.toEqual(null); // To avoid ESLINT error "Do not use 'new' for side effects"
        }).toThrow();
    });

    it('should skip cocoapod library if nospm is true', () => {
        const PROJ_NAME = 'dummyProj';
        const FIXTURES = path.join(__dirname, 'fixtures');
        const iosProjectFixture = path.join(FIXTURES, 'ios-packageswift-config-xml');
        const iosProject = path.join(FIXTURES, PROJ_NAME);
        fs.cpSync(iosProject, tmpDir.name, { recursive: true });
        const iosProjectTest = tmpDir.name;
        const iosPlatformTest = path.join(iosProjectTest, 'platforms', 'ios');
        fs.cpSync(iosProjectFixture, iosPlatformTest, { recursive: true });
        const cocoapod_swift_plugin = path.join(FIXTURES, 'org.test.plugins.swiftpackagecocoapodplugin');
        spyOn(Podfile_mod.Podfile.prototype, 'install').and.returnValue(Promise.resolve());
        spyOn(PodsJson_mod.PodsJson.prototype, 'setSwiftVersionForCocoaPodsLibraries').and.stub();
        const api = new Api('ios', iosPlatformTest, new EventEmitter());
        const project = {
            root: iosProjectTest,
            projectConfig: new ConfigParser(path.join(iosProjectTest, 'config.xml')),
            locations: {
                plugins: path.join(iosProjectTest, 'plugins'),
                www: path.join(iosProjectTest, 'www')
            }
        };
        return api.prepare(project, {})
            .then(() => {
                return api.addPlugin(new PluginInfo(cocoapod_swift_plugin), {});
            })
            .then(() => {
                const podFilePath = path.join(iosPlatformTest, 'Podfile');
                const podFile = fs.readFileSync(podFilePath, 'utf8');
                expect(podFile).toContain('pod \'DummyObjCPodAlpha\'');
                expect(podFile).not.toContain('pod \'DummyObjCPodBeta\'');
                expect(podFile).toContain('pod \'DummyObjCPodGamma\'');
            });
    });

    describe('addPlugin', () => {
        const my_plugin = {
            id: 'my-plugin',
            dir: path.join(__dirname, 'fixtures', 'org.test.plugins.swiftpackageplugin')
        };

        const namespaced_plugin = {
            id: '@username/my-plugin',
            dir: path.join(__dirname, 'fixtures', 'org.test.plugins.swiftpackageplugin')
        };

        let pkg;
        beforeEach(() => {
            fs.mkdirSync(path.join(tmpDir.name, 'packages', 'cordova-ios-plugins'), { recursive: true });
            fs.writeFileSync(path.join(tmpDir.name, 'packages', 'cordova-ios-plugins', 'Package.swift'), fixturePackage, 'utf8');

            pkg = new SwiftPackage(tmpDir.name);
        });

        it('should add plugin references to the package file', () => {
            pkg.addPlugin(my_plugin);

            const pkgPath = path.join(tmpDir.name, 'packages', 'cordova-ios-plugins', 'Package.swift');
            const content = fs.readFileSync(pkgPath, 'utf8');
            expect(content).toContain('.package(name: "my-plugin", path: "../my-plugin")');
            expect(content).toContain('.product(name: "my-plugin", package: "my-plugin")');
        });

        it('should copy the plugin into the packages directory', () => {
            pkg.addPlugin(my_plugin);

            expect(fs.existsSync(path.join(tmpDir.name, 'packages', 'my-plugin'))).toBeTruthy();
        });

        it('should update the CordovaLib dependency (copied)', () => {
            fs.mkdirSync(path.join(tmpDir.name, 'packages', 'cordova-ios'), { recursive: true });

            pkg.addPlugin(my_plugin);

            const pkgPath = path.join(tmpDir.name, 'packages', 'my-plugin', 'Package.swift');
            const content = fs.readFileSync(pkgPath, 'utf8');

            const relativePath = path.posix.join('..', 'cordova-ios');

            expect(content).toContain(`package(name: "cordova-ios", path: "${relativePath}"`);
            expect(content).not.toContain('github.com/apache/cordova-ios');
        });

        it('should update the CordovaLib dependency (linked)', () => {
            pkg.addPlugin(my_plugin);

            const pkgPath = path.join(tmpDir.name, 'packages', 'my-plugin', 'Package.swift');
            const content = fs.readFileSync(pkgPath, 'utf8');

            // Because we don't have the full project here, it behaves as if linked
            const packageLoc = path.dirname(require.resolve('../../package.json'));
            const relativeLink = path.relative(path.dirname(pkgPath), packageLoc).replaceAll(path.sep, path.posix.sep);

            expect(content).toContain(`package(name: "cordova-ios", path: "${relativeLink}"`);
            expect(content).not.toContain('github.com/apache/cordova-ios');
        });

        it('should add namespaced plugin references to the package file', () => {
            pkg.addPlugin(namespaced_plugin);

            const pkgPath = path.join(tmpDir.name, 'packages', 'cordova-ios-plugins', 'Package.swift');
            const content = fs.readFileSync(pkgPath, 'utf8');
            expect(content).toContain('.package(name: "@username/my-plugin", path: "../@username/my-plugin")');
            expect(content).toContain('.product(name: "@username/my-plugin", package: "@username/my-plugin")');
        });

        it('should copy the namespaced plugin into the packages directory', () => {
            pkg.addPlugin(namespaced_plugin);

            expect(fs.existsSync(path.join(tmpDir.name, 'packages', '@username', 'my-plugin'))).toBeTruthy();
        });

        it('should add plugin references to the package file when linked', () => {
            pkg.addPlugin(my_plugin, { link: true });

            const pkgPath = path.join(tmpDir.name, 'packages', 'cordova-ios-plugins', 'Package.swift');
            const content = fs.readFileSync(pkgPath, 'utf8');

            expect(content).toContain('.package(name: "my-plugin", path: "');
            expect(content).not.toContain('.package(name: "my-plugin", path: "../my-plugin")');
            expect(content).toContain('.product(name: "my-plugin", package: "my-plugin")');
        });

        it('should copy a linked plugin into the packages directory', () => {
            pkg.addPlugin(my_plugin, { link: true });

            expect(fs.existsSync(path.join(tmpDir.name, 'packages', 'my-plugin'))).toBeFalsy();
        });
    });

    describe('removePlugin', () => {
        const my_plugin = {
            id: 'my-plugin',
            dir: path.join(__dirname, 'fixtures', 'org.test.plugins.swiftpackageplugin')
        };

        let pkg;
        beforeEach(() => {
            fs.mkdirSync(path.join(tmpDir.name, 'packages', 'cordova-ios-plugins'), { recursive: true });
            const pkgPath = path.join(tmpDir.name, 'packages', 'cordova-ios-plugins', 'Package.swift');
            fs.writeFileSync(pkgPath, fixturePackage, 'utf8');

            pkg = new SwiftPackage(tmpDir.name);
            fs.writeFileSync(pkgPath, fixturePackage + pkg._pluginReference(my_plugin, '../my-plugin'), 'utf8');
        });

        it('should remove plugin references to the package file', () => {
            pkg.removePlugin(my_plugin);

            const pkgPath = path.join(tmpDir.name, 'packages', 'cordova-ios-plugins', 'Package.swift');
            const content = fs.readFileSync(pkgPath, 'utf8');

            expect(content).not.toContain('.package(name: "my-plugin"');
            expect(content).not.toContain('.product(name: "my-plugin", package: "my-plugin")');
        });

        it('should remove the plugin from the packages directory', () => {
            fs.mkdirSync(path.join(tmpDir.name, 'packages', 'my-plugin'), { recursive: true });
            fs.writeFileSync(path.join(tmpDir.name, 'packages', 'my-plugin', 'test.txt'), 'Test', 'utf-8');

            expect(fs.existsSync(path.join(tmpDir.name, 'packages', 'my-plugin'))).toBeTruthy();

            pkg.removePlugin(my_plugin);

            expect(fs.existsSync(path.join(tmpDir.name, 'packages', 'my-plugin'))).toBeFalsy();
        });
    });
});
