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

const path = require('node:path');
const fs = require('node:fs');
const { ConfigParser, CordovaError, events, xmlHelpers } = require('cordova-common');
const xcode = require('xcode');
const pkg = require('../package');

const ROOT = path.join(__dirname, '..');

/**
 * Creates a new iOS project with the following options:
 *
 * @param {string} project_path Path to your new Cordova iOS project
 * @param {string} package_name Package name, following reverse-domain style convention
 * @param {string} project_name Project name
 * @param {{ link: boolean, customTemplate: string }} opts Project creation options
 * @param {ConfigParser} root_config The application config.xml
 * @returns {Promise<void>} resolves when the project has been created
 */
exports.createProject = async (project_path, package_name, project_name, opts, root_config) => {
    opts = opts || {};

    project_path = path.relative(process.cwd(), project_path);

    // Check if project already exists
    if (fs.existsSync(project_path)) {
        throw new CordovaError('Project already exists');
    }

    package_name = package_name || 'org.apache.cordova.hellocordova';
    project_name = project_name || 'Hello Cordova';

    events.emit('log', 'Creating Cordova project for the iOS platform:');
    events.emit('log', `\tPath: ${project_path}`);
    events.emit('log', `\tPackage: ${package_name}`);
    events.emit('log', `\tName: ${project_name}`);

    new ProjectCreator({
        project: {
            path: project_path,
            name: project_name,
            id: package_name
        },
        options: {
            templatePath: opts.customTemplate || path.join(ROOT, 'templates', 'project'),
            linkLib: !!opts.link,
            rootConfig: root_config
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
        this.provideBuildScripts();
        this.updateProjectSettings();
        this.updatePlatformConfigFile();
    }

    provideProjectTemplate () {
        fs.cpSync(this.options.templatePath, this.project.path, { recursive: true });

        // TODO: why two .gitignores?
        const r = this.projectPath('App');
        fs.renameSync(path.join(r, 'gitignore'), path.join(r, '.gitignore'));
        fs.cpSync(path.join(r, '.gitignore'), this.projectPath('.gitignore'));

        if (!this.options.linkLib) {
            // Copy CordovaLib into the packages folder
            fs.mkdirSync(this.projectPath('packages', 'cordova-ios'), { recursive: true });
            fs.cpSync(path.join(ROOT, 'CordovaLib'), this.projectPath('packages', 'cordova-ios', 'CordovaLib'), { recursive: true });
            fs.cpSync(path.join(ROOT, 'Package.swift'), this.projectPath('packages', 'cordova-ios', 'Package.swift'));
        }
    }

    provideCordovaJs () {
        fs.cpSync(
            this.projectPath('www', 'cordova.js'),
            this.projectPath('platform_www', 'cordova.js')
        );
    }

    provideBuildScripts () {
        const srcScriptsDir = path.join(ROOT, 'templates', 'cordova');
        const destScriptsDir = this.projectPath('cordova');
        fs.cpSync(srcScriptsDir, destScriptsDir, { recursive: true });
    }

    updatePlatformConfigFile () {
        const defaultXmlPath = this.projectPath('cordova', 'defaults.xml');
        const configXmlPath = this.projectPath('App', 'config.xml');

        fs.cpSync(defaultXmlPath, configXmlPath);

        const config = new ConfigParser(configXmlPath);
        const src = this.options.rootConfig.doc.getroot();
        xmlHelpers.mergeXml(src, config.doc.getroot(), 'ios', /* clobber= */true);
        config.write();
    }

    updateProjectSettings () {
        const projectPath = this.projectPath('App.xcodeproj', 'project.pbxproj');
        const xcodeproj = xcode.project(projectPath);
        xcodeproj.parseSync();

        xcodeproj.updateBuildProperty('PRODUCT_NAME', `"${this.project.name}"`, null, 'App');
        xcodeproj.updateBuildProperty('PRODUCT_BUNDLE_IDENTIFIER', `"${this.project.id}"`, null, 'App');

        const deploymentTarget = this.options.rootConfig.getPreference('deployment-target', 'ios');
        if (deploymentTarget) {
            xcodeproj.updateBuildProperty('IPHONEOS_DEPLOYMENT_TARGET', deploymentTarget);
        }

        // Update the CordovaLib Swift package reference path
        const pkgRefs = xcodeproj.hash.project.objects.XCLocalSwiftPackageReference;
        if (pkgRefs) {
            for (const [key, ref] of Object.entries(pkgRefs)) {
                /* istanbul ignore if */
                if (key.endsWith('_comment')) {
                    continue;
                }

                if (ref.relativePath?.match(/\/cordova-ios/)) {
                    let relPath = path.relative(this.project.path, this.projectPath('packages', 'cordova-ios'));

                    if (this.options.linkLib) {
                        // Point to CordovaLib in node_modules
                        relPath = path.relative(this.project.path, ROOT);
                    }

                    ref.relativePath = `"${relPath.replaceAll(path.sep, path.posix.sep)}"`;
                    break;
                }
            }
        }

        fs.writeFileSync(projectPath, xcodeproj.writeSync());
    }

    projectPath (...projectRelativePaths) {
        return path.join(this.project.path, ...projectRelativePaths);
    }
}
