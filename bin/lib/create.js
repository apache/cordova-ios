#!/usr/bin/env node

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

var shell = require('shelljs'),
    Q = require ('q'),
    path = require('path'),
    fs = require('fs'),
    root = path.join(__dirname, '..', '..');

function createHelp() {
    console.log("Usage: $0 [--shared] [--cli] <path_to_new_project> <package_name> <project_name> [<project_template_dir>]");
    console.log("   --shared (optional): Link directly against the shared copy of the CordovaLib instead of a copy of it.");
    console.log("   --cli (optional): Use the CLI-project template.");
    console.log("   <path_to_new_project>: Path to your new Cordova iOS project");
    console.log("   <package_name>: Package name, following reverse-domain style convention");
    console.log("   <project_name>: Project name");
    console.log("   <project_template_dir>: Path to project template (override).");
}

function updateSubprojectHelp() {
    console.log('Updates the subproject path of the CordovaLib entry to point to this script\'s version of Cordova.')
    console.log("Usage: CordovaVersion/bin/update_cordova_project path/to/your/app.xcodeproj [path/to/CordovaLib.xcodeproj]");
}

function AbsParentPath(_path) {
    return path.resolve(path.dirname(_path));
}

function AbsProjectPath(relative_path) {
    var absolute_path = path.resolve(relative_path);
    if (/.pbxproj$/.test(absolute_path)) {
        absolute_path = AbsParentPath(absolute_path);
    }
    else if (!(/.xcodeproj$/.test(absolute_path))) {
        throw new Error('The following is not a valid path to an Xcode project' + absolute_path);
    }
    return absolute_path;
}

function relpath(_path, start) {
    start = start || process.cwd();
    return path.relative(path.resolve(start), path.resolve(_path));
}

/*
 * Creates a new iOS project with the following options:
 *
 * - --shared (optional): Link directly against the shared copy of the CordovaLib instead of a copy of it
 * - --cli (optional): Use the CLI-project template
 * - <path_to_new_project>: Path to your new Cordova iOS project
 * - <package_name>: Package name, following reverse-domain style convention
 * - <project_name>: Project name
 * - <project_template_dir>: Path to a project template (override)
 *
 */

exports.createProject = function(argv) {
    var project_path,
        package_name,
        project_name,
        project_template_dir,
        use_shared = false,
        use_cli = false;

    //get arguments
    var args = argv.slice(2);

    //check and set arguments
    if (args.length < 3)
    {
        createHelp();
        return Q.reject('Too few arguments');
    }

    for (var i = 0; i < args.length; i++) {
        if (args[i] === '--shared')
            use_shared = true;
        else if (args[i] === '--cli')
            use_cli = true;
        else
        {
            if (!project_path)
                project_path = args[i];
            else if (!package_name)
                package_name = args[i];
            else if (!project_name)
                project_name = args[i];
            else if (!project_template_dir)
                project_template_dir = args[i];
            else
            {
                createHelp();
                return Q.reject('Too many arguments');
            }
        }
    }

    var bin_dir = path.join(root, 'bin'),
        cordovalib_dir = path.join(root, 'CordovaLib'),
        cordovalib_ver = fs.readFileSync(path.join(cordovalib_dir, 'VERSION'), 'utf-8').trim();
        project_parent = path.dirname(project_path),
        project_template_dir = project_template_dir ? project_template_dir : path.join(bin_dir, 'templates', 'project'),
        script_template_dir = path.join(bin_dir, 'templates', 'scripts');

    //check that project path doesn't exist
    if (fs.existsSync(project_path)) {
        return Q.reject('Project already exists');
    }

    //check that parent directory does exist so cp -r will not fail
    if (!fs.existsSync(project_parent)) {
        return Q.reject(project_parent + ' does not exist. Please specify an existing parent folder');
    }

    //create the project directory and copy over files
    shell.mkdir('-p', project_path);
    shell.cp('-rf', path.join(project_template_dir, 'www'), project_path);
    shell.cp('-f', path.join(cordovalib_dir, 'cordova.js'), path.join(project_path, 'www', 'cordova.js'));
    if (use_cli) {
        shell.cp('-rf', path.join(project_template_dir, '__CLI__.xcodeproj'), project_path);
        shell.mv(path.join(project_path, '__CLI__.xcodeproj'), path.join(project_path, project_name+'.xcodeproj'));
    }
    else {
        shell.cp('-rf', path.join(project_template_dir, '__NON-CLI__.xcodeproj'), project_path);
        shell.mv(path.join(project_path, '__NON-CLI__.xcodeproj'), path.join(project_path, project_name+'.xcodeproj'));
    }
    shell.cp('-rf', path.join(project_template_dir, '__PROJECT_NAME__'), project_path);
    shell.mv(path.join(project_path, '__PROJECT_NAME__'), path.join(project_path, project_name));

    var r = path.join(project_path, project_name);
    shell.mv(path.join(r, '__PROJECT_NAME__-Info.plist'), path.join(r, project_name+'-Info.plist'));
    shell.mv(path.join(r, '__PROJECT_NAME__-Prefix.pch'), path.join(r, project_name+'-Prefix.pch'));
    shell.mv(path.join(r, 'gitignore'), path.join(r, '.gitignore'));

    /*replace __PROJECT_NAME__ and --ID-- with ACTIVITY and ID strings, respectively, in:
     *
     * - ./__PROJECT_NAME__.xcodeproj/project.pbxproj
     * - ./__PROJECT_NAME__/Classes/AppDelegate.h
     * - ./__PROJECT_NAME__/Classes/AppDelegate.m
     * - ./__PROJECT_NAME__/Resources/main.m
     * - ./__PROJECT_NAME__/Resources/__PROJECT_NAME__-info.plist
     * - ./__PROJECT_NAME__/Resources/__PROJECT_NAME__-Prefix.plist
     */
    var project_name_esc = project_name.replace(/&/g, '\\&');
    shell.sed('-i', /__PROJECT_NAME__/g, project_name_esc, path.join(r+'.xcodeproj', 'project.pbxproj'));
    shell.sed('-i', /__PROJECT_NAME__/g, project_name_esc, path.join(r, 'Classes', 'AppDelegate.h'));
    shell.sed('-i', /__PROJECT_NAME__/g, project_name_esc, path.join(r, 'Classes', 'AppDelegate.m'));
    shell.sed('-i', /__PROJECT_NAME__/g, project_name_esc, path.join(r, 'Classes', 'MainViewController.h'));
    shell.sed('-i', /__PROJECT_NAME__/g, project_name_esc, path.join(r, 'Classes', 'MainViewController.m'));
    shell.sed('-i', /__PROJECT_NAME__/g, project_name_esc, path.join(r, 'main.m'));
    shell.sed('-i', /__PROJECT_NAME__/g, project_name_esc, path.join(r, project_name+'-Info.plist'));
    shell.sed('-i', /__PROJECT_NAME__/g, project_name_esc, path.join(r, project_name+'-Prefix.pch'));
    shell.sed('-i', /--ID--/g, package_name, path.join(r, project_name+'-Info.plist'));

    //CordovaLib stuff
    if (use_shared) {
        update_cordova_subproject([path.join(r+'.xcodeproj', 'project.pbxproj')]);
    }
    else {
        //copy in the CordovaLib directory
        shell.mkdir('-p', path.join(project_path, 'CordovaLib', 'CordovaLib.xcodeproj'));
        shell.cp('-f', path.join(r, '.gitignore'), project_path);
        shell.cp('-rf', path.join(bin_dir, '..', 'CordovaLib', 'Classes'), path.join(project_path, 'CordovaLib'));
        shell.cp('-f', path.join(bin_dir, '..', 'CordovaLib', 'VERSION'), path.join(project_path, 'CordovaLib'));
        shell.cp('-f', path.join(bin_dir, '..', 'CordovaLib', 'cordova.js'), path.join(project_path, 'CordovaLib'));
        shell.cp('-f', path.join(bin_dir, '..', 'CordovaLib', 'CordovaLib_Prefix.pch'), path.join(project_path, 'CordovaLib'));
        shell.cp('-f', path.join(bin_dir, '..', 'CordovaLib', 'CordovaLib.xcodeproj', 'project.pbxproj'), path.join(project_path, 'CordovaLib', 'CordovaLib.xcodeproj'));
        update_cordova_subproject([path.join(r+'.xcodeproj', 'project.pbxproj'), path.join(project_path, 'CordovaLib', 'CordovaLib.xcodeproj', 'project.pbxproj')]);
    }

    //Finally copy the scripts
    shell.cp('-r', path.join(script_template_dir, '*'), project_path);
    shell.cp('-r', path.join(bin_dir, 'node_modules'), path.join(project_path, 'cordova'));

    //copy the check_reqs script
    shell.cp(path.join(bin_dir, 'check_reqs'), path.join(project_path, 'cordova'));

    //copy the version scripts script
    shell.cp(path.join(bin_dir, 'apple_ios_version'), path.join(project_path, 'cordova'));
    shell.cp(path.join(bin_dir, 'apple_osx_version'), path.join(project_path, 'cordova'));
    shell.cp(path.join(bin_dir, 'apple_xcode_version'), path.join(project_path, 'cordova'));
    shell.cp(path.join(bin_dir, 'lib', 'versions.js'), path.join(project_path, 'cordova', 'lib'));

    //Make scripts executable
    shell.find(path.join(project_path, 'cordova')).forEach(function(entry) {
        shell.chmod(755, entry);
    });

    return Q.resolve();
}


function update_cordova_subproject(argv) {
    if (argv.length < 1 || argv.length > 2)
    {
        updateSubprojectHelp();
        throw new Error('Usage error for update_cordova_subproject');
    }

    var projectPath = AbsProjectPath(argv[0]),
        cordovaLibXcodePath;
    if (argv.length < 2) {
        cordovaLibXcodePath = path.join(root, 'CordovaLib', 'CordovaLib.xcodeproj');
    }
    else {
        cordovaLibXcodePath = AbsProjectPath(argv[1]);
    }

    var parentProjectPath = AbsParentPath(projectPath),
        subprojectPath = relpath(cordovaLibXcodePath, parentProjectPath),
        REGEX = /(.+PBXFileReference.+wrapper.pb-project.+)(path = .+?;)(.*)(sourceTree.+;)(.+)/,
        newLine,
        lines = shell.grep('CordovaLib.xcodeproj', path.join(projectPath, 'project.pbxproj')),
        found = false;

    subprojectPath = subprojectPath.replace(/\\/g, '/');
    lines = lines.split('\n');
    for (var i = 0; i < lines.length; ++i) {
        if (lines[i].match(REGEX)) {
            found = true;
            newLine = lines[i].replace(/path = .+?;/, 'path = ' + subprojectPath + ';');
            newLine = newLine.replace(/sourceTree.+?;/, 'sourceTree = \"<group>\";');
            if (!newLine.match('name')) {
                newLine = newLine.replace('path = ', 'name = CordovaLib.xcodeproj; path = ');
            }
            shell.sed('-i', lines[i], newLine, path.join(projectPath, 'project.pbxproj'));
        }
    }

    if (!found) {
        throw new Error('Subproject: ' + subprojectPath + ' entry not found in project file');
    }
}

exports.createHelp = createHelp;
exports.updateSubprojectHelp = updateSubprojectHelp;
exports.update_cordova_subproject = update_cordova_subproject;
