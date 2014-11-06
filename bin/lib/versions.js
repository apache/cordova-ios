#!/usr/bin/env node

/*
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

var child_process = require('child_process'),
    Q = require('q');

exports.get_apple_ios_version = function() {
    var d = Q.defer();
    child_process.exec('xcodebuild -showsdks', function(error, stdout, stderr) {
        if (error) {
            d.reject(stderr);
        }
        else {
            d.resolve(stdout);
        }
    });

    return d.promise.then(function(output) {
        var regex = /[0-9]*\.[0-9]*/,
            versions = [],
            regexIOS = /^iOS \d+/;
        output = output.split('\n');
        for (var i = 0; i < output.length; i++) {
            if (output[i].trim().match(regexIOS)) {
                versions[versions.length] = parseFloat(output[i].match(regex)[0]);
                }
        }
        versions.sort();
        console.log(versions[0]);
        return Q();
    }, function(stderr) {
        return Q.reject(stderr);
    });
}

exports.get_apple_osx_version = function() {
    var d = Q.defer();
    child_process.exec('xcodebuild -showsdks', function(error, stdout, stderr) {
        if (error) {
            d.reject(stderr);
        }
        else {
            d.resolve(stdout);
        }
    });

    return d.promise.then(function(output) {
        var regex = /[0-9]*\.[0-9]*/,
            versions = [],
            regexOSX = /^OS X \d+/;
        output = output.split('\n');
        for (var i = 0; i < output.length; i++) {
            if (output[i].trim().match(regexOSX)) {
                versions[versions.length] = parseFloat(output[i].match(regex)[0]);
            }
        }
        versions.sort();
        console.log(versions[0]);
        return Q();
    }, function(stderr) {
        return Q.reject(stderr);
    });
}

exports.get_apple_xcode_version = function() {
    var d = Q.defer();
    child_process.exec('xcodebuild -version', function(error, stdout, stderr) {
        if (error) {
            d.reject(stderr);
        }
        else {
            d.resolve(stdout);
        }
    });

    return d.promise.then(function(output) {
        output = output.split('\n');
        console.log(output[0].slice(6));
        return Q();
    }, function(stderr) {
        return Q.reject(stderr);
    });
}
