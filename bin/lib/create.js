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

function updateSubprojectHelp () {
    console.log('Updates the subproject path of the CordovaLib entry to point to this script\'s version of Cordova.');
    console.log('Usage: CordovaVersion/bin/update_cordova_project path/to/your/app.xcodeproj [path/to/CordovaLib.xcodeproj]');
}

function copyJsAndCordovaLib (projectPath, projectName, use_shared, config) {
    fs.copySync(path.join(ROOT, 'CordovaLib', 'cordova.js'), path.join(projectPath, 'www/cordova.js'));
    fs.copySync(path.join(ROOT, 'cordova-js-src'), path.join(projectPath, 'platform_www/cordova-js-src'));
    fs.copySync(path.join(ROOT, 'CordovaLib', 'cordova.js'), path.join(projectPath, 'platform_www/cordova.js'));

    /*
     * Check if "CordovaLib" already exists with "fs.lstatSync" and remove it.
     * Wrapped with try/catch because lstatSync will throw an error if "CordovaLib"
     * is missing.
     */
    try {
        const stats = fs.lstatSync(path.join(projectPath, 'CordovaLib'));
        if (stats.isSymbolicLink()) {
            fs.unlinkSync(path.join(projectPath, 'CordovaLib'));
        } else {
            fs.removeSync(path.join(projectPath, 'CordovaLib'));
        }
    } catch (e) { }
    if (use_shared) {
        update_cordova_subproject([path.join(projectPath, `${projectName}.xcodeproj`, 'project.pbxproj'), config]);
        // Symlink not used in project file, but is currently required for plugman because
        // it reads the VERSION file from it (instead of using the cordova/version script
        // like it should).
        fs.symlinkSync(path.join(ROOT, 'CordovaLib'), path.join(projectPath, 'CordovaLib'));
    } else {
        const r = path.join(projectPath, projectName);
        fs.ensureDirSync(path.join(projectPath, 'CordovaLib', 'CordovaLib.xcodeproj'));
        fs.copySync(path.join(r, '.gitignore'), path.join(projectPath, '.gitignore'));
        fs.copySync(path.join(ROOT, 'CordovaLib', 'Classes'), path.join(projectPath, 'CordovaLib/Classes'));
        fs.copySync(path.join(ROOT, 'CordovaLib', 'VERSION'), path.join(projectPath, 'CordovaLib/VERSION'));
        fs.copySync(path.join(ROOT, 'CordovaLib', 'cordova.js'), path.join(projectPath, 'CordovaLib/cordova.js'));
        fs.copySync(path.join(ROOT, 'CordovaLib', 'CordovaLib_Prefix.pch'), path.join(projectPath, 'CordovaLib/CordovaLib_Prefix.pch'));
        fs.copySync(path.join(ROOT, 'CordovaLib', 'CordovaLib.xcodeproj', 'project.pbxproj'), path.join(projectPath, 'CordovaLib', 'CordovaLib.xcodeproj', 'project.pbxproj'));
        update_cordova_subproject([path.join(`${r}.xcodeproj`, 'project.pbxproj'), path.join(projectPath, 'CordovaLib', 'CordovaLib.xcodeproj', 'project.pbxproj'), config]);
    }
}

function copyScripts (projectPath, projectName) {
    const srcScriptsDir = path.join(ROOT, 'bin', 'templates', 'scripts', 'cordova');
    const destScriptsDir = path.join(projectPath, 'cordova');

    // Delete old scripts directory.
    fs.removeSync(destScriptsDir);

    // Copy in the new ones.
    const binDir = path.join(ROOT, 'bin');
    fs.copySync(srcScriptsDir, destScriptsDir);

    const nodeModulesDir = path.join(ROOT, 'node_modules');
    if (fs.existsSync(nodeModulesDir)) fs.copySync(nodeModulesDir, path.join(destScriptsDir, 'node_modules'));

    // Copy the check_reqs script
    fs.copySync(path.join(binDir, 'check_reqs'), path.join(destScriptsDir, 'check_reqs'));
    fs.copySync(path.join(binDir, 'check_reqs.bat'), path.join(destScriptsDir, 'check_reqs.bat'));

    // Copy the version scripts
    fs.copySync(path.join(binDir, 'apple_ios_version'), path.join(destScriptsDir, 'apple_ios_version'));
    fs.copySync(path.join(binDir, 'apple_osx_version'), path.join(destScriptsDir, 'apple_osx_version'));
    fs.copySync(path.join(binDir, 'apple_xcode_version'), path.join(destScriptsDir, 'apple_xcode_version'));

    // TODO: the two files being edited on-the-fly here are shared between
    // platform and project-level commands. the below `sed` is updating the
    // `require` path for the two libraries. if there's a better way to share
    // modules across both the repo and generated projects, we should make sure
    // to remove/update this.
    const path_regex = /templates\/scripts\/cordova\//;
    utils.replaceFileContents(path.join(destScriptsDir, 'check_reqs'), path_regex, '');
    utils.replaceFileContents(path.join(destScriptsDir, 'apple_ios_version'), path_regex, '');
    utils.replaceFileContents(path.join(destScriptsDir, 'apple_osx_version'), path_regex, '');
    utils.replaceFileContents(path.join(destScriptsDir, 'apple_xcode_version'), path_regex, '');

    // CB-11792 do a token replace for __PROJECT_NAME__ in .xcconfig
    const project_name_esc = projectName.replace(/&/g, '\\&');
    utils.replaceFileContents(path.join(destScriptsDir, 'build-debug.xcconfig'), /__PROJECT_NAME__/g, project_name_esc);
    utils.replaceFileContents(path.join(destScriptsDir, 'build-release.xcconfig'), /__PROJECT_NAME__/g, project_name_esc);
}

/*
 * Copy project template files into cordova project.
 *
 * @param {String} project_path         path to cordova project
 * @param {String} project_name         name of cordova project
 * @param {String} project_template_dir path to cordova-ios template directory
 * @parm  {BOOL}   use_cli              true if cli project
 */
function copyTemplateFiles (project_path, project_name, project_template_dir, package_name) {
    const r = path.join(project_path, project_name);

    fs.removeSync(path.join(`${r}.xcodeproj`));
    fs.copySync(path.join(project_template_dir, '__TEMP__.xcodeproj'), path.join(`${project_path}/__TEMP__.xcodeproj`));
    fs.moveSync(path.join(project_path, '__TEMP__.xcodeproj'), path.join(`${r}.xcodeproj`));

    fs.removeSync(path.join(project_path, `${project_name}.xcworkspace`));
    fs.copySync(path.join(project_template_dir, '__TEMP__.xcworkspace'), path.join(`${project_path}/__TEMP__.xcworkspace`));
    fs.moveSync(path.join(project_path, '__TEMP__.xcworkspace'), path.join(`${r}.xcworkspace`));
    fs.moveSync(path.join(`${r}.xcworkspace`, 'xcshareddata', 'xcschemes', '__PROJECT_NAME__.xcscheme'), path.join(`${r}.xcworkspace`, 'xcshareddata', 'xcschemes', `${project_name}.xcscheme`));

    fs.removeSync(r);
    fs.copySync(path.join(project_template_dir, '__PROJECT_NAME__'), path.join(`${project_path}/__PROJECT_NAME__`));
    fs.moveSync(path.join(project_path, '__PROJECT_NAME__'), r);

    fs.moveSync(path.join(r, '__PROJECT_NAME__-Info.plist'), path.join(r, `${project_name}-Info.plist`));
    fs.moveSync(path.join(r, '__PROJECT_NAME__-Prefix.pch'), path.join(r, `${project_name}-Prefix.pch`));
    fs.moveSync(path.join(r, 'gitignore'), path.join(r, '.gitignore'));

    /* replace __PROJECT_NAME__ and __PROJECT_ID__ with ACTIVITY and ID strings, respectively, in:
     *
     * - ./__PROJECT_NAME__.xcodeproj/project.pbxproj
     * - ./__PROJECT_NAME__/Classes/AppDelegate.h
     * - ./__PROJECT_NAME__/Classes/AppDelegate.m
     * - ./__PROJECT_NAME__/Classes/MainViewController.h
     * - ./__PROJECT_NAME__/Classes/MainViewController.m
     * - ./__PROJECT_NAME__/Resources/main.m
     * - ./__PROJECT_NAME__/Resources/__PROJECT_NAME__-info.plist
     * - ./__PROJECT_NAME__/Resources/__PROJECT_NAME__-Prefix.plist
     */

    // https://issues.apache.org/jira/browse/CB-12402 - Encode XML characters properly
    const project_name_xml_esc = xmlescape(project_name);
    utils.replaceFileContents(path.join(`${r}.xcworkspace`, 'contents.xcworkspacedata'), /__PROJECT_NAME__/g, project_name_xml_esc);
    utils.replaceFileContents(path.join(`${r}.xcworkspace`, 'xcshareddata', 'xcschemes', `${project_name}.xcscheme`), /__PROJECT_NAME__/g, project_name_xml_esc);

    const project_name_esc = project_name.replace(/&/g, '\\&');
    utils.replaceFileContents(path.join(`${r}.xcodeproj`, 'project.pbxproj'), /__PROJECT_NAME__/g, project_name_esc);
    utils.replaceFileContents(path.join(`${r}.xcodeproj`, 'project.pbxproj'), /__PROJECT_ID__/g, package_name);
    utils.replaceFileContents(path.join(r, 'Classes', 'AppDelegate.h'), /__PROJECT_NAME__/g, project_name_esc);
    utils.replaceFileContents(path.join(r, 'Classes', 'AppDelegate.m'), /__PROJECT_NAME__/g, project_name_esc);
    utils.replaceFileContents(path.join(r, 'Classes', 'MainViewController.h'), /__PROJECT_NAME__/g, project_name_esc);
    utils.replaceFileContents(path.join(r, 'Classes', 'MainViewController.m'), /__PROJECT_NAME__/g, project_name_esc);
    utils.replaceFileContents(path.join(r, 'main.m'), /__PROJECT_NAME__/g, project_name_esc);
    utils.replaceFileContents(path.join(r, `${project_name}-Info.plist`), /__PROJECT_NAME__/g, project_name_esc);
    utils.replaceFileContents(path.join(r, `${project_name}-Prefix.pch`), /__PROJECT_NAME__/g, project_name_esc);
}

function AbsParentPath (_path) {
    return path.resolve(path.dirname(_path));
}

function AbsProjectPath (relative_path) {
    let absolute_path = path.resolve(relative_path);
    if (/.pbxproj$/.test(absolute_path)) {
        absolute_path = AbsParentPath(absolute_path);
    } else if (!(/.xcodeproj$/.test(absolute_path))) {
        throw new Error(`The following is not a valid path to an Xcode project: ${absolute_path}`);
    }
    return absolute_path;
}

function relpath (_path, start) {
    start = start || process.cwd();
    return path.relative(path.resolve(start), path.resolve(_path));
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

    // Copy project template files
    copyTemplateFiles(project_path, project_name, project_template_dir, package_name);

    // Copy xcconfig files
    fs.copySync(path.join(project_template_dir, 'pods-debug.xcconfig'), path.join(project_path, 'pods-debug.xcconfig'));
    fs.copySync(path.join(project_template_dir, 'pods-release.xcconfig'), path.join(project_path, 'pods-release.xcconfig'));

    // CordovaLib stuff
    copyJsAndCordovaLib(project_path, project_name, use_shared, config);
    copyScripts(project_path, project_name);

    events.emit('log', generateDoneMessage('create', use_shared));
    return Promise.resolve();
};

exports.updateProject = (projectPath, opts) => {
    const errorString =
    'An in-place platform update is not supported. \n' +
    'The `platforms` folder is always treated as a build artifact.\n' +
    'To update your platform, you have to remove, then add your ios platform again.\n' +
    'Make sure you save your plugins beforehand using `cordova plugin save`, and save a copy of the platform first if you had manual changes in it.\n' +
    '\tcordova plugin save\n' +
    '\tcordova platform rm ios\n' +
    '\tcordova platform add ios\n';

    return Promise.reject(new CordovaError(errorString));
};

function generateDoneMessage (type, link) {
    const pkg = require('../../package');
    let msg = `iOS project ${type === 'update' ? 'updated' : 'created'} with ${pkg.name}@${pkg.version}`;
    if (link) {
        msg += ' and has a linked CordovaLib';
    }
    return msg;
}

function update_cordova_subproject (argv) {
    if (argv.length < 1 || argv.length > 3) {
        updateSubprojectHelp();
        throw new Error('Usage error for update_cordova_subproject');
    }

    const projectPath = AbsProjectPath(argv[0]);
    let cordovaLibXcodePath;
    if (argv.length < 3) {
        cordovaLibXcodePath = path.join(ROOT, 'CordovaLib', 'CordovaLib.xcodeproj');
    } else {
        cordovaLibXcodePath = AbsProjectPath(argv[1]);
    }

    const parentProjectPath = AbsParentPath(projectPath);
    const subprojectPath = relpath(cordovaLibXcodePath, parentProjectPath);
    const projectPbxprojPath = path.join(projectPath, 'project.pbxproj');
    const line = utils.grep(
        projectPbxprojPath,
        /(.+CordovaLib.xcodeproj.+PBXFileReference.+wrapper.pb-project.+)(path = .+?;)(.*)(sourceTree.+;)(.+)/
    );

    if (!line) {
        throw new Error(`Entry not found in project file for sub-project: ${subprojectPath}`);
    }

    let newLine = line
        .replace(/path = .+?;/, `path = ${subprojectPath};`)
        .replace(/sourceTree.+?;/, 'sourceTree = \"<group>\";'); /* eslint no-useless-escape : 0 */

    if (!newLine.match('name')) {
        newLine = newLine.replace('path = ', 'name = CordovaLib.xcodeproj; path = ');
    }

    utils.replaceFileContents(projectPbxprojPath, line, newLine);
}

exports.updateSubprojectHelp = updateSubprojectHelp;
exports.update_cordova_subproject = update_cordova_subproject;
