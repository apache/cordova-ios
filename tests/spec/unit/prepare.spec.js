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

var fs = require('fs');
var os = require('os');
var path = require('path');
var shell = require('shelljs');
var plist = require('plist');
var xcode = require('xcode');
var rewire = require('rewire');
var EventEmitter = require('events').EventEmitter;
var Api = require('../../../bin/templates/scripts/cordova/Api');
var prepare = rewire('../../../bin/templates/scripts/cordova/lib/prepare');
var projectFile = require('../../../bin/templates/scripts/cordova/lib/projectFile');
var FileUpdater = require('cordova-common').FileUpdater;

var FIXTURES = path.join(__dirname, 'fixtures');

var iosProjectFixture = path.join(FIXTURES, 'ios-config-xml');
var iosProject = path.join(os.tmpdir(), 'prepare');
var iosPlatform = path.join(iosProject, 'platforms/ios');

shell.config.silent = true;

var ConfigParser = require('cordova-common').ConfigParser;
// Create a real config object before mocking out everything.
var cfg = new ConfigParser(path.join(FIXTURES, 'test-config.xml'));
var cfg2 = new ConfigParser(path.join(FIXTURES, 'test-config-2.xml'));


function wrapper(p, done, post) {
    p.then(post, function(err) {
        expect(err.stack).toBeUndefined();
    }).fin(done);
}

describe('prepare', function () {
    var p;
    beforeEach(function() {
        shell.mkdir('-p', iosPlatform);
        shell.cp('-rf', iosProjectFixture + '/*', iosPlatform);
        p = new Api('ios', iosPlatform, new EventEmitter());
    });

    afterEach(function () {
        shell.rm('-rf', path.join(__dirname, 'some'));
    });

    describe('updateProject method', function() {
        var mv;
        var update_name;
        var xcOrig = xcode.project;

        var updateProject = prepare.__get__('updateProject');

        beforeEach(function() {
            mv = spyOn(shell, 'mv');
            spyOn(fs, 'writeFileSync');
            spyOn(plist, 'parse').andReturn({});
            spyOn(plist, 'build').andReturn('');
            spyOn(xcode, 'project').andCallFake(function (pbxproj) {
                var xc = new xcOrig(pbxproj);
                update_name = spyOn(xc, 'updateProductName').andCallThrough();
                return xc;
            });
            cfg.name = function() { return 'SampleApp'; };
            cfg2.name = function() { return 'testname'; };
            cfg.packageName = function() { return 'testpkg'; };
            cfg.version = function() { return 'one point oh'; };

            spyOn(cfg, 'getPreference');
        });

        it('should update the app name in pbxproj by calling xcode.updateProductName, and move the ios native files to match the new name', function(done) {
            var test_path = path.join(iosProject, 'platforms/ios/SampleApp');
            var testname_path = path.join(iosProject, 'platforms/ios/testname');

            // Warm up the projectFile cache
            projectFile.parse(p.locations);
            // Copy pbxproj file to expected destination because updateProject expects it would be there
            var destPbxproj = path.join(p.locations.xcodeProjDir, '../testname.xcodeproj/project.pbxproj');
            shell.mkdir('-p', path.dirname(destPbxproj));
            shell.cp(p.locations.pbxproj, destPbxproj);

            wrapper(updateProject(cfg2, p.locations), done, function() {
                expect(update_name).toHaveBeenCalledWith('testname');
                expect(mv).toHaveBeenCalledWith(path.join(test_path, 'SampleApp-Info.plist'), path.join(test_path, 'testname-Info.plist'));
                expect(mv).toHaveBeenCalledWith(path.join(test_path, 'SampleApp-Prefix.pch'), path.join(test_path, 'testname-Prefix.pch'));
                expect(mv).toHaveBeenCalledWith(test_path + '.xcodeproj', testname_path + '.xcodeproj');
                expect(mv).toHaveBeenCalledWith(test_path, testname_path);

                // Validate that Api.locations properties also updated according to new project name
                expect(p.locations.xcodeCordovaProj).toBe(testname_path);
                expect(p.locations.configXml).toBe(path.join(testname_path, 'config.xml'));
                expect(p.locations.xcodeProjDir).toBe(path.join(p.locations.root, 'testname.xcodeproj'));
                expect(p.locations.pbxproj).toBe(path.join(p.locations.root, 'testname.xcodeproj/project.pbxproj'));

                expect(projectFile.__get__('cachedProjectFiles')[p.locations.root]).not.toBeDefined();
            });
        });
        it('should write out the app id to info plist as CFBundleIdentifier', function(done) {
            cfg.ios_CFBundleIdentifier = function() { return null; };
            wrapper(updateProject(cfg, p.locations), done, function() {
                expect(plist.build.mostRecentCall.args[0].CFBundleIdentifier).toEqual('testpkg');
            });
        });
        it('should write out the app id to info plist as CFBundleIdentifier with ios-CFBundleIdentifier', function(done) {
            cfg.ios_CFBundleIdentifier = function() { return 'testpkg_ios'; };
            wrapper(updateProject(cfg, p.locations), done, function() {
                expect(plist.build.mostRecentCall.args[0].CFBundleIdentifier).toEqual('testpkg_ios');
            });
        });
        it('should write out the app version to info plist as CFBundleVersion', function(done) {
            wrapper(updateProject(cfg, p.locations), done, function() {
                expect(plist.build.mostRecentCall.args[0].CFBundleShortVersionString).toEqual('one point oh');
            });
        });
        it('should write out the orientation preference value', function(done) {
            cfg.getPreference.andCallThrough();
            wrapper(updateProject(cfg, p.locations), done, function() {
                expect(plist.build.mostRecentCall.args[0].UISupportedInterfaceOrientations).toEqual([ 'UIInterfaceOrientationPortrait', 'UIInterfaceOrientationPortraitUpsideDown' ]);
                expect(plist.build.mostRecentCall.args[0]['UISupportedInterfaceOrientations~ipad']).toEqual([ 'UIInterfaceOrientationPortrait', 'UIInterfaceOrientationPortraitUpsideDown' ]);
                expect(plist.build.mostRecentCall.args[0].UIInterfaceOrientation).toEqual([ 'UIInterfaceOrientationPortrait' ]);
            });
        });
        it('should handle no orientation', function(done) {
            cfg.getPreference.andReturn('');
            wrapper(updateProject(cfg, p.locations), done, function() {
                expect(plist.build.mostRecentCall.args[0].UISupportedInterfaceOrientations).toBeUndefined();
                expect(plist.build.mostRecentCall.args[0]['UISupportedInterfaceOrientations~ipad']).toBeUndefined();
                expect(plist.build.mostRecentCall.args[0].UIInterfaceOrientation).toBeUndefined();
            });
        });
        it('should handle default orientation', function(done) {
            cfg.getPreference.andReturn('default');
            wrapper(updateProject(cfg, p.locations), done, function() {
                expect(plist.build.mostRecentCall.args[0].UISupportedInterfaceOrientations).toEqual([ 'UIInterfaceOrientationPortrait', 'UIInterfaceOrientationLandscapeLeft', 'UIInterfaceOrientationLandscapeRight' ]);
                expect(plist.build.mostRecentCall.args[0]['UISupportedInterfaceOrientations~ipad']).toEqual([ 'UIInterfaceOrientationPortrait', 'UIInterfaceOrientationPortraitUpsideDown', 'UIInterfaceOrientationLandscapeLeft', 'UIInterfaceOrientationLandscapeRight' ]);
                expect(plist.build.mostRecentCall.args[0].UIInterfaceOrientation).toBeUndefined();
            });
        });
        it('should handle portrait orientation', function(done) {
            cfg.getPreference.andReturn('portrait');
            wrapper(updateProject(cfg, p.locations), done, function() {
                expect(plist.build.mostRecentCall.args[0].UISupportedInterfaceOrientations).toEqual([ 'UIInterfaceOrientationPortrait', 'UIInterfaceOrientationPortraitUpsideDown' ]);
                expect(plist.build.mostRecentCall.args[0].UIInterfaceOrientation).toEqual([ 'UIInterfaceOrientationPortrait' ]);
            });
        });
        it('should handle landscape orientation', function(done) {
            cfg.getPreference.andReturn('landscape');
            wrapper(updateProject(cfg, p.locations), done, function() {
                expect(plist.build.mostRecentCall.args[0].UISupportedInterfaceOrientations).toEqual([ 'UIInterfaceOrientationLandscapeLeft', 'UIInterfaceOrientationLandscapeRight' ]);
                expect(plist.build.mostRecentCall.args[0].UIInterfaceOrientation).toEqual([ 'UIInterfaceOrientationLandscapeLeft' ]);
            });
        });
        it('should handle all orientation on ios', function(done) {
            cfg.getPreference.andReturn('all');
            wrapper(updateProject(cfg, p.locations), done, function() {
                expect(plist.build.mostRecentCall.args[0].UISupportedInterfaceOrientations).toEqual([ 'UIInterfaceOrientationPortrait', 'UIInterfaceOrientationPortraitUpsideDown', 'UIInterfaceOrientationLandscapeLeft', 'UIInterfaceOrientationLandscapeRight' ]);
                expect(plist.build.mostRecentCall.args[0].UIInterfaceOrientation).toEqual([ 'UIInterfaceOrientationPortrait' ]);
            });
        });
        it('should handle custom orientation', function(done) {
            cfg.getPreference.andReturn('some-custom-orientation');
            wrapper(updateProject(cfg, p.locations), done, function() {
                expect(plist.build.mostRecentCall.args[0].UISupportedInterfaceOrientations).toEqual([ 'UIInterfaceOrientationPortrait', 'UIInterfaceOrientationLandscapeLeft', 'UIInterfaceOrientationLandscapeRight' ]);
                expect(plist.build.mostRecentCall.args[0]['UISupportedInterfaceOrientations~ipad']).toEqual([ 'UIInterfaceOrientationPortrait', 'UIInterfaceOrientationPortraitUpsideDown', 'UIInterfaceOrientationLandscapeLeft', 'UIInterfaceOrientationLandscapeRight' ]);
                expect(plist.build.mostRecentCall.args[0].UIInterfaceOrientation).toBeUndefined();
            });
        });
        ///// App Transport Security Tests /////////////////////////////
        it('<access> - should handle wildcard', function(done) {
            wrapper(updateProject(cfg, p.locations), done, function() {
                var ats = plist.build.mostRecentCall.args[0].NSAppTransportSecurity;
                expect(ats.NSAllowsArbitraryLoads).toEqual(true);
            });
        });
        it('<access> - https, subdomain wildcard', function(done) {
            wrapper(updateProject(cfg, p.locations), done, function() {
                var ats = plist.build.mostRecentCall.args[0].NSAppTransportSecurity;
                var exceptionDomains = ats.NSExceptionDomains;
                var d;

                expect(exceptionDomains).toBeTruthy();

                d = exceptionDomains['server01.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(true);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(null);
                expect(d.NSExceptionMinimumTLSVersion).toEqual(null);
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(null);

                d = exceptionDomains['server02.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(true);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(null);
                expect(d.NSExceptionMinimumTLSVersion).toEqual(null);
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(false);

                d = exceptionDomains['server03.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(true);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(null);
                expect(d.NSExceptionMinimumTLSVersion).toEqual('TLSv1.1');
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(null);

                d = exceptionDomains['server04.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(true);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(null);
                expect(d.NSExceptionMinimumTLSVersion).toEqual('TLSv1.1');
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(false);
            });
        });
        it('<access> - http, no wildcard', function(done) {
            wrapper(updateProject(cfg, p.locations), done, function() {
                var ats = plist.build.mostRecentCall.args[0].NSAppTransportSecurity;
                var exceptionDomains = ats.NSExceptionDomains;
                var d;

                expect(exceptionDomains).toBeTruthy();

                d = exceptionDomains['server05.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(null);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(true);
                expect(d.NSExceptionMinimumTLSVersion).toEqual(null);
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(null);

                d = exceptionDomains['server06.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(null);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(true);
                expect(d.NSExceptionMinimumTLSVersion).toEqual(null);
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(false);

                d = exceptionDomains['server07.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(null);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(true);
                expect(d.NSExceptionMinimumTLSVersion).toEqual('TLSv1.1');
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(null);

                d = exceptionDomains['server08.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(null);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(true);
                expect(d.NSExceptionMinimumTLSVersion).toEqual('TLSv1.1');
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(false);
            });
        });
        it('<access> - https, no wildcard', function(done) {
            wrapper(updateProject(cfg, p.locations), done, function() {
                var ats = plist.build.mostRecentCall.args[0].NSAppTransportSecurity;
                var exceptionDomains = ats.NSExceptionDomains;
                var d;

                expect(exceptionDomains).toBeTruthy();

                d = exceptionDomains['server09.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(null);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(null);
                expect(d.NSExceptionMinimumTLSVersion).toEqual(null);
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(null);

                d = exceptionDomains['server10.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(null);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(null);
                expect(d.NSExceptionMinimumTLSVersion).toEqual(null);
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(false);

                d = exceptionDomains['server11.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(null);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(null);
                expect(d.NSExceptionMinimumTLSVersion).toEqual('TLSv1.1');
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(null);

                d = exceptionDomains['server12.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(null);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(null);
                expect(d.NSExceptionMinimumTLSVersion).toEqual('TLSv1.1');
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(false);
            });
        });
        //////////////////////////////////////////////////
        it('<access>, <allow-navigation> - http and https, no clobber', function(done) {
            wrapper(updateProject(cfg2, p.locations), done, function() {
                var ats = plist.build.mostRecentCall.args[0].NSAppTransportSecurity;
                var exceptionDomains = ats.NSExceptionDomains;
                var d;

                expect(exceptionDomains).toBeTruthy();

                d = exceptionDomains['apache.org'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(true);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(true);
                expect(d.NSExceptionMinimumTLSVersion).toEqual(null);
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(null);
            });
        });
        //////////////////////////////////////////////////
        it('<allow-navigation> - wildcard scheme, wildcard subdomain', function(done) {
            wrapper(updateProject(cfg, p.locations), done, function() {
                var ats = plist.build.mostRecentCall.args[0].NSAppTransportSecurity;
                var exceptionDomains = ats.NSExceptionDomains;
                var d;

                expect(exceptionDomains).toBeTruthy();

                d = exceptionDomains['server33.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(true);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(true);
                expect(d.NSExceptionMinimumTLSVersion).toEqual(null);
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(null);

                d = exceptionDomains['server34.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(true);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(true);
                expect(d.NSExceptionMinimumTLSVersion).toEqual(null);
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(false);

                d = exceptionDomains['server35.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(true);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(true);
                expect(d.NSExceptionMinimumTLSVersion).toEqual('TLSv1.1');
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(null);

                d = exceptionDomains['server36.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(true);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(true);
                expect(d.NSExceptionMinimumTLSVersion).toEqual('TLSv1.1');
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(false);
            });
        });
        it('<allow-navigation> - wildcard scheme, no subdomain', function(done) {
            wrapper(updateProject(cfg, p.locations), done, function() {
                var ats = plist.build.mostRecentCall.args[0].NSAppTransportSecurity;
                var exceptionDomains = ats.NSExceptionDomains;
                var d;

                expect(exceptionDomains).toBeTruthy();

                d = exceptionDomains['server37.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(null);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(true);
                expect(d.NSExceptionMinimumTLSVersion).toEqual(null);
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(null);

                d = exceptionDomains['server38.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(null);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(true);
                expect(d.NSExceptionMinimumTLSVersion).toEqual(null);
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(false);

                d = exceptionDomains['server39.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(null);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(true);
                expect(d.NSExceptionMinimumTLSVersion).toEqual('TLSv1.1');
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(null);

                d = exceptionDomains['server40.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(null);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(true);
                expect(d.NSExceptionMinimumTLSVersion).toEqual('TLSv1.1');
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(false);
            });
        });
        it('<allow-navigation> - should ignore wildcards like data:*, https:*, https://*', function(done) {
            wrapper(updateProject(cfg, p.locations), done, function() {
                var ats = plist.build.mostRecentCall.args[0].NSAppTransportSecurity;
                var exceptionDomains = ats.NSExceptionDomains;
                expect(exceptionDomains['']).toBeUndefined();
                expect(exceptionDomains['null']).toBeUndefined();
                expect(exceptionDomains['undefined']).toBeUndefined();
            });
        });
    });

    describe('updateWww method', function() {
        var updateWww = prepare.__get__('updateWww');
        var logFileOp = prepare.__get__('logFileOp');

        beforeEach(function () {
            spyOn(FileUpdater, 'mergeAndUpdateDir').andReturn(true);
        });

        var project = {
            root: iosProject,
            locations: { www: path.join(iosProject, 'www') }
        };

        it('should update project-level www and with platform agnostic www and merges', function() {
            var merges_path = path.join(project.root, 'merges', 'ios');
            shell.mkdir('-p', merges_path);
            updateWww(project, p.locations);
            expect(FileUpdater.mergeAndUpdateDir).toHaveBeenCalledWith(
                [ 'www', path.join('platforms', 'ios', 'platform_www'), path.join('merges','ios') ],
                path.join('platforms', 'ios', 'www'),
                { rootDir : iosProject },
                logFileOp);
        });
        it('should skip merges if merges directory does not exist', function() {
            var merges_path = path.join(project.root, 'merges', 'ios');
            shell.rm('-rf', merges_path);
            updateWww(project, p.locations);
            expect(FileUpdater.mergeAndUpdateDir).toHaveBeenCalledWith(
                [ 'www', path.join('platforms', 'ios', 'platform_www') ],
                path.join('platforms', 'ios', 'www'),
                { rootDir : iosProject },
                logFileOp);
        });
    });
});
