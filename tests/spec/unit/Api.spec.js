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
var fs = require('fs');
const EventEmitter = require('events');
var PluginManager = require('cordova-common').PluginManager;
var Api = require('../../../bin/templates/scripts/cordova/Api');
var check_reqs = require('../../../bin/templates/scripts/cordova/lib/check_reqs');

// The lib/run module pulls in ios-sim, which has a hard requirement that it
// be run on a Mac OS - simply requiring the module is enough to trigger the
// environment checks. These checks will blow up on Windows + Linux.
// So, conditionally pull in the module, and conditionally test the `run`
// method (more below).
var run_mod;
if (process.platform === 'darwin') {
    run_mod = require('../../../bin/templates/scripts/cordova/lib/run');
}

var projectFile = require('../../../bin/templates/scripts/cordova/lib/projectFile');
var BridgingHeader_mod = require('../../../bin/templates/scripts/cordova/lib/BridgingHeader.js');
var Podfile_mod = require('../../../bin/templates/scripts/cordova/lib/Podfile');
var PodsJson_mod = require('../../../bin/templates/scripts/cordova/lib/PodsJson');
var Q = require('q');
var FIXTURES = path.join(__dirname, 'fixtures');
var iosProjectFixture = path.join(FIXTURES, 'ios-config-xml');

function compareListWithoutOrder (list1, list2) {
    expect(list1.sort()).toEqual(list2.sort());
}

describe('Platform Api', function () {

    describe('constructor', function () {
        it('Test 001 : should throw if provided directory does not contain an xcodeproj file', function () {
            expect(() =>
                new Api('ios', path.join(FIXTURES, '..'), new EventEmitter())
            ).toThrow();
        });
        it('Test 002 : should create an instance with path, pbxproj, xcodeproj, originalName and cordovaproj properties', function () {
            expect(function () {
                var p = new Api('ios', iosProjectFixture, new EventEmitter());
                expect(p.locations.root).toEqual(iosProjectFixture);
                expect(p.locations.pbxproj).toEqual(path.join(iosProjectFixture, 'SampleApp.xcodeproj', 'project.pbxproj'));
                expect(p.locations.xcodeProjDir).toEqual(path.join(iosProjectFixture, 'SampleApp.xcodeproj'));
                expect(p.locations.www).toEqual(path.join(iosProjectFixture, 'www'));
                expect(p.locations.configXml).toEqual(path.join(iosProjectFixture, 'SampleApp', 'config.xml'));
            }).not.toThrow();
        });
    });

    describe('.prototype', function () {
        var api, events;
        var projectRoot = iosProjectFixture;
        beforeEach(function () {
            events = new EventEmitter();
            api = new Api('ios', projectRoot, events);
            spyOn(fs, 'readdirSync').and.returnValue([api.locations.xcodeProjDir]);
            spyOn(projectFile, 'parse').and.returnValue({
                getPackageName: function () { return 'ios.cordova.io'; }
            });
        });

        // See the comment at the top of this file, in the list of requires,
        // for information on why we conditionall run this test.
        // tl;dr run_mod requires the ios-sim module, which requires mac OS.
        if (process.platform === 'darwin') {
            describe('run', function () {
                beforeEach(function () {
                    spyOn(check_reqs, 'run').and.returnValue(Q.resolve());
                });
                it('should call into lib/run module', function () {
                    spyOn(run_mod, 'run');
                    return api.run().then(function () {
                        expect(run_mod.run).toHaveBeenCalled();
                    });
                });
            });
        }

        describe('addPlugin', function () {
            var my_plugin = {
                getHeaderFiles: function () { return []; },
                getFrameworks: function () { return []; },
                getPodSpecs: function () { return []; }
            };
            beforeEach(function () {
                spyOn(PluginManager, 'get').and.returnValue({
                    addPlugin: function () { return Q(); }
                });
                spyOn(BridgingHeader_mod, 'BridgingHeader');
                spyOn(Podfile_mod, 'Podfile');
                spyOn(PodsJson_mod, 'PodsJson');
            });
            it('should assign a package name to plugin variables if one is not explicitly provided via options', function () {
                var opts = {};
                return api.addPlugin(my_plugin, opts)
                    .then(() => expect(opts.variables.PACKAGE_NAME).toEqual('ios.cordova.io'));
            });
            describe('with header-file of `BridgingHeader` type', function () {
                var bridgingHeader_mock;
                var my_bridgingHeader_json = {
                    type: 'BridgingHeader',
                    src: 'bridgingHeaderSource!'
                };
                beforeEach(function () {
                    bridgingHeader_mock = jasmine.createSpyObj('bridgingHeader mock', ['addHeader', 'write']);
                    spyOn(my_plugin, 'getFrameworks').and.returnValue([]);
                    spyOn(my_plugin, 'getHeaderFiles').and.returnValue([my_bridgingHeader_json]);
                    BridgingHeader_mod.BridgingHeader.and.callFake(function () {
                        return bridgingHeader_mock;
                    });
                });
                it('should add BridgingHeader', function () {
                    return api.addPlugin(my_plugin)
                        .then(function () {
                            expect(bridgingHeader_mock.addHeader).toHaveBeenCalledWith(my_plugin.id, 'bridgingHeaderSource!');
                            expect(bridgingHeader_mock.write).toHaveBeenCalled();
                        });
                });
            });
            describe('adding pods since the plugin contained <podspecs>', function () {
                var podsjson_mock;
                var podfile_mock;
                var my_pod_json = {
                    declarations: {
                        'use-frameworks': 'true',
                        'inhibit_all_warnings!': 'true'
                    },
                    sources: {
                        'https://github.com/sample/SampleSpecs.git': { source: 'https://github.com/sample/SampleSpecs.git' },
                        'https://github.com/CocoaPods/Specs.git': { source: 'https://github.com/CocoaPods/Specs.git' }
                    },
                    libraries: {
                        'AFNetworking': {
                            name: 'AFNetworking',
                            spec: '~> 3.2'
                        },
                        'Eureka': {
                            name: 'Eureka',
                            spec: '4.0',
                            'swift-version': '4.1'
                        },
                        'HogeLib': {
                            name: 'HogeLib',
                            git: 'https://github.com/hoge/HogewLib.git',
                            branch: 'develop'
                        }
                    }
                };
                beforeEach(function () {
                    podsjson_mock = jasmine.createSpyObj('podsjson mock', ['getLibrary', 'getSource', 'getDeclaration',
                        'incrementLibrary', 'incrementSource', 'incrementDeclaration', 'write',
                        'setJsonLibrary', 'setJsonSource', 'setJsonDeclaration']);
                    podfile_mock = jasmine.createSpyObj('podfile mock', ['isDirty', 'addSpec', 'addSource', 'addDeclaration', 'write', 'install']);
                    spyOn(my_plugin, 'getFrameworks').and.returnValue([]);
                    spyOn(my_plugin, 'getPodSpecs').and.returnValue([my_pod_json]);
                    PodsJson_mod.PodsJson.and.callFake(function () {
                        return podsjson_mock;
                    });
                    Podfile_mod.Podfile.and.callFake(function () {
                        return podfile_mock;
                    });
                });
                it('on a new declaration, it should add a new json to declarations', function () {
                    return api.addPlugin(my_plugin)
                        .then(function () {
                            expect(podsjson_mock.getDeclaration.calls.count()).toEqual(2);
                            compareListWithoutOrder(podsjson_mock.getDeclaration.calls.allArgs(), [['use_frameworks!'], ['inhibit_all_warnings!']]);
                            expect(podsjson_mock.setJsonDeclaration.calls.count()).toEqual(2);
                            compareListWithoutOrder(podsjson_mock.setJsonDeclaration.calls.allArgs(),
                                [['use_frameworks!', { declaration: 'use_frameworks!', count: 1 }], ['inhibit_all_warnings!', { declaration: 'inhibit_all_warnings!', count: 1 }]]);
                            expect(podfile_mock.addDeclaration.calls.count()).toEqual(2);
                            compareListWithoutOrder(podfile_mock.addDeclaration.calls.allArgs(), [['use_frameworks!'], ['inhibit_all_warnings!']]);
                        });
                });
                it('should increment count in declarations if already exists', function () {
                    podsjson_mock.getDeclaration.and.callFake(function (declaration) {
                        if (declaration === 'use_frameworks!') {
                            return { declaration: 'use_frameworks!', count: 1 };
                        }
                        return null;
                    });
                    return api.addPlugin(my_plugin)
                        .then(function () {
                            expect(podsjson_mock.getDeclaration.calls.count()).toEqual(2);
                            compareListWithoutOrder(podsjson_mock.getDeclaration.calls.allArgs(), [['use_frameworks!'], ['inhibit_all_warnings!']]);
                            expect(podsjson_mock.incrementDeclaration).toHaveBeenCalledWith('use_frameworks!');
                            expect(podsjson_mock.setJsonDeclaration.calls.count()).toEqual(1);
                            compareListWithoutOrder(podsjson_mock.setJsonDeclaration.calls.allArgs(), [['inhibit_all_warnings!', { declaration: 'inhibit_all_warnings!', count: 1 }]]);
                            expect(podfile_mock.addDeclaration.calls.count()).toEqual(1);
                            compareListWithoutOrder(podfile_mock.addDeclaration.calls.allArgs(), [['inhibit_all_warnings!']]);
                        });
                });
                it('on a new source, it should add a new json to sources', function () {
                    return api.addPlugin(my_plugin)
                        .then(function () {
                            expect(podsjson_mock.getSource.calls.count()).toEqual(2);
                            compareListWithoutOrder(podsjson_mock.getSource.calls.allArgs(), [['https://github.com/sample/SampleSpecs.git'], ['https://github.com/CocoaPods/Specs.git']]);
                            expect(podsjson_mock.setJsonSource.calls.count()).toEqual(2);
                            compareListWithoutOrder(podsjson_mock.setJsonSource.calls.allArgs(), [
                                ['https://github.com/sample/SampleSpecs.git', { source: 'https://github.com/sample/SampleSpecs.git', count: 1 }],
                                ['https://github.com/CocoaPods/Specs.git', { source: 'https://github.com/CocoaPods/Specs.git', count: 1 }]
                            ]);
                            expect(podfile_mock.addSource.calls.count()).toEqual(2);
                            compareListWithoutOrder(podfile_mock.addSource.calls.allArgs(), [['https://github.com/sample/SampleSpecs.git'], ['https://github.com/CocoaPods/Specs.git']]);
                        });
                });
                it('should increment count in sources if already exists', function () {
                    podsjson_mock.getSource.and.callFake(function (source) {
                        if (source === 'https://github.com/CocoaPods/Specs.git') {
                            return { source: 'https://github.com/CocoaPods/Specs.git', count: 1 };
                        }
                        return null;
                    });
                    return api.addPlugin(my_plugin)
                        .then(function () {
                            expect(podsjson_mock.getSource.calls.count()).toEqual(2);
                            compareListWithoutOrder(podsjson_mock.getSource.calls.allArgs(), [['https://github.com/sample/SampleSpecs.git'], ['https://github.com/CocoaPods/Specs.git']]);
                            expect(podsjson_mock.incrementSource).toHaveBeenCalledWith('https://github.com/CocoaPods/Specs.git');
                            expect(podsjson_mock.setJsonSource.calls.count()).toEqual(1);
                            compareListWithoutOrder(podsjson_mock.setJsonSource.calls.allArgs(), [['https://github.com/sample/SampleSpecs.git', { source: 'https://github.com/sample/SampleSpecs.git', count: 1 }]]);
                            expect(podfile_mock.addSource.calls.count()).toEqual(1);
                            compareListWithoutOrder(podfile_mock.addSource.calls.allArgs(), [['https://github.com/sample/SampleSpecs.git']]);
                        });
                });
                it('on a new library, it should add a new json to library', function () {
                    return api.addPlugin(my_plugin)
                        .then(function () {
                            expect(podsjson_mock.getLibrary.calls.count()).toEqual(3);
                            compareListWithoutOrder(podsjson_mock.getLibrary.calls.allArgs(), [
                                ['AFNetworking'],
                                ['Eureka'],
                                ['HogeLib']
                            ]);
                            expect(podsjson_mock.setJsonLibrary.calls.count()).toEqual(3);
                            compareListWithoutOrder(podsjson_mock.setJsonLibrary.calls.allArgs(), [
                                ['AFNetworking', { name: 'AFNetworking', spec: '~> 3.2', count: 1 }],
                                ['Eureka', { name: 'Eureka', spec: '4.0', 'swift-version': '4.1', count: 1 }],
                                ['HogeLib', { name: 'HogeLib', git: 'https://github.com/hoge/HogewLib.git', branch: 'develop', count: 1 }]
                            ]);
                            expect(podfile_mock.addSpec.calls.count()).toEqual(3);
                            compareListWithoutOrder(podfile_mock.addSpec.calls.allArgs(), [
                                ['AFNetworking', { name: 'AFNetworking', spec: '~> 3.2', count: 1 }],
                                ['Eureka', { name: 'Eureka', spec: '4.0', 'swift-version': '4.1', count: 1 }],
                                ['HogeLib', { name: 'HogeLib', git: 'https://github.com/hoge/HogewLib.git', branch: 'develop', count: 1 }]
                            ]);
                        });
                });
                it('should increment count in libraries if already exists', function () {
                    podsjson_mock.getLibrary.and.callFake(function (library) {
                        if (library === 'AFNetworking') {
                            return { name: 'AFNetworking', spec: '~> 3.2', count: 1 };
                        }
                        return null;
                    });
                    return api.addPlugin(my_plugin)
                        .then(function () {
                            expect(podsjson_mock.getLibrary.calls.count()).toEqual(3);
                            compareListWithoutOrder(podsjson_mock.getLibrary.calls.allArgs(), [
                                ['AFNetworking'],
                                ['Eureka'],
                                ['HogeLib']
                            ]);
                            expect(podsjson_mock.incrementLibrary).toHaveBeenCalledWith('AFNetworking');
                            expect(podsjson_mock.setJsonLibrary.calls.count()).toEqual(2);
                            compareListWithoutOrder(podsjson_mock.setJsonLibrary.calls.allArgs(), [
                                ['Eureka', { name: 'Eureka', spec: '4.0', 'swift-version': '4.1', count: 1 }],
                                ['HogeLib', { name: 'HogeLib', git: 'https://github.com/hoge/HogewLib.git', branch: 'develop', count: 1 }]
                            ]);
                            expect(podfile_mock.addSpec.calls.count()).toEqual(2);
                            compareListWithoutOrder(podfile_mock.addSpec.calls.allArgs(), [
                                ['Eureka', { name: 'Eureka', spec: '4.0', 'swift-version': '4.1', count: 1 }],
                                ['HogeLib', { name: 'HogeLib', git: 'https://github.com/hoge/HogewLib.git', branch: 'develop', count: 1 }]
                            ]);
                        });
                });
            });
            describe('with frameworks of `podspec` type', function () {
                var podsjson_mock;
                var podfile_mock;
                var my_pod_json = {
                    type: 'podspec',
                    src: 'podsource!',
                    spec: 'podspec!'
                };
                beforeEach(function () {
                    podsjson_mock = jasmine.createSpyObj('podsjson mock', ['getLibrary', 'incrementLibrary', 'write', 'setJsonLibrary']);
                    podfile_mock = jasmine.createSpyObj('podfile mock', ['isDirty', 'addSpec', 'write', 'install']);
                    spyOn(my_plugin, 'getFrameworks').and.returnValue([my_pod_json]);
                    PodsJson_mod.PodsJson.and.callFake(function () {
                        return podsjson_mock;
                    });
                    Podfile_mod.Podfile.and.callFake(function () {
                        return podfile_mock;
                    });
                });
                // TODO: a little help with clearly labeling / describing the tests below? :(
                it('should warn if Pods JSON contains name/src but differs in spec', function () {
                    podsjson_mock.getLibrary.and.returnValue({
                        spec: 'something different from ' + my_pod_json.spec
                    });
                    spyOn(events, 'emit');
                    return api.addPlugin(my_plugin)
                        .then(function () {
                            expect(events.emit).toHaveBeenCalledWith('warn', jasmine.stringMatching(/which conflicts with another plugin/g));
                        });
                });
                it('should increment Pods JSON file if pod name/src already exists in file', function () {
                    podsjson_mock.getLibrary.and.returnValue({
                        spec: my_pod_json.spec
                    });
                    return api.addPlugin(my_plugin)
                        .then(function () {
                            expect(podsjson_mock.incrementLibrary).toHaveBeenCalledWith('podsource!');
                        });
                });
                it('on a new framework/pod name/src/key, it should add a new json to podsjson and add a new spec to podfile', function () {
                    return api.addPlugin(my_plugin)
                        .then(function () {
                            expect(podsjson_mock.setJsonLibrary).toHaveBeenCalledWith(my_pod_json.src, jasmine.any(Object));
                            expect(podfile_mock.addSpec).toHaveBeenCalledWith(my_pod_json.src, my_pod_json.spec);
                        });
                });
                it('should write out podfile and install if podfile was changed', function () {
                    podfile_mock.isDirty.and.returnValue(true);
                    podfile_mock.install.and.returnValue({ then: function () { } });
                    return api.addPlugin(my_plugin)
                        .then(function () {
                            expect(podfile_mock.write).toHaveBeenCalled();
                            expect(podfile_mock.install).toHaveBeenCalled();
                        });
                });
                it('if two frameworks with the same name are added, should honour the spec of the first-installed plugin', function () {
                    podsjson_mock.getLibrary.and.returnValue({
                        spec: 'something different from ' + my_pod_json.spec
                    });
                    return api.addPlugin(my_plugin)
                        .then(function () {
                            // Increment will non-destructively set the spec to keep it as it was...
                            expect(podsjson_mock.incrementLibrary).toHaveBeenCalledWith(my_pod_json.src);
                            // ...whereas setJson would overwrite it completely.
                            expect(podsjson_mock.setJsonLibrary).not.toHaveBeenCalled();
                        });
                });
            });
        });
        describe('removePlugin', function () {
            var my_plugin = {
                getHeaderFiles: function () { return []; },
                getFrameworks: function () {},
                getPodSpecs: function () { return []; }
            };
            beforeEach(function () {
                spyOn(PluginManager, 'get').and.returnValue({
                    removePlugin: function () { return Q(); }
                });
                spyOn(Podfile_mod, 'Podfile');
                spyOn(PodsJson_mod, 'PodsJson');
            });
            describe('removing pods since the plugin contained <podspecs>', function () {
                var podsjson_mock;
                var podfile_mock;
                var my_pod_json = {
                    declarations: {
                        'use-frameworks': 'true',
                        'inhibit_all_warnings!': 'true'
                    },
                    sources: {
                        'https://github.com/sample/SampleSpecs.git': { source: 'https://github.com/sample/SampleSpecs.git' },
                        'https://github.com/CocoaPods/Specs.git': { source: 'https://github.com/CocoaPods/Specs.git' }
                    },
                    libraries: {
                        'AFNetworking': {
                            name: 'AFNetworking',
                            spec: '~> 3.2'
                        },
                        'Eureka': {
                            name: 'Eureka',
                            spec: '4.0',
                            'swift-version': '4.1'
                        },
                        'HogeLib': {
                            name: 'HogeLib',
                            git: 'https://github.com/hoge/HogewLib.git',
                            branch: 'develop'
                        }
                    }
                };
                beforeEach(function () {
                    podsjson_mock = jasmine.createSpyObj('podsjson mock', ['getLibrary', 'getSource', 'getDeclaration',
                        'decrementLibrary', 'decrementSource', 'decrementDeclaration', 'write',
                        'setJsonLibrary', 'setJsonSource', 'setJsonDeclaration']);
                    podfile_mock = jasmine.createSpyObj('podfile mock', ['isDirty', 'removeSpec', 'removeSource', 'removeDeclaration', 'write', 'install']);
                    spyOn(my_plugin, 'getFrameworks').and.returnValue([]);
                    spyOn(my_plugin, 'getPodSpecs').and.returnValue([my_pod_json]);
                    PodsJson_mod.PodsJson.and.callFake(function () {
                        return podsjson_mock;
                    });
                    Podfile_mod.Podfile.and.callFake(function () {
                        return podfile_mock;
                    });
                });
                it('on a last declaration, it should remove a json from declarations', function () {
                    var json1 = { declaration: 'use_frameworks!', count: 1 };
                    var json2 = { declaration: 'inhibit_all_warnings!', count: 1 };
                    podsjson_mock.getDeclaration.and.callFake(function (declaration) {
                        if (declaration === 'use_frameworks!') {
                            return json1;
                        } else if (declaration === 'inhibit_all_warnings!') {
                            return json2;
                        }
                        return null;
                    });
                    podsjson_mock.decrementDeclaration.and.callFake(function (declaration) {
                        if (declaration === 'use_frameworks!') {
                            json1.count--;
                        } else if (declaration === 'inhibit_all_warnings!') {
                            json2.count--;
                        }
                    });
                    return api.removePlugin(my_plugin)
                        .then(function () {
                            expect(podsjson_mock.getDeclaration.calls.count()).toEqual(2);
                            compareListWithoutOrder(podsjson_mock.getDeclaration.calls.allArgs(), [['use_frameworks!'], ['inhibit_all_warnings!']]);
                            expect(podsjson_mock.decrementDeclaration.calls.count()).toEqual(2);
                            compareListWithoutOrder(podsjson_mock.decrementDeclaration.calls.allArgs(), [['use_frameworks!'], ['inhibit_all_warnings!']]);
                            expect(podfile_mock.removeDeclaration.calls.count()).toEqual(2);
                            compareListWithoutOrder(podfile_mock.removeDeclaration.calls.allArgs(), [['use_frameworks!'], ['inhibit_all_warnings!']]);
                        });
                });
                it('should decrement count in declarations and does not remove if count > 1', function () {
                    var json1 = { declaration: 'use_frameworks!', count: 2 };
                    var json2 = { declaration: 'inhibit_all_warnings!', count: 1 };
                    podsjson_mock.getDeclaration.and.callFake(function (declaration) {
                        if (declaration === 'use_frameworks!') {
                            return json1;
                        } else if (declaration === 'inhibit_all_warnings!') {
                            return json2;
                        }
                        return null;
                    });
                    podsjson_mock.decrementDeclaration.and.callFake(function (declaration) {
                        if (declaration === 'use_frameworks!') {
                            json1.count--;
                        } else if (declaration === 'inhibit_all_warnings!') {
                            json2.count--;
                        }
                    });
                    return api.removePlugin(my_plugin)
                        .then(function () {
                            expect(podsjson_mock.getDeclaration.calls.count()).toEqual(2);
                            compareListWithoutOrder(podsjson_mock.getDeclaration.calls.allArgs(), [['use_frameworks!'], ['inhibit_all_warnings!']]);
                            expect(podsjson_mock.decrementDeclaration.calls.count()).toEqual(2);
                            compareListWithoutOrder(podsjson_mock.decrementDeclaration.calls.allArgs(), [['use_frameworks!'], ['inhibit_all_warnings!']]);
                            expect(podfile_mock.removeDeclaration.calls.count()).toEqual(1);
                            compareListWithoutOrder(podfile_mock.removeDeclaration.calls.allArgs(), [['inhibit_all_warnings!']]);
                        });
                });
                it('on a last source, it should remove a json from sources', function () {
                    var json1 = { source: 'https://github.com/sample/SampleSpecs.git', count: 1 };
                    var json2 = { source: 'https://github.com/CocoaPods/Specs.git', count: 1 };
                    podsjson_mock.getSource.and.callFake(function (source) {
                        if (source === 'https://github.com/sample/SampleSpecs.git') {
                            return json1;
                        } else if (source === 'https://github.com/CocoaPods/Specs.git') {
                            return json2;
                        }
                        return null;
                    });
                    podsjson_mock.decrementSource.and.callFake(function (source) {
                        if (source === 'https://github.com/sample/SampleSpecs.git') {
                            json1.count--;
                        } else if (source === 'https://github.com/CocoaPods/Specs.git') {
                            json2.count--;
                        }
                    });
                    return api.removePlugin(my_plugin)
                        .then(function () {
                            expect(podsjson_mock.getSource.calls.count()).toEqual(2);
                            compareListWithoutOrder(podsjson_mock.getSource.calls.allArgs(), [['https://github.com/sample/SampleSpecs.git'], ['https://github.com/CocoaPods/Specs.git']]);
                            expect(podsjson_mock.decrementSource.calls.count()).toEqual(2);
                            compareListWithoutOrder(podsjson_mock.decrementSource.calls.allArgs(), [['https://github.com/sample/SampleSpecs.git'], ['https://github.com/CocoaPods/Specs.git']]);
                            expect(podfile_mock.removeSource.calls.count()).toEqual(2);
                            compareListWithoutOrder(podfile_mock.removeSource.calls.allArgs(), [['https://github.com/sample/SampleSpecs.git'], ['https://github.com/CocoaPods/Specs.git']]);
                        });
                });
                it('should decrement count in sources and does not remove if count > 1', function () {
                    var json1 = { source: 'https://github.com/sample/SampleSpecs.git', count: 2 };
                    var json2 = { source: 'https://github.com/CocoaPods/Specs.git', count: 1 };
                    podsjson_mock.getSource.and.callFake(function (source) {
                        if (source === 'https://github.com/sample/SampleSpecs.git') {
                            return json1;
                        } else if (source === 'https://github.com/CocoaPods/Specs.git') {
                            return json2;
                        }
                        return null;
                    });
                    podsjson_mock.decrementSource.and.callFake(function (source) {
                        if (source === 'https://github.com/sample/SampleSpecs.git') {
                            json1.count--;
                        } else if (source === 'https://github.com/CocoaPods/Specs.git') {
                            json2.count--;
                        }
                    });
                    return api.removePlugin(my_plugin)
                        .then(function () {
                            expect(podsjson_mock.getSource.calls.count()).toEqual(2);
                            compareListWithoutOrder(podsjson_mock.getSource.calls.allArgs(), [['https://github.com/sample/SampleSpecs.git'], ['https://github.com/CocoaPods/Specs.git']]);
                            expect(podsjson_mock.decrementSource.calls.count()).toEqual(2);
                            compareListWithoutOrder(podsjson_mock.decrementSource.calls.allArgs(), [['https://github.com/sample/SampleSpecs.git'], ['https://github.com/CocoaPods/Specs.git']]);
                            expect(podfile_mock.removeSource.calls.count()).toEqual(1);
                            compareListWithoutOrder(podfile_mock.removeSource.calls.allArgs(), [['https://github.com/CocoaPods/Specs.git']]);
                        });
                });
                it('on a last library, it should remove a json from libraries', function () {
                    var json1 = Object.assign({}, my_pod_json.libraries['AFNetworking'], { count: 1 });
                    var json2 = Object.assign({}, my_pod_json.libraries['Eureka'], { count: 1 });
                    var json3 = Object.assign({}, my_pod_json.libraries['HogeLib'], { count: 1 });
                    podsjson_mock.getLibrary.and.callFake(function (name) {
                        if (name === json1.name) {
                            return json1;
                        } else if (name === json2.name) {
                            return json2;
                        } else if (name === json3.name) {
                            return json3;
                        }
                        return null;
                    });
                    podsjson_mock.decrementLibrary.and.callFake(function (name) {
                        if (name === json1.name) {
                            json1.count--;
                        } else if (name === json2.name) {
                            json2.count--;
                        } else if (name === json3.name) {
                            json3.count--;
                        }
                    });
                    return api.removePlugin(my_plugin)
                        .then(function () {
                            expect(podsjson_mock.getLibrary.calls.count()).toEqual(3);
                            compareListWithoutOrder(podsjson_mock.getLibrary.calls.allArgs(), [[json1.name], [json2.name], [json3.name]]);
                            expect(podsjson_mock.decrementLibrary.calls.count()).toEqual(3);
                            compareListWithoutOrder(podsjson_mock.decrementLibrary.calls.allArgs(), [[json1.name], [json2.name], [json3.name]]);
                            expect(podfile_mock.removeSpec.calls.count()).toEqual(3);
                            compareListWithoutOrder(podfile_mock.removeSpec.calls.allArgs(), [[json1.name], [json2.name], [json3.name]]);
                        });
                });
                it('should decrement count in libraries and does not remove if count > 1', function () {
                    var json1 = Object.assign({}, my_pod_json.libraries['AFNetworking'], { count: 2 });
                    var json2 = Object.assign({}, my_pod_json.libraries['Eureka'], { count: 1 });
                    var json3 = Object.assign({}, my_pod_json.libraries['HogeLib'], { count: 1 });
                    podsjson_mock.getLibrary.and.callFake(function (name) {
                        if (name === json1.name) {
                            return json1;
                        } else if (name === json2.name) {
                            return json2;
                        } else if (name === json3.name) {
                            return json3;
                        }
                        return null;
                    });
                    podsjson_mock.decrementLibrary.and.callFake(function (name) {
                        if (name === json1.name) {
                            json1.count--;
                        } else if (name === json2.name) {
                            json2.count--;
                        } else if (name === json3.name) {
                            json3.count--;
                        }
                    });
                    return api.removePlugin(my_plugin)
                        .then(function () {
                            expect(podsjson_mock.getLibrary.calls.count()).toEqual(3);
                            compareListWithoutOrder(podsjson_mock.getLibrary.calls.allArgs(), [[json1.name], [json2.name], [json3.name]]);
                            expect(podsjson_mock.decrementLibrary.calls.count()).toEqual(3);
                            compareListWithoutOrder(podsjson_mock.decrementLibrary.calls.allArgs(), [[json1.name], [json2.name], [json3.name]]);
                            expect(podfile_mock.removeSpec.calls.count()).toEqual(2);
                            compareListWithoutOrder(podfile_mock.removeSpec.calls.allArgs(), [[json2.name], [json3.name]]);
                        });
                });
            });
        });
    });
});
