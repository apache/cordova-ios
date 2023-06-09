/*
    Licensed to the Apache Software Foundation (ASF) under one
    or more contributor license agreements. See the NOTICE file
    distributed with this work for additional information
    regarding copyright ownership. The ASF licenses this file
    to you under the Apache License, Version 2.0 (the
    "License"); you may not use this file except in compliance
    with the License. You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing,
    software distributed under the License is distributed on an
    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, either express or implied. See the License for the
    specific language governing permissions and limitations
    under the License.
*/

const path = require('path');
const fs = require('fs-extra');
const xmlescape = require('xml-escape');
const { CordovaError, events } = require('cordova-common');
const pkg = require('../package');

const ROOT = path.join(__dirname, '..');

/**
 * Creates a new iOS project with the following options:
 *
 * @param {string} project_path Path to your new Cordova iOS project
 * @param {string} package_name Package name, following reverse-domain style convention
 * @param {string} project_name Project name
 * @param {{ link: boolean, customTemplate: string }} opts Project creation options
 * @returns {Promise<void>} resolves when the project has been created
 */
exports.createProject = async (project_path, package_name, project_name, opts) => {
    package_name = package_name || 'my.cordova.project';
    project_name = project_name || 'CordovaExample';

    // check that project path doesn't exist
    if (fs.existsSync(project_path)) {
        throw new CordovaError('Project already exists');
    }

    events.emit('log', 'Creating Cordova project for the iOS platform:');
    events.emit('log', `\tPath: ${path.relative(process.cwd(), project_path)}`);
    events.emit('log', `\tPackage: ${package_name}`);
    events.emit('log', `\tName: ${project_name}`);

    new ProjectCreator({
        project: {
            path: project_path,
            name: project_name,
            id: package_name
        },
        options: {
            templatePath: opts.customTemplate || path.join(ROOT, 'templates/project'),
            linkLib: !!opts.link
        }
    }).create();

    events.emit('log', `iOS project created with ${pkg.name}@${pkg.version}`);
};

class ProjectCreator {
    constructor (obj) {
        Object.assign(this, obj);
    }

    create () {
        this.provideProjectTemplate();
        this.provideCordovaJs();
        this.provideCordovaLib();
        this.provideBuildScripts();
        this.expandTokens();
    }

    provideProjectTemplate () {
        fs.copySync(this.options.templatePath, this.project.path);

        // TODO: why two .gitignores?
        const r = this.projectPath('__PROJECT_NAME__');
        fs.moveSync(path.join(r, 'gitignore'), path.join(r, '.gitignore'));
        fs.copySync(path.join(r, '.gitignore'), this.projectPath('.gitignore'));
    }

    provideCordovaJs () {
        fs.copySync(
            this.projectPath('www/cordova.js'),
            this.projectPath('platform_www/cordova.js')
        );
    }

    provideCordovaLib () {
        this.copyOrLinkCordovaLib();
        this.configureCordovaLibPath();
    }

    provideBuildScripts () {
        const srcScriptsDir = path.join(ROOT, 'templates/cordova');
        const destScriptsDir = this.projectPath('cordova');
        fs.copySync(srcScriptsDir, destScriptsDir);
    }

    expandTokens () {
        this.expandTokensInFileContents();
        this.expandTokensInFileNames();
    }

    copyOrLinkCordovaLib () {
        const cordovaLibPathSrc = path.join(ROOT, 'CordovaLib');
        const cordovaLibPathDest = this.projectPath('CordovaLib');

        if (this.options.linkLib) {
            // Symlink not used in project file, but is currently required for plugman because
            // it reads the VERSION file from it (instead of using the cordova/version script
            // like it should).
            fs.symlinkSync(cordovaLibPathSrc, cordovaLibPathDest);
        } else {
            for (const p of ['include', 'Classes', 'CordovaLib.xcodeproj/project.pbxproj']) {
                fs.copySync(path.join(cordovaLibPathSrc, p), path.join(cordovaLibPathDest, p));
            }
        }
    }

    configureCordovaLibPath () {
        // CordovaLib could be a symlink, so we resolve it
        const cdvLibRealPath = fs.realpathSync(this.projectPath('CordovaLib'));

        const cdvLibXcodeAbsPath = path.join(cdvLibRealPath, 'CordovaLib.xcodeproj');
        let cdvLibXcodePath = path.relative(this.project.path, cdvLibXcodeAbsPath);

        if (path.sep !== path.posix.sep) {
            // If the Cordova project is being created on Windows, we need to
            // make sure the Xcode project file uses POSIX-style paths or else
            // Xcode considers it invalid
            cdvLibXcodePath = cdvLibXcodePath.replace(path.sep, path.posix.sep);
        }

        // Replace magic line in project.pbxproj
        const pbxprojPath = this.projectPath('__PROJECT_NAME__.xcodeproj/project.pbxproj');
        transformFileContents(pbxprojPath, contents => {
            const regex = /(.+CordovaLib.xcodeproj.+PBXFileReference.+wrapper.pb-project.+)(path = .+?;)(.*)(sourceTree.+;)(.+)/;
            const line = contents.split(/\r?\n/)
                .find(l => regex.test(l));

            if (!line) {
                throw new Error(`Entry not found in project file for sub-project: ${cdvLibXcodePath}`);
            }

            let newLine = line
                .replace(/path = .+?;/, `path = ${cdvLibXcodePath};`)
                .replace(/sourceTree.+?;/, 'sourceTree = "<group>";');

            if (!newLine.match('name')) {
                newLine = newLine.replace('path = ', 'name = CordovaLib.xcodeproj; path = ');
            }

            return contents.replace(line, newLine);
        });
    }

    expandTokensInFileContents () {
        // Expand __PROJECT_ID__ token in file contents
        transformFileContents(
            this.projectPath('__PROJECT_NAME__.xcodeproj/project.pbxproj'),
            contents => contents.replace(/__PROJECT_ID__/g, this.project.id)
        );

        // Expand __PROJECT_NAME__ token in file contents
        for (const p of [
            'cordova/build-debug.xcconfig',
            'cordova/build-release.xcconfig',
            '__PROJECT_NAME__.xcworkspace/contents.xcworkspacedata',
            '__PROJECT_NAME__.xcworkspace/xcshareddata/xcschemes/__PROJECT_NAME__.xcscheme',
            '__PROJECT_NAME__.xcodeproj/project.pbxproj',
            '__PROJECT_NAME__/AppDelegate.h',
            '__PROJECT_NAME__/AppDelegate.m',
            '__PROJECT_NAME__/MainViewController.h',
            '__PROJECT_NAME__/MainViewController.m',
            '__PROJECT_NAME__/main.m',
            '__PROJECT_NAME__/__PROJECT_NAME__-Info.plist',
            '__PROJECT_NAME__/__PROJECT_NAME__-Prefix.pch'
        ]) {
            this.expandProjectNameInFileContents(this.projectPath(p));
        }
    }

    expandTokensInFileNames () {
        // Expand __PROJECT_NAME__ token in file & folder names
        for (const p of [
            '__PROJECT_NAME__.xcworkspace/xcshareddata/xcschemes/__PROJECT_NAME__.xcscheme',
            '__PROJECT_NAME__.xcworkspace',
            '__PROJECT_NAME__.xcodeproj',
            '__PROJECT_NAME__/__PROJECT_NAME__-Info.plist',
            '__PROJECT_NAME__/__PROJECT_NAME__-Prefix.pch',
            '__PROJECT_NAME__'
        ]) {
            this.expandProjectNameInBaseName(this.projectPath(p));
        }
    }

    expandProjectNameInBaseName (f) {
        const { dir, base } = path.parse(f);
        const newBase = base.replace('__PROJECT_NAME__', this.project.name);
        return fs.moveSync(f, path.join(dir, newBase));
    }

    expandProjectNameInFileContents (f) {
        // https://issues.apache.org/jira/browse/CB-12402 - Encode XML characters properly
        const xmlExtensions = new Set(['.xcworkspacedata', '.xcscheme']);
        const escape = xmlExtensions.has(path.extname(f))
            ? xmlescape
            : s => s.replace(/&/g, '\\&');

        transformFileContents(f, contents =>
            contents.replace(/__PROJECT_NAME__/g, escape(this.project.name))
        );
    }

    projectPath (projectRelativePath) {
        return path.join(this.project.path, projectRelativePath);
    }
}

function transformFileContents (file, transform) {
    const contents = fs.readFileSync(file, 'utf-8');
    fs.writeFileSync(file, transform(contents));
}
