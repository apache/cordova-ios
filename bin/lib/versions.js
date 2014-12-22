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
        } else {
            var version = stdout.split('\n')[0].slice(6);
            d.resolve(version);
        }
    });
    return d.promise;
};

/**
 * Gets ios-deploy util version
 * @return {Promise} Promise that either resolved with ios-deploy version
 *                           or rejected in case of error
 */
exports.get_ios_deploy_version = function() {
    var d = Q.defer();
    child_process.exec('ios-deploy --version', function(error, stdout, stderr) {
        if (error) {
            d.reject(stderr);
        } else {
            d.resolve(stdout);
        }
    });
    return d.promise;
};

/**
 * Gets ios-sim util version
 * @return {Promise} Promise that either resolved with ios-sim version
 *                           or rejected in case of error
 */
exports.get_ios_sim_version = function() {
    var d = Q.defer();
    child_process.exec('ios-sim --version', function(error, stdout, stderr) {
        if (error) {
            d.reject(stderr);
        } else {
            d.resolve(stdout);
        }
    });
    return d.promise;
};

/**
 * Gets specific tool version
 * @param  {String} toolName Tool name to check. Known tools are 'xcodebuild', 'ios-sim' and 'ios-deploy'
 * @return {Promise}         Promise that either resolved with tool version
 *                                   or rejected in case of error
 */
exports.get_tool_version = function (toolName) {
    switch (toolName) {
        case 'xcodebuild': return exports.get_apple_xcode_version();
        case 'ios-sim': return exports.get_apple_xcode_version();
        case 'ios-deploy': return exports.get_apple_xcode_version();
        default: return Q.reject(toolName + ' is not valid tool name. Valid names are: \'xcodebuild\', \'ios-sim\' and \'ios-deploy\'');
    }
};
