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

/* jshint sub:true */

var ios = require('../../src/plugman/platforms/ios'),
    install = require('../../src/plugman/install'),
    path = require('path'),
    fs = require('fs'),
    shell = require('shelljs'),
    os = require('os'),
    temp = path.join(os.tmpdir(), 'plugman'),
    plugins_dir = path.join(temp, 'cordova', 'plugins'),
    ios_config_xml_project = path.join(__dirname, '..', 'projects', 'ios-config-xml', '*'),
    ios_project = path.join(ios_config_xml_project, '..'),
    faultyplugin = path.join(__dirname, '..', 'plugins', 'org.test.plugins.faultyplugin'),
    dummyplugin = path.join(__dirname, '..', 'plugins', 'org.test.plugins.dummyplugin'),
    weblessplugin = path.join(__dirname, '..', 'plugins', 'org.test.plugins.weblessplugin'),
    done = false;

var PluginInfo = require('cordova-common').PluginInfo;

var dummyPluginInfo = new PluginInfo(dummyplugin);
var dummy_id = dummyPluginInfo.id;
var valid_source = dummyPluginInfo.getSourceFiles('ios'),
    valid_headers = dummyPluginInfo.getHeaderFiles('ios'),
    valid_resources = dummyPluginInfo.getResourceFiles('ios'),
    valid_custom_frameworks = dummyPluginInfo.getFrameworks('ios').filter(function(f) { return f.custom; });

var faultyPluginInfo = new PluginInfo(faultyplugin);
var faulty_id = faultyPluginInfo.id;

var invalid_source = faultyPluginInfo.getSourceFiles('ios');
var invalid_headers = faultyPluginInfo.getHeaderFiles('ios');
var invalid_resources = faultyPluginInfo.getResourceFiles('ios');
var invalid_custom_frameworks = faultyPluginInfo.getFrameworks('ios').filter(function(f) { return f.custom; });

shell.mkdir('-p', temp);
shell.cp('-rf', ios_config_xml_project, temp);
var proj_files = ios.parseProjectFile(temp);
shell.rm('-rf', temp);
ios.purgeProjectFileCache(temp);

function copyArray(arr) {
    return Array.prototype.slice.call(arr, 0);
}

function installPromise(f) {
    f.then(function(res) { done = true; }, function(err) { done = err; });
}

function slashJoin() {
    // In some places we need to use forward slash instead of path.join().
    // See CB-7311.
    return Array.prototype.join.call(arguments, '/');
}

describe('ios project handler', function() {
    beforeEach(function() {
        shell.mkdir('-p', temp);
        shell.mkdir('-p', plugins_dir);
    });
    afterEach(function() {
        shell.rm('-rf', temp);
        ios.purgeProjectFileCache(temp);
    });

    describe('www_dir method', function() {
        it('should return cordova-ios project www location using www_dir', function() {
            expect(ios.www_dir(path.sep)).toEqual(path.sep + 'www');
        });
    });

    describe('package_name method', function() {
        it('should return the CFBundleIdentifier from the project\'s Info.plist file', function() {
            expect(ios.package_name(ios_project)).toEqual('com.example.friendstring');
        });
    });

    describe('parseProjectFile method', function () {
        it('should throw if project is not an xcode project', function() {
            expect(function() {
                ios.parseProjectFile(temp);
            }).toThrow('does not appear to be an xcode project (no xcode project file)');
        });
        it('should throw if project does not contain an appropriate config.xml file', function() {
            shell.cp('-rf', ios_config_xml_project, temp);
            shell.rm(path.join(temp, 'SampleApp', 'config.xml'));

            expect(function() {
                ios.parseProjectFile(temp);
            }).toThrow('could not find -Info.plist file, or config.xml file.');
        });
        it('should throw if project does not contain an appropriate -Info.plist file', function() {
            shell.cp('-rf', ios_config_xml_project, temp);
            shell.rm(path.join(temp, 'SampleApp', 'SampleApp-Info.plist'));

            expect(function () {
                ios.parseProjectFile(temp);
            }).toThrow('could not find -Info.plist file, or config.xml file.');
        });
        it('should return right directory when multiple .plist files are present', function() {
            shell.cp('-rf', ios_config_xml_project, temp);
            //Create a folder named A with config.xml and .plist files in it
            var pathToFolderA = path.join(temp, 'A');
            shell.mkdir(pathToFolderA);
            shell.cp('-rf', path.join(temp, 'SampleApp/*'), pathToFolderA);

            var parsedProjectFile = ios.parseProjectFile(temp);
            var pluginsDir = parsedProjectFile.plugins_dir,
                resourcesDir = parsedProjectFile.resources_dir,
                xcodePath = parsedProjectFile.xcode_path;

            var pluginsDirParent = path.dirname(pluginsDir),
                resourcesDirParent = path.dirname(resourcesDir),
                sampleAppDir = path.join(temp, 'SampleApp');

            expect(pluginsDirParent).toEqual(sampleAppDir);
            expect(resourcesDirParent).toEqual(sampleAppDir);
            expect(xcodePath).toEqual(sampleAppDir);
        });
    });

    describe('installation', function() {
        beforeEach(function() {
            shell.cp('-rf', ios_config_xml_project, temp);
            done = false;
        });

        describe('of <source-file> elements', function() {
            it('should throw if source-file src cannot be found', function() {
                var source = copyArray(invalid_source);
                expect(function() {
                    ios['source-file'].install(source[1], faultyplugin, temp, faulty_id, null, proj_files);
                }).toThrow();
            });
            it('should throw if source-file target already exists', function() {
                var source = copyArray(valid_source);
                var target = path.join(temp, 'SampleApp', 'Plugins', dummy_id, 'DummyPluginCommand.m');
                shell.mkdir('-p', path.dirname(target));
                fs.writeFileSync(target, 'some bs', 'utf-8');
                expect(function() {
                    ios['source-file'].install(source[0], dummyplugin, temp, dummy_id, null, proj_files);
                }).toThrow();
            });
            it('should call into xcodeproj\'s addSourceFile appropriately when element has no target-dir', function() {
                var source = copyArray(valid_source).filter(function(s) { return s.targetDir === undefined; });
                var spy = spyOn(proj_files.xcode, 'addSourceFile');
                ios['source-file'].install(source[0], dummyplugin, temp, dummy_id, null, proj_files);
                expect(spy).toHaveBeenCalledWith(slashJoin('Plugins', dummy_id, 'DummyPluginCommand.m'), {});
            });
            it('should call into xcodeproj\'s addSourceFile appropriately when element has a target-dir', function() {
                var source = copyArray(valid_source).filter(function(s) { return s.targetDir !== undefined; });
                var spy = spyOn(proj_files.xcode, 'addSourceFile');
                ios['source-file'].install(source[0], dummyplugin, temp, dummy_id, null, proj_files);
                expect(spy).toHaveBeenCalledWith(slashJoin('Plugins', dummy_id, 'targetDir', 'TargetDirTest.m'), {});
            });
            it('should cp the file to the right target location when element has no target-dir', function() {
                var source = copyArray(valid_source).filter(function(s) { return s.targetDir === undefined; });
                var spy = spyOn(shell, 'cp');
                ios['source-file'].install(source[0], dummyplugin, temp, dummy_id, null, proj_files);
                expect(spy).toHaveBeenCalledWith('-f', path.join(dummyplugin, 'src', 'ios', 'DummyPluginCommand.m'), path.join(temp, 'SampleApp', 'Plugins', dummy_id, 'DummyPluginCommand.m'));
            });
            it('should cp the file to the right target location when element has a target-dir', function() {
                var source = copyArray(valid_source).filter(function(s) { return s.targetDir !== undefined; });
                var spy = spyOn(shell, 'cp');
                ios['source-file'].install(source[0], dummyplugin, temp, dummy_id, null, proj_files);
                expect(spy).toHaveBeenCalledWith('-f', path.join(dummyplugin, 'src', 'ios', 'TargetDirTest.m'), path.join(temp, 'SampleApp', 'Plugins', dummy_id, 'targetDir', 'TargetDirTest.m'));
            });
            it('should call into xcodeproj\'s addFramework appropriately when element has framework=true set', function() {
                var source = copyArray(valid_source).filter(function(s) { return s.framework; });
                spyOn(proj_files.xcode, 'addSourceFile');
                var spy = spyOn(proj_files.xcode, 'addFramework');
                ios['source-file'].install(source[0], dummyplugin, temp, dummy_id, null, proj_files);
                expect(spy).toHaveBeenCalledWith(path.join('SampleApp', 'Plugins', dummy_id, 'SourceWithFramework.m'), {weak:false});
            });
        });

        describe('of <header-file> elements', function() {
            it('should throw if header-file src cannot be found', function() {
                var headers = copyArray(invalid_headers);
                expect(function() {
                    ios['header-file'].install(headers[1], faultyplugin, temp, faulty_id, null, proj_files);
                }).toThrow();
            });
            it('should throw if header-file target already exists', function() {
                var headers = copyArray(valid_headers);
                var target = path.join(temp, 'SampleApp', 'Plugins', dummy_id, 'DummyPluginCommand.h');
                shell.mkdir('-p', path.dirname(target));
                fs.writeFileSync(target, 'some bs', 'utf-8');
                expect(function() {
                    ios['header-file'].install(headers[0], dummyplugin, temp, dummy_id, null, proj_files);
                }).toThrow();
            });
            it('should call into xcodeproj\'s addHeaderFile appropriately when element has no target-dir', function() {
                var headers = copyArray(valid_headers).filter(function(s) { return s.targetDir === undefined; });
                var spy = spyOn(proj_files.xcode, 'addHeaderFile');
                ios['header-file'].install(headers[0], dummyplugin, temp, dummy_id,  null, proj_files);
                expect(spy).toHaveBeenCalledWith(slashJoin('Plugins', dummy_id, 'DummyPluginCommand.h'));
            });
            it('should call into xcodeproj\'s addHeaderFile appropriately when element a target-dir', function() {
                var headers = copyArray(valid_headers).filter(function(s) { return s.targetDir !== undefined; });
                var spy = spyOn(proj_files.xcode, 'addHeaderFile');
                ios['header-file'].install(headers[0], dummyplugin, temp, dummy_id, null, proj_files);
                expect(spy).toHaveBeenCalledWith(slashJoin('Plugins', dummy_id, 'targetDir', 'TargetDirTest.h'));
            });
            it('should cp the file to the right target location when element has no target-dir', function() {
                var headers = copyArray(valid_headers).filter(function(s) { return s.targetDir === undefined; });
                var spy = spyOn(shell, 'cp');
                ios['header-file'].install(headers[0], dummyplugin, temp, dummy_id, null, proj_files);
                expect(spy).toHaveBeenCalledWith('-f', path.join(dummyplugin, 'src', 'ios', 'DummyPluginCommand.h'), path.join(temp, 'SampleApp', 'Plugins', dummy_id, 'DummyPluginCommand.h'));
            });
            it('should cp the file to the right target location when element has a target-dir', function() {
                var headers = copyArray(valid_headers).filter(function(s) { return s.targetDir !== undefined; });
                var spy = spyOn(shell, 'cp');
                ios['header-file'].install(headers[0], dummyplugin, temp, dummy_id, null, proj_files);
                expect(spy).toHaveBeenCalledWith('-f', path.join(dummyplugin, 'src', 'ios', 'TargetDirTest.h'), path.join(temp, 'SampleApp', 'Plugins', dummy_id, 'targetDir', 'TargetDirTest.h'));
            });
        });

        describe('of <resource-file> elements', function() {
            it('should throw if resource-file src cannot be found', function() {
                var resources = copyArray(invalid_resources);
                expect(function() {
                    ios['resource-file'].install(resources[0], faultyplugin, temp, 'pluginid', null, proj_files);
                }).toThrow('cannot find "' + path.resolve(faultyplugin, 'src/ios/IDontExist.bundle') + '" ios <resource-file>');
            });
            it('should throw if resource-file target already exists', function() {
                var resources = copyArray(valid_resources);
                var target = path.join(temp, 'SampleApp', 'Resources', 'DummyPlugin.bundle');
                shell.mkdir('-p', path.dirname(target));
                fs.writeFileSync(target, 'some bs', 'utf-8');
                expect(function() {
                    ios['resource-file'].install(resources[0], dummyplugin, temp, 'pluginid',null, proj_files);
                }).toThrow('target destination "' + target + '" already exists');
            });
            it('should call into xcodeproj\'s addResourceFile', function() {
                var resources = copyArray(valid_resources);
                var spy = spyOn(proj_files.xcode, 'addResourceFile');
                ios['resource-file'].install(resources[0], dummyplugin, temp, 'pluginid', null, proj_files);
                expect(spy).toHaveBeenCalledWith(path.join('Resources', 'DummyPlugin.bundle'));
            });
            it('should cp the file to the right target location', function() {
                var resources = copyArray(valid_resources);
                var spy = spyOn(shell, 'cp');
                ios['resource-file'].install(resources[0], dummyplugin, temp, 'pluginid', null, proj_files);
                expect(spy).toHaveBeenCalledWith('-R', path.join(dummyplugin, 'src', 'ios', 'DummyPlugin.bundle'), path.join(temp, 'SampleApp', 'Resources'));
            });
        });
        describe('of <framework> elements', function() {

            it('should call into xcodeproj\'s addFramework', function() {
                var frameworks = copyArray(valid_custom_frameworks);
                var spy = spyOn(proj_files.xcode, 'addFramework');
                ios['framework'].install(frameworks[0], dummyplugin, temp, dummy_id, null, proj_files);
                expect(spy).toHaveBeenCalledWith(path.normalize('SampleApp/Plugins/org.test.plugins.dummyplugin/Custom.framework'), {customFramework:true});
            });

            // TODO: Add more tests to cover the cases:
            // * framework with weak attribute
            // * framework that shouldn't be added/removed

            describe('with custom="true" attribute', function () {
                it('should throw if framework src cannot be found', function() {
                    var frameworks = copyArray(invalid_custom_frameworks);
                    expect(function() {
                        ios['framework'].install(frameworks[0], faultyplugin, temp, dummy_id, null, proj_files);
                    }).toThrow('cannot find "' + path.resolve(faultyplugin, 'src/ios/NonExistantCustomFramework.framework') + '" ios <framework>');
                });
                it('should throw if framework target already exists', function() {
                    var frameworks = copyArray(valid_custom_frameworks);
                    var target = path.join(temp, 'SampleApp/Plugins/org.test.plugins.dummyplugin/Custom.framework');
                    shell.mkdir('-p', target);
                    expect(function() {
                        ios['framework'].install(frameworks[0], dummyplugin, temp, dummy_id, null, proj_files);
                    }).toThrow('target destination "' + target + '" already exists');
                });
                it('should cp the file to the right target location', function() {
                    var frameworks = copyArray(valid_custom_frameworks);
                    var spy = spyOn(shell, 'cp');
                    ios['framework'].install(frameworks[0], dummyplugin, temp, dummy_id, null, proj_files);
                    expect(spy).toHaveBeenCalledWith('-R', path.join(dummyplugin, 'src', 'ios', 'Custom.framework'),
                                                     path.join(temp, 'SampleApp/Plugins/org.test.plugins.dummyplugin'));
                });
            });
        });
        it('of two plugins should apply xcode file changes from both', function(){
            runs(function() {
                installPromise(
                    install('ios', temp, dummyplugin)
                    .then(function () { install('ios', temp, weblessplugin); })
                );
            });
            waitsFor(function() { return done; }, 'install promise never resolved', 200);
            runs(function() {
                var xcode = ios.parseProjectFile(temp).xcode;
                // from org.test.plugins.dummyplugin
                expect(xcode.hasFile(slashJoin('Resources', 'DummyPlugin.bundle'))).toBe(true);
                expect(xcode.hasFile(slashJoin('Plugins','org.test.plugins.dummyplugin', 'DummyPluginCommand.h'))).toBe(true);
                expect(xcode.hasFile(slashJoin('Plugins','org.test.plugins.dummyplugin', 'DummyPluginCommand.m'))).toBe(true);
                expect(xcode.hasFile(slashJoin('Plugins','org.test.plugins.dummyplugin','targetDir','TargetDirTest.h'))).toBe(true);
                expect(xcode.hasFile(slashJoin('Plugins','org.test.plugins.dummyplugin','targetDir','TargetDirTest.m'))).toBe(true);
                expect(xcode.hasFile('usr/lib/src/ios/libsqlite3.dylib')).toBe(true);
                expect(xcode.hasFile(slashJoin('SampleApp','Plugins','org.test.plugins.dummyplugin','Custom.framework'))).toBe(true);
                // from org.test.plugins.weblessplugin
                expect(xcode.hasFile(slashJoin('Resources', 'WeblessPluginViewController.xib'))).toBe(true);
                expect(xcode.hasFile(slashJoin('Plugins','org.test.plugins.weblessplugin','WeblessPluginCommand.h'))).toBe(true);
                expect(xcode.hasFile(slashJoin('Plugins','org.test.plugins.weblessplugin','WeblessPluginCommand.m'))).toBe(true);
                expect(xcode.hasFile('usr/lib/libsqlite3.dylib')).toBe(true);
            });
        });
    });

    describe('uninstallation', function() {
        describe('of <source-file> elements', function() {
            it('should call into xcodeproj\'s removeSourceFile appropriately when element has no target-dir', function(){
                var source = copyArray(valid_source).filter(function(s) { return s.targetDir === undefined; });
                shell.cp('-rf', ios_config_xml_project, temp);
                var spy = spyOn(proj_files.xcode, 'removeSourceFile');
                ios['source-file'].uninstall(source[0], temp, dummy_id, null, proj_files);
                expect(spy).toHaveBeenCalledWith(slashJoin('Plugins', dummy_id, 'DummyPluginCommand.m'));
            });
            it('should call into xcodeproj\'s removeSourceFile appropriately when element a target-dir', function(){
                var source = copyArray(valid_source).filter(function(s) { return s.targetDir !== undefined; });
                shell.cp('-rf', ios_config_xml_project, temp);
                var spy = spyOn(proj_files.xcode, 'removeSourceFile');
                ios['source-file'].uninstall(source[0], temp, dummy_id, null, proj_files);
                expect(spy).toHaveBeenCalledWith(slashJoin('Plugins', dummy_id, 'targetDir', 'TargetDirTest.m'));
            });
            it('should rm the file from the right target location when element has no target-dir', function(){
                var source = copyArray(valid_source).filter(function(s) { return s.targetDir === undefined; });
                shell.cp('-rf', ios_config_xml_project, temp);

                var spy = spyOn(shell, 'rm');
                ios['source-file'].uninstall(source[0], temp, dummy_id, null, proj_files);
                expect(spy).toHaveBeenCalledWith('-rf', path.join(temp, 'SampleApp', 'Plugins', dummy_id));
            });
            it('should rm the file from the right target location when element has a target-dir', function(){
                var source = copyArray(valid_source).filter(function(s) { return s.targetDir !== undefined; });
                shell.cp('-rf', ios_config_xml_project, temp);
                var spy = spyOn(shell, 'rm');

                ios['source-file'].uninstall(source[0], temp, dummy_id, null, proj_files);
                expect(spy).toHaveBeenCalledWith('-rf', path.join(temp, 'SampleApp', 'Plugins', dummy_id, 'targetDir'));
            });
            it('should call into xcodeproj\'s removeFramework appropriately when element framework=true set', function(){
                var source = copyArray(valid_source).filter(function(s) { return s.framework; });
                shell.cp('-rf', ios_config_xml_project, temp);
                var spy = spyOn(proj_files.xcode, 'removeFramework');

                ios['source-file'].uninstall(source[0], temp, dummy_id, null, proj_files);
                expect(spy).toHaveBeenCalledWith(path.join('SampleApp', 'Plugins', dummy_id, 'SourceWithFramework.m'));
            });
        });

        describe('of <header-file> elements', function() {
            beforeEach(function() {
                shell.cp('-rf', ios_config_xml_project, temp);
            });
            it('should call into xcodeproj\'s removeHeaderFile appropriately when element has no target-dir', function(){
                var headers = copyArray(valid_headers).filter(function(s) { return s.targetDir === undefined; });
                var spy = spyOn(proj_files.xcode, 'removeHeaderFile');

                ios['header-file'].uninstall(headers[0], temp, dummy_id, null, proj_files);
                expect(spy).toHaveBeenCalledWith(slashJoin('Plugins', dummy_id, 'DummyPluginCommand.h'));
            });
            it('should call into xcodeproj\'s removeHeaderFile appropriately when element a target-dir', function(){
                var headers = copyArray(valid_headers).filter(function(s) { return s.targetDir !== undefined; });

                var spy = spyOn(proj_files.xcode, 'removeHeaderFile');

                ios['header-file'].uninstall(headers[0], temp, dummy_id, null, proj_files);
                expect(spy).toHaveBeenCalledWith(slashJoin('Plugins', dummy_id, 'targetDir', 'TargetDirTest.h'));
            });
            it('should rm the file from the right target location', function(){
                var headers = copyArray(valid_headers).filter(function(s) { return s.targetDir !== undefined; });
                var spy = spyOn(shell, 'rm');

                ios['header-file'].uninstall(headers[0], temp, dummy_id, null, proj_files);
                expect(spy).toHaveBeenCalledWith('-rf', path.join(temp, 'SampleApp', 'Plugins', dummy_id, 'targetDir'));
            });
        });

        describe('of <resource-file> elements', function() {
            beforeEach(function() {
                shell.cp('-rf', ios_config_xml_project, temp);
            });
            it('should call into xcodeproj\'s removeResourceFile', function(){
                var resources = copyArray(valid_resources);
                var spy = spyOn(proj_files.xcode, 'removeResourceFile');

                ios['resource-file'].uninstall(resources[0], temp, 'pluginid', null, proj_files);
                expect(spy).toHaveBeenCalledWith(path.join('Resources', 'DummyPlugin.bundle'));
            });
            it('should rm the file from the right target location', function(){
                var resources = copyArray(valid_resources);
                var spy = spyOn(shell, 'rm');

                ios['resource-file'].uninstall(resources[0], temp, 'pluginid', null, proj_files);
                expect(spy).toHaveBeenCalledWith('-rf', path.join(temp, 'SampleApp', 'Resources', 'DummyPlugin.bundle'));
            });
        });
        describe('of <framework> elements', function() {
            beforeEach(function() {
                shell.cp('-rf', ios_config_xml_project, temp);
            });

            it('should call into xcodeproj\'s removeFramework', function(){
                var frameworks = copyArray(valid_custom_frameworks);
                var spy = spyOn(proj_files.xcode, 'removeFramework');

                ios['framework'].uninstall(frameworks[0], temp, dummy_id, null, proj_files);
                expect(spy).toHaveBeenCalledWith(path.join(temp, 'SampleApp/Plugins/org.test.plugins.dummyplugin/Custom.framework'), {customFramework:true});
            });

            // TODO: Add more tests to cover the cases:
            // * framework with weak attribute
            // * framework that shouldn't be added/removed

            describe('with custom="true" attribute', function () {
                it('should rm the file from the right target location', function(){
                    var frameworks = copyArray(valid_custom_frameworks);
                    var spy = spyOn(shell, 'rm');

                    ios['framework'].uninstall(frameworks[0], temp, dummy_id, null, proj_files);
                    expect(spy).toHaveBeenCalledWith('-rf', path.join(temp, 'SampleApp/Plugins/org.test.plugins.dummyplugin/Custom.framework'));
                });
            });
        });
    });
});
