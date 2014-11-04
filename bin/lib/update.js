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
var shell = require('shelljs'),
    path  = require('path'),
    fs    = require('fs'),
    ROOT    = path.join(__dirname, '..', '..');

function setShellFatal(value, func) {
    var oldVal = shell.config.fatal;
    shell.config.fatal = value;
    func();
    shell.config.fatal = oldVal;
}

function copyJsAndCordovaLib(projectPath) {
    shell.cp('-f', path.join(ROOT, 'CordovaLib', 'cordova.js'), path.join(projectPath, 'www'));
    shell.rm('-rf', path.join(projectPath, 'CordovaLib'));
    shell.cp('-r', path.join(ROOT, 'CordovaLib'), projectPath);
    // Ensure no workspace files got copied over.
    var entries = fs.readdirSync(path.join(projectPath, 'CordovaLib', 'CordovaLib.xcodeproj'));
    entries.forEach(function(p) {
        if (/.*xc.*/.test(p)) {
            shell.rm('-rf', path.join(projectPath, 'CordovaLib', 'CordovaLib.xcodeproj', p));
        }
    });
}

function copyScripts(projectPath) {
    var srcScriptsDir = path.join(ROOT, 'bin', 'templates', 'scripts', 'cordova');
    var destScriptsDir = path.join(projectPath, 'cordova');
    // Delete old scripts directory.
    shell.rm('-rf', destScriptsDir);
    // Copy in the new ones.
    shell.cp('-r', srcScriptsDir, projectPath);
    shell.cp('-r', path.join(ROOT, 'bin', 'node_modules'), destScriptsDir);
    shell.cp(path.join(ROOT, 'bin', 'check_reqs'), path.join(destScriptsDir, 'check_reqs'));
    shell.cp(path.join(ROOT, 'bin', 'apple_ios_version'), destScriptsDir);
    shell.cp(path.join(ROOT, 'bin', 'apple_osx_version'), destScriptsDir);
    shell.cp(path.join(ROOT, 'bin', 'apple_xcode_version'), destScriptsDir);
    shell.cp(path.join(ROOT, 'bin', 'lib', 'versions.js'), path.join(destScriptsDir, 'lib'));
    // Make sure they are executable.
    shell.find(destScriptsDir).forEach(function(entry) {
        shell.chmod(755, entry);
    });
}

exports.updateProject = function(projectPath) {
    var version = fs.readFileSync(path.join(ROOT, 'CordovaLib', 'VERSION'), 'utf-8').trim();
    setShellFatal(true, function() {
        copyJsAndCordovaLib(projectPath);
        copyScripts(projectPath);
        console.log('iOS project is now at version ' + version);
    });
};
