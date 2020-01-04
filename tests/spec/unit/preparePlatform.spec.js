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

const path = require('path');
const fs = require('fs');
const shell = require('shelljs');
const EventEmitter = require('events').EventEmitter;
const ConfigParser = require('cordova-common').ConfigParser;
const PluginInfo = require('cordova-common').PluginInfo;
const Api = require('../../../bin/templates/scripts/cordova/Api');

const FIXTURES = path.join(__dirname, 'fixtures');
const DUMMY_PLUGIN = 'org.test.plugins.dummyplugin';

const iosProjectFixture = path.join(FIXTURES, 'ios-config-xml');
const iosProject = path.join(FIXTURES, 'dummyProj');
const iosPlatform = path.join(iosProject, 'platforms/ios');
const dummyPlugin = path.join(FIXTURES, DUMMY_PLUGIN);

shell.config.silent = true;

describe('prepare after plugin add', () => {
    let api;
    beforeEach(() => {
        shell.mkdir('-p', iosPlatform);
        shell.cp('-rf', `${iosProjectFixture}/*`, iosPlatform);
        api = new Api('ios', iosPlatform, new EventEmitter());

        jasmine.addMatchers({
            toBeInstalledIn: function () {
                return {
                    compare: function (actual, expected) {
                        const result = {};
                        let content;
                        try {
                            content = fs.readFileSync(path.join(expected, 'ios.json'));
                            const cfg = JSON.parse(content);
                            result.pass = Object.keys(cfg.installed_plugins).indexOf(actual) > -1;
                        } catch (e) {
                            result.pass = false;
                        }

                        if (result.pass) {
                            result.message = `Expected ${actual} to be installed in ${expected}.`;
                        } else {
                            result.message = `Expected ${actual} to not be installed in ${expected}.`;
                        }
                        return result;
                    }
                };
            }
        });
    });

    afterEach(() => {
        shell.rm('-rf', iosPlatform);
    });

    it('Test 001 : should not overwrite plugin metadata added by "addPlugin"', () => {
        const project = {
            root: iosProject,
            projectConfig: new ConfigParser(path.join(iosProject, 'config.xml')),
            locations: {
                plugins: path.join(iosProject, 'plugins'),
                www: path.join(iosProject, 'www')
            }
        };

        return api.prepare(project, {})
            .then(() => {
                expect(fs.existsSync(path.join(iosPlatform, 'ios.json'))).toBe(true);
                expect(DUMMY_PLUGIN).not.toBeInstalledIn(iosProject);
                return api.addPlugin(new PluginInfo(dummyPlugin), {});
            })
            .then(() => {
                expect(DUMMY_PLUGIN).toBeInstalledIn(iosPlatform);
                return api.prepare(project, {});
            })
            .then(() => {
                expect(DUMMY_PLUGIN).toBeInstalledIn(iosPlatform);
            });
    });
});
