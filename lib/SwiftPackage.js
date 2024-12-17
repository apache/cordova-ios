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

const fs = require('node:fs');
const CordovaError = require('cordova-common').CordovaError;

class SwiftPackage {
    constructor (packagePath) {
        this.path = packagePath;

        if (!fs.existsSync(this.path)) {
            throw new CordovaError('Package.swift is not found.');
        }
    }

    _pluginReference (plugin) {
        return `
package.dependencies.append(.package(name: "${plugin.id}", path: "../../../plugins/${plugin.id}"))
package.targets.first?.dependencies.append(.product(name: "${plugin.id}", package: "${plugin.id}"))
`;
    }

    addPlugin (plugin) {
        const fd = fs.openSync(this.path, 'a');
        fs.writeFileSync(fd, this._pluginReference(plugin), 'utf8');
        fs.closeSync(fd);
    }

    removePlugin (plugin) {
        const fd = fs.openSync(this.path, 'r+');

        let packageContent = fs.readFileSync(fd, 'utf8');
        packageContent = packageContent.replace(this._pluginReference(plugin), '');

        fs.ftruncateSync(fd);
        fs.writeFileSync(fd, packageContent, 'utf8');
        fs.closeSync(fd);
    }
}

// Use this as a hidden property on the plugin so that we can cache the result
// of the Swift Package check for the lifetime of that PluginInfo object,
// without caching it based on plugin name.
const _isSwiftPackage = Symbol('isSwiftPackage');

function isSwiftPackagePlugin (plugin) {
    if (!plugin[_isSwiftPackage]) {
        plugin[_isSwiftPackage] = plugin.getPlatforms().some((platform) => {
            return platform.name === 'ios' && !!platform.package;
        });
    }

    return plugin[_isSwiftPackage];
}

module.exports.SwiftPackage = SwiftPackage;
module.exports.isSwiftPackagePlugin = isSwiftPackagePlugin;
