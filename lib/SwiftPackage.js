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
const path = require('node:path');
const { CordovaError } = require('cordova-common');

const ROOT = path.join(__dirname, '..');

class SwiftPackage {
    constructor (projectRoot) {
        this.root = projectRoot;
        this.path = path.join(this.root, 'packages', 'cordova-ios-plugins', 'Package.swift');

        if (!fs.existsSync(this.path)) {
            throw new CordovaError('Package.swift is not found.');
        }
    }

    _pluginReference (plugin, pluginPath) {
        return `
package.dependencies.append(.package(name: "${plugin.id}", path: "${pluginPath.replaceAll(path.sep, path.posix.sep)}"))
package.targets.first?.dependencies.append(.product(name: "${plugin.id}", package: "${plugin.id}"))
`;
    }

    addPlugin (plugin, opts = {}) {
        let pluginPath = path.relative(path.dirname(this.path), path.join(this.root, 'packages', plugin.id));
        if (opts.link) {
            pluginPath = path.relative(path.dirname(this.path), plugin.dir);
        } else {
            // Copy the plugin into the packages directory
            const localPluginPath = path.join(this.root, 'packages', plugin.id);
            fs.cpSync(plugin.dir, localPluginPath, { recursive: true });

            const pkgSwiftPath = path.join(localPluginPath, 'Package.swift');

            let cordovaPath = path.relative(localPluginPath, path.join(this.root, 'packages', 'cordova-ios'));
            if (!fs.existsSync(path.join(localPluginPath, cordovaPath))) {
                cordovaPath = path.relative(localPluginPath, ROOT);
            }

            const pkg_fd = fs.openSync(pkgSwiftPath, 'r+');
            let packageContent = fs.readFileSync(pkg_fd, 'utf8');

            // Note: May match unintended packages, e.g. 'cordova-ios-plugin',
            // due to flexible patterns. Strict filtering would risk valid
            // exclusions.
            packageContent = packageContent.replace(/package\(.+cordova-ios.+\)/gm, `package(name: "cordova-ios", path: "${cordovaPath.replaceAll(path.sep, path.posix.sep)}")`);

            fs.ftruncateSync(pkg_fd);
            fs.writeSync(pkg_fd, packageContent, 0, 'utf8');
            fs.closeSync(pkg_fd);
        }

        const fd = fs.openSync(this.path, 'a');
        fs.writeFileSync(fd, this._pluginReference(plugin, pluginPath), 'utf8');
        fs.closeSync(fd);
    }

    removePlugin (plugin) {
        const fd = fs.openSync(this.path, 'r+');

        if (fs.existsSync(path.join(this.root, 'packages', plugin.id))) {
            fs.rmSync(path.join(this.root, 'packages', plugin.id), { recursive: true, force: true });
        }

        let packageContent = fs.readFileSync(fd, 'utf8');

        // We don't know if it was originally linked or not, so try to remove both
        const pluginPath = path.relative(path.dirname(this.path), path.join(this.root, 'packages', plugin.id));
        const pluginLink = path.relative(path.dirname(this.path), plugin.dir);
        packageContent = packageContent.replace(this._pluginReference(plugin, pluginPath), '');
        packageContent = packageContent.replace(this._pluginReference(plugin, pluginLink), '');

        fs.ftruncateSync(fd);
        fs.writeSync(fd, packageContent, 0, 'utf8');
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
