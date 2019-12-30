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

const os = require('os');
const fs = require('fs');
const path = require('path');
const rewire = require('rewire');
const shell = require('shelljs');
const EventEmitter = require('events');

const PluginInfo = require('cordova-common').PluginInfo;
const Api = require('../../../../bin/templates/scripts/cordova/Api');
const projectFile = require('../../../../bin/templates/scripts/cordova/lib/projectFile');
const pluginHandlers = rewire('../../../../bin/templates/scripts/cordova/lib/plugman/pluginHandlers');

const temp = path.join(os.tmpdir(), 'plugman');

const FIXTURES = path.join(__dirname, '../fixtures');
const iosProject = path.join(FIXTURES, 'ios-config-xml', '*');
const faultyplugin = path.join(FIXTURES, 'org.test.plugins.faultyplugin');
const dummyplugin = path.join(FIXTURES, 'org.test.plugins.dummyplugin');
const weblessplugin = path.join(FIXTURES, 'org.test.plugins.weblessplugin');

const dummyPluginInfo = new PluginInfo(dummyplugin);
const dummy_id = dummyPluginInfo.id;
const valid_source = dummyPluginInfo.getSourceFiles('ios');
const valid_headers = dummyPluginInfo.getHeaderFiles('ios');
const valid_resources = dummyPluginInfo.getResourceFiles('ios');
const valid_custom_frameworks = dummyPluginInfo.getFrameworks('ios').filter(f => f.custom);
const valid_embeddable_custom_frameworks = dummyPluginInfo.getFrameworks('ios').filter(f => f.custom && f.embed);
const valid_weak_frameworks = dummyPluginInfo.getFrameworks('ios').filter(f => !(f.custom) && f.weak);

const faultyPluginInfo = new PluginInfo(faultyplugin);
const invalid_source = faultyPluginInfo.getSourceFiles('ios');
const invalid_headers = faultyPluginInfo.getHeaderFiles('ios');
const invalid_resources = faultyPluginInfo.getResourceFiles('ios');
const invalid_custom_frameworks = faultyPluginInfo.getFrameworks('ios').filter(f => f.custom);

const weblessPluginInfo = new PluginInfo(weblessplugin);

function copyArray (arr) {
    return Array.prototype.slice.call(arr, 0);
}

function slashJoin () {
    // In some places we need to use forward slash instead of path.join().
    // See CB-7311.
    return Array.prototype.join.call(arguments, '/');
}

describe('ios plugin handler', () => {
    let dummyProject;

    beforeEach(() => {
        shell.cp('-rf', iosProject, temp);
        projectFile.purgeProjectFileCache(temp);

        dummyProject = projectFile.parse({
            root: temp,
            pbxproj: path.join(temp, 'SampleApp.xcodeproj/project.pbxproj')
        });
    });

    afterEach(() => {
        shell.rm('-rf', temp);
    });

    describe('installation', () => {
        describe('of <source-file> elements', () => {
            const install = pluginHandlers.getInstaller('source-file');

            beforeEach(() => {
                spyOn(dummyProject.xcode, 'addSourceFile');
            });

            it('Test 001 : should throw if source-file src cannot be found', () => {
                const source = copyArray(invalid_source);
                expect(() => {
                    install(source[1], faultyPluginInfo, dummyProject);
                }).toThrow();
            });
            it('Test 002 : should throw if source-file target already exists', () => {
                const source = copyArray(valid_source);
                const target = path.join(temp, 'SampleApp', 'Plugins', dummy_id, 'DummyPluginCommand.m');
                shell.mkdir('-p', path.dirname(target));
                fs.writeFileSync(target, 'some bs', 'utf-8');
                expect(() => {
                    install(source[0], dummyPluginInfo, dummyProject);
                }).toThrow();
            });
            it('Test 003 : should call into xcodeproj\'s addSourceFile appropriately when element has no target-dir', () => {
                const source = copyArray(valid_source).filter(s => s.targetDir === undefined);
                install(source[0], dummyPluginInfo, dummyProject);
                expect(dummyProject.xcode.addSourceFile)
                    .toHaveBeenCalledWith(slashJoin('Plugins', dummy_id, 'DummyPluginCommand.m'), {});
            });
            it('Test 004 : should call into xcodeproj\'s addSourceFile appropriately when element has a target-dir', () => {
                const source = copyArray(valid_source).filter(s => s.targetDir !== undefined);
                install(source[0], dummyPluginInfo, dummyProject);
                expect(dummyProject.xcode.addSourceFile)
                    .toHaveBeenCalledWith(slashJoin('Plugins', dummy_id, 'targetDir', 'TargetDirTest.m'), {});
            });
            it('Test 005 : should cp the file to the right target location when element has no target-dir', () => {
                const source = copyArray(valid_source).filter(s => s.targetDir === undefined);
                const spy = spyOn(shell, 'cp');
                install(source[0], dummyPluginInfo, dummyProject);
                expect(spy).toHaveBeenCalledWith('-f', path.join(dummyplugin, 'src', 'ios', 'DummyPluginCommand.m'), path.join(temp, 'SampleApp', 'Plugins', dummy_id, 'DummyPluginCommand.m'));
            });
            it('Test 006 : should cp the file to the right target location when element has a target-dir', () => {
                const source = copyArray(valid_source).filter(s => s.targetDir !== undefined);
                const spy = spyOn(shell, 'cp');
                install(source[0], dummyPluginInfo, dummyProject);
                expect(spy).toHaveBeenCalledWith('-f', path.join(dummyplugin, 'src', 'ios', 'TargetDirTest.m'), path.join(temp, 'SampleApp', 'Plugins', dummy_id, 'targetDir', 'TargetDirTest.m'));
            });
            it('Test 007 : should call into xcodeproj\'s addFramework appropriately when element has framework=true set', () => {
                const source = copyArray(valid_source).filter(s => s.framework);
                spyOn(dummyProject.xcode, 'addFramework');
                install(source[0], dummyPluginInfo, dummyProject);
                expect(dummyProject.xcode.addFramework)
                    .toHaveBeenCalledWith(path.join('SampleApp', 'Plugins', dummy_id, 'SourceWithFramework.m'), { weak: false });
            });
        });

        describe('of <header-file> elements', () => {
            const install = pluginHandlers.getInstaller('header-file');

            beforeEach(() => {
                spyOn(dummyProject.xcode, 'addHeaderFile');
            });

            it('Test 008 : should throw if header-file src cannot be found', () => {
                const headers = copyArray(invalid_headers);
                expect(() => {
                    install(headers[1], faultyPluginInfo, dummyProject);
                }).toThrow();
            });
            it('Test 009 : should throw if header-file target already exists', () => {
                const headers = copyArray(valid_headers);
                const target = path.join(temp, 'SampleApp', 'Plugins', dummy_id, 'DummyPluginCommand.h');
                shell.mkdir('-p', path.dirname(target));
                fs.writeFileSync(target, 'some bs', 'utf-8');
                expect(() => {
                    install(headers[0], dummyPluginInfo, dummyProject);
                }).toThrow();
            });
            it('Test 010 : should call into xcodeproj\'s addHeaderFile appropriately when element has no target-dir', () => {
                const headers = copyArray(valid_headers).filter(s => s.targetDir === undefined);
                install(headers[0], dummyPluginInfo, dummyProject);
                expect(dummyProject.xcode.addHeaderFile)
                    .toHaveBeenCalledWith(slashJoin('Plugins', dummy_id, 'DummyPluginCommand.h'));
            });
            it('Test 011 : should call into xcodeproj\'s addHeaderFile appropriately when element a target-dir', () => {
                const headers = copyArray(valid_headers).filter(s => s.targetDir !== undefined);
                install(headers[0], dummyPluginInfo, dummyProject);
                expect(dummyProject.xcode.addHeaderFile)
                    .toHaveBeenCalledWith(slashJoin('Plugins', dummy_id, 'targetDir', 'TargetDirTest.h'));
            });
            it('Test 012 : should cp the file to the right target location when element has no target-dir', () => {
                const headers = copyArray(valid_headers).filter(s => s.targetDir === undefined);
                const spy = spyOn(shell, 'cp');
                install(headers[0], dummyPluginInfo, dummyProject);
                expect(spy).toHaveBeenCalledWith('-f', path.join(dummyplugin, 'src', 'ios', 'DummyPluginCommand.h'), path.join(temp, 'SampleApp', 'Plugins', dummy_id, 'DummyPluginCommand.h'));
            });
            it('Test 013 : should cp the file to the right target location when element has a target-dir', () => {
                const headers = copyArray(valid_headers).filter(s => s.targetDir !== undefined);
                const spy = spyOn(shell, 'cp');
                install(headers[0], dummyPluginInfo, dummyProject);
                expect(spy).toHaveBeenCalledWith('-f', path.join(dummyplugin, 'src', 'ios', 'TargetDirTest.h'), path.join(temp, 'SampleApp', 'Plugins', dummy_id, 'targetDir', 'TargetDirTest.h'));
            });
        });

        describe('of <resource-file> elements', () => {
            const install = pluginHandlers.getInstaller('resource-file');

            beforeEach(() => {
                spyOn(dummyProject.xcode, 'addResourceFile');
            });

            it('Test 014 : should throw if resource-file src cannot be found', () => {
                const resources = copyArray(invalid_resources);
                expect(() => {
                    install(resources[0], faultyPluginInfo, dummyProject);
                }).toThrow(new Error(`Cannot find resource file "${path.resolve(faultyplugin, 'src/ios/IDontExist.bundle')}" for plugin ${faultyPluginInfo.id} in iOS platform`));
            });
            it('Test 015 : should throw if resource-file target already exists', () => {
                const resources = copyArray(valid_resources);
                const target = path.join(temp, 'SampleApp', 'Resources', 'DummyPlugin.bundle');
                shell.mkdir('-p', path.dirname(target));
                fs.writeFileSync(target, 'some bs', 'utf-8');
                expect(() => {
                    install(resources[0], dummyPluginInfo, dummyProject);
                }).toThrow(new Error(`File already exists at destination "${target}" for resource file specified by plugin ${dummyPluginInfo.id} in iOS platform`));
            });
            it('Test 016 : should call into xcodeproj\'s addResourceFile', () => {
                const resources = copyArray(valid_resources);
                install(resources[0], dummyPluginInfo, dummyProject);
                expect(dummyProject.xcode.addResourceFile)
                    .toHaveBeenCalledWith(path.join('Resources', 'DummyPlugin.bundle'));
            });
            it('Test 017 : should cp the file to the right target location', () => {
                const resources = copyArray(valid_resources);
                const spy = spyOn(shell, 'cp');
                install(resources[0], dummyPluginInfo, dummyProject);
                expect(spy).toHaveBeenCalledWith('-f', path.join(dummyplugin, 'src', 'ios', 'DummyPlugin.bundle'), path.join(temp, 'SampleApp', 'Resources', 'DummyPlugin.bundle'));
            });

            it('Test 018 : should link files to the right target location', () => {
                const resources = copyArray(valid_resources);
                const spy = spyOn(fs, 'linkSync');
                install(resources[0], dummyPluginInfo, dummyProject, { link: true });
                const src_bundle = path.join(dummyplugin, 'src', 'ios', 'DummyPlugin.bundle');
                const dest_bundle = path.join(temp, 'SampleApp/Resources/DummyPlugin.bundle');
                expect(spy).toHaveBeenCalledWith(src_bundle, dest_bundle);
            });
        });

        describe('of <framework> elements', () => {
            const install = pluginHandlers.getInstaller('framework');
            beforeEach(() => {
                spyOn(dummyProject.xcode, 'addFramework');
            });

            it('Test 019 : should call into xcodeproj\'s addFramework', () => {
                let frameworks = copyArray(valid_custom_frameworks);
                install(frameworks[0], dummyPluginInfo, dummyProject);
                expect(dummyProject.xcode.addFramework)
                    .toHaveBeenCalledWith('SampleApp/Plugins/org.test.plugins.dummyplugin/Custom.framework', { customFramework: true, embed: false, link: true, sign: true });

                frameworks = copyArray(valid_embeddable_custom_frameworks);
                install(frameworks[0], dummyPluginInfo, dummyProject);
                expect(dummyProject.xcode.addFramework)
                    .toHaveBeenCalledWith('SampleApp/Plugins/org.test.plugins.dummyplugin/CustomEmbeddable.framework', { customFramework: true, embed: true, link: false, sign: true });

                frameworks = copyArray(valid_weak_frameworks);
                install(frameworks[0], dummyPluginInfo, dummyProject);
                expect(dummyProject.xcode.addFramework)
                    .toHaveBeenCalledWith('src/ios/libsqlite3.dylib', { customFramework: false, embed: false, link: true, weak: true });
            });

            // TODO: Add more tests to cover the cases:
            // * framework with weak attribute
            // * framework that shouldn't be added/removed

            describe('with custom="true" attribute', () => {
                it('Test 020 : should throw if framework src cannot be found', () => {
                    const frameworks = copyArray(invalid_custom_frameworks);
                    expect(() => {
                        install(frameworks[0], faultyPluginInfo, dummyProject);
                    }).toThrow(new Error(`Cannot find framework "${path.resolve(faultyplugin, 'src/ios/NonExistantCustomFramework.framework')}" for plugin ${faultyPluginInfo.id} in iOS platform`));
                });
                it('Test 021 : should throw if framework target already exists', () => {
                    const frameworks = copyArray(valid_custom_frameworks);
                    const target = path.join(temp, 'SampleApp/Plugins/org.test.plugins.dummyplugin/Custom.framework');
                    shell.mkdir('-p', target);
                    expect(() => {
                        install(frameworks[0], dummyPluginInfo, dummyProject);
                    }).toThrow(new Error(`Framework "${target}" for plugin ${dummyPluginInfo.id} already exists in iOS platform`));
                });
                it('Test 022 : should cp the file to the right target location', () => {
                    const frameworks = copyArray(valid_custom_frameworks);
                    const spy = spyOn(shell, 'cp');
                    install(frameworks[0], dummyPluginInfo, dummyProject);
                    expect(spy).toHaveBeenCalledWith('-Rf', path.join(dummyplugin, 'src', 'ios', 'Custom.framework', '*'),
                        path.join(temp, 'SampleApp/Plugins/org.test.plugins.dummyplugin/Custom.framework'));
                });

                it('Test 023 : should deep symlink files to the right target location', () => {
                    const frameworks = copyArray(valid_custom_frameworks);
                    const spy = spyOn(fs, 'linkSync');
                    install(frameworks[0], dummyPluginInfo, dummyProject, { link: true });
                    const src_binlib = path.join(dummyplugin, 'src', 'ios', 'Custom.framework', 'somebinlib');
                    const dest_binlib = path.join(temp, 'SampleApp/Plugins/org.test.plugins.dummyplugin/Custom.framework/somebinlib');
                    expect(spy).toHaveBeenCalledWith(src_binlib, dest_binlib);
                });
            });
        });

        describe('of <js-module> elements', () => {
            const jsModule = { src: 'www/dummyplugin.js' };
            const install = pluginHandlers.getInstaller('js-module');
            let wwwDest;
            let platformWwwDest;

            beforeEach(() => {
                spyOn(fs, 'writeFileSync');
                wwwDest = path.resolve(dummyProject.www, 'plugins', dummyPluginInfo.id, jsModule.src);
                platformWwwDest = path.resolve(dummyProject.platformWww, 'plugins', dummyPluginInfo.id, jsModule.src);
            });

            it('Test 024 : should put module to both www and platform_www when options.usePlatformWww flag is specified', () => {
                install(jsModule, dummyPluginInfo, dummyProject, { usePlatformWww: true });
                expect(fs.writeFileSync).toHaveBeenCalledWith(wwwDest, jasmine.any(String), 'utf-8');
                expect(fs.writeFileSync).toHaveBeenCalledWith(platformWwwDest, jasmine.any(String), 'utf-8');
            });

            it('Test 025 : should put module to www only when options.usePlatformWww flag is not specified', () => {
                install(jsModule, dummyPluginInfo, dummyProject);
                expect(fs.writeFileSync).toHaveBeenCalledWith(wwwDest, jasmine.any(String), 'utf-8');
                expect(fs.writeFileSync).not.toHaveBeenCalledWith(platformWwwDest, jasmine.any(String), 'utf-8');
            });
        });

        describe('of <asset> elements', () => {
            const asset = { src: 'www/dummyplugin.js', target: 'foo/dummy.js' };
            const install = pluginHandlers.getInstaller('asset');
            /* eslint-disable no-unused-vars */
            let wwwDest;
            let platformWwwDest;
            /* eslint-enable no-unused-vars */

            beforeEach(() => {
                spyOn(shell, 'cp');
                wwwDest = path.resolve(dummyProject.www, asset.target);
                platformWwwDest = path.resolve(dummyProject.platformWww, asset.target);
            });

            it('Test 026 : should put asset to both www and platform_www when options.usePlatformWww flag is specified', () => {
                install(asset, dummyPluginInfo, dummyProject, { usePlatformWww: true });
                expect(shell.cp).toHaveBeenCalledWith('-f', path.resolve(dummyPluginInfo.dir, asset.src), path.resolve(dummyProject.www, asset.target));
                expect(shell.cp).toHaveBeenCalledWith('-f', path.resolve(dummyPluginInfo.dir, asset.src), path.resolve(dummyProject.platformWww, asset.target));
            });

            it('Test 027 : should put asset to www only when options.usePlatformWww flag is not specified', () => {
                install(asset, dummyPluginInfo, dummyProject);
                expect(shell.cp).toHaveBeenCalledWith('-f', path.resolve(dummyPluginInfo.dir, asset.src), path.resolve(dummyProject.www, asset.target));
                expect(shell.cp).not.toHaveBeenCalledWith(path.resolve(dummyPluginInfo.dir, asset.src), path.resolve(dummyProject.platformWww, asset.target));
            });
        });

        it('Test 028 : of two plugins should apply xcode file changes from both', () => {
            const api = new Api('ios', temp, new EventEmitter());

            return api.addPlugin(dummyPluginInfo)
                .then(() => api.addPlugin(weblessPluginInfo))
                .then(() => {
                    const xcode = projectFile.parse({
                        root: temp,
                        pbxproj: path.join(temp, 'SampleApp.xcodeproj/project.pbxproj')
                    }).xcode;

                    // from org.test.plugins.dummyplugin
                    expect(xcode.hasFile(slashJoin('DummyPlugin.bundle'))).toEqual(jasmine.any(Object));
                    expect(xcode.hasFile(slashJoin('org.test.plugins.dummyplugin', 'DummyPluginCommand.h'))).toEqual(jasmine.any(Object));
                    expect(xcode.hasFile(slashJoin('org.test.plugins.dummyplugin', 'DummyPluginCommand.m'))).toEqual(jasmine.any(Object));
                    expect(xcode.hasFile(slashJoin('org.test.plugins.dummyplugin', 'targetDir', 'TargetDirTest.h'))).toEqual(jasmine.any(Object));
                    expect(xcode.hasFile(slashJoin('org.test.plugins.dummyplugin', 'targetDir', 'TargetDirTest.m'))).toEqual(jasmine.any(Object));
                    expect(xcode.hasFile('usr/lib/libsqlite3.dylib')).toEqual(jasmine.any(Object));
                    expect(xcode.hasFile(slashJoin('SampleApp', 'Plugins', 'org.test.plugins.dummyplugin', 'Custom.framework'))).toEqual(jasmine.any(Object));
                    // from org.test.plugins.weblessplugin
                    expect(xcode.hasFile(slashJoin('WeblessPluginViewController.xib'))).toEqual(jasmine.any(Object));
                    expect(xcode.hasFile(slashJoin('org.test.plugins.weblessplugin', 'WeblessPluginCommand.h'))).toEqual(jasmine.any(Object));
                    expect(xcode.hasFile(slashJoin('org.test.plugins.weblessplugin', 'WeblessPluginCommand.m'))).toEqual(jasmine.any(Object));
                    expect(xcode.hasFile('usr/lib/libsqlite3.dylib')).toEqual(jasmine.any(Object));
                });
        });
    });

    describe('uninstallation', () => {
        describe('of <source-file> elements', () => {
            const uninstall = pluginHandlers.getUninstaller('source-file');
            beforeEach(() => {
                spyOn(dummyProject.xcode, 'removeSourceFile');
                spyOn(dummyProject.xcode, 'removeFramework');
            });

            it('Test 029 : should call into xcodeproj\'s removeSourceFile appropriately when element has no target-dir', () => {
                const source = copyArray(valid_source).filter(s => s.targetDir === undefined);
                uninstall(source[0], dummyPluginInfo, dummyProject);
                expect(dummyProject.xcode.removeSourceFile).toHaveBeenCalledWith(slashJoin('Plugins', dummy_id, 'DummyPluginCommand.m'));
            });
            it('Test 030 : should call into xcodeproj\'s removeSourceFile appropriately when element a target-dir', () => {
                const source = copyArray(valid_source).filter(s => s.targetDir !== undefined);
                uninstall(source[0], dummyPluginInfo, dummyProject);
                expect(dummyProject.xcode.removeSourceFile).toHaveBeenCalledWith(slashJoin('Plugins', dummy_id, 'targetDir', 'TargetDirTest.m'));
            });
            it('Test 031 : should rm the file from the right target location when element has no target-dir', () => {
                const source = copyArray(valid_source).filter(s => s.targetDir === undefined);
                const spy = spyOn(shell, 'rm');
                uninstall(source[0], dummyPluginInfo, dummyProject);
                expect(spy).toHaveBeenCalledWith('-rf', path.join(temp, 'SampleApp', 'Plugins', dummy_id));
            });
            it('Test 032 : should rm the file from the right target location when element has a target-dir', () => {
                const source = copyArray(valid_source).filter(s => s.targetDir !== undefined);
                const spy = spyOn(shell, 'rm');
                uninstall(source[0], dummyPluginInfo, dummyProject);
                expect(spy).toHaveBeenCalledWith('-rf', path.join(temp, 'SampleApp', 'Plugins', dummy_id, 'targetDir'));
            });
            it('Test 033 : should call into xcodeproj\'s removeFramework appropriately when element framework=true set', () => {
                const source = copyArray(valid_source).filter(s => s.framework);
                uninstall(source[0], dummyPluginInfo, dummyProject);
                expect(dummyProject.xcode.removeFramework).toHaveBeenCalledWith(path.join('SampleApp', 'Plugins', dummy_id, 'SourceWithFramework.m'));
            });
        });

        describe('of <header-file> elements', () => {
            const uninstall = pluginHandlers.getUninstaller('header-file');
            beforeEach(() => {
                spyOn(dummyProject.xcode, 'removeHeaderFile');
            });

            it('Test 034 : should call into xcodeproj\'s removeHeaderFile appropriately when element has no target-dir', () => {
                const headers = copyArray(valid_headers).filter(s => s.targetDir === undefined);
                uninstall(headers[0], dummyPluginInfo, dummyProject);
                expect(dummyProject.xcode.removeHeaderFile).toHaveBeenCalledWith(slashJoin('Plugins', dummy_id, 'DummyPluginCommand.h'));
            });
            it('Test 035 : should call into xcodeproj\'s removeHeaderFile appropriately when element a target-dir', () => {
                const headers = copyArray(valid_headers).filter(s => s.targetDir !== undefined);
                uninstall(headers[0], dummyPluginInfo, dummyProject);
                expect(dummyProject.xcode.removeHeaderFile).toHaveBeenCalledWith(slashJoin('Plugins', dummy_id, 'targetDir', 'TargetDirTest.h'));
            });
            it('Test 036 : should rm the file from the right target location', () => {
                const headers = copyArray(valid_headers).filter(s => s.targetDir !== undefined);
                const spy = spyOn(shell, 'rm');
                uninstall(headers[0], dummyPluginInfo, dummyProject);
                expect(spy).toHaveBeenCalledWith('-rf', path.join(temp, 'SampleApp', 'Plugins', dummy_id, 'targetDir'));
            });
        });

        describe('of <resource-file> elements', () => {
            const uninstall = pluginHandlers.getUninstaller('resource-file');
            beforeEach(() => {
                spyOn(dummyProject.xcode, 'removeResourceFile');
            });

            it('Test 037 : should call into xcodeproj\'s removeResourceFile', () => {
                const resources = copyArray(valid_resources);
                uninstall(resources[0], dummyPluginInfo, dummyProject);
                expect(dummyProject.xcode.removeResourceFile).toHaveBeenCalledWith(path.join('Resources', 'DummyPlugin.bundle'));
            });
            it('Test 038 : should rm the file from the right target location', () => {
                const resources = copyArray(valid_resources);
                const spy = spyOn(shell, 'rm');
                uninstall(resources[0], dummyPluginInfo, dummyProject);
                expect(spy).toHaveBeenCalledWith('-rf', path.join(temp, 'SampleApp', 'Resources', 'DummyPlugin.bundle'));
            });
        });

        describe('of <framework> elements', () => {
            const uninstall = pluginHandlers.getUninstaller('framework');
            beforeEach(() => {
                spyOn(dummyProject.xcode, 'removeFramework');
            });

            const frameworkPath = path.join(temp, 'SampleApp/Plugins/org.test.plugins.dummyplugin/Custom.framework').replace(/\\/g, '/');

            it('Test 039 : should call into xcodeproj\'s removeFramework', () => {
                const frameworks = copyArray(valid_custom_frameworks);
                uninstall(frameworks[0], dummyPluginInfo, dummyProject);
                expect(dummyProject.xcode.removeFramework).toHaveBeenCalledWith(frameworkPath, { customFramework: true });
            });

            // TODO: Add more tests to cover the cases:
            // * framework with weak attribute
            // * framework that shouldn't be added/removed

            describe('with custom="true" attribute', () => {
                it('Test 040 : should rm the file from the right target location', () => {
                    const frameworks = copyArray(valid_custom_frameworks);
                    const spy = spyOn(shell, 'rm');
                    uninstall(frameworks[0], dummyPluginInfo, dummyProject);
                    expect(spy).toHaveBeenCalledWith('-rf', frameworkPath);
                });
            });

            describe('without custom="true" attribute ', () => {
                it('Test 041 : should decrease framework counter after uninstallation', () => {
                    const install = pluginHandlers.getInstaller('framework');
                    const dummyNonCustomFrameworks = dummyPluginInfo.getFrameworks('ios').filter(f => !f.custom);
                    const dummyFramework = dummyNonCustomFrameworks[0];
                    install(dummyFramework, dummyPluginInfo, dummyProject);
                    install(dummyFramework, dummyPluginInfo, dummyProject);
                    const frameworkName = Object.keys(dummyProject.frameworks)[0];
                    expect(dummyProject.frameworks[frameworkName]).toEqual(2);
                    uninstall(dummyFramework, dummyPluginInfo, dummyProject);
                    expect(dummyProject.frameworks[frameworkName]).toEqual(1);
                    uninstall(dummyFramework, dummyPluginInfo, dummyProject);
                    expect(dummyProject.frameworks[frameworkName]).not.toBeDefined();
                });
            });
        });

        describe('of <js-module> elements', () => {
            const jsModule = { src: 'www/dummyPlugin.js' };
            const uninstall = pluginHandlers.getUninstaller('js-module');
            let wwwDest;
            let platformWwwDest;

            beforeEach(() => {
                wwwDest = path.resolve(dummyProject.www, 'plugins', dummyPluginInfo.id, jsModule.src);
                platformWwwDest = path.resolve(dummyProject.platformWww, 'plugins', dummyPluginInfo.id, jsModule.src);

                spyOn(shell, 'rm');

                const existsSyncOrig = fs.existsSync;
                spyOn(fs, 'existsSync').and.callFake(file => {
                    if ([wwwDest, platformWwwDest].indexOf(file) >= 0) return true;
                    return existsSyncOrig.call(fs, file);
                });
            });

            it('Test 042 : should put module to both www and platform_www when options.usePlatformWww flag is specified', () => {
                uninstall(jsModule, dummyPluginInfo, dummyProject, { usePlatformWww: true });
                expect(shell.rm).toHaveBeenCalledWith(jasmine.any(String), wwwDest);
                expect(shell.rm).toHaveBeenCalledWith(jasmine.any(String), platformWwwDest);
            });

            it('Test 043 : should put module to www only when options.usePlatformWww flag is not specified', () => {
                uninstall(jsModule, dummyPluginInfo, dummyProject);
                expect(shell.rm).toHaveBeenCalledWith(jasmine.any(String), wwwDest);
                expect(shell.rm).not.toHaveBeenCalledWith(jasmine.any(String), platformWwwDest);
            });
        });

        describe('of <asset> elements', () => {
            const asset = { src: 'www/dummyPlugin.js', target: 'foo/dummy.js' };
            const uninstall = pluginHandlers.getUninstaller('asset');
            let wwwDest;
            let platformWwwDest;

            beforeEach(() => {
                wwwDest = path.resolve(dummyProject.www, asset.target);
                platformWwwDest = path.resolve(dummyProject.platformWww, asset.target);

                spyOn(shell, 'rm');

                const existsSyncOrig = fs.existsSync;
                spyOn(fs, 'existsSync').and.callFake(file => {
                    if ([wwwDest, platformWwwDest].indexOf(file) >= 0) return true;
                    return existsSyncOrig.call(fs, file);
                });
            });

            it('Test 044 : should put module to both www and platform_www when options.usePlatformWww flag is specified', () => {
                uninstall(asset, dummyPluginInfo, dummyProject, { usePlatformWww: true });
                expect(shell.rm).toHaveBeenCalledWith(jasmine.any(String), wwwDest);
                expect(shell.rm).toHaveBeenCalledWith(jasmine.any(String), platformWwwDest);
            });

            it('Test 045 : should put module to www only when options.usePlatformWww flag is not specified', () => {
                uninstall(asset, dummyPluginInfo, dummyProject);
                expect(shell.rm).toHaveBeenCalledWith(jasmine.any(String), wwwDest);
                expect(shell.rm).not.toHaveBeenCalledWith(jasmine.any(String), platformWwwDest);
            });
        });
    });
});
