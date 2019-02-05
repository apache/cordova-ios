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
var path = require('path');

var BridgingHeader = require(path.resolve(path.join(__dirname, '..', '..', '..', 'bin', 'templates', 'scripts', 'cordova', 'lib', 'BridgingHeader.js'))).BridgingHeader;
var fixtureBridgingHeader = fs.readFileSync(path.resolve(__dirname, 'fixtures', 'test-Bridging-Header.h'), 'utf-8');

describe('unit tests for BridgingHeader module', function () {
    var existsSyncSpy;
    var readFileSyncSpy;
    var writeFileSyncSpy;
    var dummy_path = 'dummy_path';
    var dummy_plugin = { id: 'dummy_plugin', header_path: 'dummy_header_path' };
    var dummy_plugin2 = { id: 'dummy_plugin2', header_path: 'dummy_header_path2' };
    var headerImportText = function (header_path) { return '#import "' + header_path + '"'; };

    beforeEach(function () {
        existsSyncSpy = spyOn(fs, 'existsSync');
        readFileSyncSpy = spyOn(fs, 'readFileSync');
        writeFileSyncSpy = spyOn(fs, 'writeFileSync');
    });
    it('Test#001 : should error if BridgingHeader file does not exist', function () {
        existsSyncSpy.and.returnValue(false);
        expect(function () {
            var _ = new BridgingHeader(fixtureBridgingHeader);
            expect(_).not.toEqual(null); // To avoid ESLINT error "Do not use 'new' for side effects"
        }).toThrow();
    });
    it('Test#002 : load BridgingHeader file', function () {
        existsSyncSpy.and.returnValue(true);
        readFileSyncSpy.and.returnValue(fixtureBridgingHeader);

        var bridgingHeader = new BridgingHeader(dummy_path);
        expect(bridgingHeader.path).toEqual(dummy_path);
        expect(bridgingHeader).not.toEqual(null);
    });
    it('Test#003 : add and remove a BridgingHeader', function () {
        var result_json = null;
        var text_list = null;
        var bridgingHeaderFileContent = fixtureBridgingHeader;
        existsSyncSpy.and.returnValue(true);
        readFileSyncSpy.and.callFake(function (read_path, charset) {
            return bridgingHeaderFileContent;
        });
        writeFileSyncSpy.and.callFake(function (write_path, text, charset) {
            result_json = { write_path: write_path, text: text, charset: charset };
        });

        var bridgingHeader = new BridgingHeader(dummy_path);
        bridgingHeader.addHeader(dummy_plugin.id, dummy_plugin.header_path);
        bridgingHeader.write();
        expect(result_json).not.toEqual(null);
        expect(result_json.write_path).toEqual(dummy_path);
        expect(result_json.text).not.toEqual(null);
        expect(result_json.charset).toEqual('utf8');
        text_list = result_json.text.split('\n');
        expect(text_list.filter(function (line) { return line === headerImportText(dummy_plugin.header_path); }).length).toEqual(1);

        bridgingHeader = new BridgingHeader(dummy_path);
        bridgingHeader.removeHeader(dummy_plugin.id, dummy_plugin.header_path);
        bridgingHeader.write();
        expect(result_json).not.toEqual(null);
        expect(result_json.write_path).toEqual(dummy_path);
        expect(result_json.text).not.toEqual(null);
        expect(result_json.charset).toEqual('utf8');
        text_list = result_json.text.split('\n');
        expect(text_list.filter(function (line) { return line === headerImportText(dummy_plugin.header_path); }).length).toEqual(0);
    });
    it('Test#004 : add and remove two BridgingHeaders', function () {
        var result_json = null;
        var text_list = null;
        var bridgingHeaderFileContent = fixtureBridgingHeader;
        existsSyncSpy.and.returnValue(true);
        readFileSyncSpy.and.callFake(function (read_path, charset) {
            return bridgingHeaderFileContent;
        });
        writeFileSyncSpy.and.callFake(function (write_path, text, charset) {
            bridgingHeaderFileContent = text;
            result_json = { write_path: write_path, text: text, charset: charset };
        });

        var bridgingHeader = new BridgingHeader(dummy_path);
        bridgingHeader.addHeader(dummy_plugin.id, dummy_plugin.header_path);
        bridgingHeader.write();

        bridgingHeader = new BridgingHeader(dummy_path);
        bridgingHeader.addHeader(dummy_plugin2.id, dummy_plugin2.header_path);
        bridgingHeader.write();

        text_list = result_json.text.split('\n');
        expect(text_list.filter(function (line) { return line === headerImportText(dummy_plugin.header_path); }).length).toEqual(1);
        expect(text_list.filter(function (line) { return line === headerImportText(dummy_plugin2.header_path); }).length).toEqual(1);

        bridgingHeader = new BridgingHeader(dummy_path);
        bridgingHeader.removeHeader(dummy_plugin.id, dummy_plugin.header_path);
        bridgingHeader.write();

        text_list = result_json.text.split('\n');
        expect(text_list.filter(function (line) { return line === headerImportText(dummy_plugin.header_path); }).length).toEqual(0);
        expect(text_list.filter(function (line) { return line === headerImportText(dummy_plugin2.header_path); }).length).toEqual(1);

        bridgingHeader = new BridgingHeader(dummy_path);
        bridgingHeader.removeHeader(dummy_plugin2.id, dummy_plugin2.header_path);
        bridgingHeader.write();

        text_list = result_json.text.split('\n');
        expect(text_list.filter(function (line) { return line === headerImportText(dummy_plugin.header_path); }).length).toEqual(0);
        expect(text_list.filter(function (line) { return line === headerImportText(dummy_plugin2.header_path); }).length).toEqual(0);

    });

});
