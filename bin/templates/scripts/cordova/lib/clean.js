/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

const path = require('path');
const shell = require('shelljs');
const { superspawn: { spawn } } = require('cordova-common');
const { CordovaError } = require('cordova-common');

const projectPath = path.join(__dirname, '..', '..');

module.exports.run = () => {
    const projectName = shell.ls(projectPath).filter(name => path.extname(name) === '.xcodeproj')[0];

    if (!projectName) {
        return Promise.reject(new CordovaError(`No Xcode project found in ${projectPath}`));
    }

    const xcodebuildClean = configName => {
        return spawn(
            'xcodebuild',
            ['-project', projectName, '-configuration', configName, '-alltargets', 'clean'],
            { cwd: projectPath, stdio: 'inherit' }
        ).then(({ stdout }) => stdout);
    };

    return xcodebuildClean('Debug')
        .then(() => xcodebuildClean('Release'))
        .then(() => shell.rm('-rf', path.join(projectPath, 'build')));
};
