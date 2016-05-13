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

var os = require('os');
var fs = require('fs');
var path = require('path');
var rewire = require('rewire');
var shell = require('shelljs');

var PluginInfo = require('cordova-common').PluginInfo;
var Api = require('../../../../bin/templates/scripts/cordova/Api');
var projectFile = require('../../../../bin/templates/scripts/cordova/lib/projectFile');
var pluginHandlers = rewire('../../../../bin/templates/scripts/cordova/lib/plugman/pluginHandlers');

var temp = path.join(os.tmpdir(), 'plugman');

var FIXTURES = path.join(__dirname, '../fixtures');
var iosProject = path.join(FIXTURES, 'ios-config-xml', '*');
var faultyplugin = path.join(FIXTURES, 'org.test.plugins.faultyplugin');
var dummyplugin = path.join(FIXTURES, 'org.test.plugins.dummyplugin');
var weblessplugin = path.join(FIXTURES, 'org.test.plugins.weblessplugin');

var dummyPluginInfo = new PluginInfo(dummyplugin);
var dummy_id = dummyPluginInfo.id;
var valid_source = dummyPluginInfo.getSourceFiles('ios'),
    valid_headers = dummyPluginInfo.getHeaderFiles('ios'),
    valid_resources = dummyPluginInfo.getResourceFiles('ios'),
    valid_custom_frameworks = dummyPluginInfo.getFrameworks('ios').filter(function(f) { return f.custom; });

var faultyPluginInfo = new PluginInfo(faultyplugin);
var invalid_source = faultyPluginInfo.getSourceFiles('ios');
var invalid_headers = faultyPluginInfo.getHeaderFiles('ios');
var invalid_resources = faultyPluginInfo.getResourceFiles('ios');
var invalid_custom_frameworks = faultyPluginInfo.getFrameworks('ios').filter(function(f) { return f.custom; });

var weblessPluginInfo = new PluginInfo(weblessplugin);

function copyArray(arr) {
    return Array.prototype.slice.call(arr, 0);
}

function slashJoin() {
    // In some places we need to use forward slash instead of path.join().
    // See CB-7311.
    return Array.prototype.join.call(arguments, '/');
}

describe('ios plugin handler', function() {
    var dummyProject;

    beforeEach(function() {
        shell.cp('-rf', iosProject, temp);
        projectFile.purgeProjectFileCache(temp);

        dummyProject = projectFile.parse({
            root: temp,
            pbxproj: path.join(temp, 'SampleApp.xcodeproj/project.pbxproj')
        });
    });

    afterEach(function() {
        shell.rm('-rf', temp);
    });

    describe('installation', function() {

        describe('of <source-file> elements', function() {
            var install = pluginHandlers.getInstaller('source-file');

            beforeEach(function () {
                spyOn(dummyProject.xcode, 'addSourceFile');
            });

            it('should throw if source-file src cannot be found', function() {
                var source = copyArray(invalid_source);
                expect(function() {
                    install(source[1], faultyPluginInfo, dummyProject);
                }).toThrow();
            });
            it('should throw if source-file target already exists', function() {
                var source = copyArray(valid_source);
                var target = path.join(temp, 'SampleApp', 'Plugins', dummy_id, 'DummyPluginCommand.m');
                shell.mkdir('-p', path.dirname(target));
                fs.writeFileSync(target, 'some bs', 'utf-8');
                expect(function() {
                    install(source[0], dummyPluginInfo, dummyProject);
                }).toThrow();
            });
            it('should call into xcodeproj\'s addSourceFile appropriately when element has no target-dir', function() {
                var source = copyArray(valid_source).filter(function(s) { return s.targetDir === undefined; });
                install(source[0], dummyPluginInfo, dummyProject);
                expect(dummyProject.xcode.addSourceFile)
                    .toHaveBeenCalledWith(slashJoin('Plugins', dummy_id, 'DummyPluginCommand.m'), {});
            });
            it('should call into xcodeproj\'s addSourceFile appropriately when element has a target-dir', function() {
                var source = copyArray(valid_source).filter(function(s) { return s.targetDir !== undefined; });
                install(source[0], dummyPluginInfo, dummyProject);
                expect(dummyProject.xcode.addSourceFile)
                    .toHaveBeenCalledWith(slashJoin('Plugins', dummy_id, 'targetDir', 'TargetDirTest.m'), {});
            });
            it('should cp the file to the right target location when element has no target-dir', function() {
                var source = copyArray(valid_source).filter(function(s) { return s.targetDir === undefined; });
                var spy = spyOn(shell, 'cp');
                install(source[0], dummyPluginInfo, dummyProject);
                expect(spy).toHaveBeenCalledWith('-f', path.join(dummyplugin, 'src', 'ios', 'DummyPluginCommand.m'), path.join(temp, 'SampleApp', 'Plugins', dummy_id, 'DummyPluginCommand.m'));
            });
            it('should cp the file to the right target location when element has a target-dir', function() {
                var source = copyArray(valid_source).filter(function(s) { return s.targetDir !== undefined; });
                var spy = spyOn(shell, 'cp');
                install(source[0], dummyPluginInfo, dummyProject);
                expect(spy).toHaveBeenCalledWith('-f', path.join(dummyplugin, 'src', 'ios', 'TargetDirTest.m'), path.join(temp, 'SampleApp', 'Plugins', dummy_id, 'targetDir', 'TargetDirTest.m'));
            });
            it('should call into xcodeproj\'s addFramework appropriately when element has framework=true set', function() {
                var source = copyArray(valid_source).filter(function(s) { return s.framework; });
                spyOn(dummyProject.xcode, 'addFramework');
                install(source[0], dummyPluginInfo, dummyProject);
                expect(dummyProject.xcode.addFramework)
                    .toHaveBeenCalledWith(path.join('SampleApp', 'Plugins', dummy_id, 'SourceWithFramework.m'), {weak:false});
            });
        });

        describe('of <header-file> elements', function() {
            var install = pluginHandlers.getInstaller('header-file');

            beforeEach(function () {
                spyOn(dummyProject.xcode, 'addHeaderFile');
            });

            it('should throw if header-file src cannot be found', function() {
                var headers = copyArray(invalid_headers);
                expect(function() {
                    install(headers[1], faultyPluginInfo, dummyProject);
                }).toThrow();
            });
            it('should throw if header-file target already exists', function() {
                var headers = copyArray(valid_headers);
                var target = path.join(temp, 'SampleApp', 'Plugins', dummy_id, 'DummyPluginCommand.h');
                shell.mkdir('-p', path.dirname(target));
                fs.writeFileSync(target, 'some bs', 'utf-8');
                expect(function() {
                    install(headers[0], dummyPluginInfo, dummyProject);
                }).toThrow();
            });
            it('should call into xcodeproj\'s addHeaderFile appropriately when element has no target-dir', function() {
                var headers = copyArray(valid_headers).filter(function(s) { return s.targetDir === undefined; });
                install(headers[0], dummyPluginInfo, dummyProject);
                expect(dummyProject.xcode.addHeaderFile)
                    .toHaveBeenCalledWith(slashJoin('Plugins', dummy_id, 'DummyPluginCommand.h'));
            });
            it('should call into xcodeproj\'s addHeaderFile appropriately when element a target-dir', function() {
                var headers = copyArray(valid_headers).filter(function(s) { return s.targetDir !== undefined; });
                install(headers[0], dummyPluginInfo, dummyProject);
                expect(dummyProject.xcode.addHeaderFile)
                    .toHaveBeenCalledWith(slashJoin('Plugins', dummy_id, 'targetDir', 'TargetDirTest.h'));
            });
            it('should cp the file to the right target location when element has no target-dir', function() {
                var headers = copyArray(valid_headers).filter(function(s) { return s.targetDir === undefined; });
                var spy = spyOn(shell, 'cp');
                install(headers[0], dummyPluginInfo, dummyProject);
                expect(spy).toHaveBeenCalledWith('-f', path.join(dummyplugin, 'src', 'ios', 'DummyPluginCommand.h'), path.join(temp, 'SampleApp', 'Plugins', dummy_id, 'DummyPluginCommand.h'));
            });
            it('should cp the file to the right target location when element has a target-dir', function() {
                var headers = copyArray(valid_headers).filter(function(s) { return s.targetDir !== undefined; });
                var spy = spyOn(shell, 'cp');
                install(headers[0], dummyPluginInfo, dummyProject);
                expect(spy).toHaveBeenCalledWith('-f', path.join(dummyplugin, 'src', 'ios', 'TargetDirTest.h'), path.join(temp, 'SampleApp', 'Plugins', dummy_id, 'targetDir', 'TargetDirTest.h'));
            });
        });

        describe('of <resource-file> elements', function() {
            var install = pluginHandlers.getInstaller('resource-file');

            beforeEach(function () {
                spyOn(dummyProject.xcode, 'addResourceFile');
            });

            it('should throw if resource-file src cannot be found', function() {
                var resources = copyArray(invalid_resources);
                expect(function() {
                    install(resources[0], faultyPluginInfo, dummyProject);
                }).toThrow('Cannot find resource file "' + path.resolve(faultyplugin, 'src/ios/IDontExist.bundle') + '" for plugin ' + faultyPluginInfo.id + ' in iOS platform');
            });
            it('should throw if resource-file target already exists', function() {
                var resources = copyArray(valid_resources);
                var target = path.join(temp, 'SampleApp', 'Resources', 'DummyPlugin.bundle');
                shell.mkdir('-p', path.dirname(target));
                fs.writeFileSync(target, 'some bs', 'utf-8');
                expect(function() {
                    install(resources[0], dummyPluginInfo, dummyProject);
                }).toThrow('File already exists at detination "' + target + '" for resource file specified by plugin ' + dummyPluginInfo.id + ' in iOS platform');
            });
            it('should call into xcodeproj\'s addResourceFile', function() {
                var resources = copyArray(valid_resources);
                install(resources[0], dummyPluginInfo, dummyProject);
                expect(dummyProject.xcode.addResourceFile)
                    .toHaveBeenCalledWith(path.join('Resources', 'DummyPlugin.bundle'));
            });
            it('should cp the file to the right target location', function() {
                var resources = copyArray(valid_resources);
                var spy = spyOn(shell, 'cp');
                install(resources[0], dummyPluginInfo, dummyProject);
                expect(spy).toHaveBeenCalledWith('-R', path.join(dummyplugin, 'src', 'ios', 'DummyPlugin.bundle'), path.join(temp, 'SampleApp', 'Resources'));
            });
        });

        describe('of <framework> elements', function() {

            var install = pluginHandlers.getInstaller('framework');
            beforeEach(function () {
                spyOn(dummyProject.xcode, 'addFramework');
            });

            it('should call into xcodeproj\'s addFramework', function() {
                var frameworks = copyArray(valid_custom_frameworks);
                install(frameworks[0], dummyPluginInfo, dummyProject);
                expect(dummyProject.xcode.addFramework)
                    .toHaveBeenCalledWith('SampleApp/Plugins/org.test.plugins.dummyplugin/Custom.framework', {customFramework:true});
            });

            // TODO: Add more tests to cover the cases:
            // * framework with weak attribute
            // * framework that shouldn't be added/removed

            describe('with custom="true" attribute', function () {
                it('should throw if framework src cannot be found', function() {
                    var frameworks = copyArray(invalid_custom_frameworks);
                    expect(function() {
                        install(frameworks[0], faultyPluginInfo, dummyProject);
                    }).toThrow('Cannot find framework "' + path.resolve(faultyplugin, 'src/ios/NonExistantCustomFramework.framework')  + '" for plugin ' + faultyPluginInfo.id + ' in iOS platform');
                });
                it('should throw if framework target already exists', function() {
                    var frameworks = copyArray(valid_custom_frameworks);
                    var target = path.join(temp, 'SampleApp/Plugins/org.test.plugins.dummyplugin/Custom.framework');
                    shell.mkdir('-p', target);
                    expect(function() {
                        install(frameworks[0], dummyPluginInfo, dummyProject);
                    }).toThrow('Framework "' + target + '" for plugin ' + dummyPluginInfo.id + ' already exists in iOS platform');
                });
                it('should cp the file to the right target location', function() {
                    var frameworks = copyArray(valid_custom_frameworks);
                    var spy = spyOn(shell, 'cp');
                    install(frameworks[0], dummyPluginInfo, dummyProject);
                    expect(spy).toHaveBeenCalledWith('-R', path.join(dummyplugin, 'src', 'ios', 'Custom.framework'),
                                                     path.join(temp, 'SampleApp/Plugins/org.test.plugins.dummyplugin'));
                });
            });
        });

        describe('of <js-module> elements', function() {
            var jsModule = {src: 'www/dummyPlugin.js'};
            var install = pluginHandlers.getInstaller('js-module');
            var wwwDest, platformWwwDest;

            beforeEach(function () {
                spyOn(fs, 'writeFileSync');
                wwwDest = path.resolve(dummyProject.www, 'plugins', dummyPluginInfo.id, jsModule.src);
                platformWwwDest = path.resolve(dummyProject.platformWww, 'plugins', dummyPluginInfo.id, jsModule.src);
            });

            it('should put module to both www and platform_www when options.usePlatformWww flag is specified', function () {
                install(jsModule, dummyPluginInfo, dummyProject, {usePlatformWww: true});
                expect(fs.writeFileSync).toHaveBeenCalledWith(wwwDest, jasmine.any(String), 'utf-8');
                expect(fs.writeFileSync).toHaveBeenCalledWith(platformWwwDest, jasmine.any(String), 'utf-8');
            });

            it('should put module to www only when options.usePlatformWww flag is not specified', function () {
                install(jsModule, dummyPluginInfo, dummyProject);
                expect(fs.writeFileSync).toHaveBeenCalledWith(wwwDest, jasmine.any(String), 'utf-8');
                expect(fs.writeFileSync).not.toHaveBeenCalledWith(platformWwwDest, jasmine.any(String), 'utf-8');
            });
        });

        describe('of <asset> elements', function() {
            var asset = {src: 'www/dummyPlugin.js', target: 'foo/dummy.js'};
            var install = pluginHandlers.getInstaller('asset');
            var wwwDest, platformWwwDest;

            beforeEach(function () {
                spyOn(shell, 'cp');
                wwwDest = path.resolve(dummyProject.www, asset.target);
                platformWwwDest = path.resolve(dummyProject.platformWww, asset.target);
            });

            it('should put asset to both www and platform_www when options.usePlatformWww flag is specified', function () {
                install(asset, dummyPluginInfo, dummyProject, {usePlatformWww: true});
                expect(shell.cp).toHaveBeenCalledWith('-f', path.resolve(dummyPluginInfo.dir, asset.src), path.resolve(dummyProject.www, asset.target));
                expect(shell.cp).toHaveBeenCalledWith('-f', path.resolve(dummyPluginInfo.dir, asset.src), path.resolve(dummyProject.platformWww, asset.target));
            });

            it('should put asset to www only when options.usePlatformWww flag is not specified', function () {
                install(asset, dummyPluginInfo, dummyProject);
                expect(shell.cp).toHaveBeenCalledWith('-f', path.resolve(dummyPluginInfo.dir, asset.src), path.resolve(dummyProject.www, asset.target));
                expect(shell.cp).not.toHaveBeenCalledWith(path.resolve(dummyPluginInfo.dir, asset.src), path.resolve(dummyProject.platformWww, asset.target));
            });
        });

        it('of two plugins should apply xcode file changes from both', function(done){
            var api = new Api('ios', temp);
            var fail = jasmine.createSpy('fail');

            api.addPlugin(dummyPluginInfo)
            .then(function () {
                return api.addPlugin(weblessPluginInfo);
            })
            .fail(fail)
            .done(function() {
                expect(fail).not.toHaveBeenCalled();

                var xcode = projectFile.parse({
                    root: temp,
                    pbxproj: path.join(temp, 'SampleApp.xcodeproj/project.pbxproj')
                }).xcode;

                // from org.test.plugins.dummyplugin
                expect(xcode.hasFile(slashJoin('Resources', 'DummyPlugin.bundle'))).toEqual(jasmine.any(Object));
                expect(xcode.hasFile(slashJoin('Plugins','org.test.plugins.dummyplugin', 'DummyPluginCommand.h'))).toEqual(jasmine.any(Object));
                expect(xcode.hasFile(slashJoin('Plugins','org.test.plugins.dummyplugin', 'DummyPluginCommand.m'))).toEqual(jasmine.any(Object));
                expect(xcode.hasFile(slashJoin('Plugins','org.test.plugins.dummyplugin','targetDir','TargetDirTest.h'))).toEqual(jasmine.any(Object));
                expect(xcode.hasFile(slashJoin('Plugins','org.test.plugins.dummyplugin','targetDir','TargetDirTest.m'))).toEqual(jasmine.any(Object));
                expect(xcode.hasFile('usr/lib/libsqlite3.dylib')).toEqual(jasmine.any(Object));
                expect(xcode.hasFile(slashJoin('SampleApp','Plugins','org.test.plugins.dummyplugin','Custom.framework'))).toEqual(jasmine.any(Object));
                // from org.test.plugins.weblessplugin
                expect(xcode.hasFile(slashJoin('Resources', 'WeblessPluginViewController.xib'))).toEqual(jasmine.any(Object));
                expect(xcode.hasFile(slashJoin('Plugins','org.test.plugins.weblessplugin','WeblessPluginCommand.h'))).toEqual(jasmine.any(Object));
                expect(xcode.hasFile(slashJoin('Plugins','org.test.plugins.weblessplugin','WeblessPluginCommand.m'))).toEqual(jasmine.any(Object));
                expect(xcode.hasFile('usr/lib/libsqlite3.dylib')).toEqual(jasmine.any(Object));

                done();
            });
        });
    });

    describe('uninstallation', function() {
        describe('of <source-file> elements', function() {
            var uninstall = pluginHandlers.getUninstaller('source-file');
            beforeEach(function () {
                spyOn(dummyProject.xcode, 'removeSourceFile');
                spyOn(dummyProject.xcode, 'removeFramework');
            });

            it('should call into xcodeproj\'s removeSourceFile appropriately when element has no target-dir', function(){
                var source = copyArray(valid_source).filter(function(s) { return s.targetDir === undefined; });
                uninstall(source[0], dummyPluginInfo, dummyProject);
                expect(dummyProject.xcode.removeSourceFile).toHaveBeenCalledWith(slashJoin('Plugins', dummy_id, 'DummyPluginCommand.m'));
            });
            it('should call into xcodeproj\'s removeSourceFile appropriately when element a target-dir', function(){
                var source = copyArray(valid_source).filter(function(s) { return s.targetDir !== undefined; });
                uninstall(source[0], dummyPluginInfo, dummyProject);
                expect(dummyProject.xcode.removeSourceFile).toHaveBeenCalledWith(slashJoin('Plugins', dummy_id, 'targetDir', 'TargetDirTest.m'));
            });
            it('should rm the file from the right target location when element has no target-dir', function(){
                var source = copyArray(valid_source).filter(function(s) { return s.targetDir === undefined; });
                var spy = spyOn(shell, 'rm');
                uninstall(source[0], dummyPluginInfo, dummyProject);
                expect(spy).toHaveBeenCalledWith('-rf', path.join(temp, 'SampleApp', 'Plugins', dummy_id));
            });
            it('should rm the file from the right target location when element has a target-dir', function(){
                var source = copyArray(valid_source).filter(function(s) { return s.targetDir !== undefined; });
                var spy = spyOn(shell, 'rm');
                uninstall(source[0], dummyPluginInfo, dummyProject);
                expect(spy).toHaveBeenCalledWith('-rf', path.join(temp, 'SampleApp', 'Plugins', dummy_id, 'targetDir'));
            });
            it('should call into xcodeproj\'s removeFramework appropriately when element framework=true set', function(){
                var source = copyArray(valid_source).filter(function(s) { return s.framework; });
                uninstall(source[0], dummyPluginInfo, dummyProject);
                expect(dummyProject.xcode.removeFramework).toHaveBeenCalledWith(path.join('SampleApp', 'Plugins', dummy_id, 'SourceWithFramework.m'));
            });
        });

        describe('of <header-file> elements', function() {
            var uninstall = pluginHandlers.getUninstaller('header-file');
            beforeEach(function () {
                spyOn(dummyProject.xcode, 'removeHeaderFile');
            });

            it('should call into xcodeproj\'s removeHeaderFile appropriately when element has no target-dir', function(){
                var headers = copyArray(valid_headers).filter(function(s) { return s.targetDir === undefined; });
                uninstall(headers[0], dummyPluginInfo, dummyProject);
                expect(dummyProject.xcode.removeHeaderFile).toHaveBeenCalledWith(slashJoin('Plugins', dummy_id, 'DummyPluginCommand.h'));
            });
            it('should call into xcodeproj\'s removeHeaderFile appropriately when element a target-dir', function(){
                var headers = copyArray(valid_headers).filter(function(s) { return s.targetDir !== undefined; });
                uninstall(headers[0], dummyPluginInfo, dummyProject);
                expect(dummyProject.xcode.removeHeaderFile).toHaveBeenCalledWith(slashJoin('Plugins', dummy_id, 'targetDir', 'TargetDirTest.h'));
            });
            it('should rm the file from the right target location', function(){
                var headers = copyArray(valid_headers).filter(function(s) { return s.targetDir !== undefined; });
                var spy = spyOn(shell, 'rm');
                uninstall(headers[0], dummyPluginInfo, dummyProject);
                expect(spy).toHaveBeenCalledWith('-rf', path.join(temp, 'SampleApp', 'Plugins', dummy_id, 'targetDir'));
            });
        });

        describe('of <resource-file> elements', function() {
            var uninstall = pluginHandlers.getUninstaller('resource-file');
            beforeEach(function () {
                spyOn(dummyProject.xcode, 'removeResourceFile');
            });

            it('should call into xcodeproj\'s removeResourceFile', function(){
                var resources = copyArray(valid_resources);
                uninstall(resources[0], dummyPluginInfo, dummyProject);
                expect(dummyProject.xcode.removeResourceFile).toHaveBeenCalledWith(path.join('Resources', 'DummyPlugin.bundle'));
            });
            it('should rm the file from the right target location', function(){
                var resources = copyArray(valid_resources);
                var spy = spyOn(shell, 'rm');
                uninstall(resources[0], dummyPluginInfo, dummyProject);
                expect(spy).toHaveBeenCalledWith('-rf', path.join(temp, 'SampleApp', 'Resources', 'DummyPlugin.bundle'));
            });
        });

        describe('of <framework> elements', function() {
            var uninstall = pluginHandlers.getUninstaller('framework');
            beforeEach(function () {
                spyOn(dummyProject.xcode, 'removeFramework');
            });

            var frameworkPath = path.join(temp, 'SampleApp/Plugins/org.test.plugins.dummyplugin/Custom.framework').replace(/\\/g, '/');

            it('should call into xcodeproj\'s removeFramework', function(){
                var frameworks = copyArray(valid_custom_frameworks);
                uninstall(frameworks[0], dummyPluginInfo, dummyProject);
                expect(dummyProject.xcode.removeFramework).toHaveBeenCalledWith(frameworkPath, {customFramework:true});
            });

            // TODO: Add more tests to cover the cases:
            // * framework with weak attribute
            // * framework that shouldn't be added/removed

            describe('with custom="true" attribute', function () {
                it('should rm the file from the right target location', function(){
                    var frameworks = copyArray(valid_custom_frameworks);
                    var spy = spyOn(shell, 'rm');
                    uninstall(frameworks[0], dummyPluginInfo, dummyProject);
                    expect(spy).toHaveBeenCalledWith('-rf', frameworkPath);
                });
            });
        });

        describe('of <js-module> elements', function() {
            var jsModule = {src: 'www/dummyPlugin.js'};
            var uninstall = pluginHandlers.getUninstaller('js-module');
            var wwwDest, platformWwwDest;

            beforeEach(function () {
                wwwDest = path.resolve(dummyProject.www, 'plugins', dummyPluginInfo.id, jsModule.src);
                platformWwwDest = path.resolve(dummyProject.platformWww, 'plugins', dummyPluginInfo.id, jsModule.src);

                spyOn(shell, 'rm');

                var existsSyncOrig = fs.existsSync;
                spyOn(fs, 'existsSync').andCallFake(function (file) {
                    if ([wwwDest, platformWwwDest].indexOf(file) >= 0 ) return true;
                    return existsSyncOrig.call(fs, file);
                });
            });

            it('should put module to both www and platform_www when options.usePlatformWww flag is specified', function () {
                uninstall(jsModule, dummyPluginInfo, dummyProject, {usePlatformWww: true});
                expect(shell.rm).toHaveBeenCalledWith(jasmine.any(String), wwwDest);
                expect(shell.rm).toHaveBeenCalledWith(jasmine.any(String), platformWwwDest);
            });

            it('should put module to www only when options.usePlatformWww flag is not specified', function () {
                uninstall(jsModule, dummyPluginInfo, dummyProject);
                expect(shell.rm).toHaveBeenCalledWith(jasmine.any(String), wwwDest);
                expect(shell.rm).not.toHaveBeenCalledWith(jasmine.any(String), platformWwwDest);
            });
        });

        describe('of <asset> elements', function() {
            var asset = {src: 'www/dummyPlugin.js', target: 'foo/dummy.js'};
            var uninstall = pluginHandlers.getUninstaller('asset');
            var wwwDest, platformWwwDest;

            beforeEach(function () {
                wwwDest = path.resolve(dummyProject.www, asset.target);
                platformWwwDest = path.resolve(dummyProject.platformWww, asset.target);

                spyOn(shell, 'rm');

                var existsSyncOrig = fs.existsSync;
                spyOn(fs, 'existsSync').andCallFake(function (file) {
                    if ([wwwDest, platformWwwDest].indexOf(file) >= 0 ) return true;
                    return existsSyncOrig.call(fs, file);
                });
            });

            it('should put module to both www and platform_www when options.usePlatformWww flag is specified', function () {
                uninstall(asset, dummyPluginInfo, dummyProject, {usePlatformWww: true});
                expect(shell.rm).toHaveBeenCalledWith(jasmine.any(String), wwwDest);
                expect(shell.rm).toHaveBeenCalledWith(jasmine.any(String), platformWwwDest);
            });

            it('should put module to www only when options.usePlatformWww flag is not specified', function () {
                uninstall(asset, dummyPluginInfo, dummyProject);
                expect(shell.rm).toHaveBeenCalledWith(jasmine.any(String), wwwDest);
                expect(shell.rm).not.toHaveBeenCalledWith(jasmine.any(String), platformWwwDest);
            });
        });
    });
});
