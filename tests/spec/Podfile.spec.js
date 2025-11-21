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

const path = require('node:path');
const fs = require('node:fs');
const CordovaError = require('cordova-common').CordovaError;

const PROJECT_NAME = 'testProj';
const Podfile = require(path.resolve(__dirname, '..', '..', 'lib', 'Podfile.js')).Podfile;
const fixturePodfile = path.resolve(__dirname, 'fixtures', PROJECT_NAME, 'platforms', 'ios', 'Podfile');
const fixturePodXcconfigDebug = path.resolve(__dirname, 'fixtures', PROJECT_NAME, 'platforms', 'ios', 'pods-debug.xcconfig');
const fixturePodXcconfigRelease = path.resolve(__dirname, 'fixtures', PROJECT_NAME, 'platforms', 'ios', 'pods-release.xcconfig');

// tests are nested in a describe to ensure clean up happens after all unit tests are run
describe('unit tests for Podfile module', () => {
    const podfile = new Podfile(fixturePodfile, PROJECT_NAME);

    describe('tests', () => {
        it('Test 001 : throws CordovaError when the path filename is not named Podfile', () => {
            const dummyPath = 'NotAPodfile';
            expect(() => {
                new Podfile(dummyPath); /* eslint no-new : 0 */
            }).toThrow(new CordovaError(`Podfile: The file at ${dummyPath} is not \`${Podfile.FILENAME}\`.`));
        });

        it('Test 003 : throws CordovaError when no pod name provided when adding a spec', () => {
            expect(() => {
                podfile.addSpec(null);
            }).toThrow(new CordovaError('Podfile addSpec: name is not specified.'));
        });

        it('Test 004 : adds the spec', () => {
            expect(podfile.existsSpec('Foo')).toBe(false);
            podfile.addSpec('Foo', '1.0');
            expect(podfile.existsSpec('Foo')).toBe(true);
        });

        it('Test 005 : removes the spec', () => {
            podfile.addSpec('Baz', '3.0');
            expect(podfile.existsSpec('Baz')).toBe(true);
            podfile.removeSpec('Baz');
            expect(podfile.existsSpec('Baz')).toBe(false);
        });

        it('Test 006 : clears all specs', () => {
            podfile.addSpec('Bar', '2.0');
            podfile.clear();

            expect(podfile.existsSpec('Foo')).toBe(false);
            expect(podfile.existsSpec('Bar')).toBe(false);
        });

        it('Test 007 : isDirty tests', () => {
            podfile.addSpec('Foo', '1.0');
            expect(podfile.isDirty()).toBe(true);

            podfile.write();
            expect(podfile.isDirty()).toBe(false);

            podfile.removeSpec('Foo');
            expect(podfile.isDirty()).toBe(true);

            podfile.clear();
            expect(podfile.isDirty()).toBe(true);

            podfile.write();
            expect(podfile.isDirty()).toBe(false);
        });

        it('Test 008 : writes specs to the Podfile', () => {
            podfile.clear();

            podfile.addSpec('Foo', '1.0');
            podfile.addSpec('Bar', '2.0');
            podfile.addSpec('Baz', '3.0');
            podfile.addSpec('Foo-Baz', '4.0');
            podfile.addSpec('Foo~Baz@!%@!%!', '5.0');
            podfile.addSpec('Bla', ':configurations => [\'Debug\', \'Beta\']');
            podfile.addSpec('Bla2', { configurations: 'Debug,Release' });
            podfile.addSpec('Bla3', { configurations: 'Debug, Release' });

            podfile.write();

            // verify by reading it back in a new Podfile
            const newPodfile = new Podfile(fixturePodfile, `${PROJECT_NAME}2`);
            expect(newPodfile.existsSpec('Foo')).toBe(true);
            expect(newPodfile.existsSpec('Bar')).toBe(true);
            expect(newPodfile.existsSpec('Baz')).toBe(true);
            expect(newPodfile.existsSpec('Foo-Baz')).toBe(true);
            expect(newPodfile.existsSpec('Foo~Baz@!%@!%!')).toBe(true);
            expect(newPodfile.existsSpec('Bla')).toBe(true);

            expect(newPodfile.getSpec('Foo')).toEqual(podfile.getSpec('Foo'));
            expect(newPodfile.getSpec('Bar')).toEqual(podfile.getSpec('Bar'));
            expect(newPodfile.getSpec('Baz')).toEqual(podfile.getSpec('Baz'));
            expect(newPodfile.getSpec('Foo-Baz')).toEqual(podfile.getSpec('Foo-Baz'));
            expect(newPodfile.getSpec('Foo~Baz@!%@!%!')).toEqual(podfile.getSpec('Foo~Baz@!%@!%!'));
            expect(newPodfile.getSpec('Bla')).toEqual(podfile.getSpec('Bla'));
            expect(newPodfile.getSpec('Bla2').options).toEqual(':configurations => [\'Debug\',\'Release\']');
            expect(newPodfile.getSpec('Bla3').options).toEqual(':configurations => [\'Debug\',\'Release\']');
        });

        it('Test 009 : runs before_install to install xcconfig paths', () => {
            podfile.before_install();

            // Template tokens in order: project name, project name, debug | release
            const createXConfigContent = buildType => '// DO NOT MODIFY -- auto-generated by Apache Cordova\n' +
                `#include "Pods/Target Support Files/Pods-App/Pods-App.${buildType}.xcconfig"`;

            const expectedDebugContents = createXConfigContent('debug');
            const expectedReleaseContents = createXConfigContent('release');

            const actualDebugContents = fs.readFileSync(fixturePodXcconfigDebug, 'utf8');
            const actualReleaseContents = fs.readFileSync(fixturePodXcconfigRelease, 'utf8');

            expect(actualDebugContents).toBe(expectedDebugContents);
            expect(actualReleaseContents).toBe(expectedReleaseContents);
        });

        it('Test 010 : escapes single quotes in project name when writing a Podfile', () => {
            podfile.before_install();

            const projectName = 'This project\'s name';

            const expectedProjectName = 'This project\\\'s name';
            const actualProjectName = podfile.escapeSingleQuotes(projectName);

            expect(actualProjectName).toBe(expectedProjectName);
        });

        it('Test 011 : escapes double single quotes in project name when writing a Podfile', () => {
            podfile.before_install();

            const projectName = 'l\'etat c\'est moi';

            const expectedProjectName = 'l\\\'etat c\\\'est moi';
            const actualProjectName = podfile.escapeSingleQuotes(projectName);

            expect(actualProjectName).toBe(expectedProjectName);
        });
    });

    it('Test 012 : tear down', () => {
        podfile.destroy();

        const text = '// DO NOT MODIFY -- auto-generated by Apache Cordova\n';

        fs.writeFileSync(fixturePodXcconfigDebug, text, 'utf8');
        fs.writeFileSync(fixturePodXcconfigRelease, text, 'utf8');
    });
});
