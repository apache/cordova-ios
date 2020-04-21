#!/usr/bin/env node

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

const path = require('path');
const findProcess = require('find-process');
const { superspawn } = require('cordova-common');

function killSimulator (processName) {
    return findProcess('name', processName)
        .then(processList => processList.map(process => process.pid))
        .then(pids => {
            if (pids.length > 0) {
                const filename = path.parse(processName).name;
                return superspawn.spawn('killall', [filename], { printCommand: true, stdio: 'inherit' })
                    .then(
                        () => `Process was killed: ${processName}`,
                        error => `Failed to kill process: ${processName} with the error: ${error}`
                    );
            }

            return Promise.resolve(`No iOS Simulators were detected to stop with the processname of: ${processName}.`);
        });
}

Promise.all([
    killSimulator('iOS Simulator.app'), // XCode 6
    killSimulator('Simulator.app') // XCode 7
]).then(
    output => loopPrint(output),
    error => loopPrint(error)
);

function loopPrint (output) {
    for (const message of output) {
        console.log(message);
    }
}
