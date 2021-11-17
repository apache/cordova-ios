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
const ROOT = path.join(__dirname, '..', '..');
const { CordovaError, events } = require('cordova-common');
const utils = require('./utils');
const pkg = require('../../package');

function copyJsAndCordovaLib (projectPath, projectName, use_shared) {
    fs.copySync(
        path.join(projectPath, 'www/cordova.js'),
        path.join(projectPath, 'platform_www/cordova.js')
    );

    const projectAppPath = path.join(projectPath, projectName);
    const cordovaLibPathSrc = path.join(ROOT, 'CordovaLib');
    const cordovaLibPathDest = path.join(projectPath, 'CordovaLib');

    // Make sure we are starting from scratch
    fs.removeSync(cordovaLibPathDest);

    if (use_shared) {
        // Symlink not used in project file, but is currently required for plugman because
        // it reads the VERSION file from it (instead of using the cordova/version script
        // like it should).
        fs.symlinkSync(cordovaLibPathSrc, cordovaLibPathDest);
    } else {
        for (const p of ['include', 'Classes', 'VERSION', 'CordovaLib.xcodeproj/project.pbxproj']) {
            fs.copySync(path.join(cordovaLibPathSrc, p), path.join(cordovaLibPathDest, p));
        }
    }

    const projectXcodeProjPath = `${projectAppPath}.xcodeproj`;
    const cordovaLibXcodePath = path.join(
        (use_shared ? cordovaLibPathSrc : cordovaLibPathDest),
        'CordovaLib.xcodeproj'
    );
    updateCordovaSubproject(projectXcodeProjPath, cordovaLibXcodePath);
}

function copyScripts (projectPath) {
    const srcScriptsDir = path.join(ROOT, 'bin', 'templates', 'scripts', 'cordova');
    const destScriptsDir = path.join(projectPath, 'cordova');

    // Delete old scripts directory.
    fs.removeSync(destScriptsDir);

    // Copy in the new ones.
    fs.copySync(srcScriptsDir, destScriptsDir);

    const nodeModulesDir = path.join(ROOT, 'node_modules');
    if (fs.existsSync(nodeModulesDir)) fs.copySync(nodeModulesDir, path.join(destScriptsDir, 'node_modules'));
}

function copyTemplateFiles (project_template_dir, project_path) {
    fs.copySync(project_template_dir, project_path);

    // TODO: why two .gitignores?
    const r = path.join(project_path, '__PROJECT_NAME__');
    fs.moveSync(path.join(r, 'gitignore'), path.join(r, '.gitignore'));
    fs.copySync(path.join(r, '.gitignore'), path.join(project_path, '.gitignore'));
}

function expandTokens (project_path, project_name, package_name) {
    expandTokensInFileContents(project_path, project_name, package_name);
    expandTokensInFileNames(project_path, project_name);
}

function expandTokensInFileContents (project_path, project_name, package_name) {
    // Expand __PROJECT_ID__ token in file contents
    utils.replaceFileContents(path.join(project_path, '__PROJECT_NAME__.xcodeproj/project.pbxproj'), /__PROJECT_ID__/g, package_name);

    // Expand __PROJECT_NAME__ token in file contents
    for (const p of [
        'cordova/build-debug.xcconfig',
        'cordova/build-release.xcconfig',
        '__PROJECT_NAME__.xcworkspace/contents.xcworkspacedata',
        '__PROJECT_NAME__.xcworkspace/xcshareddata/xcschemes/__PROJECT_NAME__.xcscheme',
        '__PROJECT_NAME__.xcodeproj/project.pbxproj',
        '__PROJECT_NAME__/Classes/AppDelegate.h',
        '__PROJECT_NAME__/Classes/AppDelegate.m',
        '__PROJECT_NAME__/Classes/MainViewController.h',
        '__PROJECT_NAME__/Classes/MainViewController.m',
        '__PROJECT_NAME__/main.m',
        '__PROJECT_NAME__/__PROJECT_NAME__-Info.plist',
        '__PROJECT_NAME__/__PROJECT_NAME__-Prefix.pch'
    ]) {
        expandProjectNameInFileContents(path.join(project_path, p), project_name);
    }
}

function expandTokensInFileNames (project_path, project_name) {
    // Expand __PROJECT_NAME__ token in file & folder names
    for (const p of [
        '__PROJECT_NAME__.xcworkspace/xcshareddata/xcschemes/__PROJECT_NAME__.xcscheme',
        '__PROJECT_NAME__.xcworkspace',
        '__PROJECT_NAME__.xcodeproj',
        '__PROJECT_NAME__/__PROJECT_NAME__-Info.plist',
        '__PROJECT_NAME__/__PROJECT_NAME__-Prefix.pch',
        '__PROJECT_NAME__'
    ]) {
        expandProjectNameInBaseName(path.join(project_path, p), project_name);
    }
}

function expandProjectNameInBaseName (f, projectName) {
    const { dir, base } = path.parse(f);
    const newBase = base.replace('__PROJECT_NAME__', projectName);
    return fs.moveSync(f, path.join(dir, newBase));
}

function expandProjectNameInFileContents (f, projectName) {
    // https://issues.apache.org/jira/browse/CB-12402 - Encode XML characters properly
    const xmlExtensions = new Set(['.xcworkspacedata', '.xcscheme']);
    const escape = xmlExtensions.has(path.extname(f))
        ? xmlescape
        : s => s.replace(/&/g, '\\&');
    utils.replaceFileContents(f, /__PROJECT_NAME__/g, escape(projectName));
}

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
    const use_shared = !!opts.link;
    const project_template_dir = opts.customTemplate || path.join(ROOT, 'templates', 'project');

    // check that project path doesn't exist
    if (fs.existsSync(project_path)) {
        throw new CordovaError('Project already exists');
    }

    events.emit('log', 'Creating Cordova project for the iOS platform:');
    events.emit('log', `\tPath: ${path.relative(process.cwd(), project_path)}`);
    events.emit('log', `\tPackage: ${package_name}`);
    events.emit('log', `\tName: ${project_name}`);

    copyTemplateFiles(project_template_dir, project_path);

    copyScripts(project_path);

    expandTokens(project_path, project_name, package_name);

    copyJsAndCordovaLib(project_path, project_name, use_shared);

    events.emit('log', `iOS project created with ${pkg.name}@${pkg.version}`);
};

/**
 * Updates xcodeproj's Sub Projects
 *
 * @param {String} projectXcodePath Path to project's xcodeproj.
 *  E.g.
 *   - `/path/to/cordovaTest/platforms/ios/cordovaTest.xcodeproj`
 * @param {String} cordovaLibXcodePath path to CordovaLib's xcodeproj. (Note: may also be symlinked)
 *  E.g.
 *   - `/path/to/cordovaTest/platforms/ios/CordovaLib/CordovaLib.xcodeproj` (project's copy)
 *   - `/path/to/cordova-ios/CordovaLib/CordovaLib.xcodeproj` (resolved symlink, --link)
 */
function updateCordovaSubproject (projectXcodePath, cordovaLibXcodePath) {
    // absolute path to the project's `platforms/ios` directory
    const platformPath = path.dirname(projectXcodePath);
    // relative path to project's `CordovaLib/CordovaLib.xcodeproj`
    const cdvLibXcodePath = path.relative(platformPath, cordovaLibXcodePath);
    // absolute path to project's xcodeproj's 'project.pbxproj'
    const pbxprojPath = path.join(projectXcodePath, 'project.pbxproj');

    const line = utils.grep(
        pbxprojPath,
        /(.+CordovaLib.xcodeproj.+PBXFileReference.+wrapper.pb-project.+)(path = .+?;)(.*)(sourceTree.+;)(.+)/
    );

    if (!line) {
        throw new Error(`Entry not found in project file for sub-project: ${cdvLibXcodePath}`);
    }

    let newLine = line
        .replace(/path = .+?;/, `path = ${cdvLibXcodePath};`)
        .replace(/sourceTree.+?;/, 'sourceTree = "<group>";');

    if (!newLine.match('name')) {
        newLine = newLine.replace('path = ', 'name = CordovaLib.xcodeproj; path = ');
    }

    utils.replaceFileContents(pbxprojPath, line, newLine);
}
