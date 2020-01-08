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

const execa = require('execa');

/**
 * Gets list of running iOS simulators
 * @return {Promise} Promise fulfilled with list of running iOS simulators
 *
 * @todo In the next PR, I will refactor this entire method.
 *
 * The process no longer contains the pattern "[i]OS Simulator".
 * The process is now called "Simulator.app"
 *
 * Additionaly, `defaults read com.apple.iphonesimulator "SimulateDevice"` is also not valid aymore.
 *
 * I will replace this entire method to locate the active simulators though `simctl`
 *
 * Alternativly, remove this file. It is not documented in Cordova and not used anywhere in our code base.
 */
function listStartedEmulators () {
    return execa('ps', ['aux'])
        .then(({ stdout }) => {
            if (stdout.match(/[i]OS Simulator/)) {
                return execa('defaults', ['read', 'com.apple.iphonesimulator', '"SimulateDevice"']);
            }

            return { stdout: '' };
        })
        .then(({ stdout }) => stdout.split('\n'));
}

exports.run = listStartedEmulators;
