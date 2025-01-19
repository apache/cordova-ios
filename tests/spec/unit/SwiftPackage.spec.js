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
const SwiftPackage = require('../../../lib/SwiftPackage.js').SwiftPackage;

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

    describe('addPlugin', () => {
        const my_plugin = {
            id: 'my-plugin',
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
            fs.writeFileSync(pkgPath, fixturePackage + pkg._pluginReference(my_plugin), 'utf8');
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
