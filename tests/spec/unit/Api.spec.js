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

var path = require('path');
var Api = require('../../../bin/templates/scripts/cordova/Api');
var check_reqs = require('../../../bin/lib/check_reqs');
var Q = require('q');
var FIXTURES = path.join(__dirname, 'fixtures');
var iosProjectFixture = path.join(FIXTURES, 'ios-config-xml');

describe('Platform Api', function () {

    describe('constructor', function() {
        it('Test 001 : should throw if provided directory does not contain an xcodeproj file', function() {
            expect(function() { new Api('ios', path.join(FIXTURES, '..')); }).toThrow();
        });
        it('Test 002 : should create an instance with path, pbxproj, xcodeproj, originalName and cordovaproj properties', function() {
            expect(function() {
                var p = new Api('ios',iosProjectFixture);
                expect(p.locations.root).toEqual(iosProjectFixture);
                expect(p.locations.pbxproj).toEqual(path.join(iosProjectFixture, 'SampleApp.xcodeproj', 'project.pbxproj'));
                expect(p.locations.xcodeProjDir).toEqual(path.join(iosProjectFixture, 'SampleApp.xcodeproj'));
                expect(p.locations.www).toEqual(path.join(iosProjectFixture, 'www'));
                expect(p.locations.configXml).toEqual(path.join(iosProjectFixture, 'SampleApp', 'config.xml'));
            }).not.toThrow();
        });
        it('Test 003 : test cocoapods check_reqs, on darwin (macOS)', function(done) {
            // the purpose of this test is not to actually test whether CocoaPods is installed
            // it is to test check_reqs can run and be covered (we mock the actual checking, simple check)

            check_reqs.check_os()
            .then(function(message) {
                // supported os
                function fail() {
                    done.fail('check_reqs fail (' + message + ')');
                }
                function success() {
                    done();
                }
                var toolsChecker = {
                    success: function() {
                        return Q.resolve('CocoaPods found');
                    },
                    fail: function() {
                        return Q.reject('CocoaPods NOT found');
                    }
                };

                // success expected
                check_reqs.check_cocoapods(toolsChecker.success)
                    .then(success, fail)
                    .catch(fail);

                // fail expected
                check_reqs.check_cocoapods(toolsChecker.fail)
                    .then(fail, success)
                    .catch(success);
                    
            }, function(){
                // unsupported os, do nothing
                done();
            });
        });
        it('Test 004 : test cocoapods check_reqs, expected success on non-darwin (macOS)', function(done) {
            // the purpose of this test is not to actually test whether CocoaPods is installed
            // it is to test check_reqs can run and be covered (we mock the actual checking, simple check)
            check_reqs.check_os()
            .then(function(){
                // supported os, do nothing
                done();
            }, function(message) {
                // unsupported os, check_reqs should be ignored
                function fail() {
                    done.fail('check_reqs fail (' + message + ')');
                }
                function success(toolOptions) {
                    expect(toolOptions.ignore).toBeDefined();
                    expect(toolOptions.ignoreMessage).toBeDefined();
                    done();
                }
                var toolsChecker = function () {
                    done.fail(); // this function should not ever be called if non-darwin
                    return Q.reject('CocoaPods NOT found');
                };

                // success expected
                check_reqs.check_cocoapods(toolsChecker)
                    .then(success, fail)
                    .catch(fail);
            });

        });
    });
});
