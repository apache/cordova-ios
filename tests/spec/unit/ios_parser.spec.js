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
var iosParser = require('../../src/cordova/metadata/ios_parser'),
    util = require('../../src/cordova/util'),
    path = require('path'),
    shell = require('shelljs'),
    plist = require('plist'),
    xcode = require('xcode'),
    fs = require('fs'),
    Q = require('q'),
    config = require('../../src/cordova/config'),
    Parser = require('../../src/cordova/metadata/parser'),
    ConfigParser = require('cordova-common').ConfigParser;

var iosProjectFixture = path.join(__dirname, '../fixtures/projects/ios');
var proj = path.join(__dirname, 'some/path');
var ios_proj = path.join(proj, 'platforms/ios');

shell.config.silent = true;

// Create a real config object before mocking out everything.
var cfg = new ConfigParser(path.join(__dirname, '..', 'test-config.xml'));
var cfg2 = new ConfigParser(path.join(__dirname, '..', 'test-config-2.xml'));

describe('ios project parser', function () {
    var custom;
    beforeEach(function() {
        custom = spyOn(config, 'has_custom_path').andReturn(false);
        shell.mkdir('-p', ios_proj);
        shell.cp('-rf', iosProjectFixture + '/*', ios_proj);
    });

    afterEach(function () {
        shell.rm('-rf', path.join(__dirname, 'some'));
    });

    function wrapper(p, done, post) {
        p.then(post, function(err) {
            expect(err.stack).toBeUndefined();
        }).fin(done);
    }

    function errorWrapper(p, done, post) {
        p.then(function() {
            expect('this call').toBe('fail');
        }, post).fin(done);
    }

    describe('constructions', function() {
        it('should throw if provided directory does not contain an xcodeproj file', function() {
            expect(function() {
                new iosParser(proj);
            }).toThrow();
        });
        it('should create an instance with path, pbxproj, xcodeproj, originalName and cordovaproj properties', function() {
            expect(function() {
                var p = new iosParser(ios_proj);
                expect(p.path).toEqual(ios_proj);
                expect(p.pbxproj).toEqual(path.join(ios_proj, 'test.xcodeproj', 'project.pbxproj'));
                expect(p.xcodeproj).toEqual(path.join(ios_proj, 'test.xcodeproj'));
            }).not.toThrow();
        });
        it('should be an instance of Parser', function() {
            expect(new iosParser(ios_proj) instanceof Parser).toBe(true);
        });
        it('should call super with the correct arguments', function() {
            var call = spyOn(Parser, 'call');
            var p = new iosParser(ios_proj);
            expect(call).toHaveBeenCalledWith(p, 'ios', ios_proj);
        });
    });

    describe('instance', function() {
        var p, is_cordova, getOrientation;
        beforeEach(function() {
            p = new iosParser(ios_proj);
            is_cordova = spyOn(util, 'isCordova').andReturn(proj);
            getOrientation = spyOn(p.helper, 'getOrientation');
        });

        describe('update_from_config method', function() {
            var mv;
            var plist_parse, plist_build, xc;
            var update_name;
            var xcOrig = xcode.project;
            beforeEach(function() {
                mv = spyOn(shell, 'mv');
                plist_parse = spyOn(plist, 'parse').andReturn({
                });
                plist_build = spyOn(plist, 'build').andReturn('');
                xc = spyOn(xcode, 'project')
                .andCallFake(function (pbxproj) {
                    var xc = new xcOrig(pbxproj);
                    update_name = spyOn(xc, 'updateProductName').andCallThrough();
                    return xc;
                });
                cfg.name = function() { return 'testname'; };
                cfg.packageName = function() { return 'testpkg'; };
                cfg.version = function() { return 'one point oh'; };
            });

            it('should update the app name in pbxproj by calling xcode.updateProductName, and move the ios native files to match the new name', function(done) {
                var test_path = path.join(proj, 'platforms', 'ios', 'test');
                var testname_path = path.join(proj, 'platforms', 'ios', 'testname');
                wrapper(p.update_from_config(cfg), done, function() {
                    expect(update_name).toHaveBeenCalledWith('testname');
                    expect(mv).toHaveBeenCalledWith(path.join(test_path, 'test-Info.plist'), path.join(test_path, 'testname-Info.plist'));
                    expect(mv).toHaveBeenCalledWith(path.join(test_path, 'test-Prefix.pch'), path.join(test_path, 'testname-Prefix.pch'));
                    expect(mv).toHaveBeenCalledWith(test_path + '.xcodeproj', testname_path + '.xcodeproj');
                    expect(mv).toHaveBeenCalledWith(test_path, testname_path);
                });
            });
            it('should write out the app id to info plist as CFBundleIdentifier', function(done) {
                cfg.ios_CFBundleIdentifier = function() { return null; };
                wrapper(p.update_from_config(cfg), done, function() {
                    expect(plist_build.mostRecentCall.args[0].CFBundleIdentifier).toEqual('testpkg');
                });
            });
            it('should write out the app id to info plist as CFBundleIdentifier with ios-CFBundleIdentifier', function(done) {
                cfg.ios_CFBundleIdentifier = function() { return 'testpkg_ios'; };
                wrapper(p.update_from_config(cfg), done, function() {
                    expect(plist_build.mostRecentCall.args[0].CFBundleIdentifier).toEqual('testpkg_ios');
                });
            });
            it('should write out the app version to info plist as CFBundleVersion', function(done) {
                wrapper(p.update_from_config(cfg), done, function() {
                    expect(plist_build.mostRecentCall.args[0].CFBundleShortVersionString).toEqual('one point oh');
                });
            });
            it('should write out the orientation preference value', function(done) {
                getOrientation.andCallThrough();
                wrapper(p.update_from_config(cfg), done, function() {
                    expect(plist_build.mostRecentCall.args[0].UISupportedInterfaceOrientations).toEqual([ 'UIInterfaceOrientationPortrait', 'UIInterfaceOrientationPortraitUpsideDown' ]);
                    expect(plist_build.mostRecentCall.args[0]['UISupportedInterfaceOrientations~ipad']).toEqual([ 'UIInterfaceOrientationPortrait', 'UIInterfaceOrientationPortraitUpsideDown' ]);
                    expect(plist_build.mostRecentCall.args[0].UIInterfaceOrientation).toEqual([ 'UIInterfaceOrientationPortrait' ]);
                });
            });
            it('should handle no orientation', function(done) {
                getOrientation.andReturn('');
                wrapper(p.update_from_config(cfg), done, function() {
                    expect(plist_build.mostRecentCall.args[0].UISupportedInterfaceOrientations).toBeUndefined();
                    expect(plist_build.mostRecentCall.args[0]['UISupportedInterfaceOrientations~ipad']).toBeUndefined();
                    expect(plist_build.mostRecentCall.args[0].UIInterfaceOrientation).toBeUndefined();
                });
            });
            it('should handle default orientation', function(done) {
                getOrientation.andReturn(p.helper.ORIENTATION_DEFAULT);
                wrapper(p.update_from_config(cfg), done, function() {
                    expect(plist_build.mostRecentCall.args[0].UISupportedInterfaceOrientations).toBeUndefined();
                    expect(plist_build.mostRecentCall.args[0]['UISupportedInterfaceOrientations~ipad']).toBeUndefined();
                    expect(plist_build.mostRecentCall.args[0].UIInterfaceOrientation).toBeUndefined();
                });
            });
            it('should handle portrait orientation', function(done) {
                getOrientation.andReturn(p.helper.ORIENTATION_PORTRAIT);
                wrapper(p.update_from_config(cfg), done, function() {
                    expect(plist_build.mostRecentCall.args[0].UISupportedInterfaceOrientations).toEqual([ 'UIInterfaceOrientationPortrait', 'UIInterfaceOrientationPortraitUpsideDown' ]);
                    expect(plist_build.mostRecentCall.args[0].UIInterfaceOrientation).toEqual([ 'UIInterfaceOrientationPortrait' ]);
                });
            });
            it('should handle landscape orientation', function(done) {
                getOrientation.andReturn(p.helper.ORIENTATION_LANDSCAPE);
                wrapper(p.update_from_config(cfg), done, function() {
                    expect(plist_build.mostRecentCall.args[0].UISupportedInterfaceOrientations).toEqual([ 'UIInterfaceOrientationLandscapeLeft', 'UIInterfaceOrientationLandscapeRight' ]);
                    expect(plist_build.mostRecentCall.args[0].UIInterfaceOrientation).toEqual([ 'UIInterfaceOrientationLandscapeLeft' ]);
                });
            });
            it('should handle all orientation on ios', function(done) {
                getOrientation.andReturn(p.helper.ORIENTATION_ALL);
                wrapper(p.update_from_config(cfg2), done, function() {
                    expect(plist_build.mostRecentCall.args[0].UISupportedInterfaceOrientations).toEqual([ 'UIInterfaceOrientationPortrait', 'UIInterfaceOrientationPortraitUpsideDown', 'UIInterfaceOrientationLandscapeLeft', 'UIInterfaceOrientationLandscapeRight' ]);
                    expect(plist_build.mostRecentCall.args[0].UIInterfaceOrientation).toEqual([ 'UIInterfaceOrientationPortrait' ]);
                });
            });
            it('should handle custom orientation', function(done) {
                getOrientation.andReturn('some-custom-orientation');
                wrapper(p.update_from_config(cfg), done, function() {
                    expect(plist_build.mostRecentCall.args[0].UISupportedInterfaceOrientations).toBeUndefined();
                    expect(plist_build.mostRecentCall.args[0].UIInterfaceOrientation).toEqual([ 'some-custom-orientation' ]);
                });
            });
            ///// App Transport Security Tests /////////////////////////////
            it('<access> - should handle wildcard', function(done) {
                wrapper(p.update_from_config(cfg), done, function() {
                    var ats = plist_build.mostRecentCall.args[0].NSAppTransportSecurity;
                    expect(ats.NSAllowsArbitraryLoads).toEqual(true);
                });
            });
            it('<access> - https, subdomain wildcard', function(done) {
                wrapper(p.update_from_config(cfg), done, function() {
                    var ats = plist_build.mostRecentCall.args[0].NSAppTransportSecurity;
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
                wrapper(p.update_from_config(cfg), done, function() {
                    var ats = plist_build.mostRecentCall.args[0].NSAppTransportSecurity;
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
                wrapper(p.update_from_config(cfg), done, function() {
                    var ats = plist_build.mostRecentCall.args[0].NSAppTransportSecurity;
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
                wrapper(p.update_from_config(cfg2), done, function() {
                    var ats = plist_build.mostRecentCall.args[0].NSAppTransportSecurity;
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
                wrapper(p.update_from_config(cfg), done, function() {
                    var ats = plist_build.mostRecentCall.args[0].NSAppTransportSecurity;
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
                wrapper(p.update_from_config(cfg), done, function() {
                    var ats = plist_build.mostRecentCall.args[0].NSAppTransportSecurity;
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
                wrapper(p.update_from_config(cfg), done, function() {
                    var ats = plist_build.mostRecentCall.args[0].NSAppTransportSecurity;
                    var exceptionDomains = ats.NSExceptionDomains;
                    expect(exceptionDomains['']).toBeUndefined();
                    expect(exceptionDomains['null']).toBeUndefined();
                    expect(exceptionDomains['undefined']).toBeUndefined();
                });
            });
        });
        describe('www_dir method', function() {
            it('should return /www', function() {
                expect(p.www_dir()).toEqual(path.join(ios_proj, 'www'));
            });
        });
        describe('config_xml method', function() {
            it('should return the location of the config.xml', function() {
                expect(p.config_xml()).toEqual(path.join(ios_proj, 'test', 'config.xml'));
            });
        });
        describe('update_www method', function() {
            var cp, rm;

            beforeEach(function () {
                rm = spyOn(shell, 'rm').andCallThrough();
                cp = spyOn(shell, 'cp').andCallThrough();
            });

            it('should rm project-level www and cp in platform agnostic www', function() {
                p.update_www(path.join('lib','dir'));
                expect(rm).toHaveBeenCalled();
                expect(cp).toHaveBeenCalled();
            });
        });
        describe('update_overrides method', function() {
            var exists, rm, cp;
            beforeEach(function() {
                exists = spyOn(fs, 'existsSync').andCallThrough();
                rm = spyOn(shell, 'rm').andCallThrough();
                cp = spyOn(shell, 'cp').andCallThrough();
            });
            it('should do nothing if merges directory does not exist', function() {
                cp.reset();
                exists.andReturn(false);
                p.update_overrides();
                expect(cp).not.toHaveBeenCalled();
            });
            it('should copy merges path into www', function() {
                cp.andCallFake(function(){});
                cp.reset();
                exists.andReturn(true);
                p.update_overrides();
                expect(cp).toHaveBeenCalled();
            });
        });
        describe('update_project method', function() {
            var config, www, overrides, svn;
            beforeEach(function() {
                config = spyOn(p, 'update_from_config').andReturn(Q());
                www = spyOn(p, 'update_www');
                overrides = spyOn(p, 'update_overrides');
                svn = spyOn(util, 'deleteSvnFolders');
            });
            it('should call update_from_config', function(done) {
                wrapper(p.update_project(), done, function() {
                    expect(config).toHaveBeenCalled();
                });
            });
            it('should throw if update_from_config errors', function(done) {
                var e = new Error('uh oh!');
                config.andReturn(Q.reject(e));
                errorWrapper(p.update_project({}), done, function(err) {
                    expect(err).toEqual(e);
                });
            });
            it('should not call update_www', function(done) {
                wrapper(p.update_project({}), done, function() {
                    expect(www).not().toHaveBeenCalled();
                });
            });
            it('should call update_overrides', function(done) {
                wrapper(p.update_project(), done, function() {
                    expect(overrides).toHaveBeenCalled();
                });
            });
            it('should call deleteSvnFolders', function(done) {
                wrapper(p.update_project(), done, function() {
                    expect(svn).toHaveBeenCalled();
                });
            });
        });
    });
});
