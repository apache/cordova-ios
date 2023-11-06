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

const fs = require('fs-extra');
const path = require('path');
const util = require('util');
const CordovaError = require('cordova-common').CordovaError;

const PodsJson = require(path.resolve(path.join(__dirname, '../../../lib/PodsJson.js'))).PodsJson;
const fixturePodsJson = path.resolve(__dirname, 'fixtures', 'testProj', 'platforms', 'ios', 'pods.json');

// tests are nested in a describe to ensure clean up happens after all unit tests are run
describe('unit tests for Podfile module', () => {
    let podsjson = null;
    beforeEach(() => {
        podsjson = new PodsJson(fixturePodsJson);
    });
    afterEach(() => {
        podsjson.destroy();
    });

    describe('tests', () => {
        it('Test 001 : throws CordovaError when the path filename is not named pods.json', () => {
            const dummyPath = 'NotPodsJson';
            expect(() => {
                new PodsJson(dummyPath); /* eslint no-new : 0 */
            }).toThrow(new CordovaError(util.format('PodsJson: The file at %s is not `%s`.', dummyPath, PodsJson.FILENAME)));
        });

        it('Test 002 : setsJson and gets pod test', () => {
            const val0 = {
                name: 'Foo',
                type: 'podspec',
                spec: '1.0',
                count: 1
            };
            podsjson.setJsonLibrary(val0.name, val0);
            const val1 = podsjson.getLibrary(val0.name);

            expect(val1).toBeTruthy();
            expect(val1.name).toEqual(val0.name);
            expect(val1.type).toEqual(val0.type);
            expect(val1.spec).toEqual(val0.spec);
            expect(val1.count).toEqual(val0.count);
        });

        it('Test 003 : setsJson and remove pod test', () => {
            const val0 = {
                name: 'Bar',
                type: 'podspec',
                spec: '2.0',
                count: 2
            };
            podsjson.setJsonLibrary(val0.name, val0);
            let val1 = podsjson.getLibrary(val0.name);

            expect(val1).toBeTruthy();
            expect(val1.name).toEqual(val0.name);
            expect(val1.type).toEqual(val0.type);
            expect(val1.spec).toEqual(val0.spec);
            expect(val1.count).toEqual(val0.count);

            podsjson.removeLibrary(val0.name);
            val1 = podsjson.getLibrary(val0.name);
            expect(val1).toBeFalsy();
        });

        it('Test 004 : clears all pods', () => {
            const val0 = {
                name: 'Baz',
                type: 'podspec',
                spec: '3.0',
                count: 3
            };
            podsjson.setJsonLibrary(val0.name, val0);
            podsjson.clear();

            expect(podsjson.getLibrary(val0.name)).toBeFalsy();
            expect(podsjson.getLibrary('Foo')).toBeFalsy();
            expect(podsjson.getLibrary('Bar')).toBeFalsy();
        });

        it('Test 005 : isDirty tests', () => {
            const val0 = {
                name: 'Foo',
                type: 'podspec',
                spec: '1.0',
                count: 1
            };

            podsjson.setJsonLibrary(val0.name, val0);
            expect(podsjson.isDirty()).toBe(true);

            podsjson.write();
            expect(podsjson.isDirty()).toBe(false);

            podsjson.removeLibrary(val0.name);
            expect(podsjson.isDirty()).toBe(true);

            podsjson.clear();
            expect(podsjson.isDirty()).toBe(true);

            podsjson.write();
            expect(podsjson.isDirty()).toBe(false);
        });

        it('Test 006 : increment and decrement count test', () => {
            const val0 = {
                name: 'Bla',
                type: 'podspec',
                spec: '4.0',
                count: 4
            };

            podsjson.setJsonLibrary(val0.name, val0);
            expect(podsjson.getLibrary(val0.name).count).toBe(4);

            podsjson.incrementLibrary(val0.name);
            expect(podsjson.getLibrary(val0.name).count).toBe(5);

            podsjson.decrementLibrary(val0.name);
            expect(podsjson.getLibrary(val0.name).count).toBe(4);
            podsjson.decrementLibrary(val0.name);
            expect(podsjson.getLibrary(val0.name).count).toBe(3);
            podsjson.decrementLibrary(val0.name);
            expect(podsjson.getLibrary(val0.name).count).toBe(2);
            podsjson.decrementLibrary(val0.name);
            expect(podsjson.getLibrary(val0.name).count).toBe(1);

            // this next decrement takes it down to zero, where the pod will just be removed
            podsjson.decrementLibrary(val0.name);
            expect(podsjson.getLibrary(val0.name)).toBeFalsy();
        });

        it('Test 007 : writes pods to the pods.json', () => {
            podsjson.clear();

            const vals = {
                Foo: { name: 'Foo', type: 'podspec', spec: '1.0', count: 1 },
                Bar: { name: 'Bar', type: 'podspec', spec: '2.0', count: 2 },
                Baz: { name: 'Baz', type: 'podspec', spec: '3.0', count: 3 }
            };

            podsjson.setJsonLibrary('Foo', vals.Foo);
            podsjson.setJsonLibrary('Bar', vals.Bar);
            podsjson.setJsonLibrary('Baz', vals.Baz);

            podsjson.write();

            // verify by reading it back in a new PodsJson
            const newPodsJson = new PodsJson(fixturePodsJson);
            expect(newPodsJson.getLibrary('Foo')).toBeTruthy();
            expect(newPodsJson.getLibrary('Bar')).toBeTruthy();
            expect(newPodsJson.getLibrary('Baz')).toBeTruthy();

            function podEqual (a, b) {
                return (
                    a.name === b.name &&
                    a.type === b.type &&
                    a.spec === b.spec &&
                    a.count === b.count
                );
            }

            expect(podEqual(podsjson.getLibrary('Foo'), newPodsJson.getLibrary('Foo'))).toBe(true);
            expect(podEqual(podsjson.getLibrary('Bar'), newPodsJson.getLibrary('Bar'))).toBe(true);
            expect(podEqual(podsjson.getLibrary('Baz'), newPodsJson.getLibrary('Baz'))).toBe(true);
        });

        it('Test 008 : setJson, get, increment, decrement, remove and write for Declaration', () => {
            let result = null;
            const writeFileSyncSpy = spyOn(fs, 'writeFileSync');
            writeFileSyncSpy.and.callFake((filepath, data, encode) => {
                result = data;
            });
            const json = {
                declaration: 'use_frameworks!',
                count: 1
            };
            const json2 = {
                declaration: 'inhibit_all_warnings!',
                count: 2
            };
            podsjson.setJsonDeclaration(json.declaration, json);
            expect(podsjson.getDeclaration(json.declaration)).not.toBe(json);
            expect(podsjson.getDeclaration(json.declaration)).toEqual(json);
            podsjson.incrementDeclaration(json.declaration);
            expect(podsjson.getDeclaration(json.declaration).count).toEqual(2);
            podsjson.decrementDeclaration(json.declaration);
            expect(podsjson.getDeclaration(json.declaration).count).toEqual(1);
            podsjson.setJsonDeclaration(json2.declaration, json2);
            expect(podsjson.getDeclaration(json.declaration)).toEqual(json);
            expect(podsjson.getDeclaration(json2.declaration)).toEqual(json2);
            podsjson.removeDeclaration(json.declaration);
            expect(podsjson.getDeclaration(json.declaration)).toBeUndefined();
            podsjson.write();
            expect(writeFileSyncSpy).toHaveBeenCalled();
            expect(JSON.parse(result).declarations[json2.declaration]).toEqual(json2);
        });

        it('Test 009 : setJson, get, increment, decrement, remove and write for Source', () => {
            let result = null;
            const writeFileSyncSpy = spyOn(fs, 'writeFileSync');
            writeFileSyncSpy.and.callFake((filepath, data, encode) => {
                result = data;
            });
            const json = {
                source: 'https://github.com/brightcove/BrightcoveSpecs.git',
                count: 1
            };
            const json2 = {
                source: 'https://github.com/CocoaPods/Specs.git',
                count: 2
            };
            podsjson.setJsonSource(json.source, json);
            expect(podsjson.getSource(json.source)).not.toBe(json);
            expect(podsjson.getSource(json.source)).toEqual(json);
            podsjson.incrementSource(json.source);
            expect(podsjson.getSource(json.source).count).toEqual(2);
            podsjson.decrementSource(json.source);
            expect(podsjson.getSource(json.source).count).toEqual(1);
            podsjson.setJsonSource(json2.source, json2);
            expect(podsjson.getSource(json.source)).toEqual(json);
            expect(podsjson.getSource(json2.source)).toEqual(json2);
            podsjson.removeSource(json.source);
            expect(podsjson.getSource(json.source)).toBeUndefined();
            podsjson.write();
            expect(writeFileSyncSpy).toHaveBeenCalled();
            expect(JSON.parse(result).sources[json2.source]).toEqual(json2);
        });
    });

    // it('Test 008 : tear down', function () {
    //     podsjson.destroy();
    // });
});
