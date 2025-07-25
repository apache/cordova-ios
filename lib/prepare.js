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
const plist = require('plist');
const et = require('elementtree');
const events = require('cordova-common').events;
const xmlHelpers = require('cordova-common').xmlHelpers;
const ConfigParser = require('cordova-common').ConfigParser;
const CordovaError = require('cordova-common').CordovaError;
const PlatformJson = require('cordova-common').PlatformJson;
const PlatformMunger = require('cordova-common').ConfigChanges.PlatformMunger;
const PluginInfoProvider = require('cordova-common').PluginInfoProvider;
const FileUpdater = require('cordova-common').FileUpdater;
const projectFile = require('./projectFile');
const Podfile = require('./Podfile').Podfile;
const check_reqs = require('./check_reqs');
const PlatformConfigParser = require('./PlatformConfigParser');
const versions = require('./versions');

// launch storyboard and related constants
const IMAGESET_COMPACT_SIZE_CLASS = 'compact';
const CDV_ANY_SIZE_CLASS = 'any';

const ASSUMED_XCODE_VERSION = '15.0.0';
function checkOrAssumeXcodeVersion () {
    if (process.platform === 'darwin') {
        return versions.get_apple_xcode_version();
    } else {
        return Promise.resolve(ASSUMED_XCODE_VERSION);
    }
}

module.exports.prepare = function (cordovaProject, options) {
    const platformJson = PlatformJson.load(this.locations.root, 'ios');
    const munger = new PlatformMunger('ios', this.locations.root, platformJson, new PluginInfoProvider());
    this._config = updateConfigFile(cordovaProject.projectConfig, munger, this.locations);

    const parser = new PlatformConfigParser(cordovaProject.projectConfig.path);
    try {
        const manifest = parser.getPrivacyManifest();
        overwritePrivacyManifest(manifest, this.locations);
    } catch (err) {
        return Promise.reject(new CordovaError(`Could not parse PrivacyManifest in config.xml: ${err}`));
    }

    // Update own www dir with project's www assets and plugins' assets and js-files
    return updateWww(cordovaProject, this.locations)
        // update project according to config.xml changes.
        .then(() => updateProject(this._config, this.locations))
        .then(() => updateIcons(cordovaProject, this.locations))
        .then(() => updateLaunchStoryboardImages(cordovaProject, this.locations))
        .then(() => updateBackgroundColor(cordovaProject, this.locations))
        .then(() => updateFileResources(cordovaProject, this.locations))
        .then(() => alertDeprecatedPreference(this._config))
        .then(() => {
            events.emit('verbose', 'Prepared iOS project successfully');
        });
};

module.exports.clean = function (options) {
    // A cordovaProject isn't passed into the clean() function, because it might have
    // been called from the platform shell script rather than the CLI. Check for the
    // noPrepare option passed in by the non-CLI clean script. If that's present, or if
    // there's no config.xml found at the project root, then don't clean prepared files.
    const projectRoot = path.resolve(this.root, '../..');
    const projectConfigFile = path.join(projectRoot, 'config.xml');
    if ((options && options.noPrepare) || !fs.existsSync(projectConfigFile) ||
            !fs.existsSync(this.locations.configXml)) {
        return Promise.resolve();
    }

    const projectConfig = new ConfigParser(this.locations.configXml);

    return Promise.resolve()
        .then(() => cleanWww(projectRoot, this.locations))
        .then(() => cleanIcons(projectRoot, projectConfig, this.locations))
        .then(() => cleanLaunchStoryboardImages(projectRoot, projectConfig, this.locations))
        .then(() => cleanBackgroundColor(projectRoot, projectConfig, this.locations))
        .then(() => cleanFileResources(projectRoot, projectConfig, this.locations));
};

/**
 * Overwrites the privacy manifest file with the provided manifest or sets the default manifest.
 * @param {ElementTree} manifest - The manifest to be written to the privacy manifest file.
 * @param {Object} locations - The locations object containing the path to the Xcode Cordova project.
 */
function overwritePrivacyManifest (manifest, locations) {
    const privacyManifestDest = path.join(locations.xcodeCordovaProj, 'PrivacyInfo.xcprivacy');
    if (manifest != null) {
        const XML_DECLARATION = '<?xml version="1.0" encoding="UTF-8"?>\n';
        const DOCTYPE = '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n';
        const plistElement = et.Element('plist');
        plistElement.set('version', '1.0');
        const dictElement = et.SubElement(plistElement, 'dict');
        manifest.getchildren().forEach((child) => {
            dictElement.append(child);
        });
        const etree = new et.ElementTree(plistElement);
        const xmlString = XML_DECLARATION + DOCTYPE + etree.write({ xml_declaration: false });
        fs.writeFileSync(privacyManifestDest, xmlString, 'utf-8');
        return;
    }
    // Set default privacy manifest
    const defaultPrivacyManifest = path.join(__dirname, '..', 'templates', 'project', 'App', 'PrivacyInfo.xcprivacy');
    const xmlString = fs.readFileSync(defaultPrivacyManifest, 'utf8');
    fs.writeFileSync(privacyManifestDest, xmlString, 'utf-8');
}

/**
 * Updates config files in project based on app's config.xml and config munge,
 *   generated by plugins.
 *
 * @param   {ConfigParser}   sourceConfig  A project's configuration that will
 *   be merged into platform's config.xml
 * @param   {ConfigChanges}  configMunger  An initialized ConfigChanges instance
 *   for this platform.
 * @param   {Object}         locations     A map of locations for this platform
 *
 * @return  {ConfigParser}                 An instance of ConfigParser, that
 *   represents current project's configuration. When returned, the
 *   configuration is already dumped to appropriate config.xml file.
 */
function updateConfigFile (sourceConfig, configMunger, locations) {
    events.emit('verbose', `Generating platform-specific config.xml from defaults for iOS at ${locations.configXml}`);

    // First cleanup current config and merge project's one into own
    // Overwrite platform config.xml with defaults.xml.
    fs.cpSync(locations.defaultConfigXml, locations.configXml);

    // Then apply config changes from global munge to all config files
    // in project (including project's config)
    configMunger.reapply_global_munge().save_all();

    events.emit('verbose', 'Merging project\'s config.xml into platform-specific iOS config.xml');
    // Merge changes from app's config.xml into platform's one
    const config = new ConfigParser(locations.configXml);
    xmlHelpers.mergeXml(sourceConfig.doc.getroot(),
        config.doc.getroot(), 'ios', /* clobber= */true);
    config.write();

    return config;
}

/**
 * Logs all file operations via the verbose event stream, indented.
 */
function logFileOp (message) {
    events.emit('verbose', `  ${message}`);
}

/**
 * Updates platform 'www' directory by replacing it with contents of
 *   'platform_www' and app www. Also copies project's overrides' folder into
 *   the platform 'www' folder
 *
 * @param   {Object}  cordovaProject   An object which describes cordova project.
 * @param   {boolean} destinations     An object that contains destinations
 *   paths for www files.
 */
function updateWww (cordovaProject, destinations) {
    const sourceDirs = [
        path.relative(cordovaProject.root, cordovaProject.locations.www),
        path.relative(cordovaProject.root, destinations.platformWww)
    ];

    // If project contains 'merges' for our platform, use them as another overrides
    const merges_path = path.join(cordovaProject.root, 'merges', 'ios');
    if (fs.existsSync(merges_path)) {
        events.emit('verbose', 'Found "merges/ios" folder. Copying its contents into the iOS project.');
        sourceDirs.push(path.join('merges', 'ios'));
    }

    const targetDir = path.relative(cordovaProject.root, destinations.www);
    events.emit(
        'verbose', `Merging and updating files from [${sourceDirs.join(', ')}] to ${targetDir}`);
    FileUpdater.mergeAndUpdateDir(
        sourceDirs, targetDir, { rootDir: cordovaProject.root }, logFileOp);

    return Promise.resolve();
}

/**
 * Cleans all files from the platform 'www' directory.
 */
function cleanWww (projectRoot, locations) {
    const targetDir = path.relative(projectRoot, locations.www);
    events.emit('verbose', `Cleaning ${targetDir}`);

    // No source paths are specified, so mergeAndUpdateDir() will clear the target directory.
    FileUpdater.mergeAndUpdateDir(
        [], targetDir, { rootDir: projectRoot, all: true }, logFileOp);
}

/**
 * Updates project structure and AndroidManifest according to project's configuration.
 *
 * @param   {ConfigParser}  platformConfig  A project's configuration that will
 *   be used to update project
 * @param   {Object}  locations       A map of locations for this platform (In/Out)
 */
function updateProject (platformConfig, locations) {
    const plistFile = path.join(locations.xcodeCordovaProj, 'App-Info.plist');
    const infoPlist = plist.parse(fs.readFileSync(plistFile, 'utf8'));

    if (platformConfig.getAttribute('defaultlocale')) {
        infoPlist.CFBundleDevelopmentRegion = platformConfig.getAttribute('defaultlocale');
    }

    // replace Info.plist ATS entries according to <access> and <allow-navigation> config.xml entries
    const ats = writeATSEntries(platformConfig);
    if (Object.keys(ats).length > 0) {
        infoPlist.NSAppTransportSecurity = ats;
    } else {
        delete infoPlist.NSAppTransportSecurity;
    }

    // Write out the plist file with the same formatting as Xcode does
    let info_contents = plist.build(infoPlist, { indent: '\t', offset: -1 });

    info_contents = info_contents.replace(/<string>[\s\r\n]*<\/string>/g, '<string></string>');
    fs.writeFileSync(plistFile, info_contents, 'utf-8');

    return handleBuildSettings(platformConfig, locations, infoPlist);
}

function handleOrientationSettings (platformConfig, project) {
    function setProp (name, value) {
        if (value) {
            project.xcode.updateBuildProperty(`INFOPLIST_KEY_${name}`, `"${value}"`, null, 'App');
        } else {
            project.xcode.updateBuildProperty(`INFOPLIST_KEY_${name}`, null, null, 'App');
        }
    }

    const kPort = 'UIInterfaceOrientationPortrait';
    const kPortU = 'UIInterfaceOrientationPortraitUpsideDown';
    const kLandL = 'UIInterfaceOrientationLandscapeLeft';
    const kLandR = 'UIInterfaceOrientationLandscapeRight';

    switch (getOrientationValue(platformConfig)) {
    case 'portrait':
        setProp('UIInterfaceOrientation', kPort);
        setProp('UISupportedInterfaceOrientations_iPhone', [kPort, kPortU].join(' '));
        setProp('UISupportedInterfaceOrientations_iPad', [kPort, kPortU].join(' '));
        break;
    case 'landscape':
        setProp('UIInterfaceOrientation', kLandL);
        setProp('UISupportedInterfaceOrientations_iPhone', [kLandL, kLandR].join(' '));
        setProp('UISupportedInterfaceOrientations_iPad', [kLandL, kLandR].join(' '));
        break;
    case 'all':
        // TODO: Should we default to portrait in this case or set it to null?
        setProp('UIInterfaceOrientation', kPort);
        setProp('UISupportedInterfaceOrientations_iPhone', [kPort, kPortU, kLandL, kLandR].join(' '));
        setProp('UISupportedInterfaceOrientations_iPad', [kPort, kPortU, kLandL, kLandR].join(' '));
        break;
    case 'default':
        setProp('UIInterfaceOrientation', null);
        setProp('UISupportedInterfaceOrientations_iPhone', [kPort, kLandL, kLandR].join(' '));
        setProp('UISupportedInterfaceOrientations_iPad', [kPort, kPortU, kLandL, kLandR].join(' '));
    }
}

function handleBuildSettings (platformConfig, locations, infoPlist) {
    let project;

    try {
        project = projectFile.parse(locations);
    } catch (err) {
        return Promise.reject(new CordovaError(`Could not parse ${locations.pbxproj}: ${err}`));
    }

    const pkg = platformConfig.getAttribute('ios-CFBundleIdentifier') || platformConfig.packageName();
    const name = platformConfig.name();
    const version = platformConfig.version();
    const displayName = platformConfig.shortName();
    const CFBundleVersion = platformConfig.getAttribute('ios-CFBundleVersion') || default_CFBundleVersion(version);

    events.emit('verbose', `Set PRODUCT_BUNDLE_IDENTIFIER to ${pkg}.`);
    project.xcode.updateBuildProperty('PRODUCT_BUNDLE_IDENTIFIER', `"${pkg}"`, null, 'App');

    events.emit('verbose', `Set PRODUCT_NAME to ${name}.`);
    project.xcode.updateBuildProperty('PRODUCT_NAME', `"${name}"`, null, 'App');

    events.emit('verbose', `Set MARKETING_VERSION to ${version}.`);
    project.xcode.updateBuildProperty('MARKETING_VERSION', version, null, 'App');

    events.emit('verbose', `Set CURRENT_PROJECT_VERSION to ${CFBundleVersion}.`);
    project.xcode.updateBuildProperty('CURRENT_PROJECT_VERSION', CFBundleVersion, null, 'App');

    if (displayName !== name) {
        events.emit('verbose', `Set INFOPLIST_KEY_CFBundleDisplayName to ${displayName}.`);
        project.xcode.updateBuildProperty('INFOPLIST_KEY_CFBundleDisplayName', `"${displayName}"`, null, 'App');
    } else {
        project.xcode.updateBuildProperty('INFOPLIST_KEY_CFBundleDisplayName', '"$(PRODUCT_NAME)"', null, 'App');
    }

    const targetDevice = parseTargetDevicePreference(platformConfig.getPreference('target-device', 'ios'));
    if (targetDevice) {
        events.emit('verbose', `Set TARGETED_DEVICE_FAMILY to ${targetDevice}.`);
        project.xcode.updateBuildProperty('TARGETED_DEVICE_FAMILY', targetDevice);
    }

    const deploymentTarget = platformConfig.getPreference('deployment-target', 'ios');
    if (deploymentTarget) {
        events.emit('verbose', `Set IPHONEOS_DEPLOYMENT_TARGET to "${deploymentTarget}".`);
        project.xcode.updateBuildProperty('IPHONEOS_DEPLOYMENT_TARGET', deploymentTarget);
    }

    const swiftVersion = platformConfig.getPreference('SwiftVersion', 'ios');
    if (swiftVersion) {
        events.emit('verbose', `Set SwiftVersion to "${swiftVersion}".`);
        project.xcode.updateBuildProperty('SWIFT_VERSION', swiftVersion);
    }

    handleOrientationSettings(platformConfig, project);

    project.write();

    // If we have a Podfile, we want to update the deployment target there too
    const podPath = path.join(locations.root, Podfile.FILENAME);
    if (deploymentTarget && fs.existsSync(podPath)) {
        const project_name = locations.xcodeCordovaProj.split(path.sep).pop();

        const PodsJson = require('./PodsJson').PodsJson;
        const podsjsonFile = new PodsJson(path.join(locations.root, PodsJson.FILENAME));
        const podfileFile = new Podfile(podPath, project_name, deploymentTarget);
        podfileFile.write();

        events.emit('verbose', 'Running `pod install` (to install plugins)');
        projectFile.purgeProjectFileCache(locations.root);
        return podfileFile.install(check_reqs.check_cocoapods)
            .then(() => podsjsonFile.setSwiftVersionForCocoaPodsLibraries(locations.root));
    }

    return Promise.resolve();
}

function mapIconResources (icons, iconsDir, xcodeversion) {
    // Ref: https://developer.apple.com/design/human-interface-guidelines/app-icons
    // These are ordered according to how Xcode puts them in the Contents.json file
    const platformIcons = [
        // iOS fallback icon sizes
        { dest: 'icon-20@2x.png', width: 40, height: 40 },
        { dest: 'icon-20@3x.png', width: 60, height: 60 },
        { dest: 'icon-29@2x.png', width: 58, height: 58 },
        { dest: 'icon-29@3x.png', width: 87, height: 87 },
        { dest: 'icon-38@2x.png', width: 76, height: 76 },
        { dest: 'icon-38@3x.png', width: 114, height: 114 },
        { dest: 'icon-40@2x.png', width: 80, height: 80, target: 'spotlight' },
        { dest: 'icon-40@3x.png', width: 120, height: 120, target: 'spotlight' },
        { dest: 'icon-60@2x.png', width: 120, height: 120 },
        { dest: 'icon-60@3x.png', width: 180, height: 180 },
        { dest: 'icon-64@2x.png', width: 128, height: 128 },
        { dest: 'icon-64@3x.png', width: 192, height: 192 },
        { dest: 'icon-68@2x.png', width: 136, height: 136 },
        { dest: 'icon-76@2x.png', width: 152, height: 152 },
        { dest: 'icon-83.5@2x.png', width: 167, height: 167 },

        // Default iOS icon
        { dest: 'icon.png', width: 1024, height: 1024, useDefault: true },

        // macOS icon sizes
        { dest: 'mac-16.png', width: 16, height: 16, target: 'mac' },
        { dest: 'mac-16@2x.png', width: 32, height: 32, target: 'mac' },
        { dest: 'mac-32.png', width: 32, height: 32, target: 'mac' },
        { dest: 'mac-32@2x.png', width: 64, height: 64, target: 'mac' },
        { dest: 'mac-128.png', width: 128, height: 128, target: 'mac' },
        { dest: 'mac-128@2x.png', width: 256, height: 256, target: 'mac' },
        { dest: 'mac-256.png', width: 256, height: 256, target: 'mac' },
        { dest: 'mac-256@2x.png', width: 512, height: 512, target: 'mac' },
        { dest: 'mac-512.png', width: 512, height: 512, target: 'mac' },
        { dest: 'mac-512@2x.png', width: 1024, height: 1024, target: 'mac' },

        // WatchOS fallback icon sizes
        { dest: 'watchos-22@2x.png', width: 44, height: 44, target: 'watchos' },
        { dest: 'watchos-24@2x.png', width: 48, height: 48, target: 'watchos' },
        { dest: 'watchos-27.5@2x.png', width: 55, height: 55, target: 'watchos' },
        { dest: 'watchos-29@2x.png', width: 58, height: 58, target: 'watchos' },
        { dest: 'watchos-30@2x.png', width: 60, height: 60, target: 'watchos' },
        { dest: 'watchos-32@2x.png', width: 64, height: 64, target: 'watchos' },
        { dest: 'watchos-33@2x.png', width: 66, height: 66, target: 'watchos' },
        { dest: 'watchos-40@2x.png', width: 80, height: 80, target: 'watchos' },
        { dest: 'watchos-43.5@2x.png', width: 87, height: 87, target: 'watchos' },
        { dest: 'watchos-44@2x.png', width: 88, height: 88, target: 'watchos' },
        { dest: 'watchos-46@2x.png', width: 92, height: 92, target: 'watchos' },
        { dest: 'watchos-50@2x.png', width: 100, height: 100, target: 'watchos' },
        { dest: 'watchos-51@2x.png', width: 102, height: 102, target: 'watchos' },
        { dest: 'watchos-54@2x.png', width: 108, height: 108, target: 'watchos' },
        { dest: 'watchos-86@2x.png', width: 172, height: 172, target: 'watchos' },
        { dest: 'watchos-98@2x.png', width: 196, height: 196, target: 'watchos' },
        { dest: 'watchos-108@2x.png', width: 216, height: 216, target: 'watchos' },
        { dest: 'watchos-117@2x.png', width: 234, height: 234, target: 'watchos' },
        { dest: 'watchos-129@2x.png', width: 258, height: 258, target: 'watchos' },

        // Allow customizing the watchOS icon with target="watchos"
        // This falls back to using the iOS app icon by default
        { dest: 'watchos.png', width: 1024, height: 1024, target: 'watchos', useDefault: true }
    ];

    const pathMap = {};

    // We can only support dark mode and tinted icons with Xcode 16
    const isAtLeastXcode16 = versions.compareVersions(xcodeversion, '16.0.0') >= 0;

    function getDefaultIconForTarget (target) {
        const def = icons.filter(res => !res.width && !res.height && !res.target).pop();

        if (target) {
            return icons
                .filter(res => res.target === target)
                .filter(res => !res.width && !res.height)
                .pop() || def;
        }

        return def;
    }

    function getIconBySizeAndTarget (width, height, target) {
        return icons
            .filter(res => res.target === target)
            .find(res =>
                (res.width || res.height) &&
                (!res.width || (width === res.width)) &&
                (!res.height || (height === res.height))
            ) || null;
    }

    platformIcons.forEach(item => {
        const dest = path.join(iconsDir, item.dest);
        let icon = getIconBySizeAndTarget(item.width, item.height, item.target);

        if (!icon && item.target === 'spotlight') {
            // Fall back to a non-targeted icon
            icon = getIconBySizeAndTarget(item.width, item.height);
        }

        if (!icon && item.useDefault) {
            if (item.target) {
                icon = getIconBySizeAndTarget(item.width, item.height);
            }

            const defaultIcon = getDefaultIconForTarget(item.target);
            if (!icon && defaultIcon) {
                icon = defaultIcon;
            }
        }

        if (icon) {
            if (icon.src) {
                pathMap[dest] = icon.src;
            }

            // Only iOS has dark/tinted icon variants
            if (isAtLeastXcode16 && (!item.target || item.target === 'spotlight')) {
                if (icon.foreground) {
                    pathMap[dest.replace('.png', '-dark.png')] = icon.foreground;
                }

                if (icon.monochrome) {
                    pathMap[dest.replace('.png', '-tinted.png')] = icon.monochrome;
                }
            }
        }
    });

    return pathMap;
}

function generateAppIconContentsJson (resourceMap) {
    const contentsJSON = {
        images: [],
        info: {
            author: 'xcode',
            version: 1
        }
    };

    Object.keys(resourceMap).forEach(res => {
        const [filename, platform, size, scale, variant] = path.basename(res).match(/([A-Za-z]+)(?:-([0-9.]+)(?:@([0-9.]x))?)?(?:-([a-z]+))?\.png/);

        const entry = {
            filename,
            idiom: 'universal',
            platform: (platform === 'icon') ? 'ios' : platform,
            size: `${size ?? 1024}x${size ?? 1024}`
        };

        if (scale) {
            entry.scale = scale;
        }

        if (variant) {
            entry.appearances = [
                {
                    appearance: 'luminosity',
                    value: variant
                }
            ];
        }

        contentsJSON.images.push(entry);
    });

    return contentsJSON;
}

function updateIcons (cordovaProject, locations) {
    const icons = cordovaProject.projectConfig.getIcons('ios');

    if (icons.length === 0) {
        events.emit('verbose', 'This app does not have icons defined');
        return Promise.resolve();
    }

    const platformProjDir = path.relative(cordovaProject.root, locations.xcodeCordovaProj);
    const iconsDir = path.join(platformProjDir, 'Assets.xcassets', 'AppIcon.appiconset');

    return checkOrAssumeXcodeVersion()
        .then((xcodeversion) => {
            const resourceMap = mapIconResources(icons, iconsDir, xcodeversion);
            events.emit('verbose', `Updating icons at ${iconsDir}`);
            FileUpdater.updatePaths(
                resourceMap, { rootDir: cordovaProject.root }, logFileOp);

            // Now we need to update the AppIcon.appiconset/Contents.json file
            const contentsJSON = generateAppIconContentsJson(resourceMap);

            events.emit('verbose', 'Updating App Icon image set contents.json');
            fs.writeFileSync(path.join(cordovaProject.root, iconsDir, 'Contents.json'), JSON.stringify(contentsJSON, null, 2));
        });
}

function cleanIcons (projectRoot, projectConfig, locations) {
    const icons = projectConfig.getIcons('ios');
    if (icons.length === 0) {
        return Promise.resolve();
    }

    const platformProjDir = path.relative(projectRoot, locations.xcodeCordovaProj);
    const iconsDir = path.join(platformProjDir, 'Assets.xcassets', 'AppIcon.appiconset');

    return checkOrAssumeXcodeVersion()
        .then((xcodeversion) => {
            const resourceMap = mapIconResources(icons, iconsDir, xcodeversion);
            Object.keys(resourceMap).forEach(targetIconPath => {
                resourceMap[targetIconPath] = null;
            });
            events.emit('verbose', `Cleaning icons at ${iconsDir}`);

            // Source paths are removed from the map, so updatePaths() will delete the target files.
            FileUpdater.updatePaths(
                resourceMap, { rootDir: projectRoot, all: true }, logFileOp);

            const contentsJSON = generateAppIconContentsJson(resourceMap);

            // delete filename from contents.json
            contentsJSON.images.forEach(image => {
                image.filename = undefined;
            });

            events.emit('verbose', 'Updating App Icon image set contents.json');
            fs.writeFileSync(path.join(projectRoot, iconsDir, 'Contents.json'), JSON.stringify(contentsJSON, null, 2));
        });
}

/**
 * Returns the directory for the BackgroundColor.colorset asset, or null if no
 * xcassets exist.
 *
 * @param  {string} projectRoot        The project's root directory
 * @param  {string} platformProjDir    The platform's project directory
 */
function getBackgroundColorDir (projectRoot, platformProjDir) {
    if (folderExists(path.join(projectRoot, platformProjDir, 'Assets.xcassets'))) {
        return path.join(platformProjDir, 'Assets.xcassets', 'BackgroundColor.colorset');
    } else {
        return null;
    }
}

/**
 * Returns the directory for the SplashScreenBackgroundColor.colorset asset, or
 * null if no xcassets exist.
 *
 * @param  {string} projectRoot        The project's root directory
 * @param  {string} platformProjDir    The platform's project directory
 */
function getSplashScreenBackgroundColorDir (projectRoot, platformProjDir) {
    if (folderExists(path.join(projectRoot, platformProjDir, 'Assets.xcassets/'))) {
        return path.join(platformProjDir, 'Assets.xcassets', 'SplashScreenBackgroundColor.colorset');
    } else {
        return null;
    }
}

/**
 * Returns the directory for the StatusBarBackgroundColor.colorset asset, or
 * null if no xcassets exist.
 *
 * @param  {string} projectRoot        The project's root directory
 * @param  {string} platformProjDir    The platform's project directory
 */
function getStatusBarBackgroundColorDir (projectRoot, platformProjDir) {
    if (folderExists(path.join(projectRoot, platformProjDir, 'Assets.xcassets/'))) {
        return path.join(platformProjDir, 'Assets.xcassets', 'StatusBarBackgroundColor.colorset');
    } else {
        return null;
    }
}

function colorPreferenceToComponents (pref) {
    if (!pref || !pref.match(/^(#[0-9A-Fa-f]{3}|(0x|#)([0-9A-Fa-f]{2})?[0-9A-Fa-f]{6})$/)) {
        return {
            platform: 'ios',
            reference: 'systemBackgroundColor'
        };
    }

    let red = 'FF';
    let green = 'FF';
    let blue = 'FF';
    let alpha = 1.0;

    if (pref[0] === '#' && pref.length === 4) {
        red = pref[1] + pref[1];
        green = pref[2] + pref[2];
        blue = pref[3] + pref[3];
    }

    if (pref.length >= 7 && (pref[0] === '#' || pref.substring(0, 2) === '0x')) {
        let offset = pref[0] === '#' ? 1 : 2;

        if (pref.substring(offset).length === 8) {
            alpha = parseInt(pref.substring(offset, offset + 2), 16) / 255.0;
            offset += 2;
        }

        red = pref.substring(offset, offset + 2);
        green = pref.substring(offset + 2, offset + 4);
        blue = pref.substring(offset + 4, offset + 6);
    }

    return {
        'color-space': 'srgb',
        components: {
            red: '0x' + red.toUpperCase(),
            green: '0x' + green.toUpperCase(),
            blue: '0x' + blue.toUpperCase(),
            alpha: alpha.toFixed(3)
        }
    };
}

/**
 * Update the background color Contents.json in xcassets.
 *
 * @param {Object} cordovaProject The cordova project
 * @param {Object} locations A dictionary containing useful location paths
 */
function updateBackgroundColor (cordovaProject, locations) {
    const platformProjDir = path.relative(cordovaProject.root, locations.xcodeCordovaProj);

    const pref = cordovaProject.projectConfig.getPreference('BackgroundColor', 'ios') || '';
    const splashPref = cordovaProject.projectConfig.getPreference('SplashScreenBackgroundColor', 'ios') || pref;
    const statusBarPref = cordovaProject.projectConfig.getPreference('StatusBarBackgroundColor', 'ios') || pref;

    const backgroundColorDir = getBackgroundColorDir(cordovaProject.root, platformProjDir);
    if (backgroundColorDir) {
        const contentsJSON = {
            colors: [{
                idiom: 'universal',
                color: colorPreferenceToComponents(pref)
            }],
            info: {
                author: 'Xcode',
                version: 1
            }
        };

        events.emit('verbose', 'Updating Background Color color set Contents.json');
        fs.writeFileSync(path.join(cordovaProject.root, backgroundColorDir, 'Contents.json'),
            JSON.stringify(contentsJSON, null, 2));
    }

    const splashBackgroundColorDir = getSplashScreenBackgroundColorDir(cordovaProject.root, platformProjDir);
    if (splashBackgroundColorDir) {
        const contentsJSON = {
            colors: [{
                idiom: 'universal',
                color: colorPreferenceToComponents(splashPref)
            }],
            info: {
                author: 'Xcode',
                version: 1
            }
        };

        events.emit('verbose', 'Updating Splash Screen Background Color color set Contents.json');
        fs.writeFileSync(path.join(cordovaProject.root, splashBackgroundColorDir, 'Contents.json'),
            JSON.stringify(contentsJSON, null, 2));
    }

    const statusBarBackgroundColorDir = getStatusBarBackgroundColorDir(cordovaProject.root, platformProjDir);
    if (statusBarBackgroundColorDir) {
        const contentsJSON = {
            colors: [{
                idiom: 'universal',
                color: colorPreferenceToComponents(statusBarPref)
            }],
            info: {
                author: 'Xcode',
                version: 1
            }
        };

        events.emit('verbose', 'Updating Status Bar Background Color color set Contents.json');
        fs.writeFileSync(path.join(cordovaProject.root, statusBarBackgroundColorDir, 'Contents.json'),
            JSON.stringify(contentsJSON, null, 2));
    }
}

/**
 * Resets the background color Contents.json in xcassets to default.
 *
 * @param {string} projectRoot Path to the project root
 * @param {Object} projectConfig The project's config.xml
 * @param {Object} locations A dictionary containing useful location paths
 */
function cleanBackgroundColor (projectRoot, projectConfig, locations) {
    const platformProjDir = path.relative(projectRoot, locations.xcodeCordovaProj);

    const contentsJSON = {
        colors: [{
            idiom: 'universal',
            color: colorPreferenceToComponents(null)
        }],
        info: {
            author: 'Xcode',
            version: 1
        }
    };

    const backgroundColorDir = getBackgroundColorDir(projectRoot, platformProjDir);
    if (backgroundColorDir) {
        events.emit('verbose', 'Cleaning Background Color color set Contents.json');
        fs.writeFileSync(path.join(projectRoot, backgroundColorDir, 'Contents.json'),
            JSON.stringify(contentsJSON, null, 2));
    }

    const splashBackgroundColorDir = getSplashScreenBackgroundColorDir(projectRoot, platformProjDir);
    if (splashBackgroundColorDir) {
        events.emit('verbose', 'Cleaning Splash Screen Background Color color set Contents.json');
        fs.writeFileSync(path.join(projectRoot, splashBackgroundColorDir, 'Contents.json'),
            JSON.stringify(contentsJSON, null, 2));
    }

    const statusBarBackgroundColorDir = getStatusBarBackgroundColorDir(projectRoot, platformProjDir);
    if (statusBarBackgroundColorDir) {
        events.emit('verbose', 'Cleaning Status Bar Background Color color set Contents.json');
        fs.writeFileSync(path.join(projectRoot, statusBarBackgroundColorDir, 'Contents.json'),
            JSON.stringify(contentsJSON, null, 2));
    }
}

function updateFileResources (cordovaProject, locations) {
    const platformDir = path.relative(cordovaProject.root, locations.root);
    const files = cordovaProject.projectConfig.getFileResources('ios');

    const project = projectFile.parse(locations);

    // if there are resource-file elements in config.xml
    if (files.length === 0) {
        events.emit('verbose', 'This app does not have additional resource files defined');
        return;
    }

    const resourceMap = {};
    files.forEach(res => {
        const src = res.src;
        let target = res.target;

        if (!target) {
            target = src;
        }

        let targetPath = path.join(project.resources_dir, target);
        targetPath = path.relative(cordovaProject.root, targetPath);

        if (!fs.existsSync(targetPath)) {
            project.xcode.addResourceFile(target);
        } else {
            events.emit('warn', `Overwriting existing resource file at ${targetPath}`);
        }

        resourceMap[targetPath] = src;
    });

    events.emit('verbose', `Updating resource files at ${platformDir}`);
    FileUpdater.updatePaths(
        resourceMap, { rootDir: cordovaProject.root }, logFileOp);

    project.write();
}

function alertDeprecatedPreference (configParser) {
    const deprecatedToNewPreferences = {
        MediaPlaybackRequiresUserAction: {
            newPreference: 'MediaTypesRequiringUserActionForPlayback',
            isDeprecated: true
        },
        MediaPlaybackAllowsAirPlay: {
            newPreference: 'AllowsAirPlayForMediaPlayback',
            isDeprecated: false
        }
    };

    Object.keys(deprecatedToNewPreferences).forEach(oldKey => {
        if (configParser.getPreference(oldKey)) {
            const isDeprecated = deprecatedToNewPreferences[oldKey].isDeprecated;
            const verb = isDeprecated ? 'has been' : 'is being';
            const newPreferenceKey = deprecatedToNewPreferences[oldKey].newPreference;

            // Create the Log Message
            const log = [`The preference name "${oldKey}" ${verb} deprecated.`];
            if (newPreferenceKey) {
                log.push(`It is recommended to replace this preference with "${newPreferenceKey}."`);
            } else {
                log.push('There is no replacement for this preference.');
            }

            /**
             * If the preference has been deprecated, the usage of the old preference is no longer used.
             * Therefore, the following line is not appended. It is added only if the old preference is still used.
             * We are only keeping the top lines for deprecated items only for an additional major release when
             * the pre-warning was not provided in a past major release due to a necessary quick deprecation.
             * Typically caused by implementation nature or third-party requirement changes.
             */
            if (!isDeprecated) {
                log.push('Please note that this preference will be removed in the near future.');
            }

            events.emit('warn', log.join(' '));
        }
    });
}

function cleanFileResources (projectRoot, projectConfig, locations) {
    const platformDir = path.relative(projectRoot, locations.root);
    const files = projectConfig.getFileResources('ios', true);
    if (files.length > 0) {
        events.emit('verbose', `Cleaning resource files at ${platformDir}`);

        const project = projectFile.parse(locations);

        const resourceMap = {};
        files.forEach(res => {
            const src = res.src;
            let target = res.target;

            if (!target) {
                target = src;
            }

            let targetPath = path.join(project.resources_dir, target);
            targetPath = path.relative(projectRoot, targetPath);
            const resfile = path.join('Resources', path.basename(targetPath));
            project.xcode.removeResourceFile(resfile);

            resourceMap[targetPath] = null;
        });

        FileUpdater.updatePaths(
            resourceMap, { rootDir: projectRoot, all: true }, logFileOp);

        project.write();
    }
}

/**
 * Returns an array of images for each possible idiom, scale, and size class. The images themselves are
 * located in the platform's splash images by their pattern (@scale~idiom~sizesize). All possible
 * combinations are returned, but not all will have a `filename` property. If the latter isn't present,
 * the device won't attempt to load an image matching the same traits. If the filename is present,
 * the device will try to load the image if it corresponds to the traits.
 *
 * The resulting return looks like this:
 *
 *     [
 *         {
 *             idiom: 'universal|ipad|iphone',
 *             scale: '1x|2x|3x',
 *             width: 'any|com',
 *             height: 'any|com',
 *             filename: undefined|'Default@scale~idiom~widthheight.png',
 *             src: undefined|'path/to/original/matched/image/from/splash/screens.png',
 *             target: undefined|'path/to/asset/library/Default@scale~idiom~widthheight.png',
 *             appearence: undefined|'dark'|'light'
 *         }, ...
 *     ]
 *
 * @param  {Array<Object>} splashScreens         splash screens as defined in config.xml for this platform
 * @param  {string} launchStoryboardImagesDir    project-root/Assets.xcassets/LaunchStoryboard.imageset/
 * @return {Array<Object>}
 */
function mapLaunchStoryboardContents (splashScreens, launchStoryboardImagesDir) {
    const platformLaunchStoryboardImages = [];
    const idioms = ['universal', 'ipad', 'iphone'];
    const scalesForIdiom = {
        universal: ['1x', '2x', '3x'],
        ipad: ['1x', '2x'],
        iphone: ['1x', '2x', '3x']
    };
    const sizes = ['com', 'any'];
    const appearences = ['', 'dark', 'light'];

    idioms.forEach(idiom => {
        scalesForIdiom[idiom].forEach(scale => {
            sizes.forEach(width => {
                sizes.forEach(height => {
                    appearences.forEach(appearence => {
                        const item = { idiom, scale, width, height };

                        if (appearence !== '') {
                            item.appearence = appearence;
                        }

                        /* examples of the search pattern:
                         *    scale   ~  idiom    ~   width    height ~ appearence
                         *     @2x    ~ universal ~    any      any
                         *     @3x    ~  iphone   ~    com      any   ~   dark
                         *     @2x    ~   ipad    ~    com      any   ~   light
                         */
                        const searchPattern = '@' + scale + '~' + idiom + '~' + width + height + (appearence ? '~' + appearence : '');

                        /* because old node versions don't have Array.find, the below is
                         * functionally equivalent to this:
                         *     var launchStoryboardImage = splashScreens.find(function(item) {
                         *         return (item.src.indexOf(searchPattern) >= 0) ? (appearence !== '' ? true : ((item.src.indexOf(searchPattern + '~light') >= 0 || (item.src.indexOf(searchPattern + '~dark') >= 0)) ? false : true)) : false;
                         *     });
                         */
                        const launchStoryboardImage = splashScreens.reduce(
                            (p, c) => (c.src.indexOf(searchPattern) >= 0) ? (appearence !== '' ? c : ((c.src.indexOf(searchPattern + '~light') >= 0 || (c.src.indexOf(searchPattern + '~dark') >= 0)) ? p : c)) : p,
                            undefined
                        );

                        if (launchStoryboardImage) {
                            item.filename = `Default${searchPattern}.png`;
                            item.src = launchStoryboardImage.src;
                            item.target = path.join(launchStoryboardImagesDir, item.filename);
                        }

                        platformLaunchStoryboardImages.push(item);
                    });
                });
            });
        });
    });
    return platformLaunchStoryboardImages;
}

/**
 * Returns a dictionary representing the source and destination paths for the launch storyboard images
 * that need to be copied.
 *
 * The resulting return looks like this:
 *
 *     {
 *         'target-path': 'source-path',
 *         ...
 *     }
 *
 * @param  {Array<Object>} splashScreens         splash screens as defined in config.xml for this platform
 * @param  {string} launchStoryboardImagesDir    project-root/Assets.xcassets/LaunchStoryboard.imageset/
 * @return {Object}
 */
function mapLaunchStoryboardResources (splashScreens, launchStoryboardImagesDir) {
    const platformLaunchStoryboardImages = mapLaunchStoryboardContents(splashScreens, launchStoryboardImagesDir);
    const pathMap = {};
    platformLaunchStoryboardImages.forEach(item => {
        if (item.target) {
            pathMap[item.target] = item.src;
        }
    });
    return pathMap;
}

/**
 * Builds the object that represents the contents.json file for the LaunchStoryboard image set.
 *
 * The resulting return looks like this:
 *
 *     {
 *         images: [
 *             {
 *                 idiom: 'universal|ipad|iphone',
 *                 scale: '1x|2x|3x',
 *                 width-class: undefined|'compact',
 *                 height-class: undefined|'compact'
 *                 ...
 *             }, ...
 *         ],
 *         info: {
 *             author: 'Xcode',
 *             version: 1
 *         }
 *     }
 *
 * A bit of minor logic is used to map from the array of images returned from mapLaunchStoryboardContents
 * to the format requried by Xcode.
 *
 * @param  {Array<Object>} splashScreens         splash screens as defined in config.xml for this platform
 * @param  {string} launchStoryboardImagesDir    project-root/Assets.xcassets/LaunchStoryboard.imageset/
 * @return {Object}
 */
function getLaunchStoryboardContentsJSON (splashScreens, launchStoryboardImagesDir) {
    const platformLaunchStoryboardImages = mapLaunchStoryboardContents(splashScreens, launchStoryboardImagesDir);
    const contentsJSON = {
        images: [],
        info: {
            author: 'Xcode',
            version: 1
        }
    };
    contentsJSON.images = platformLaunchStoryboardImages.map(item => {
        const newItem = {
            idiom: item.idiom,
            scale: item.scale
        };

        // Xcode doesn't want any size class property if the class is "any"
        // If our size class is "com", Xcode wants "compact".
        if (item.width !== CDV_ANY_SIZE_CLASS) {
            newItem['width-class'] = IMAGESET_COMPACT_SIZE_CLASS;
        }
        if (item.height !== CDV_ANY_SIZE_CLASS) {
            newItem['height-class'] = IMAGESET_COMPACT_SIZE_CLASS;
        }

        if (item.appearence) {
            newItem.appearances = [{ appearance: 'luminosity', value: item.appearence }];
        }

        // Xcode doesn't want a filename property if there's no image for these traits
        if (item.filename) {
            newItem.filename = item.filename;
        }
        return newItem;
    });
    return contentsJSON;
}

/**
 * Returns the directory for the Launch Storyboard image set, if image sets are being used. If they aren't
 * being used, returns null.
 *
 * @param  {string} projectRoot        The project's root directory
 * @param  {string} platformProjDir    The platform's project directory
 */
function getLaunchStoryboardImagesDir (projectRoot, platformProjDir) {
    let launchStoryboardImagesDir;
    const xcassetsExists = folderExists(path.join(projectRoot, platformProjDir, 'Assets.xcassets'));

    if (xcassetsExists) {
        launchStoryboardImagesDir = path.join(platformProjDir, 'Assets.xcassets', 'LaunchStoryboard.imageset');
    } else {
        // if we don't have a asset library for images, we can't do the storyboard.
        launchStoryboardImagesDir = null;
    }

    return launchStoryboardImagesDir;
}

/**
 * Update the images for the Launch Storyboard and updates the image set's contents.json file appropriately.
 *
 * @param  {Object} cordovaProject     The cordova project
 * @param  {Object} locations          A dictionary containing useful location paths
 */
function updateLaunchStoryboardImages (cordovaProject, locations) {
    const splashScreens = cordovaProject.projectConfig.getSplashScreens('ios');
    const platformProjDir = path.relative(cordovaProject.root, locations.xcodeCordovaProj);
    const launchStoryboardImagesDir = getLaunchStoryboardImagesDir(cordovaProject.root, platformProjDir);

    if (launchStoryboardImagesDir) {
        const resourceMap = mapLaunchStoryboardResources(splashScreens, launchStoryboardImagesDir);
        const contentsJSON = getLaunchStoryboardContentsJSON(splashScreens, launchStoryboardImagesDir);

        events.emit('verbose', `Updating launch storyboard images at ${launchStoryboardImagesDir}`);
        FileUpdater.updatePaths(
            resourceMap, { rootDir: cordovaProject.root }, logFileOp);

        events.emit('verbose', 'Updating Storyboard image set contents.json');
        fs.writeFileSync(path.join(cordovaProject.root, launchStoryboardImagesDir, 'Contents.json'),
            JSON.stringify(contentsJSON, null, 2));
    }
}

/**
 * Removes the images from the launch storyboard's image set and updates the image set's contents.json
 * file appropriately.
 *
 * @param  {string} projectRoot        Path to the project root
 * @param  {Object} projectConfig      The project's config.xml
 * @param  {Object} locations          A dictionary containing useful location paths
 */
function cleanLaunchStoryboardImages (projectRoot, projectConfig, locations) {
    const splashScreens = projectConfig.getSplashScreens('ios');
    const platformProjDir = path.relative(projectRoot, locations.xcodeCordovaProj);
    const launchStoryboardImagesDir = getLaunchStoryboardImagesDir(projectRoot, platformProjDir);
    if (launchStoryboardImagesDir) {
        const resourceMap = mapLaunchStoryboardResources(splashScreens, launchStoryboardImagesDir);
        const contentsJSON = getLaunchStoryboardContentsJSON(splashScreens, launchStoryboardImagesDir);

        Object.keys(resourceMap).forEach(targetPath => {
            resourceMap[targetPath] = null;
        });
        events.emit('verbose', `Cleaning storyboard image set at ${launchStoryboardImagesDir}`);

        // Source paths are removed from the map, so updatePaths() will delete the target files.
        FileUpdater.updatePaths(
            resourceMap, { rootDir: projectRoot, all: true }, logFileOp);

        // delete filename from contents.json
        contentsJSON.images.forEach(image => {
            image.filename = undefined;
        });

        events.emit('verbose', 'Updating Storyboard image set contents.json');
        fs.writeFileSync(path.join(projectRoot, launchStoryboardImagesDir, 'Contents.json'),
            JSON.stringify(contentsJSON, null, 2));
    }
}

/**
 * Queries ConfigParser object for the orientation <preference> value. Warns if
 *   global preference value is not supported by platform.
 *
 * @param  {Object} platformConfig    ConfigParser object
 *
 * @return {String}           Global/platform-specific orientation in lower-case
 *   (or empty string if both are undefined).
 */
function getOrientationValue (platformConfig) {
    const ORIENTATION_DEFAULT = 'default';

    let orientation = platformConfig.getPreference('orientation');
    if (!orientation) {
        return ORIENTATION_DEFAULT;
    }

    orientation = orientation.toLowerCase();

    // Check if the given global orientation is supported
    if (['default', 'portrait', 'landscape', 'all'].indexOf(orientation) >= 0) {
        return orientation;
    }

    events.emit('warn', `Unrecognized value for Orientation preference: ${orientation}. Defaulting to value: ${ORIENTATION_DEFAULT}.`);

    return ORIENTATION_DEFAULT;
}

/*
    Parses all <access> and <allow-navigation> entries and consolidates duplicates (for ATS).
    Returns an object with a Hostname as the key, and the value an object with properties:
        {
            Hostname, // String
            NSExceptionAllowsInsecureHTTPLoads, // boolean
            NSIncludesSubdomains,  // boolean
            NSExceptionMinimumTLSVersion, // String
            NSExceptionRequiresForwardSecrecy, // boolean
            NSRequiresCertificateTransparency, // boolean

            // the three below _only_ show when the Hostname is '*'
            // if any of the three are set, it disables setting NSAllowsArbitraryLoads
            // (Apple already enforces this in ATS)
            NSAllowsArbitraryLoadsInWebContent, // boolean (default: false)
            NSAllowsLocalNetworking, // boolean (default: false)
            NSAllowsArbitraryLoadsForMedia, // boolean (default:false)

        }
*/
function processAccessAndAllowNavigationEntries (config) {
    const accesses = config.getAccesses();
    const allow_navigations = config.getAllowNavigations();

    return allow_navigations
    // we concat allow_navigations and accesses, after processing accesses
        .concat(accesses.map(obj => {
            // map accesses to a common key interface using 'href', not origin
            obj.href = obj.origin;
            delete obj.origin;
            return obj;
        }))
        // we reduce the array to an object with all the entries processed (key is Hostname)
        .reduce((previousReturn, currentElement) => {
            const options = {
                minimum_tls_version: currentElement.minimum_tls_version,
                requires_forward_secrecy: currentElement.requires_forward_secrecy,
                requires_certificate_transparency: currentElement.requires_certificate_transparency,
                allows_arbitrary_loads_for_media: currentElement.allows_arbitrary_loads_in_media || currentElement.allows_arbitrary_loads_for_media,
                allows_arbitrary_loads_in_web_content: currentElement.allows_arbitrary_loads_in_web_content,
                allows_local_networking: currentElement.allows_local_networking
            };
            const obj = parseAllowlistUrlForATS(currentElement.href, options);

            if (obj) {
                // we 'union' duplicate entries
                let item = previousReturn[obj.Hostname];
                if (!item) {
                    item = {};
                }
                for (const o in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, o)) {
                        item[o] = obj[o];
                    }
                }
                previousReturn[obj.Hostname] = item;
            }
            return previousReturn;
        }, {});
}

/*
    Parses a URL and returns an object with these keys:
        {
            Hostname, // String
            NSExceptionAllowsInsecureHTTPLoads, // boolean (default: false)
            NSIncludesSubdomains,  // boolean (default: false)
            NSExceptionMinimumTLSVersion, // String (default: 'TLSv1.2')
            NSExceptionRequiresForwardSecrecy, // boolean (default: true)
            NSRequiresCertificateTransparency, // boolean (default: false)

            // the three below _only_ apply when the Hostname is '*'
            // if any of the three are set, it disables setting NSAllowsArbitraryLoads
            // (Apple already enforces this in ATS)
            NSAllowsArbitraryLoadsInWebContent, // boolean (default: false)
            NSAllowsLocalNetworking, // boolean (default: false)
            NSAllowsArbitraryLoadsForMedia, // boolean (default:false)
        }

    null is returned if the URL cannot be parsed, or is to be skipped for ATS.
*/
function parseAllowlistUrlForATS (url, options) {
    // Guiding principle: we only set values in retObj if they are NOT the default
    const retObj = {};

    if (url === '*') {
        retObj.Hostname = '*';
        let val;

        val = (options.allows_arbitrary_loads_in_web_content === 'true');
        if (options.allows_arbitrary_loads_in_web_content && val) { // default is false
            retObj.NSAllowsArbitraryLoadsInWebContent = true;
        }

        val = (options.allows_arbitrary_loads_for_media === 'true');
        if (options.allows_arbitrary_loads_for_media && val) { // default is false
            retObj.NSAllowsArbitraryLoadsForMedia = true;
        }

        val = (options.allows_local_networking === 'true');
        if (options.allows_local_networking && val) { // default is false
            retObj.NSAllowsLocalNetworking = true;
        }

        return retObj;
    }

    let href = null;
    try {
        href = new URL(url);
    } catch (e) {
        const scheme = url.split(':')[0];
        // If there's a wildcard in the protocol, the URL will fail to parse
        // Replace it with "http" to allow insecure loads
        if (scheme.includes('*')) {
            href = new URL(url.replace(scheme, 'http'));
        } else {
            return null;
        }
    }

    retObj.Hostname = href.hostname;

    // Handling "scheme:*" case to avoid creating of a blank key in NSExceptionDomains.
    if (retObj.Hostname === '') {
        return null;
    }

    // check origin, if it allows subdomains (wildcard in hostname), we set NSIncludesSubdomains to YES. Default is NO
    if (retObj.Hostname.startsWith('*.')) {
        retObj.NSIncludesSubdomains = true;
        retObj.Hostname = href.hostname.substring(2);
    }

    if (options.minimum_tls_version && options.minimum_tls_version !== 'TLSv1.2') { // default is TLSv1.2
        retObj.NSExceptionMinimumTLSVersion = options.minimum_tls_version;
    }

    const rfs = (options.requires_forward_secrecy === 'true');
    if (options.requires_forward_secrecy && !rfs) { // default is true
        retObj.NSExceptionRequiresForwardSecrecy = false;
    }

    const rct = (options.requires_certificate_transparency === 'true');
    if (options.requires_certificate_transparency && rct) { // default is false
        retObj.NSRequiresCertificateTransparency = true;
    }

    // if the scheme is HTTP, we set NSExceptionAllowsInsecureHTTPLoads to YES. Default is NO
    if (href.protocol === 'http:') {
        retObj.NSExceptionAllowsInsecureHTTPLoads = true;
    }

    return retObj;
}

/*
    App Transport Security (ATS) writer from <access> and <allow-navigation> tags
    in config.xml
*/
function writeATSEntries (config) {
    const pObj = processAccessAndAllowNavigationEntries(config);

    const ats = {};

    for (const hostname in pObj) {
        if (Object.prototype.hasOwnProperty.call(pObj, hostname)) {
            const entry = pObj[hostname];

            // Guiding principle: we only set values if they are available

            if (hostname === '*') {
                // always write this, for iOS 9, since in iOS 10 it will be overriden if
                // any of the other three keys are written
                ats.NSAllowsArbitraryLoads = true;

                // at least one of the overriding keys is present
                if (entry.NSAllowsArbitraryLoadsInWebContent) {
                    ats.NSAllowsArbitraryLoadsInWebContent = true;
                }
                if (entry.NSAllowsArbitraryLoadsForMedia) {
                    ats.NSAllowsArbitraryLoadsForMedia = true;
                }
                if (entry.NSAllowsLocalNetworking) {
                    ats.NSAllowsLocalNetworking = true;
                }

                continue;
            }

            const exceptionDomain = {};

            for (const key in entry) {
                if (Object.prototype.hasOwnProperty.call(entry, key) && key !== 'Hostname') {
                    exceptionDomain[key] = entry[key];
                }
            }

            if (!ats.NSExceptionDomains) {
                ats.NSExceptionDomains = {};
            }

            ats.NSExceptionDomains[hostname] = exceptionDomain;
        }
    }

    return ats;
}

function folderExists (folderPath) {
    try {
        const stat = fs.statSync(folderPath);
        return stat && stat.isDirectory();
    } catch (e) {
        return false;
    }
}

// Construct a default value for CFBundleVersion as the version with any
// -rclabel stripped=.
function default_CFBundleVersion (version) {
    return version.split('-')[0];
}

// Converts cordova specific representation of target device to XCode value
function parseTargetDevicePreference (value) {
    if (!value) return null;
    const map = { universal: '"1,2"', handset: '"1"', tablet: '"2"' };
    if (map[value.toLowerCase()]) {
        return map[value.toLowerCase()];
    }
    events.emit('warn', `Unrecognized value for target-device preference: ${value}.`);
    return null;
}
