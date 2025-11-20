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

const path = require('node:path');
const fs = require('node:fs');
const tmp = require('tmp');
const projectFile = require('../../lib/projectFile');

tmp.setGracefulCleanup();

const tempdir = tmp.dirSync({ unsafeCleanup: true });
const iosProject = path.join(tempdir.name, 'plugman/projectFile');
const iosProjectFixture = path.join(__dirname, 'fixtures/ios-config-xml');

const locations = {
    root: iosProject,
    pbxproj: path.join(iosProject, 'App.xcodeproj', 'project.pbxproj')
};

describe('projectFile', () => {
    beforeEach(() => {
        fs.cpSync(iosProjectFixture, iosProject, { recursive: true });
    });

    afterEach(() => {
        fs.rmSync(iosProject, { recursive: true, force: true });
    });

    describe('parse method', () => {
        it('Test#001 : should throw if project is not an xcode project', () => {
            fs.rmSync(path.join(iosProject, 'App', 'App.xcodeproj'), { recursive: true, force: true });
            expect(() => { projectFile.parse(); }).toThrow();
        });
        it('Test#002 : should throw if project does not contain an appropriate config.xml file', () => {
            fs.rmSync(path.join(iosProject, 'App', 'config.xml'));
            expect(() => { projectFile.parse(locations); })
                .toThrow(new Error('Could not find config.xml file.'));
        });
        it('Test#004 : should return right directory when multiple .plist files are present', () => {
            // Create a folder named A with config.xml and .plist files in it
            const pathToFolderA = path.join(iosProject, 'A');
            fs.mkdirSync(pathToFolderA, { recursive: true });
            fs.cpSync(path.join(iosProject, 'App'), pathToFolderA, { recursive: true });

            const parsedProjectFile = projectFile.parse(locations);
            const pluginsDir = parsedProjectFile.plugins_dir;
            const resourcesDir = parsedProjectFile.resources_dir;
            const xcodePath = parsedProjectFile.xcode_path;

            const pluginsDirParent = path.dirname(pluginsDir);
            const resourcesDirParent = path.dirname(resourcesDir);
            const sampleAppDir = path.join(iosProject, 'App');

            expect(pluginsDirParent).toEqual(sampleAppDir);
            expect(resourcesDirParent).toEqual(sampleAppDir);
            expect(xcodePath).toEqual(sampleAppDir);
        });
    });

    describe('other methods', () => {
        it('Test#005 : getPackageName method should return the CFBundleIdentifier from the project\'s Info.plist file', () => {
            expect(projectFile.parse(locations).getPackageName()).toEqual('com.example.friendstring');
        });
    });
});
