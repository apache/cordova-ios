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

function copyJsAndCordovaLib (projectPath, projectName, use_shared) {
    fs.copySync(path.join(ROOT, 'CordovaLib', 'cordova.js'), path.join(projectPath, 'www/cordova.js'));
    fs.copySync(path.join(ROOT, 'cordova-js-src'), path.join(projectPath, 'platform_www/cordova-js-src'));
    fs.copySync(path.join(ROOT, 'CordovaLib', 'cordova.js'), path.join(projectPath, 'platform_www/cordova.js'));

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
        fs.copySync(path.join(projectAppPath, '.gitignore'), path.join(projectPath, '.gitignore'));

        for (const p of ['include', 'Classes', 'VERSION', 'cordova.js', 'CordovaLib.xcodeproj/project.pbxproj']) {
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

/**
 * Copy the templated Cordova Scripts to project's `platforms/ios/cordova` directory
 *
 * @todo during directory restructing, move the contents of `bin/templates/scripts/cordova`
 *   to `templates/cordova` and remove the old templated cordova scripts copy step.
 *
 * @param {String} projectPath path to the projects platform directory `platforms/ios`
 * @param {String} projectName name of the project
 */
function copyScripts (projectPath, projectName) {
    // Desitnation of project's Cordova scripts as `platforms/ios/cordova`
    const destScriptsDir = path.join(projectPath, 'cordova');
    // Remove the old scripts first.
    fs.removeSync(destScriptsDir);

    // Path of the old templated cordova scripts.
    const srcScriptsDir = path.join(ROOT, 'bin/templates/scripts/cordova');
    // Path of the new templated cordova scripts.
    const tplCordovaDir = path.join(ROOT, 'templates/cordova');
    // Copy templated Cordova scripts to desitnation
    fs.copySync(srcScriptsDir, destScriptsDir);
    fs.copySync(tplCordovaDir, destScriptsDir);

    // @todo remove this like after the scripts remain in `node_modules`
    const nodeModulesDir = path.join(ROOT, 'node_modules');
    if (fs.existsSync(nodeModulesDir)) fs.copySync(nodeModulesDir, path.join(destScriptsDir, 'node_modules'));

    // CB-11792 do a token replace for __PROJECT_NAME__ in .xcconfig
    const project_name_esc = projectName.replace(/&/g, '\\&');
    utils.replaceFileContents(path.join(destScriptsDir, 'build-debug.xcconfig'), /__PROJECT_NAME__/g, project_name_esc);
    utils.replaceFileContents(path.join(destScriptsDir, 'build-release.xcconfig'), /__PROJECT_NAME__/g, project_name_esc);
}

/**
 * Copies the native project template files into cordova project and renames internal files that
 * should contain the project name.
 *
 * Note: If the following directories exist, they will first be removed before  the new template
 * files over are copied over.
 * - `<Project Name>`
 * - `<Project Name>.xcodeproj`
 * - `<Project Name>.xcworkspace`
 *
 * @param {String} project_path path to cordova project
 * @param {String} project_name name of cordova project
 * @param {String} project_template_dir path to cordova-ios template directory
 * @parm  {String} package_name the project's Project ID
 */
function copyNativeTemplateFiles (project_path, project_name, project_template_dir, package_name) {
    // App Directory
    const srcProjectAppDir = path.join(project_template_dir, '__PROJECT_NAME__');
    const destProjectAppDir = path.join(project_path, project_name);
    fs.removeSync(destProjectAppDir);
    fs.copySync(srcProjectAppDir, destProjectAppDir);
    fs.moveSync(path.join(destProjectAppDir, '__PROJECT_NAME__-Info.plist'), path.join(destProjectAppDir, `${project_name}-Info.plist`));
    fs.moveSync(path.join(destProjectAppDir, '__PROJECT_NAME__-Prefix.pch'), path.join(destProjectAppDir, `${project_name}-Prefix.pch`));

    // xcodeproj Directory
    const srcProjectTmpDir = path.join(project_template_dir, '__TEMP__');
    const srcProjectXcodeDir = `${srcProjectTmpDir}.xcodeproj`;
    const destProjectXcodeDir = `${destProjectAppDir}.xcodeproj`;
    fs.removeSync(destProjectXcodeDir);
    fs.copySync(srcProjectXcodeDir, destProjectXcodeDir);

    // xcworkspace Directory
    const destProjectXcworkspaceDir = `${destProjectAppDir}.xcworkspace`;
    const srcProjectXcworkspaceDir = `${srcProjectTmpDir}.xcworkspace`;
    fs.removeSync(destProjectXcworkspaceDir);
    fs.copySync(srcProjectXcworkspaceDir, destProjectXcworkspaceDir);
    fs.moveSync(path.join(destProjectXcworkspaceDir, 'xcshareddata/xcschemes/__PROJECT_NAME__.xcscheme'), path.join(destProjectXcworkspaceDir, `xcshareddata/xcschemes/${project_name}.xcscheme`));

    // Replace in file __PROJECT_NAME__ and __PROJECT_ID__ with ACTIVITY and ID strings
    // https://issues.apache.org/jira/browse/CB-12402 - Encode XML characters properly
    const project_name_xml_esc = xmlescape(project_name);
    const projectPbxprojFilePath = path.join(destProjectXcodeDir, 'project.pbxproj');
    [
        path.join(destProjectXcworkspaceDir, 'contents.xcworkspacedata'),
        path.join(destProjectXcworkspaceDir, `xcshareddata/xcschemes/${project_name}.xcscheme`),
        projectPbxprojFilePath,
        path.join(destProjectAppDir, 'Classes/AppDelegate.h'),
        path.join(destProjectAppDir, 'Classes/AppDelegate.m'),
        path.join(destProjectAppDir, 'Classes/MainViewController.h'),
        path.join(destProjectAppDir, 'Classes/MainViewController.m'),
        path.join(destProjectAppDir, 'main.m'),
        path.join(destProjectAppDir, `${project_name}-Info.plist`),
        path.join(destProjectAppDir, `${project_name}-Prefix.pch`)
    ].forEach(file => {
        utils.replaceFileContents(file, /__PROJECT_NAME__/g, project_name_xml_esc);
    });

    // Run separately from the above replacements since it is only in one file.
    utils.replaceFileContents(projectPbxprojFilePath, /__PROJECT_ID__/g, package_name);

    // Rename gitignore as dot file
    fs.moveSync(path.join(destProjectAppDir, 'gitignore'), path.join(destProjectAppDir, '.gitignore'));
}

/*
 * Creates a new iOS project with the following options:
 *
 * - --link (optional): Link directly against the shared copy of the CordovaLib instead of a copy of it
 * - --cli (optional): Use the CLI-project template
 * - <path_to_new_project>: Path to your new Cordova iOS project
 * - <package_name>: Package name, following reverse-domain style convention
 * - <project_name>: Project name
 * - <project_template_dir>: Path to a project template (override)
 *
 */
exports.createProject = (project_path, package_name, project_name, opts, config) => {
    package_name = package_name || 'my.cordova.project';
    project_name = project_name || 'CordovaExample';
    const use_shared = !!opts.link;
    const bin_dir = path.join(ROOT, 'bin');
    const project_parent = path.dirname(project_path);
    const project_template_dir = opts.customTemplate || path.join(bin_dir, 'templates', 'project');

    // check that project path doesn't exist
    if (fs.existsSync(project_path)) {
        return Promise.reject(new CordovaError('Project already exists'));
    }

    // check that parent directory does exist so cp -r will not fail
    if (!fs.existsSync(project_parent)) {
        return Promise.reject(new CordovaError(`Parent directory "${project_parent}" of given project path does not exist`));
    }

    events.emit('log', 'Creating Cordova project for the iOS platform:');
    events.emit('log', `\tPath: ${path.relative(process.cwd(), project_path)}`);
    events.emit('log', `\tPackage: ${package_name}`);
    events.emit('log', `\tName: ${project_name}`);

    events.emit('verbose', `Copying iOS template project to ${project_path}`);

    // create the project directory and copy over files
    fs.ensureDirSync(project_path);
    fs.copySync(path.join(project_template_dir, 'www'), path.join(project_path, 'www'));

    // Copy native project template files
    copyNativeTemplateFiles(project_path, project_name, project_template_dir, package_name);

    // Copy xcconfig files
    fs.copySync(path.join(project_template_dir, 'pods-debug.xcconfig'), path.join(project_path, 'pods-debug.xcconfig'));
    fs.copySync(path.join(project_template_dir, 'pods-release.xcconfig'), path.join(project_path, 'pods-release.xcconfig'));

    // CordovaLib stuff
    copyJsAndCordovaLib(project_path, project_name, use_shared);
    copyScripts(project_path, project_name);

    events.emit('log', generateDoneMessage('create', use_shared));
    return Promise.resolve();
};

function generateDoneMessage (type, link) {
    const pkg = require('../../package');
    let msg = `iOS project ${type === 'update' ? 'updated' : 'created'} with ${pkg.name}@${pkg.version}`;
    if (link) {
        msg += ' and has a linked CordovaLib';
    }
    return msg;
}

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
    const subProjectPath = path.relative(platformPath, cordovaLibXcodePath);
    // absolute path to project's xcodeproj's 'project.pbxproj'
    const projectPbxprojPath = path.join(projectXcodePath, 'project.pbxproj');

    const line = utils.grep(
        projectPbxprojPath,
        /(.+CordovaLib.xcodeproj.+PBXFileReference.+wrapper.pb-project.+)(path = .+?;)(.*)(sourceTree.+;)(.+)/
    );

    if (!line) {
        throw new Error(`Entry not found in project file for sub-project: ${subProjectPath}`);
    }

    let newLine = line
        .replace(/path = .+?;/, `path = ${subProjectPath};`)
        .replace(/sourceTree.+?;/, 'sourceTree = \"<group>\";'); /* eslint no-useless-escape : 0 */

    if (!newLine.match('name')) {
        newLine = newLine.replace('path = ', 'name = CordovaLib.xcodeproj; path = ');
    }

    utils.replaceFileContents(projectPbxprojPath, line, newLine);
}
