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

const path = require('path');
const shell = require('shelljs');
const tmp = require('tmp');

const projectFile = require('../../../bin/templates/scripts/cordova/lib/projectFile');

const iosProjectFixture = path.join(__dirname, 'fixtures/ios-config-xml/*');

describe('projectFile', () => {
    let iosProject = '';

    let locations = {};

    beforeEach(() => {
        const tmpobj = tmp.dirSync();

        iosProject = path.join(tmpobj.name, 'plugman/projectFile');

        locations = {
            root: iosProject,
            pbxproj: path.join(
                iosProject,
                'SampleApp.xcodeproj/project.pbxproj')
        };

        shell.mkdir('-p', iosProject);
        shell.cp('-rf', iosProjectFixture, iosProject);
    });

    describe('parse method', () => {
        it('Test#001 : should return result with correct xcode_path value', () => {
            expect(projectFile.parse(locations).xcode_path)
                .toEqual(path.join(iosProject, 'SampleApp'));
        });

        it('Test#002 : should throw if project is not an xcode project', () => {
            shell.rm('-rf', path.join(iosProject, 'SampleApp', 'SampleApp.xcodeproj'));
            expect(() => { projectFile.parse(); }).toThrow();
        });

        it('Test#003 : should throw if project does not contain an appropriate config.xml file', () => {
            shell.rm(path.join(iosProject, 'SampleApp', 'config.xml'));
            expect(() => { projectFile.parse(locations); })
                .toThrow(new Error('Could not find config.xml file.'));
        });

        it('Test#004 : should throw if project does not contain an appropriate -Info.plist file', () => {
            shell.rm(path.join(iosProject, 'SampleApp', 'SampleApp-Info.plist'));
            expect(() => { projectFile.parse(locations); })
                .toThrow(new Error(
                    'Could not find SampleApp-Info.plist file.'));
        });

        it('Test#005 : should return right directory when multiple .plist files are present', () => {
            // Create a folder named A with config.xml and .plist files in it
            const pathToFolderA = path.join(iosProject, 'A');
            shell.mkdir(pathToFolderA);
            shell.cp('-rf', path.join(iosProject, 'SampleApp/*'), pathToFolderA);

            const parsedProjectFile = projectFile.parse(locations);
            const pluginsDir = parsedProjectFile.plugins_dir;
            const resourcesDir = parsedProjectFile.resources_dir;
            const xcodePath = parsedProjectFile.xcode_path;

            const pluginsDirParent = path.dirname(pluginsDir);
            const resourcesDirParent = path.dirname(resourcesDir);
            const sampleAppDir = path.join(iosProject, 'SampleApp');

            expect(pluginsDirParent).toEqual(sampleAppDir);
            expect(resourcesDirParent).toEqual(sampleAppDir);
            expect(xcodePath).toEqual(sampleAppDir);
        });

        it('Test#006 : getPackageName method should return the CFBundleIdentifier from the project\'s Info.plist file', () => {
            expect(projectFile.parse(locations).getPackageName()).toEqual('com.example.friendstring');
        });

        it('Test#007 : should use correct plist in case an extra INFOPLIST_FILE entry comes first in project.pbxproj', () => {
            // Change a single INFOPLIST_FILE entry to:
            //     INFOPLIST_FILE = "SampleApp/Sample2-Info.plist"
            // Second INFOPLIST_FILE entry remains correct in project.pbxproj
            shell.sed('-i',
                'INFOPLIST_FILE = "SampleApp/SampleApp-Info.plist"',
                'INFOPLIST_FILE = "SampleApp/Sample2-Info.plist"',
                path.join(iosProject,
                    'SampleApp.xcodeproj', 'project.pbxproj'));

            // ensure parse method uses correct INFOPLIST_FILE entry and
            // reads from correct plist file:
            expect(projectFile.parse(locations).getPackageName())
                .toEqual('com.example.friendstring');
        });

        it('Test#008 : should throw if project contains single -Info.plist file with incorrect name', () => {
            shell.mv(path.join(iosProject, 'SampleApp', 'SampleApp-Info.plist'),
                path.join(iosProject, 'SampleApp', 'Sample2-Info.plist'));
            shell.sed('-i', /SampleApp-Info.plist/g, 'Sample2-Info.plist',
                path.join(iosProject, 'SampleApp.xcodeproj', 'project.pbxproj'));

            expect(() => { projectFile.parse(locations); }).toThrow(
                new Error(
                    'Could not find correct INFOPLIST_FILE entry in pbxproj'));
        });
    });
});
