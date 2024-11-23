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
    it('should error if Package.swift file does not exist', () => {
        expect(() => {
            const _ = new SwiftPackage('dummypath');
            expect(_).not.toEqual(null); // To avoid ESLINT error "Do not use 'new' for side effects"
        }).toThrow();
    });

    describe('addPlugin', () => {
        const my_plugin = {
            id: 'my-plugin'
        };

        let pkg;
        let tmpFile;
        beforeEach(() => {
            tmpFile = tmp.fileSync({ discardDescriptor: true });
            fs.writeFileSync(tmpFile.name, fixturePackage, 'utf8');

            pkg = new SwiftPackage(tmpFile.name);
        });

        it('should add plugin references to the package file', () => {
            pkg.addPlugin(my_plugin);

            const content = fs.readFileSync(tmpFile.name, 'utf8');
            expect(content).toContain('.package(name: "my-plugin"');
            expect(content).toContain('.product(name: "my-plugin", package: "my-plugin")');
        });
    });

    describe('removePlugin', () => {
        const my_plugin = {
            id: 'my-plugin'
        };

        let pkg;
        let tmpFile;
        beforeEach(() => {
            tmpFile = tmp.fileSync({ discardDescriptor: true });

            pkg = new SwiftPackage(tmpFile.name);
            fs.writeFileSync(tmpFile.name, fixturePackage + pkg._pluginReference(my_plugin), 'utf8');
        });

        it('should add plugin references to the package file', () => {
            pkg.removePlugin(my_plugin);

            const content = fs.readFileSync(tmpFile.name, 'utf8');
            expect(content).not.toContain('.package(name: "my-plugin"');
            expect(content).not.toContain('.product(name: "my-plugin", package: "my-plugin")');
        });
    });
});
