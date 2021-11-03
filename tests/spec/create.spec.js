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

const spec = __dirname;
const path = require('path');
const fs = require('fs-extra');
const { superspawn } = require('cordova-common');

const cordova_bin = path.join(spec, '../..', 'bin');
const tmp = require('tmp').dirSync().name;

function createAndBuild (projectname, projectid) {
    const projectTempDir = path.join(`${tmp}/${projectname}`);
    const createBin = path.join(`${cordova_bin}/create`);
    const buildBin = path.join(`${projectTempDir}/cordova/build`);

    // Remove any pre-existing temp projects
    fs.removeSync(projectTempDir);

    return superspawn.spawn(createBin, [projectTempDir, projectid, projectname], { printCommand: true }).then(
        () => {
            expect(true).toBe(true); // It is expected that create is successful

            return superspawn.spawn(buildBin, ['--emulator'], { printCommand: true }).then(
                () => {
                    expect(true).toBe(true); // It is expected that build is successful
                },
                () => fail('Project Build has failed and is not expected.')
            );
        },
        () => fail('Project create has failed and is not expected.')
    ).finally(() => {
        // Delete Temp Project
        fs.removeSync(projectTempDir);
    });
}

describe('create', () => {
    it('Test#001 : create project with ascii name, no spaces', () => {
        const projectname = 'testcreate';
        const projectid = 'com.test.app1';

        return createAndBuild(projectname, projectid);
    }, 240 * 1000); // first build takes longer (probably cold caches)

    it('Test#002 : create project with complicated name', () => {
        const projectname = '応応応応 hello & إثرا 用用用用';
        const projectid = 'com.test.app2';

        return createAndBuild(projectname, projectid);
    }, 120 * 1000);
});
