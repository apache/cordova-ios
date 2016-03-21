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

var shell = require('shelljs'),
    spec = __dirname,
    path = require('path'),
    util = require('util'),
    tmp = require('tmp');

    var tests_dir = path.join(spec, '..');

describe('cordova-lib', function() {

    it('objective-c unit tests', function() {
        var return_code = 0;
        var command;
        var artifacts_dir = tmp.dirSync().name;

        function killSimulator(processName) {
            var result;
            // check iOS Simulator if running
            command = 'pgrep "' + processName + '"';
            return_code = shell.exec(command).code;

            // if iOS Simulator is running, kill it
            if (return_code === 0) { // found
                shell.echo('iOS Simulator is running("'+ processName +'"), we\'re going to kill it.');
                result = shell.exec('killall "' + processName + '"');
                if (result.code !== 0) {
                    if (!(result.output &&
                            result.output.indexOf('No matching processes belonging to you were found') !== -1)) {
                        expect(result.code).toBe(0);
                    }
                }
            }
        }

        killSimulator('iOS Simulator'); // XCode6
        killSimulator('Simulator'); // XCode7

        // run the tests
        command = util.format('xcodebuild test -workspace %s/cordova-ios.xcworkspace -scheme CordovaLibTests -destination "platform=iOS Simulator,name=iPhone 5" CONFIGURATION_BUILD_DIR="%s"', tests_dir, artifacts_dir);
        shell.echo(command);
        return_code = shell.exec(command).code;
        expect(return_code).toBe(0);
    });
});
