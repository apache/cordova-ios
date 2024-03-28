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

const path = require('node:path');
const fs = require('node:fs');
const EventEmitter = require('node:events').EventEmitter;
const ConfigParser = require('cordova-common').ConfigParser;
const PluginInfo = require('cordova-common').PluginInfo;
const Api = require('../../../lib/Api');

const FIXTURES = path.join(__dirname, 'fixtures');
const DUMMY_PLUGIN = 'org.test.plugins.dummyplugin';

const iosProjectFixture = path.join(FIXTURES, 'ios-config-xml');
const iosProject = path.join(FIXTURES, 'dummyProj');
const iosPlatform = path.join(iosProject, 'platforms', 'ios');
const dummyPlugin = path.join(FIXTURES, DUMMY_PLUGIN);

describe('plugin add', () => {
    let api;

    beforeEach(() => {
        fs.mkdirSync(iosPlatform, { recursive: true });
        fs.cpSync(iosProjectFixture, iosPlatform, { recursive: true });
        api = new Api('ios', iosPlatform, new EventEmitter());
    });

    afterEach(() => {
        fs.rmSync(iosPlatform, { recursive: true, force: true });
    });

    it('should handle plugin preference default values', () => {
        return api.addPlugin(new PluginInfo(dummyPlugin))
            .then(() => {
                const cfg = new ConfigParser(api.locations.configXml);
                expect(cfg.getPreference('PluginPackageName', 'ios')).toEqual('com.example.friendstring');
            });
    });

    it('should handle plugin preference provided values', () => {
        return api.addPlugin(new PluginInfo(dummyPlugin), { variables: { NAME_SPACE: 'com.mycompany.myapp' } })
            .then(() => {
                const cfg = new ConfigParser(api.locations.configXml);
                expect(cfg.getPreference('PluginNameSpace', 'ios')).toEqual('com.mycompany.myapp');
            });
    });
});
