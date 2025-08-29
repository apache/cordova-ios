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
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const execa = require('execa');
const { CordovaError, events } = require('cordova-common');

Podfile.FILENAME = 'Podfile';
Podfile.declarationRegexpMap = {
    'use_frameworks!': 'use[-_]frameworks!?',
    'inhibit_all_warnings!': 'inhibit[-_]all[-_]warnings!?'
};

function Podfile (podFilePath, projectName, minDeploymentTarget) {
    this.declarationToken = '##INSERT_DECLARATION##';
    this.sourceToken = '##INSERT_SOURCE##';
    this.podToken = '##INSERT_POD##';

    this.path = podFilePath;
    this.projectName = projectName;
    this.minDeploymentTarget = minDeploymentTarget || '13.0';
    this.contents = null;
    this.sources = null;
    this.declarations = null;
    this.pods = null;
    this.__dirty = false;

    // check whether it is named Podfile
    const filename = this.path.split(path.sep).pop();
    if (filename !== Podfile.FILENAME) {
        throw new CordovaError(`Podfile: The file at ${this.path} is not \`${Podfile.FILENAME}\`.`);
    }

    if (!fs.existsSync(this.path)) {
        events.emit('verbose', `Podfile: The file at ${this.path} does not exist.`);
        events.emit('verbose', 'Creating new Podfile in platforms/ios');
        this.clear();
        this.write();
    } else {
        events.emit('verbose', 'Podfile found in platforms/ios');
        // parse for pods
        const fileText = fs.readFileSync(this.path, 'utf8');
        this.declarations = this.__parseForDeclarations(fileText);
        this.sources = this.__parseForSources(fileText);
        this.pods = this.__parseForPods(fileText);
    }
}

Podfile.prototype.__parseForDeclarations = function (text) {
    // split by \n
    const arr = text.split('\n');

    // getting lines between "platform :ios, '13.0'"" and "target 'Hello Cordova'" do
    const declarationsPreRE = /platform :ios,\s+'[^']+'/;
    const declarationsPostRE = /target\s+'[^']+'\s+do/;
    const declarationRE = /^\s*[^#]/;

    return arr.reduce((acc, line) => {
        switch (acc.state) {
        case 0:
            if (declarationsPreRE.exec(line)) {
                acc.state = 1; // Start to read
            }
            break;
        case 1:
            if (declarationsPostRE.exec(line)) {
                acc.state = 2; // Finish to read
            } else {
                acc.lines.push(line);
            }
            break;
        case 2:
        default:
            // do nothing;
        }
        return acc;
    }, { state: 0, lines: [] })
        .lines
        .filter(line => declarationRE.exec(line))
        .reduce((obj, line) => {
            obj[line] = line;
            return obj;
        }, {});
};

Podfile.prototype.__parseForSources = function (text) {
    // split by \n
    const arr = text.split('\n');

    const sourceRE = /source '(.*)'/;
    return arr.filter(line => {
        const m = sourceRE.exec(line);

        return (m !== null);
    })
        .reduce((obj, line) => {
            const m = sourceRE.exec(line);
            if (m !== null) {
                const source = m[1];
                obj[source] = source;
            }
            return obj;
        }, {});
};

Podfile.prototype.__parseForPods = function (text) {
    // split by \n
    const arr = text.split('\n');

    // aim is to match (space insignificant around the comma, comma optional):
    //     pod 'Foobar', '1.2'
    //     pod 'Foobar', 'abc 123 1.2'
    //     pod 'PonyDebugger', :configurations => ['Debug', 'Beta']
    // var podRE = new RegExp('pod \'([^\']*)\'\\s*,?\\s*(.*)');
    const podRE = /pod '([^']*)'\s*(?:,\s*'([^']*)'\s*)?,?\s*(.*)/;

    // only grab lines that don't have the pod spec'
    return arr.filter(line => {
        const m = podRE.exec(line);

        return (m !== null);
    })
        .reduce((obj, line) => {
            const m = podRE.exec(line);

            if (m !== null) {
                const podspec = {
                    name: m[1]
                };
                if (m[2]) {
                    podspec.spec = m[2];
                }
                if (m[3]) {
                    podspec.options = m[3];
                }
                obj[m[1]] = podspec; // i.e pod 'Foo', '1.2' ==> { 'Foo' : '1.2'}
            }

            return obj;
        }, {});
};

Podfile.prototype.escapeSingleQuotes = function (string) {
    return string.replaceAll("'", "\\'");
};

Podfile.prototype.getTemplate = function () {
    return '# DO NOT MODIFY -- auto-generated by Apache Cordova\n' +
        `${this.sourceToken}\n` +
        `platform :ios, '${this.minDeploymentTarget}'\n` +
        `${this.declarationToken}\n` +
        'target \'App\' do\n' +
        '\tproject \'App.xcodeproj\'\n' +
        `${this.podToken}\n` +
        'end\n';
};

Podfile.prototype.addSpec = function (name, spec) {
    name = name || '';

    if (!name.length) { // blank names are not allowed
        throw new CordovaError('Podfile addSpec: name is not specified.');
    }

    if (typeof spec === 'string') {
        if (spec.startsWith(':')) {
            spec = { name, options: spec };
        } else {
            spec = { name, spec };
        }
    }

    this.pods[name] = spec;
    this.__dirty = true;

    events.emit('verbose', `Added pod line for \`${name}\``);
};

Podfile.prototype.removeSpec = function (name) {
    if (this.existsSpec(name)) {
        delete this.pods[name];
        this.__dirty = true;
    }

    events.emit('verbose', `Removed pod line for \`${name}\``);
};

Podfile.prototype.getSpec = function (name) {
    return this.pods[name];
};

Podfile.prototype.existsSpec = function (name) {
    return (name in this.pods);
};

Podfile.prototype.addSource = function (src) {
    this.sources[src] = src;
    this.__dirty = true;

    events.emit('verbose', `Added source line for \`${src}\``);
};

Podfile.prototype.removeSource = function (src) {
    if (this.existsSource(src)) {
        delete this.sources[src];
        this.__dirty = true;
    }

    events.emit('verbose', `Removed source line for \`${src}\``);
};

Podfile.prototype.existsSource = function (src) {
    return (src in this.sources);
};

Podfile.prototype.addDeclaration = function (declaration) {
    this.declarations[declaration] = declaration;
    this.__dirty = true;

    events.emit('verbose', `Added declaration line for \`${declaration}\``);
};

Podfile.prototype.removeDeclaration = function (declaration) {
    if (this.existsDeclaration(declaration)) {
        delete this.declarations[declaration];
        this.__dirty = true;
    }

    events.emit('verbose', `Removed source line for \`${declaration}\``);
};

Podfile.proofDeclaration = declaration => {
    const list = Object.keys(Podfile.declarationRegexpMap).filter(key => {
        const regexp = new RegExp(Podfile.declarationRegexpMap[key]);
        return regexp.test(declaration);
    });
    if (list.length > 0) {
        return list[0];
    }
    return declaration;
};

Podfile.prototype.existsDeclaration = function (declaration) {
    return (declaration in this.declarations);
};

Podfile.prototype.clear = function () {
    this.sources = {};
    this.declarations = {};
    this.pods = {};
    this.__dirty = true;
};

Podfile.prototype.destroy = function () {
    fs.unlinkSync(this.path);
    events.emit('verbose', `Deleted \`${this.path}\``);
};

Podfile.prototype.write = function () {
    let text = this.getTemplate();

    const podsString =
    Object.keys(this.pods).map(key => {
        const name = key;
        const json = this.pods[key];

        if (typeof json === 'string') { // compatibility for using framework tag.
            const spec = json;
            if (spec.length) {
                if (spec.indexOf(':') === 0) {
                    // don't quote it, it's a specification (starts with ':')
                    return `\tpod '${name}', ${spec}`;
                } else {
                    // quote it, it's a version
                    return `\tpod '${name}', '${spec}'`;
                }
            } else {
                return `\tpod '${name}'`;
            }
        } else {
            const list = [`'${name}'`];
            if ('spec' in json && json.spec.length) {
                list.push(`'${json.spec}'`);
            }

            let options = ['tag', 'branch', 'commit', 'git', 'podspec']
                .filter(tag => tag in json)
                .map(tag => `:${tag} => '${json[tag]}'`);

            if ('configurations' in json) {
                options.push(`:configurations => [${json.configurations.split(',').map(conf => `'${conf.trim()}'`).join(',')}]`);
            }
            if ('options' in json) {
                options = [json.options];
            }
            if (options.length > 0) {
                list.push(options.join(', '));
            }
            return `\tpod ${list.join(', ')}`;
        }
    }).join('\n');

    const sourcesString =
    Object.keys(this.sources).map(key => {
        const source = this.sources[key];
        return `source '${source}'`;
    }).join('\n');

    const declarationString =
    Object.keys(this.declarations).map(key => {
        const declaration = this.declarations[key];
        return declaration;
    }).join('\n');

    text = text.replace(this.podToken, podsString)
        .replace(this.sourceToken, sourcesString)
        .replace(this.declarationToken, declarationString);

    fs.writeFileSync(this.path, text, 'utf8');
    this.__dirty = false;

    events.emit('verbose', 'Wrote to Podfile.');
};

Podfile.prototype.isDirty = function () {
    return this.__dirty;
};

Podfile.prototype.before_install = function (toolOptions) {
    toolOptions = toolOptions || {};

    // Template tokens in order: project name, project name, debug | release
    const createXConfigContent = buildType => '// DO NOT MODIFY -- auto-generated by Apache Cordova\n' +
        `#include "Pods/Target Support Files/Pods-App/Pods-App.${buildType}.xcconfig"`;

    const debugContents = createXConfigContent('debug');
    const releaseContents = createXConfigContent('release');

    const debugConfigPath = path.join(this.path, '..', 'pods-debug.xcconfig');
    const releaseConfigPath = path.join(this.path, '..', 'pods-release.xcconfig');

    fs.writeFileSync(debugConfigPath, debugContents, 'utf8');
    fs.writeFileSync(releaseConfigPath, releaseContents, 'utf8');

    return Promise.resolve(toolOptions);
};

Podfile.prototype.install = function (requirementsCheckerFunction) {
    const opts = {};
    opts.cwd = path.join(this.path, '..'); // parent path of this Podfile
    opts.stderr = 'inherit';

    if (!requirementsCheckerFunction) {
        requirementsCheckerFunction = Promise.resolve();
    }

    return requirementsCheckerFunction()
        .then(toolOptions => this.before_install(toolOptions))
        .then(toolOptions => {
            events.emit('verbose', '==== pod install start ====\n');

            if (toolOptions.ignore) {
                events.emit('verbose', toolOptions.ignoreMessage);
                return;
            }

            const subprocess = execa('pod', ['install', '--verbose'], opts);

            // FIXME: data emitted is not necessarily a complete line
            subprocess.stdout.on('data', data => {
                events.emit('verbose', data);
            });

            return subprocess;
        })
        .then(() => { // done
            events.emit('verbose', '==== pod install end ====\n');
        });
};

module.exports.Podfile = Podfile;
