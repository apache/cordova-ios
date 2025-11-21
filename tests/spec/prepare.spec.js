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

'use strict';

const fs = require('node:fs');
const EventEmitter = require('node:events');
const path = require('node:path');
const tmp = require('tmp');
const plist = require('plist');
const xcode = require('xcode');
const XcodeProject = xcode.project;
const rewire = require('rewire');
const prepare = rewire('../../lib/prepare');
const projectFile = require('../../lib/projectFile');
const FileUpdater = require('cordova-common').FileUpdater;
const versions = require('../../lib/versions');

tmp.setGracefulCleanup();

const relativeTmp = path.join(__dirname, '..', '..');
const FIXTURES = path.join(__dirname, 'fixtures');
const iosProjectFixture = path.join(FIXTURES, 'ios-config-xml');

const ConfigParser = require('cordova-common').ConfigParser;

describe('prepare', () => {
    let p;
    let Api;
    let tempdir;
    let iosProject;

    beforeEach(() => {
        Api = require('../../lib/Api');

        tempdir = tmp.dirSync({ tmpdir: relativeTmp, unsafeCleanup: true });
        iosProject = path.join(tempdir.name, 'prepare');
        const iosPlatform = path.join(iosProject, 'platforms/ios');

        fs.cpSync(iosProjectFixture, iosPlatform, { recursive: true });
        p = new Api('ios', iosPlatform, new EventEmitter());
    });

    describe('launch storyboard feature (CB-9762)', () => {
        function makeSplashScreenEntry (src, width, height) {
            return { src, width, height };
        }

        const noLaunchStoryboardImages = [];

        const singleLaunchStoryboardImage = [makeSplashScreenEntry('res/splash/ios/Default@2x~universal~anyany.png')];

        const singleLaunchStoryboardImageWithLegacyLaunchImage = [
            makeSplashScreenEntry('res/splash/ios/Default@2x~universal~anyany.png'),
            makeSplashScreenEntry('res/splash/ios/another-image.png', 1024, 768)
        ];

        const typicalLaunchStoryboardImages = [
            makeSplashScreenEntry('res/splash/ios/Default@2x~universal~anyany.png'),
            makeSplashScreenEntry('res/splash/ios/Default@2x~universal~comany.png'),
            makeSplashScreenEntry('res/splash/ios/Default@2x~universal~comcom.png'),
            makeSplashScreenEntry('res/splash/ios/Default@3x~universal~anyany.png'),
            makeSplashScreenEntry('res/splash/ios/Default@3x~universal~anycom.png'),
            makeSplashScreenEntry('res/splash/ios/Default@3x~universal~comany.png')
        ];

        const multiDeviceLaunchStoryboardImages = [
            makeSplashScreenEntry('res/splash/ios/Default@2x~ipad~anyany.png'),
            makeSplashScreenEntry('res/splash/ios/Default@2x~ipad~comany.png'),
            makeSplashScreenEntry('res/splash/ios/Default@2x~ipad~comcom.png'),
            makeSplashScreenEntry('res/splash/ios/Default@2x~universal~anyany.png'),
            makeSplashScreenEntry('res/splash/ios/Default@2x~universal~comany.png'),
            makeSplashScreenEntry('res/splash/ios/Default@2x~universal~comcom.png'),
            makeSplashScreenEntry('res/splash/ios/Default@3x~iphone~anyany.png'),
            makeSplashScreenEntry('res/splash/ios/Default@3x~iphone~anycom.png'),
            makeSplashScreenEntry('res/splash/ios/Default@3x~iphone~comany.png')
        ];

        const multiDeviceMultiThemeLaunchStoryboardImages = [
            makeSplashScreenEntry('res/splash/ios/Default@2x~ipad~anyany.png'),
            makeSplashScreenEntry('res/splash/ios/Default@2x~ipad~anyany~dark.png'),
            makeSplashScreenEntry('res/splash/ios/Default@2x~ipad~anyany~light.png'),
            makeSplashScreenEntry('res/splash/ios/Default@2x~ipad~comany.png'),
            makeSplashScreenEntry('res/splash/ios/Default@2x~ipad~comcom.png'),
            makeSplashScreenEntry('res/splash/ios/Default@2x~ipad~comcom~dark.png'),
            makeSplashScreenEntry('res/splash/ios/Default@2x~ipad~comcom~light.png'),
            makeSplashScreenEntry('res/splash/ios/Default@2x~universal~anyany.png'),
            makeSplashScreenEntry('res/splash/ios/Default@2x~universal~comany.png'),
            makeSplashScreenEntry('res/splash/ios/Default@2x~universal~comany~dark.png'),
            makeSplashScreenEntry('res/splash/ios/Default@2x~universal~comcom.png'),
            makeSplashScreenEntry('res/splash/ios/Default@2x~universal~comcom~light.png'),
            makeSplashScreenEntry('res/splash/ios/Default@3x~iphone~anyany.png'),
            makeSplashScreenEntry('res/splash/ios/Default@3x~iphone~anyany~dark.png'),
            makeSplashScreenEntry('res/splash/ios/Default@3x~iphone~anycom.png'),
            makeSplashScreenEntry('res/splash/ios/Default@3x~iphone~comany.png'),
            makeSplashScreenEntry('res/splash/ios/Default@3x~iphone~comany~light.png')
        ];

        describe('#mapLaunchStoryboardContents', () => {
            const mapLaunchStoryboardContents = prepare.__get__('mapLaunchStoryboardContents');

            it('should return an array with no mapped storyboard images', () => {
                const result = mapLaunchStoryboardContents(noLaunchStoryboardImages, '');
                expect(result).toBeDefined();
                expect(result).toEqual(require('./fixtures/launch-storyboard-support/contents-map/empty-map'));
            });

            it('should return an array with one mapped storyboard image', () => {
                const result = mapLaunchStoryboardContents(singleLaunchStoryboardImage, '');
                expect(result).toBeDefined();
                expect(result).toEqual(require('./fixtures/launch-storyboard-support/contents-map/single-2xanyany-map'));
            });

            it('should return an array with one mapped storyboard image, even with legacy images', () => {
                const result = mapLaunchStoryboardContents(singleLaunchStoryboardImageWithLegacyLaunchImage, '');
                expect(result).toBeDefined();
                expect(result).toEqual(require('./fixtures/launch-storyboard-support/contents-map/single-2xanyany-map'));
            });

            it('should return an array with several mapped storyboard images', () => {
                const result = mapLaunchStoryboardContents(typicalLaunchStoryboardImages, '');
                expect(result).toBeDefined();
                expect(result).toEqual(require('./fixtures/launch-storyboard-support/contents-map/typical-universal-map'));
            });

            it('should return an array with several mapped storyboard images across device classes', () => {
                const result = mapLaunchStoryboardContents(multiDeviceLaunchStoryboardImages, '');
                expect(result).toBeDefined();
                expect(result).toEqual(require('./fixtures/launch-storyboard-support/contents-map/varied-device-map'));
            });

            it('should return an array with several mapped storyboard images across device classes and themes', () => {
                const result = mapLaunchStoryboardContents(multiDeviceMultiThemeLaunchStoryboardImages, '');
                expect(result).toBeDefined();
                expect(result).toEqual(require('./fixtures/launch-storyboard-support/contents-map/varied-device-and-theme-map'));
            });
        });

        describe('#mapLaunchStoryboardResources', () => {
            const mapLaunchStoryboardResources = prepare.__get__('mapLaunchStoryboardResources');

            it('should return an empty object with no mapped storyboard images', () => {
                const result = mapLaunchStoryboardResources(noLaunchStoryboardImages, '');
                expect(result).toBeDefined();
                expect(result).toEqual({});
            });

            it('should return an object with one mapped storyboard image', () => {
                const result = mapLaunchStoryboardResources(singleLaunchStoryboardImage, '');
                expect(result).toBeDefined();
                expect(result).toEqual({
                    'Default@2x~universal~anyany.png': 'res/splash/ios/Default@2x~universal~anyany.png'
                });
            });

            it('should return an object with one mapped storyboard image, even with legacy images', () => {
                const result = mapLaunchStoryboardResources(singleLaunchStoryboardImageWithLegacyLaunchImage, '');
                expect(result).toBeDefined();
                expect(result).toEqual({
                    'Default@2x~universal~anyany.png': 'res/splash/ios/Default@2x~universal~anyany.png'
                });
            });

            it('should return an object with several mapped storyboard images', () => {
                const result = mapLaunchStoryboardResources(typicalLaunchStoryboardImages, '');
                expect(result).toBeDefined();
                expect(result).toEqual({
                    'Default@2x~universal~anyany.png': 'res/splash/ios/Default@2x~universal~anyany.png',
                    'Default@2x~universal~comany.png': 'res/splash/ios/Default@2x~universal~comany.png',
                    'Default@2x~universal~comcom.png': 'res/splash/ios/Default@2x~universal~comcom.png',
                    'Default@3x~universal~anyany.png': 'res/splash/ios/Default@3x~universal~anyany.png',
                    'Default@3x~universal~anycom.png': 'res/splash/ios/Default@3x~universal~anycom.png',
                    'Default@3x~universal~comany.png': 'res/splash/ios/Default@3x~universal~comany.png'
                });
            });

            it('should return an object with several mapped storyboard images across device classes', () => {
                const result = mapLaunchStoryboardResources(multiDeviceLaunchStoryboardImages, '');
                expect(result).toBeDefined();
                expect(result).toEqual({
                    'Default@2x~universal~anyany.png': 'res/splash/ios/Default@2x~universal~anyany.png',
                    'Default@2x~universal~comany.png': 'res/splash/ios/Default@2x~universal~comany.png',
                    'Default@2x~universal~comcom.png': 'res/splash/ios/Default@2x~universal~comcom.png',
                    'Default@2x~ipad~anyany.png': 'res/splash/ios/Default@2x~ipad~anyany.png',
                    'Default@2x~ipad~comany.png': 'res/splash/ios/Default@2x~ipad~comany.png',
                    'Default@2x~ipad~comcom.png': 'res/splash/ios/Default@2x~ipad~comcom.png',
                    'Default@3x~iphone~anyany.png': 'res/splash/ios/Default@3x~iphone~anyany.png',
                    'Default@3x~iphone~anycom.png': 'res/splash/ios/Default@3x~iphone~anycom.png',
                    'Default@3x~iphone~comany.png': 'res/splash/ios/Default@3x~iphone~comany.png'
                });
            });

            it('should return an object with several mapped storyboard images across device classes and themes', () => {
                const result = mapLaunchStoryboardResources(multiDeviceMultiThemeLaunchStoryboardImages, '');
                expect(result).toBeDefined();
                expect(result).toEqual({
                    'Default@2x~universal~anyany.png': 'res/splash/ios/Default@2x~universal~anyany.png',
                    'Default@2x~universal~comany.png': 'res/splash/ios/Default@2x~universal~comany.png',
                    'Default@2x~universal~comany~dark.png': 'res/splash/ios/Default@2x~universal~comany~dark.png',
                    'Default@2x~universal~comcom.png': 'res/splash/ios/Default@2x~universal~comcom.png',
                    'Default@2x~universal~comcom~light.png': 'res/splash/ios/Default@2x~universal~comcom~light.png',
                    'Default@2x~ipad~anyany.png': 'res/splash/ios/Default@2x~ipad~anyany.png',
                    'Default@2x~ipad~anyany~dark.png': 'res/splash/ios/Default@2x~ipad~anyany~dark.png',
                    'Default@2x~ipad~anyany~light.png': 'res/splash/ios/Default@2x~ipad~anyany~light.png',
                    'Default@2x~ipad~comany.png': 'res/splash/ios/Default@2x~ipad~comany.png',
                    'Default@2x~ipad~comcom.png': 'res/splash/ios/Default@2x~ipad~comcom.png',
                    'Default@2x~ipad~comcom~dark.png': 'res/splash/ios/Default@2x~ipad~comcom~dark.png',
                    'Default@2x~ipad~comcom~light.png': 'res/splash/ios/Default@2x~ipad~comcom~light.png',
                    'Default@3x~iphone~anyany.png': 'res/splash/ios/Default@3x~iphone~anyany.png',
                    'Default@3x~iphone~anyany~dark.png': 'res/splash/ios/Default@3x~iphone~anyany~dark.png',
                    'Default@3x~iphone~anycom.png': 'res/splash/ios/Default@3x~iphone~anycom.png',
                    'Default@3x~iphone~comany.png': 'res/splash/ios/Default@3x~iphone~comany.png',
                    'Default@3x~iphone~comany~light.png': 'res/splash/ios/Default@3x~iphone~comany~light.png'
                });
            });
        });

        describe('#getLaunchStoryboardContentsJSON', () => {
            const getLaunchStoryboardContentsJSON = prepare.__get__('getLaunchStoryboardContentsJSON');

            it('should return contents.json with no mapped storyboard images', () => {
                const result = getLaunchStoryboardContentsJSON(noLaunchStoryboardImages, '');
                expect(result).toBeDefined();
                expect(result).toEqual(require('./fixtures/launch-storyboard-support/contents-json/empty'));
            });

            it('should return contents.json with one mapped storyboard image', () => {
                const result = getLaunchStoryboardContentsJSON(singleLaunchStoryboardImage, '');
                expect(result).toBeDefined();
                expect(result).toEqual(require('./fixtures/launch-storyboard-support/contents-json/single-2xanyany'));
            });

            it('should return contents.json with one mapped storyboard image, even with legacy images', () => {
                const result = getLaunchStoryboardContentsJSON(singleLaunchStoryboardImageWithLegacyLaunchImage, '');
                expect(result).toBeDefined();
                expect(result).toEqual(require('./fixtures/launch-storyboard-support/contents-json/single-2xanyany'));
            });

            it('should return contents.json with several mapped storyboard images', () => {
                const result = getLaunchStoryboardContentsJSON(typicalLaunchStoryboardImages, '');
                expect(result).toBeDefined();
                expect(result).toEqual(require('./fixtures/launch-storyboard-support/contents-json/typical-universal'));
            });

            it('should return contents.json with several mapped storyboard images across device classes', () => {
                const result = getLaunchStoryboardContentsJSON(multiDeviceLaunchStoryboardImages, '');
                expect(result).toBeDefined();
                expect(result).toEqual(require('./fixtures/launch-storyboard-support/contents-json/varied-device'));
            });

            it('should return contents.json with several mapped storyboard images across device classes and themes', () => {
                const result = getLaunchStoryboardContentsJSON(multiDeviceMultiThemeLaunchStoryboardImages, '');
                expect(result).toBeDefined();
                expect(result).toEqual(require('./fixtures/launch-storyboard-support/contents-json/varied-device-and-theme'));
            });
        });

        describe('#getLaunchStoryboardImagesDir', () => {
            const getLaunchStoryboardImagesDir = prepare.__get__('getLaunchStoryboardImagesDir');

            it('should find the Assets.xcassets file in a project with an asset catalog', () => {
                const projectRoot = iosProject;
                const platformProjDir = path.join('platforms', 'ios', 'App');
                const assetCatalogPath = path.join(iosProject, platformProjDir, 'Assets.xcassets');
                const expectedPath = path.join(platformProjDir, 'Assets.xcassets', 'LaunchStoryboard.imageset');

                expect(fs.existsSync(assetCatalogPath)).toEqual(true);

                const returnPath = getLaunchStoryboardImagesDir(projectRoot, platformProjDir);
                expect(returnPath).toEqual(expectedPath);
            });

            it('should NOT find the Assets.xcassets file in a project with no asset catalog', () => {
                const projectRoot = iosProject;
                const platformProjDir = path.join('platforms', 'ios', 'SamplerApp');
                const assetCatalogPath = path.join(iosProject, platformProjDir, 'Assets.xcassets');

                expect(fs.existsSync(assetCatalogPath)).toEqual(false);

                const returnPath = getLaunchStoryboardImagesDir(projectRoot, platformProjDir);
                expect(returnPath).toBeNull();
            });
        });

        describe('#updateLaunchStoryboardImages', () => {
            const getLaunchStoryboardImagesDir = prepare.__get__('getLaunchStoryboardImagesDir');
            const updateLaunchStoryboardImages = prepare.__get__('updateLaunchStoryboardImages');
            const logFileOp = prepare.__get__('logFileOp');

            it('should clean storyboard launch images and update contents.json', () => {
                // spy!
                const updatePaths = spyOn(FileUpdater, 'updatePaths');

                // get appropriate paths
                const projectRoot = iosProject;
                const platformProjDir = path.join('platforms', 'ios', 'App');
                const storyboardImagesDir = getLaunchStoryboardImagesDir(projectRoot, platformProjDir);

                // create a suitable mock project for our method
                const project = {
                    root: iosProject,
                    locations: p.locations,
                    projectConfig: new ConfigParser(path.join(FIXTURES, 'launch-storyboard-support', 'configs', 'modern-only.xml'))
                };

                // copy the splash screen fixtures to the iOS project
                fs.cpSync(path.join(FIXTURES, 'launch-storyboard-support', 'res'), path.join(iosProject, 'res'), { recursive: true });

                // copy splash screens and update Contents.json
                updateLaunchStoryboardImages(project, p.locations);

                // verify that updatePaths was called as we expect
                const expectedResourceMap = {
                    'Default@2x~universal~comcom.png': 'res/screen/ios/Default@2x~universal~comcom.png',
                    'Default@2x~universal~comany.png': 'res/screen/ios/Default@2x~universal~comany.png',
                    'Default@2x~universal~anyany.png': 'res/screen/ios/Default@2x~universal~anyany.png',
                    'Default@3x~universal~comany.png': 'res/screen/ios/Default@3x~universal~comany.png',
                    'Default@3x~universal~anycom.png': 'res/screen/ios/Default@3x~universal~anycom.png',
                    'Default@3x~universal~anyany.png': 'res/screen/ios/Default@3x~universal~anyany.png'
                };
                // update keys with path to storyboardImagesDir
                for (const k in expectedResourceMap) {
                    if (Object.prototype.hasOwnProperty.call(expectedResourceMap, k)) {
                        expectedResourceMap[path.join(storyboardImagesDir, k)] = expectedResourceMap[k];
                        delete expectedResourceMap[k];
                    }
                }
                expect(updatePaths).toHaveBeenCalledWith(expectedResourceMap, {
                    rootDir: project.root
                }, logFileOp
                );

                // verify that that Contents.json is as we expect
                const result = JSON.parse(fs.readFileSync(path.join(project.root, storyboardImagesDir, 'Contents.json')));
                expect(result).toEqual(require('./fixtures/launch-storyboard-support/contents-json/typical-universal'));
            });
        });

        describe('#cleanLaunchStoryboardImages', () => {
            const getLaunchStoryboardImagesDir = prepare.__get__('getLaunchStoryboardImagesDir');
            const updateLaunchStoryboardImages = prepare.__get__('updateLaunchStoryboardImages');
            const cleanLaunchStoryboardImages = prepare.__get__('cleanLaunchStoryboardImages');
            const logFileOp = prepare.__get__('logFileOp');

            it('should move launch images and update contents.json', () => {
                const projectRoot = iosProject;
                const platformProjDir = path.join('platforms', 'ios', 'App');
                const storyboardImagesDir = getLaunchStoryboardImagesDir(projectRoot, platformProjDir);
                const project = {
                    root: iosProject,
                    locations: p.locations,
                    projectConfig: new ConfigParser(path.join(FIXTURES, 'launch-storyboard-support', 'configs', 'modern-only.xml'))
                };

                fs.cpSync(path.join(FIXTURES, 'launch-storyboard-support', 'res'), path.join(iosProject, 'res'), { recursive: true });
                updateLaunchStoryboardImages(project, p.locations);

                // now, clean the images
                const updatePaths = spyOn(FileUpdater, 'updatePaths');
                cleanLaunchStoryboardImages(projectRoot, project.projectConfig, p.locations);

                // verify that updatePaths was called as we expect
                const expectedResourceMap = {
                    'Default@2x~universal~comcom.png': null,
                    'Default@2x~universal~comany.png': null,
                    'Default@2x~universal~anyany.png': null,
                    'Default@3x~universal~comany.png': null,
                    'Default@3x~universal~anycom.png': null,
                    'Default@3x~universal~anyany.png': null
                };
                // update keys with path to storyboardImagesDir
                for (const k in expectedResourceMap) {
                    if (Object.prototype.hasOwnProperty.call(expectedResourceMap, k)) {
                        expectedResourceMap[path.join(storyboardImagesDir, k)] = null;
                        delete expectedResourceMap[k];
                    }
                }
                expect(updatePaths).toHaveBeenCalledWith(expectedResourceMap, {
                    rootDir: project.root,
                    all: true
                }, logFileOp
                );

                // verify that that Contents.json is as we expect
                const result = JSON.parse(fs.readFileSync(path.join(project.root, storyboardImagesDir, 'Contents.json')));
                expect(result).toEqual(require('./fixtures/launch-storyboard-support/contents-json/empty'));
            });
        });
    });

    describe('App Icon handling', () => {
        const xcver = '16.0.0';
        const mapIconResources = prepare.__get__('mapIconResources');

        describe('#mapIconResources', () => {
            it('should handle a default icon', () => {
                const icons = [
                    { src: 'dummy.png' }
                ];

                const resMap = mapIconResources(icons, '', xcver);

                expect(resMap).toEqual(jasmine.objectContaining({
                    'icon.png': 'dummy.png',
                    'watchos.png': 'dummy.png'
                }));
            });

            it('should handle a default icon for a watchos target', () => {
                const icons = [
                    { src: 'dummy.png' },
                    { src: 'dummy-watch.png', target: 'watchos' }
                ];

                const resMap = mapIconResources(icons, '', xcver);

                expect(resMap).toEqual(jasmine.objectContaining({
                    'icon.png': 'dummy.png',
                    'watchos.png': 'dummy-watch.png'
                }));
            });

            it('should handle default icon variants on Xcode 16+', () => {
                const icons = [
                    { src: 'dummy.png', monochrome: 'dummy-tint.png', foreground: 'dummy-dark.png' }
                ];

                const resMap = mapIconResources(icons, '', xcver);

                expect(resMap).toEqual(jasmine.objectContaining({
                    'icon.png': 'dummy.png',
                    'icon-dark.png': 'dummy-dark.png',
                    'icon-tinted.png': 'dummy-tint.png',
                    'watchos.png': 'dummy.png'
                }));
            });

            it('should ignore default icon variants on Xcode 15', () => {
                const icons = [
                    { src: 'dummy.png', monochrome: 'dummy-tint.png', foreground: 'dummy-dark.png' }
                ];

                const resMap = mapIconResources(icons, '', '15.0.0');

                expect(resMap).toEqual(jasmine.objectContaining({
                    'icon.png': 'dummy.png',
                    'watchos.png': 'dummy.png'
                }));
            });

            it('should handle a single sized icon', () => {
                const icons = [
                    { src: 'dummy.png', height: 1024, width: 1024 }
                ];

                const resMap = mapIconResources(icons, '', xcver);

                expect(resMap).toEqual(jasmine.objectContaining({
                    'icon.png': 'dummy.png',
                    'watchos.png': 'dummy.png'
                }));
            });

            it('should handle a single sized icon for watchos target', () => {
                const icons = [
                    { src: 'dummy.png', height: 1024, width: 1024, target: 'watchos' }
                ];

                const resMap = mapIconResources(icons, '', xcver);

                expect(resMap).toEqual(jasmine.objectContaining({
                    'watchos.png': 'dummy.png'
                }));
            });

            it('should handle a sized icon', () => {
                const icons = [
                    { src: 'dummy.png', height: 120, width: 120 }
                ];

                const resMap = mapIconResources(icons, '', xcver);

                expect(resMap).toEqual(jasmine.objectContaining({
                    'icon-40@3x.png': 'dummy.png',
                    'icon-60@2x.png': 'dummy.png'
                }));
            });

            it('should handle a sized spotlight icon', () => {
                const icons = [
                    { src: 'dummy.png', height: 120, width: 120 },
                    { src: 'dummy-spot.png', height: 120, width: 120, target: 'spotlight' }
                ];

                const resMap = mapIconResources(icons, '', xcver);

                expect(resMap).toEqual(jasmine.objectContaining({
                    'icon-40@3x.png': 'dummy-spot.png',
                    'icon-60@2x.png': 'dummy.png'
                }));
            });

            it('should handle sized icon variants', () => {
                const icons = [
                    { src: 'dummy.png', height: 76, width: 76, monochrome: 'dummy-tint.png', foreground: 'dummy-dark.png' }
                ];

                const resMap = mapIconResources(icons, '', xcver);

                expect(resMap).toEqual(jasmine.objectContaining({
                    'icon-38@2x.png': 'dummy.png',
                    'icon-38@2x-dark.png': 'dummy-dark.png',
                    'icon-38@2x-tinted.png': 'dummy-tint.png'
                }));
            });

            it('should ignore sized watchos icons without a target', () => {
                const icons = [
                    { src: 'dummy.png', height: 216, width: 216 }
                ];

                const resMap = mapIconResources(icons, '', xcver);

                expect(resMap).toEqual({});
            });

            it('should handle a sized macOS icon', () => {
                const icons = [
                    { src: 'dummy.png', height: 256, width: 256, target: 'mac' }
                ];

                const resMap = mapIconResources(icons, '', xcver);

                expect(resMap).toEqual(jasmine.objectContaining({
                    'mac-128@2x.png': 'dummy.png',
                    'mac-256.png': 'dummy.png'
                }));
            });

            it('should ignore tinted icons for non-iOS targets', () => {
                const icons = [
                    { monochrome: 'dummy-tint.png', height: 256, width: 256, target: 'mac' },
                    { foreground: 'dummy-dark.png', height: 216, width: 216, target: 'watchos' }
                ];

                const resMap = mapIconResources(icons, '', xcver);

                expect(resMap).toEqual({});
            });
        });

        describe('#updateIcons', () => {
            const updateIcons = prepare.__get__('updateIcons');
            const logFileOp = prepare.__get__('logFileOp');
            let iconsDir = '';

            beforeEach(() => {
                prepare.__set__('ASSUMED_XCODE_VERSION', '15.0.0');

                const platformProjDir = path.relative(iosProject, p.locations.xcodeCordovaProj);
                iconsDir = path.join(platformProjDir, 'Assets.xcassets', 'AppIcon.appiconset');
            });

            function updateIconsWithConfig (configFile) {
                // create a suitable mock project for our method
                const project = {
                    root: iosProject,
                    locations: p.locations,
                    projectConfig: new ConfigParser(path.join(FIXTURES, 'icon-support', 'configs', configFile))
                };

                // copy the icon fixtures to the iOS project
                fs.cpSync(path.join(FIXTURES, 'icon-support', 'res'), path.join(iosProject, 'res'), { recursive: true });

                // copy icons and update Contents.json
                return updateIcons(project, p.locations);
            }

            it('should not update paths if no icons are specified', () => {
                const updatePaths = spyOn(FileUpdater, 'updatePaths');

                return updateIconsWithConfig('none.xml')
                    .then(() => {
                        expect(updatePaths).not.toHaveBeenCalled();

                        // verify that that Contents.json is as we expect
                        const result = JSON.parse(fs.readFileSync(path.join(iosProject, iconsDir, 'Contents.json')));
                        expect(result).toEqual(require('./fixtures/icon-support/contents-json/none'));
                    });
            });

            it('should update paths if a single icon is specified', () => {
                const updatePaths = spyOn(FileUpdater, 'updatePaths');

                return updateIconsWithConfig('single-only.xml')
                    .then(() => {
                        expect(updatePaths).toHaveBeenCalledWith({
                            [path.join(iconsDir, 'icon.png')]: 'res/ios/appicon.png',
                            [path.join(iconsDir, 'watchos.png')]: 'res/ios/appicon.png'
                        }, { rootDir: iosProject }, logFileOp);

                        // verify that that Contents.json is as we expect
                        const result = JSON.parse(fs.readFileSync(path.join(iosProject, iconsDir, 'Contents.json')));
                        expect(result).toEqual(require('./fixtures/icon-support/contents-json/single-only'));
                    });
            });

            it('should update only some paths if a single icon with variants is specified with Xcode 15', () => {
                const updatePaths = spyOn(FileUpdater, 'updatePaths');
                spyOn(versions, 'get_apple_xcode_version').and.returnValue(Promise.resolve('15.0.0'));

                return updateIconsWithConfig('single-variants.xml')
                    .then(() => {
                        expect(updatePaths).toHaveBeenCalledWith({
                            [path.join(iconsDir, 'icon.png')]: 'res/ios/appicon.png',
                            [path.join(iconsDir, 'watchos.png')]: 'res/ios/appicon.png'
                        }, { rootDir: iosProject }, logFileOp);

                        // verify that that Contents.json is as we expect
                        const result = JSON.parse(fs.readFileSync(path.join(iosProject, iconsDir, 'Contents.json')));
                        expect(result).toEqual(require('./fixtures/icon-support/contents-json/single-only'));
                    });
            });

            it('should update paths if a single icon with variants is specified with Xcode 16', () => {
                prepare.__set__('ASSUMED_XCODE_VERSION', '16.0.0');
                const updatePaths = spyOn(FileUpdater, 'updatePaths');
                spyOn(versions, 'get_apple_xcode_version').and.returnValue(Promise.resolve('16.0.0'));

                return updateIconsWithConfig('single-variants.xml')
                    .then(() => {
                        expect(updatePaths).toHaveBeenCalledWith({
                            [path.join(iconsDir, 'icon.png')]: 'res/ios/appicon.png',
                            [path.join(iconsDir, 'icon-dark.png')]: 'res/ios/appicon-dark.png',
                            [path.join(iconsDir, 'icon-tinted.png')]: 'res/ios/appicon-tint.png',
                            [path.join(iconsDir, 'watchos.png')]: 'res/ios/appicon.png'
                        }, { rootDir: iosProject }, logFileOp);

                        // verify that that Contents.json is as we expect
                        const result = JSON.parse(fs.readFileSync(path.join(iosProject, iconsDir, 'Contents.json')));
                        expect(result).toEqual(require('./fixtures/icon-support/contents-json/single-variants'));
                    });
            });

            it('should update paths if multiple icon sizes are specified', () => {
                const updatePaths = spyOn(FileUpdater, 'updatePaths');

                return updateIconsWithConfig('multi.xml')
                    .then(() => {
                        expect(updatePaths).toHaveBeenCalledWith({
                            [path.join(iconsDir, 'icon.png')]: 'res/ios/AppIcon-1024x1024@1x.png',
                            [path.join(iconsDir, 'watchos.png')]: 'res/ios/AppIcon-1024x1024@1x.png',
                            [path.join(iconsDir, 'icon-20@2x.png')]: 'res/ios/AppIcon-20x20@2x.png',
                            [path.join(iconsDir, 'icon-20@3x.png')]: 'res/ios/AppIcon-20x20@3x.png',
                            [path.join(iconsDir, 'icon-29@2x.png')]: 'res/ios/AppIcon-29x29@2x.png',
                            [path.join(iconsDir, 'icon-29@3x.png')]: 'res/ios/AppIcon-29x29@3x.png',
                            [path.join(iconsDir, 'icon-38@2x.png')]: 'res/ios/AppIcon-38x38@2x.png',
                            [path.join(iconsDir, 'icon-38@3x.png')]: 'res/ios/AppIcon-38x38@3x.png',
                            [path.join(iconsDir, 'icon-40@2x.png')]: 'res/ios/AppIcon-40x40@2x.png',
                            [path.join(iconsDir, 'icon-40@3x.png')]: 'res/ios/AppIcon-40x40@3x.png',
                            [path.join(iconsDir, 'icon-60@2x.png')]: 'res/ios/AppIcon-60x60@2x.png',
                            [path.join(iconsDir, 'icon-60@3x.png')]: 'res/ios/AppIcon-60x60@3x.png',
                            [path.join(iconsDir, 'icon-64@2x.png')]: 'res/ios/AppIcon-64x64@2x.png',
                            [path.join(iconsDir, 'icon-64@3x.png')]: 'res/ios/AppIcon-64x64@3x.png',
                            [path.join(iconsDir, 'icon-68@2x.png')]: 'res/ios/AppIcon-68x68@2x.png',
                            [path.join(iconsDir, 'icon-76@2x.png')]: 'res/ios/AppIcon-76x76@2x.png',
                            [path.join(iconsDir, 'icon-83.5@2x.png')]: 'res/ios/AppIcon-83.5x83.5@2x.png'
                        }, { rootDir: iosProject }, logFileOp);

                        // verify that that Contents.json is as we expect
                        const result = JSON.parse(fs.readFileSync(path.join(iosProject, iconsDir, 'Contents.json')));
                        expect(result).toEqual(require('./fixtures/icon-support/contents-json/multi'));
                    });
            });
        });

        describe('#cleanIcons', () => {
            const updateIcons = prepare.__get__('updateIcons');
            const cleanIcons = prepare.__get__('cleanIcons');
            const logFileOp = prepare.__get__('logFileOp');
            let iconsDir = '';

            beforeEach(() => {
                const platformProjDir = path.relative(iosProject, p.locations.xcodeCordovaProj);
                iconsDir = path.join(platformProjDir, 'Assets.xcassets', 'AppIcon.appiconset');
            });

            it('should remove icon images', () => {
                // create a suitable mock project for our method
                const project = {
                    root: iosProject,
                    locations: p.locations,
                    projectConfig: new ConfigParser(path.join(FIXTURES, 'icon-support', 'configs', 'multi.xml'))
                };

                // copy the icon fixtures to the iOS project
                fs.cpSync(path.join(FIXTURES, 'icon-support', 'res'), path.join(iosProject, 'res'), { recursive: true });

                // copy icons and update Contents.json
                return updateIcons(project, p.locations).then(() => {
                    // now, clean the images
                    const updatePaths = spyOn(FileUpdater, 'updatePaths');

                    return cleanIcons(iosProject, project.projectConfig, p.locations)
                        .then(() => {
                            expect(updatePaths).toHaveBeenCalledWith({
                                [path.join(iconsDir, 'icon.png')]: null,
                                [path.join(iconsDir, 'watchos.png')]: null,
                                [path.join(iconsDir, 'icon-20@2x.png')]: null,
                                [path.join(iconsDir, 'icon-20@3x.png')]: null,
                                [path.join(iconsDir, 'icon-29@2x.png')]: null,
                                [path.join(iconsDir, 'icon-29@3x.png')]: null,
                                [path.join(iconsDir, 'icon-38@2x.png')]: null,
                                [path.join(iconsDir, 'icon-38@3x.png')]: null,
                                [path.join(iconsDir, 'icon-40@2x.png')]: null,
                                [path.join(iconsDir, 'icon-40@3x.png')]: null,
                                [path.join(iconsDir, 'icon-60@2x.png')]: null,
                                [path.join(iconsDir, 'icon-60@3x.png')]: null,
                                [path.join(iconsDir, 'icon-64@2x.png')]: null,
                                [path.join(iconsDir, 'icon-64@3x.png')]: null,
                                [path.join(iconsDir, 'icon-68@2x.png')]: null,
                                [path.join(iconsDir, 'icon-76@2x.png')]: null,
                                [path.join(iconsDir, 'icon-83.5@2x.png')]: null
                            }, { rootDir: iosProject, all: true }, logFileOp);
                        });
                });
            });

            it('should have no effect if no icons are specified', () => {
                // create a suitable mock project for our method
                const project = {
                    root: iosProject,
                    locations: p.locations,
                    projectConfig: new ConfigParser(path.join(FIXTURES, 'icon-support', 'configs', 'none.xml'))
                };

                // copy the icon fixtures to the iOS project
                fs.cpSync(path.join(FIXTURES, 'icon-support', 'res'), path.join(iosProject, 'res'), { recursive: true });

                // copy icons and update Contents.json
                return updateIcons(project, p.locations).then(() => {
                    // now, clean the images
                    const updatePaths = spyOn(FileUpdater, 'updatePaths');

                    return cleanIcons(iosProject, project.projectConfig, p.locations)
                        .then(() => {
                            expect(updatePaths).not.toHaveBeenCalled();
                        });
                });
            });
        });
    });

    describe('colorPreferenceToComponents', () => {
        const colorPreferenceToComponents = prepare.__get__('colorPreferenceToComponents');

        it('should handle #FAB', () => {
            expect(colorPreferenceToComponents('#FAB')).toEqual(jasmine.objectContaining({
                components: {
                    red: '0xFF',
                    green: '0xAA',
                    blue: '0xBB',
                    alpha: '1.000'
                }
            }));
        });

        it('should handle #fab', () => {
            expect(colorPreferenceToComponents('#fab')).toEqual(jasmine.objectContaining({
                components: {
                    red: '0xFF',
                    green: '0xAA',
                    blue: '0xBB',
                    alpha: '1.000'
                }
            }));
        });

        it('should handle #FFAABB', () => {
            expect(colorPreferenceToComponents('#FFAABB')).toEqual(jasmine.objectContaining({
                components: {
                    red: '0xFF',
                    green: '0xAA',
                    blue: '0xBB',
                    alpha: '1.000'
                }
            }));
        });

        it('should handle #ffaabb', () => {
            expect(colorPreferenceToComponents('#ffaabb')).toEqual(jasmine.objectContaining({
                components: {
                    red: '0xFF',
                    green: '0xAA',
                    blue: '0xBB',
                    alpha: '1.000'
                }
            }));
        });

        it('should handle 0xFFAABB', () => {
            expect(colorPreferenceToComponents('0xFFAABB')).toEqual(jasmine.objectContaining({
                components: {
                    red: '0xFF',
                    green: '0xAA',
                    blue: '0xBB',
                    alpha: '1.000'
                }
            }));
        });

        it('should handle 0xffaabb', () => {
            expect(colorPreferenceToComponents('0xffaabb')).toEqual(jasmine.objectContaining({
                components: {
                    red: '0xFF',
                    green: '0xAA',
                    blue: '0xBB',
                    alpha: '1.000'
                }
            }));
        });

        it('should handle #99FFAABB', () => {
            expect(colorPreferenceToComponents('#99FFAABB')).toEqual(jasmine.objectContaining({
                components: {
                    red: '0xFF',
                    green: '0xAA',
                    blue: '0xBB',
                    alpha: '0.600'
                }
            }));
        });

        it('should handle #99ffaabb', () => {
            expect(colorPreferenceToComponents('#99ffaabb')).toEqual(jasmine.objectContaining({
                components: {
                    red: '0xFF',
                    green: '0xAA',
                    blue: '0xBB',
                    alpha: '0.600'
                }
            }));
        });

        it('should handle 0x99FFAABB', () => {
            expect(colorPreferenceToComponents('0x99FFAABB')).toEqual(jasmine.objectContaining({
                components: {
                    red: '0xFF',
                    green: '0xAA',
                    blue: '0xBB',
                    alpha: '0.600'
                }
            }));
        });

        it('should handle 0x99ffaabb', () => {
            expect(colorPreferenceToComponents('0x99ffaabb')).toEqual(jasmine.objectContaining({
                components: {
                    red: '0xFF',
                    green: '0xAA',
                    blue: '0xBB',
                    alpha: '0.600'
                }
            }));
        });

        it('should handle null with default', () => {
            expect(colorPreferenceToComponents(null)).toEqual(jasmine.objectContaining({
                reference: 'systemBackgroundColor'
            }));
        });

        it('should handle black with default', () => {
            expect(colorPreferenceToComponents('black')).toEqual(jasmine.objectContaining({
                reference: 'systemBackgroundColor'
            }));
        });

        it('should handle 0xFAB with default', () => {
            expect(colorPreferenceToComponents('0xFAB')).toEqual(jasmine.objectContaining({
                reference: 'systemBackgroundColor'
            }));
        });

        it('should handle #1234 with default', () => {
            expect(colorPreferenceToComponents('#1234')).toEqual(jasmine.objectContaining({
                reference: 'systemBackgroundColor'
            }));
        });

        it('should handle #12345 with default', () => {
            expect(colorPreferenceToComponents('#12345')).toEqual(jasmine.objectContaining({
                reference: 'systemBackgroundColor'
            }));
        });

        it('should handle #1234567 with default', () => {
            expect(colorPreferenceToComponents('#1234567')).toEqual(jasmine.objectContaining({
                reference: 'systemBackgroundColor'
            }));
        });

        it('should handle #NOTHEX with default', () => {
            expect(colorPreferenceToComponents('#NOTHEX')).toEqual(jasmine.objectContaining({
                reference: 'systemBackgroundColor'
            }));
        });
    });

    describe('updateProject method', () => {
        /* eslint-disable no-unused-vars */
        let update_name;
        let writeFileSyncSpy;
        let cfg;
        let cfg2;
        let cfg3;

        const updateProject = prepare.__get__('updateProject');

        beforeEach(() => {
            // Create real config objects before mocking out everything.
            cfg = new ConfigParser(path.join(FIXTURES, 'test-config.xml'));
            cfg2 = new ConfigParser(path.join(FIXTURES, 'test-config-2.xml'));
            cfg3 = new ConfigParser(path.join(FIXTURES, 'test-config-3.xml'));

            writeFileSyncSpy = spyOn(fs, 'writeFileSync');

            spyOn(plist, 'parse').and.returnValue({});
            spyOn(plist, 'build').and.returnValue('');
            spyOn(xcode, 'project').and.callFake(pbxproj => {
                const xc = new XcodeProject(pbxproj);
                update_name = spyOn(xc, 'updateProductName').and.callThrough();
                return xc;
            });
            cfg.packageName = () => 'testpkg';
            cfg.version = () => 'one point oh';

            spyOn(cfg, 'getPreference');
        });

        it('should resolve', () => {
            return updateProject(cfg2, p.locations);
        });

        it('should write target-device preference', () => {
            writeFileSyncSpy.and.callThrough();

            return updateProject(cfg2, p.locations).then(() => {
                const proj = new XcodeProject(p.locations.pbxproj);
                proj.parseSync();
                const prop = proj.getBuildProperty('TARGETED_DEVICE_FAMILY');
                expect(prop).toEqual('"1"'); // 1 is handset
            });
        });
        it('should write deployment-target preference', () => {
            writeFileSyncSpy.and.callThrough();

            return updateProject(cfg2, p.locations).then(() => {
                const proj = new XcodeProject(p.locations.pbxproj);
                proj.parseSync();
                const prop = proj.getBuildProperty('IPHONEOS_DEPLOYMENT_TARGET');
                expect(prop).toEqual('15.0');
            });
        });
        it('should write SwiftVersion preference (4.1)', () => {
            writeFileSyncSpy.and.callThrough();
            return updateProject(cfg3, p.locations).then(() => {
                const proj = new XcodeProject(p.locations.pbxproj);
                proj.parseSync();
                const prop = proj.getBuildProperty('SWIFT_VERSION');
                expect(prop).toEqual('4.1');
            });
        });
        it('should write SwiftVersion preference (3.3)', () => {
            const pref = cfg3.doc.findall('platform[@name=\'ios\']/preference')
                .filter(elem => elem.attrib.name.toLowerCase() === 'swiftversion')[0];
            pref.attrib.value = '3.3';
            writeFileSyncSpy.and.callThrough();
            return updateProject(cfg3, p.locations).then(() => {
                const proj = new XcodeProject(p.locations.pbxproj);
                proj.parseSync();
                const prop = proj.getBuildProperty('SWIFT_VERSION');
                expect(prop).toEqual('3.3');
            });
        });

        it('Test#002 : should write out the app id to info plist as CFBundleIdentifier', () => {
            const orig = cfg.getAttribute;
            cfg.getAttribute = function (name) {
                if (name === 'ios-CFBundleIdentifier') {
                    return null;
                }
                return orig.call(this, name);
            };
            writeFileSyncSpy.and.callThrough();

            return updateProject(cfg, p.locations).then(() => {
                const proj = new XcodeProject(p.locations.pbxproj);
                proj.parseSync();
                const prop = proj.getBuildProperty('PRODUCT_BUNDLE_IDENTIFIER', undefined, 'App');
                expect(prop).toEqual('"testpkg"');
            });
        });
        it('Test#003 : should write out the app id to info plist as CFBundleIdentifier with ios-CFBundleIdentifier', () => {
            const orig = cfg.getAttribute;
            cfg.getAttribute = function (name) {
                if (name === 'ios-CFBundleIdentifier') {
                    return 'testpkg_ios';
                }
                return orig.call(this, name);
            };

            writeFileSyncSpy.and.callThrough();

            return updateProject(cfg, p.locations).then(() => {
                const proj = new XcodeProject(p.locations.pbxproj);
                proj.parseSync();
                const prop = proj.getBuildProperty('PRODUCT_BUNDLE_IDENTIFIER', undefined, 'App');
                expect(prop).toEqual('"testpkg_ios"');
            });
        });
        it('Test#004 : should write out the app version to info plist as CFBundleVersion', () => {
            writeFileSyncSpy.and.callThrough();
            return updateProject(cfg, p.locations).then(() => {
                const proj = new XcodeProject(p.locations.pbxproj);
                proj.parseSync();
                const prop = proj.getBuildProperty('MARKETING_VERSION', undefined, 'App');
                expect(prop).toEqual('one point oh');
            });
        });
        it('Test#005 : should write out the orientation preference value', () => {
            cfg.getPreference.and.callThrough();
            writeFileSyncSpy.and.callThrough();
            return updateProject(cfg, p.locations).then(() => {
                const proj = new XcodeProject(p.locations.pbxproj);
                proj.parseSync();

                const orientation = proj.getBuildProperty('INFOPLIST_KEY_UIInterfaceOrientation', undefined, 'App');
                expect(orientation).toEqual('"UIInterfaceOrientationPortrait"');

                const phone_supported = proj.getBuildProperty('INFOPLIST_KEY_UISupportedInterfaceOrientations_iPhone', undefined, 'App');
                expect(phone_supported).toEqual('"UIInterfaceOrientationPortrait UIInterfaceOrientationPortraitUpsideDown"');

                const pad_supported = proj.getBuildProperty('INFOPLIST_KEY_UISupportedInterfaceOrientations_iPad', undefined, 'App');
                expect(pad_supported).toEqual('"UIInterfaceOrientationPortrait UIInterfaceOrientationPortraitUpsideDown"');
            });
        });
        it('Test#006 : should handle no orientation', () => {
            cfg.getPreference.and.returnValue(null);
            writeFileSyncSpy.and.callThrough();
            return updateProject(cfg, p.locations).then(() => {
                const proj = new XcodeProject(p.locations.pbxproj);
                proj.parseSync();

                const orientation = proj.getBuildProperty('INFOPLIST_KEY_UIInterfaceOrientation', undefined, 'App');
                expect(orientation).toBeUndefined();

                const phone_supported = proj.getBuildProperty('INFOPLIST_KEY_UISupportedInterfaceOrientations_iPhone', undefined, 'App');
                expect(phone_supported).toEqual('"UIInterfaceOrientationPortrait UIInterfaceOrientationLandscapeLeft UIInterfaceOrientationLandscapeRight"');

                const pad_supported = proj.getBuildProperty('INFOPLIST_KEY_UISupportedInterfaceOrientations_iPad', undefined, 'App');
                expect(pad_supported).toEqual('"UIInterfaceOrientationPortrait UIInterfaceOrientationPortraitUpsideDown UIInterfaceOrientationLandscapeLeft UIInterfaceOrientationLandscapeRight"');
            });
        });
        it('Test#007 : should handle default orientation', () => {
            cfg.getPreference.and.returnValue('default');
            writeFileSyncSpy.and.callThrough();
            return updateProject(cfg, p.locations).then(() => {
                const proj = new XcodeProject(p.locations.pbxproj);
                proj.parseSync();

                const orientation = proj.getBuildProperty('INFOPLIST_KEY_UIInterfaceOrientation', undefined, 'App');
                expect(orientation).toBeUndefined();

                const phone_supported = proj.getBuildProperty('INFOPLIST_KEY_UISupportedInterfaceOrientations_iPhone', undefined, 'App');
                expect(phone_supported).toEqual('"UIInterfaceOrientationPortrait UIInterfaceOrientationLandscapeLeft UIInterfaceOrientationLandscapeRight"');

                const pad_supported = proj.getBuildProperty('INFOPLIST_KEY_UISupportedInterfaceOrientations_iPad', undefined, 'App');
                expect(pad_supported).toEqual('"UIInterfaceOrientationPortrait UIInterfaceOrientationPortraitUpsideDown UIInterfaceOrientationLandscapeLeft UIInterfaceOrientationLandscapeRight"');
            });
        });
        it('Test#008 : should handle portrait orientation', () => {
            cfg.getPreference.and.returnValue('portrait');
            writeFileSyncSpy.and.callThrough();
            return updateProject(cfg, p.locations).then(() => {
                const proj = new XcodeProject(p.locations.pbxproj);
                proj.parseSync();

                const orientation = proj.getBuildProperty('INFOPLIST_KEY_UIInterfaceOrientation', undefined, 'App');
                expect(orientation).toEqual('"UIInterfaceOrientationPortrait"');

                const phone_supported = proj.getBuildProperty('INFOPLIST_KEY_UISupportedInterfaceOrientations_iPhone', undefined, 'App');
                expect(phone_supported).toEqual('"UIInterfaceOrientationPortrait UIInterfaceOrientationPortraitUpsideDown"');

                const pad_supported = proj.getBuildProperty('INFOPLIST_KEY_UISupportedInterfaceOrientations_iPad', undefined, 'App');
                expect(pad_supported).toEqual('"UIInterfaceOrientationPortrait UIInterfaceOrientationPortraitUpsideDown"');
            });
        });
        it('Test#009 : should handle landscape orientation', () => {
            cfg.getPreference.and.returnValue('landscape');
            writeFileSyncSpy.and.callThrough();
            return updateProject(cfg, p.locations).then(() => {
                const proj = new XcodeProject(p.locations.pbxproj);
                proj.parseSync();

                const orientation = proj.getBuildProperty('INFOPLIST_KEY_UIInterfaceOrientation', undefined, 'App');
                expect(orientation).toEqual('"UIInterfaceOrientationLandscapeLeft"');

                const phone_supported = proj.getBuildProperty('INFOPLIST_KEY_UISupportedInterfaceOrientations_iPhone', undefined, 'App');
                expect(phone_supported).toEqual('"UIInterfaceOrientationLandscapeLeft UIInterfaceOrientationLandscapeRight"');

                const pad_supported = proj.getBuildProperty('INFOPLIST_KEY_UISupportedInterfaceOrientations_iPad', undefined, 'App');
                expect(pad_supported).toEqual('"UIInterfaceOrientationLandscapeLeft UIInterfaceOrientationLandscapeRight"');
            });
        });
        it('Test#010 : should handle all orientation on ios', () => {
            cfg.getPreference.and.returnValue('all');
            writeFileSyncSpy.and.callThrough();
            return updateProject(cfg, p.locations).then(() => {
                const proj = new XcodeProject(p.locations.pbxproj);
                proj.parseSync();

                const orientation = proj.getBuildProperty('INFOPLIST_KEY_UIInterfaceOrientation', undefined, 'App');
                expect(orientation).toEqual('"UIInterfaceOrientationPortrait"');

                const phone_supported = proj.getBuildProperty('INFOPLIST_KEY_UISupportedInterfaceOrientations_iPhone', undefined, 'App');
                expect(phone_supported).toEqual('"UIInterfaceOrientationPortrait UIInterfaceOrientationPortraitUpsideDown UIInterfaceOrientationLandscapeLeft UIInterfaceOrientationLandscapeRight"');

                const pad_supported = proj.getBuildProperty('INFOPLIST_KEY_UISupportedInterfaceOrientations_iPad', undefined, 'App');
                expect(pad_supported).toEqual('"UIInterfaceOrientationPortrait UIInterfaceOrientationPortraitUpsideDown UIInterfaceOrientationLandscapeLeft UIInterfaceOrientationLandscapeRight"');
            });
        });
        it('Test#011 : should handle custom orientation', () => {
            cfg.getPreference.and.returnValue('some-custom-orientation');
            writeFileSyncSpy.and.callThrough();
            return updateProject(cfg, p.locations).then(() => {
                const proj = new XcodeProject(p.locations.pbxproj);
                proj.parseSync();

                const orientation = proj.getBuildProperty('INFOPLIST_KEY_UIInterfaceOrientation', undefined, 'App');
                expect(orientation).toBeUndefined();

                const phone_supported = proj.getBuildProperty('INFOPLIST_KEY_UISupportedInterfaceOrientations_iPhone', undefined, 'App');
                expect(phone_supported).toEqual('"UIInterfaceOrientationPortrait UIInterfaceOrientationLandscapeLeft UIInterfaceOrientationLandscapeRight"');

                const pad_supported = proj.getBuildProperty('INFOPLIST_KEY_UISupportedInterfaceOrientations_iPad', undefined, 'App');
                expect(pad_supported).toEqual('"UIInterfaceOrientationPortrait UIInterfaceOrientationPortraitUpsideDown UIInterfaceOrientationLandscapeLeft UIInterfaceOrientationLandscapeRight"');
            });
        });

        /// // App Transport Security Tests /////////////////////////////
        // NOTE: if an ATS value is equal to "null", it means that it was not written,
        // thus it will use the default (check the default for the key).
        // This is to prevent the Info.plist to be too verbose.
        it('Test#012 : <access> - should handle wildcard', () => {
            return updateProject(cfg, p.locations).then(() => {
                const ats = plist.build.calls.mostRecent().args[0].NSAppTransportSecurity;
                expect(ats.NSAllowsArbitraryLoads).toEqual(true);
                expect(ats.NSAllowsArbitraryLoadsInWebContent).toEqual(undefined);
                expect(ats.NSAllowsArbitraryLoadsInMedia).toEqual(undefined); // DEPRECATED
                expect(ats.NSAllowsArbitraryLoadsForMedia).toEqual(undefined);
                expect(ats.NSAllowsLocalNetworking).toEqual(undefined);
            });
        });

        it('<access> - should handle wildcard, with NSAllowsArbitraryLoadsInWebContent', () => {
            const my_config = new ConfigParser(path.join(FIXTURES, 'prepare', 'allows-arbitrary-loads-in-web-content-true.xml'));
            return updateProject(my_config, p.locations).then(() => {
                const ats = plist.build.calls.mostRecent().args[0].NSAppTransportSecurity;
                expect(ats.NSAllowsArbitraryLoads).toEqual(true);
                expect(ats.NSAllowsArbitraryLoadsInWebContent).toEqual(true);
                expect(ats.NSAllowsArbitraryLoadsInMedia).toEqual(undefined); // DEPRECATED
                expect(ats.NSAllowsArbitraryLoadsForMedia).toEqual(undefined);
                expect(ats.NSAllowsLocalNetworking).toEqual(undefined);
            });
        });

        it('<access> - should handle wildcard, with NSAllowsArbitraryLoadsForMedia set (fixed allows-arbitrary-loads-for-media)', () => {
            const my_config = new ConfigParser(path.join(FIXTURES, 'prepare', 'allows-arbitrary-loads-for-media-true.xml'));
            return updateProject(my_config, p.locations).then(() => {
                const ats = plist.build.calls.mostRecent().args[0].NSAppTransportSecurity;
                expect(ats.NSAllowsArbitraryLoads).toEqual(true);
                expect(ats.NSAllowsArbitraryLoadsInWebContent).toEqual(undefined);
                expect(ats.NSAllowsArbitraryLoadsInMedia).toEqual(undefined); // DEPRECATED
                expect(ats.NSAllowsArbitraryLoadsForMedia).toEqual(true);
                expect(ats.NSAllowsLocalNetworking).toEqual(undefined);
            });
        });

        it('<access> - should handle wildcard, with NSAllowsArbitraryLoadsForMedia not set (fixed allows-arbitrary-loads-for-media)', () => {
            const my_config = new ConfigParser(path.join(FIXTURES, 'prepare', 'allows-arbitrary-loads-for-media-false.xml'));
            return updateProject(my_config, p.locations).then(() => {
                const ats = plist.build.calls.mostRecent().args[0].NSAppTransportSecurity;
                expect(ats.NSAllowsArbitraryLoads).toEqual(true);
                expect(ats.NSAllowsArbitraryLoadsInWebContent).toEqual(undefined);
                expect(ats.NSAllowsArbitraryLoadsInMedia).toEqual(undefined); // DEPRECATED
                expect(ats.NSAllowsArbitraryLoadsForMedia).toEqual(undefined);
                expect(ats.NSAllowsLocalNetworking).toEqual(undefined);
            });
        });

        it('<access> - should handle wildcard, with NSAllowsArbitraryLoadsForMedia set (deprecated allows-arbitrary-loads-in-media)', () => {
            const my_config = new ConfigParser(path.join(FIXTURES, 'prepare', 'allows-arbitrary-loads-in-media-true.xml'));
            return updateProject(my_config, p.locations).then(() => {
                const ats = plist.build.calls.mostRecent().args[0].NSAppTransportSecurity;
                expect(ats.NSAllowsArbitraryLoads).toEqual(true);
                expect(ats.NSAllowsArbitraryLoadsInWebContent).toEqual(undefined);
                expect(ats.NSAllowsArbitraryLoadsInMedia).toEqual(undefined); // DEPRECATED
                expect(ats.NSAllowsArbitraryLoadsForMedia).toEqual(true);
                expect(ats.NSAllowsLocalNetworking).toEqual(undefined);
            });
        });

        it('<access> - should handle wildcard, with NSAllowsArbitraryLoadsForMedia not set (deprecated allows-arbitrary-loads-in-media)', () => {
            const my_config = new ConfigParser(path.join(FIXTURES, 'prepare', 'allows-arbitrary-loads-in-media-false.xml'));
            return updateProject(my_config, p.locations).then(() => {
                const ats = plist.build.calls.mostRecent().args[0].NSAppTransportSecurity;
                expect(ats.NSAllowsArbitraryLoads).toEqual(true);
                expect(ats.NSAllowsArbitraryLoadsInWebContent).toEqual(undefined);
                expect(ats.NSAllowsArbitraryLoadsInMedia).toEqual(undefined); // DEPRECATED
                expect(ats.NSAllowsArbitraryLoadsForMedia).toEqual(undefined);
                expect(ats.NSAllowsLocalNetworking).toEqual(undefined);
            });
        });

        it('<access> - should handle wildcard, with NSAllowsLocalNetworking', () => {
            const my_config = new ConfigParser(path.join(FIXTURES, 'prepare', 'allows-local-networking-true.xml'));
            return updateProject(my_config, p.locations).then(() => {
                const ats = plist.build.calls.mostRecent().args[0].NSAppTransportSecurity;
                expect(ats.NSAllowsArbitraryLoads).toEqual(true);
                expect(ats.NSAllowsArbitraryLoadsInWebContent).toEqual(undefined);
                expect(ats.NSAllowsArbitraryLoadsInMedia).toEqual(undefined); // DEPRECATED
                expect(ats.NSAllowsArbitraryLoadsForMedia).toEqual(undefined);
                expect(ats.NSAllowsLocalNetworking).toEqual(true);
            });
        });

        it('<access> - should handle wildcard, with NSAllowsArbitraryLoadsInWebContent, NSAllowsArbitraryLoadsForMedia, NSAllowsLocalNetworking', () => {
            const my_config = new ConfigParser(path.join(FIXTURES, 'prepare', 'wildcard-with-mixed-nsallows.xml'));
            return updateProject(my_config, p.locations).then(() => {
                const ats = plist.build.calls.mostRecent().args[0].NSAppTransportSecurity;
                expect(ats.NSAllowsArbitraryLoads).toEqual(true);
                expect(ats.NSAllowsArbitraryLoadsInWebContent).toEqual(true);
                expect(ats.NSAllowsArbitraryLoadsInMedia).toEqual(undefined); // DEPRECATED
                expect(ats.NSAllowsArbitraryLoadsForMedia).toEqual(true);
                expect(ats.NSAllowsLocalNetworking).toEqual(true);
            });
        });
        it('<access> - sanity check - no wildcard but has NSAllowsArbitraryLoadsInWebContent, NSAllowsArbitraryLoadsForMedia, NSAllowsLocalNetworking', () => {
            const my_config = new ConfigParser(path.join(FIXTURES, 'prepare', 'set-origin-with-mixed-nsallows.xml'));
            return updateProject(my_config, p.locations).then(() => {
                const ats = plist.build.calls.mostRecent().args[0].NSAppTransportSecurity;
                expect(ats.NSAllowsArbitraryLoads).toEqual(undefined);
                expect(ats.NSAllowsArbitraryLoadsInWebContent).toEqual(undefined);
                expect(ats.NSAllowsArbitraryLoadsInMedia).toEqual(undefined); // DEPRECATED
                expect(ats.NSAllowsArbitraryLoadsForMedia).toEqual(undefined);
                expect(ats.NSAllowsLocalNetworking).toEqual(undefined);
            });
        });

        it('Test#13 : <access> - https, subdomain wildcard', () => {
            return updateProject(cfg, p.locations).then(() => {
                const ats = plist.build.calls.mostRecent().args[0].NSAppTransportSecurity;
                const exceptionDomains = ats.NSExceptionDomains;
                let d;

                expect(exceptionDomains).toBeTruthy();

                d = exceptionDomains['server01.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(true);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(undefined);
                expect(d.NSExceptionMinimumTLSVersion).toEqual(undefined);
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(undefined);
                expect(d.NSRequiresCertificateTransparency).toEqual(undefined);

                d = exceptionDomains['server02.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(true);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(undefined);
                expect(d.NSExceptionMinimumTLSVersion).toEqual(undefined);
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(false);
                expect(d.NSRequiresCertificateTransparency).toEqual(undefined);

                d = exceptionDomains['server02-1.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(true);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(undefined);
                expect(d.NSExceptionMinimumTLSVersion).toEqual(undefined);
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(undefined);
                expect(d.NSRequiresCertificateTransparency).toEqual(true);

                d = exceptionDomains['server02-2.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(true);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(undefined);
                expect(d.NSExceptionMinimumTLSVersion).toEqual(undefined);
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(false);
                expect(d.NSRequiresCertificateTransparency).toEqual(true);

                d = exceptionDomains['server03.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(true);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(undefined);
                expect(d.NSExceptionMinimumTLSVersion).toEqual('TLSv1.1');
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(undefined);
                expect(d.NSRequiresCertificateTransparency).toEqual(undefined);

                d = exceptionDomains['server04.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(true);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(undefined);
                expect(d.NSExceptionMinimumTLSVersion).toEqual('TLSv1.1');
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(false);
                expect(d.NSRequiresCertificateTransparency).toEqual(undefined);

                d = exceptionDomains['server04-1.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(true);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(undefined);
                expect(d.NSExceptionMinimumTLSVersion).toEqual('TLSv1.1');
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(undefined);
                expect(d.NSRequiresCertificateTransparency).toEqual(true);

                d = exceptionDomains['server04-2.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(true);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(undefined);
                expect(d.NSExceptionMinimumTLSVersion).toEqual('TLSv1.1');
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(false);
                expect(d.NSRequiresCertificateTransparency).toEqual(true);
            });
        });

        it('Test#014 : <access> - http, no wildcard', () => {
            return updateProject(cfg, p.locations).then(() => {
                const ats = plist.build.calls.mostRecent().args[0].NSAppTransportSecurity;
                const exceptionDomains = ats.NSExceptionDomains;
                let d;

                expect(exceptionDomains).toBeTruthy();

                d = exceptionDomains['server05.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(undefined);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(true);
                expect(d.NSExceptionMinimumTLSVersion).toEqual(undefined);
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(undefined);
                expect(d.NSRequiresCertificateTransparency).toEqual(undefined);

                d = exceptionDomains['server06.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(undefined);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(true);
                expect(d.NSExceptionMinimumTLSVersion).toEqual(undefined);
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(false);
                expect(d.NSRequiresCertificateTransparency).toEqual(undefined);

                d = exceptionDomains['server06-1.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(undefined);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(true);
                expect(d.NSExceptionMinimumTLSVersion).toEqual(undefined);
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(undefined);
                expect(d.NSRequiresCertificateTransparency).toEqual(true);

                d = exceptionDomains['server06-2.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(undefined);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(true);
                expect(d.NSExceptionMinimumTLSVersion).toEqual(undefined);
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(false);
                expect(d.NSRequiresCertificateTransparency).toEqual(true);

                d = exceptionDomains['server07.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(undefined);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(true);
                expect(d.NSExceptionMinimumTLSVersion).toEqual('TLSv1.1');
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(undefined);
                expect(d.NSRequiresCertificateTransparency).toEqual(undefined);

                d = exceptionDomains['server08.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(undefined);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(true);
                expect(d.NSExceptionMinimumTLSVersion).toEqual('TLSv1.1');
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(false);
                expect(d.NSRequiresCertificateTransparency).toEqual(undefined);

                d = exceptionDomains['server08-1.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(undefined);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(true);
                expect(d.NSExceptionMinimumTLSVersion).toEqual('TLSv1.1');
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(undefined);
                expect(d.NSRequiresCertificateTransparency).toEqual(true);

                d = exceptionDomains['server08-2.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(undefined);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(true);
                expect(d.NSExceptionMinimumTLSVersion).toEqual('TLSv1.1');
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(false);
                expect(d.NSRequiresCertificateTransparency).toEqual(true);
            });
        });
        it('Test#015 : <access> - https, no wildcard', () => {
            return updateProject(cfg, p.locations).then(() => {
                const ats = plist.build.calls.mostRecent().args[0].NSAppTransportSecurity;
                const exceptionDomains = ats.NSExceptionDomains;
                let d;

                expect(exceptionDomains).toBeTruthy();

                d = exceptionDomains['server09.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(undefined);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(undefined);
                expect(d.NSExceptionMinimumTLSVersion).toEqual(undefined);
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(undefined);
                expect(d.NSRequiresCertificateTransparency).toEqual(undefined);

                d = exceptionDomains['server10.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(undefined);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(undefined);
                expect(d.NSExceptionMinimumTLSVersion).toEqual(undefined);
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(false);
                expect(d.NSRequiresCertificateTransparency).toEqual(undefined);

                d = exceptionDomains['server10-1.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(undefined);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(undefined);
                expect(d.NSExceptionMinimumTLSVersion).toEqual(undefined);
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(undefined);
                expect(d.NSRequiresCertificateTransparency).toEqual(true);

                d = exceptionDomains['server10-2.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(undefined);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(undefined);
                expect(d.NSExceptionMinimumTLSVersion).toEqual(undefined);
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(false);
                expect(d.NSRequiresCertificateTransparency).toEqual(true);

                d = exceptionDomains['server11.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(undefined);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(undefined);
                expect(d.NSExceptionMinimumTLSVersion).toEqual('TLSv1.1');
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(undefined);
                expect(d.NSRequiresCertificateTransparency).toEqual(undefined);

                d = exceptionDomains['server12.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(undefined);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(undefined);
                expect(d.NSExceptionMinimumTLSVersion).toEqual('TLSv1.1');
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(false);
                expect(d.NSRequiresCertificateTransparency).toEqual(undefined);

                d = exceptionDomains['server12-1.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(undefined);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(undefined);
                expect(d.NSExceptionMinimumTLSVersion).toEqual('TLSv1.1');
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(undefined);
                expect(d.NSRequiresCertificateTransparency).toEqual(true);

                d = exceptionDomains['server12-2.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(undefined);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(undefined);
                expect(d.NSExceptionMinimumTLSVersion).toEqual('TLSv1.1');
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(false);
                expect(d.NSRequiresCertificateTransparency).toEqual(true);
            });
        });
        /// ///////////////////////////////////////////////
        it('Test#016 : <access>, <allow-navigation> - http and https, no clobber', () => {
            return updateProject(cfg2, p.locations).then(() => {
                const ats = plist.build.calls.mostRecent().args[0].NSAppTransportSecurity;
                const exceptionDomains = ats.NSExceptionDomains;

                expect(exceptionDomains).toBeTruthy();

                const d = exceptionDomains['apache.org'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(true);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(true);
                expect(d.NSExceptionMinimumTLSVersion).toEqual(undefined);
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(undefined);
                expect(d.NSRequiresCertificateTransparency).toEqual(undefined);
            });
        });
        /// ///////////////////////////////////////////////

        it('<allow-navigation> - should handle wildcard', () => {
            const my_config = new ConfigParser(path.join(FIXTURES, 'prepare', 'wildcard-navigation.xml'));
            return updateProject(my_config, p.locations).then(() => {
                const ats = plist.build.calls.mostRecent().args[0].NSAppTransportSecurity;
                expect(ats.NSAllowsArbitraryLoads).toEqual(true);
                expect(ats.NSAllowsArbitraryLoadsInWebContent).toEqual(undefined);
                expect(ats.NSAllowsArbitraryLoadsInMedia).toEqual(undefined); // DEPRECATED
                expect(ats.NSAllowsArbitraryLoadsForMedia).toEqual(undefined);
                expect(ats.NSAllowsLocalNetworking).toEqual(undefined);
            });
        });

        it('<allow-navigation> - sanity check - no wildcard but has NSAllowsArbitraryLoadsInWebContent, NSAllowsArbitraryLoadsForMedia, NSAllowsLocalNetworking', () => {
            const my_config = new ConfigParser(path.join(FIXTURES, 'prepare', 'wildcard-navigation-with-mixed-nsallows.xml'));
            return updateProject(my_config, p.locations).then(() => {
                const ats = plist.build.calls.mostRecent().args[0].NSAppTransportSecurity;
                expect(ats.NSAllowsArbitraryLoads).toEqual(undefined);
                expect(ats.NSAllowsArbitraryLoadsInWebContent).toEqual(undefined);
                expect(ats.NSAllowsArbitraryLoadsInMedia).toEqual(undefined); // DEPRECATED
                expect(ats.NSAllowsArbitraryLoadsForMedia).toEqual(undefined);
                expect(ats.NSAllowsLocalNetworking).toEqual(undefined);
            });
        });

        it('<allow-navigation> - https, subdomain wildcard', () => {
            return updateProject(cfg, p.locations).then(() => {
                const ats = plist.build.calls.mostRecent().args[0].NSAppTransportSecurity;
                const exceptionDomains = ats.NSExceptionDomains;
                let d;

                expect(exceptionDomains).toBeTruthy();

                d = exceptionDomains['server21.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(true);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(undefined);
                expect(d.NSExceptionMinimumTLSVersion).toEqual(undefined);
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(undefined);
                expect(d.NSRequiresCertificateTransparency).toEqual(undefined);

                d = exceptionDomains['server22.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(true);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(undefined);
                expect(d.NSExceptionMinimumTLSVersion).toEqual(undefined);
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(false);
                expect(d.NSRequiresCertificateTransparency).toEqual(undefined);

                d = exceptionDomains['server22-1.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(true);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(undefined);
                expect(d.NSExceptionMinimumTLSVersion).toEqual(undefined);
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(undefined);
                expect(d.NSRequiresCertificateTransparency).toEqual(true);

                d = exceptionDomains['server22-2.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(true);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(undefined);
                expect(d.NSExceptionMinimumTLSVersion).toEqual(undefined);
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(false);
                expect(d.NSRequiresCertificateTransparency).toEqual(true);

                d = exceptionDomains['server23.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(true);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(undefined);
                expect(d.NSExceptionMinimumTLSVersion).toEqual('TLSv1.1');
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(undefined);
                expect(d.NSRequiresCertificateTransparency).toEqual(undefined);

                d = exceptionDomains['server24.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(true);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(undefined);
                expect(d.NSExceptionMinimumTLSVersion).toEqual('TLSv1.1');
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(false);
                expect(d.NSRequiresCertificateTransparency).toEqual(undefined);

                d = exceptionDomains['server24-1.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(true);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(undefined);
                expect(d.NSExceptionMinimumTLSVersion).toEqual('TLSv1.1');
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(undefined);
                expect(d.NSRequiresCertificateTransparency).toEqual(true);

                d = exceptionDomains['server24-2.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(true);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(undefined);
                expect(d.NSExceptionMinimumTLSVersion).toEqual('TLSv1.1');
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(false);
                expect(d.NSRequiresCertificateTransparency).toEqual(true);
            });
        });

        it('<allow-navigation> - http, no wildcard', () => {
            return updateProject(cfg, p.locations).then(() => {
                const ats = plist.build.calls.mostRecent().args[0].NSAppTransportSecurity;
                const exceptionDomains = ats.NSExceptionDomains;
                let d;

                expect(exceptionDomains).toBeTruthy();

                d = exceptionDomains['server25.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(undefined);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(true);
                expect(d.NSExceptionMinimumTLSVersion).toEqual(undefined);
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(undefined);
                expect(d.NSRequiresCertificateTransparency).toEqual(undefined);

                d = exceptionDomains['server26.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(undefined);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(true);
                expect(d.NSExceptionMinimumTLSVersion).toEqual(undefined);
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(false);
                expect(d.NSRequiresCertificateTransparency).toEqual(undefined);

                d = exceptionDomains['server26-1.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(undefined);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(true);
                expect(d.NSExceptionMinimumTLSVersion).toEqual(undefined);
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(undefined);
                expect(d.NSRequiresCertificateTransparency).toEqual(true);

                d = exceptionDomains['server26-2.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(undefined);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(true);
                expect(d.NSExceptionMinimumTLSVersion).toEqual(undefined);
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(false);
                expect(d.NSRequiresCertificateTransparency).toEqual(true);

                d = exceptionDomains['server27.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(undefined);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(true);
                expect(d.NSExceptionMinimumTLSVersion).toEqual('TLSv1.1');
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(undefined);
                expect(d.NSRequiresCertificateTransparency).toEqual(undefined);

                d = exceptionDomains['server28.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(undefined);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(true);
                expect(d.NSExceptionMinimumTLSVersion).toEqual('TLSv1.1');
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(false);
                expect(d.NSRequiresCertificateTransparency).toEqual(undefined);

                d = exceptionDomains['server28-1.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(undefined);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(true);
                expect(d.NSExceptionMinimumTLSVersion).toEqual('TLSv1.1');
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(undefined);
                expect(d.NSRequiresCertificateTransparency).toEqual(true);

                d = exceptionDomains['server28-2.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(undefined);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(true);
                expect(d.NSExceptionMinimumTLSVersion).toEqual('TLSv1.1');
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(false);
                expect(d.NSRequiresCertificateTransparency).toEqual(true);
            });
        });

        it('<allow-navigation> - https, no wildcard', () => {
            return updateProject(cfg, p.locations).then(() => {
                const ats = plist.build.calls.mostRecent().args[0].NSAppTransportSecurity;
                const exceptionDomains = ats.NSExceptionDomains;
                let d;

                expect(exceptionDomains).toBeTruthy();

                d = exceptionDomains['server29.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(undefined);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(undefined);
                expect(d.NSExceptionMinimumTLSVersion).toEqual(undefined);
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(undefined);
                expect(d.NSRequiresCertificateTransparency).toEqual(undefined);

                d = exceptionDomains['server30.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(undefined);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(undefined);
                expect(d.NSExceptionMinimumTLSVersion).toEqual(undefined);
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(false);
                expect(d.NSRequiresCertificateTransparency).toEqual(undefined);

                d = exceptionDomains['server30-1.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(undefined);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(undefined);
                expect(d.NSExceptionMinimumTLSVersion).toEqual(undefined);
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(undefined);
                expect(d.NSRequiresCertificateTransparency).toEqual(true);

                d = exceptionDomains['server30-2.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(undefined);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(undefined);
                expect(d.NSExceptionMinimumTLSVersion).toEqual(undefined);
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(false);
                expect(d.NSRequiresCertificateTransparency).toEqual(true);

                d = exceptionDomains['server31.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(undefined);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(undefined);
                expect(d.NSExceptionMinimumTLSVersion).toEqual('TLSv1.1');
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(undefined);
                expect(d.NSRequiresCertificateTransparency).toEqual(undefined);

                d = exceptionDomains['server32.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(undefined);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(undefined);
                expect(d.NSExceptionMinimumTLSVersion).toEqual('TLSv1.1');
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(false);
                expect(d.NSRequiresCertificateTransparency).toEqual(undefined);

                d = exceptionDomains['server32-1.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(undefined);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(undefined);
                expect(d.NSExceptionMinimumTLSVersion).toEqual('TLSv1.1');
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(undefined);
                expect(d.NSRequiresCertificateTransparency).toEqual(true);

                d = exceptionDomains['server32-2.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(undefined);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(undefined);
                expect(d.NSExceptionMinimumTLSVersion).toEqual('TLSv1.1');
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(false);
                expect(d.NSRequiresCertificateTransparency).toEqual(true);
            });
        });

        it('Test#017 : <allow-navigation> - wildcard scheme, wildcard subdomain', () => {
            return updateProject(cfg, p.locations).then(() => {
                const ats = plist.build.calls.mostRecent().args[0].NSAppTransportSecurity;
                const exceptionDomains = ats.NSExceptionDomains;
                let d;

                expect(exceptionDomains).toBeTruthy();

                d = exceptionDomains['server33.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(true);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(true);
                expect(d.NSExceptionMinimumTLSVersion).toEqual(undefined);
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(undefined);
                expect(d.NSRequiresCertificateTransparency).toEqual(undefined);

                d = exceptionDomains['server34.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(true);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(true);
                expect(d.NSExceptionMinimumTLSVersion).toEqual(undefined);
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(false);
                expect(d.NSRequiresCertificateTransparency).toEqual(undefined);

                d = exceptionDomains['server34-1.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(true);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(true);
                expect(d.NSExceptionMinimumTLSVersion).toEqual(undefined);
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(undefined);
                expect(d.NSRequiresCertificateTransparency).toEqual(true);

                d = exceptionDomains['server34-2.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(true);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(true);
                expect(d.NSExceptionMinimumTLSVersion).toEqual(undefined);
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(false);
                expect(d.NSRequiresCertificateTransparency).toEqual(true);

                d = exceptionDomains['server35.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(true);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(true);
                expect(d.NSExceptionMinimumTLSVersion).toEqual('TLSv1.1');
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(undefined);
                expect(d.NSRequiresCertificateTransparency).toEqual(undefined);

                d = exceptionDomains['server36.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(true);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(true);
                expect(d.NSExceptionMinimumTLSVersion).toEqual('TLSv1.1');
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(false);
                expect(d.NSRequiresCertificateTransparency).toEqual(undefined);

                d = exceptionDomains['server36-1.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(true);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(true);
                expect(d.NSExceptionMinimumTLSVersion).toEqual('TLSv1.1');
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(undefined);
                expect(d.NSRequiresCertificateTransparency).toEqual(true);

                d = exceptionDomains['server36-2.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(true);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(true);
                expect(d.NSExceptionMinimumTLSVersion).toEqual('TLSv1.1');
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(false);
                expect(d.NSRequiresCertificateTransparency).toEqual(true);
            });
        });
        it('Test#018 : <allow-navigation> - wildcard scheme, no subdomain', () => {
            return updateProject(cfg, p.locations).then(() => {
                const ats = plist.build.calls.mostRecent().args[0].NSAppTransportSecurity;
                const exceptionDomains = ats.NSExceptionDomains;
                let d;

                expect(exceptionDomains).toBeTruthy();

                d = exceptionDomains['server37.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(undefined);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(true);
                expect(d.NSExceptionMinimumTLSVersion).toEqual(undefined);
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(undefined);
                expect(d.NSRequiresCertificateTransparency).toEqual(undefined);

                d = exceptionDomains['server38.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(undefined);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(true);
                expect(d.NSExceptionMinimumTLSVersion).toEqual(undefined);
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(false);
                expect(d.NSRequiresCertificateTransparency).toEqual(undefined);

                d = exceptionDomains['server38-1.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(undefined);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(true);
                expect(d.NSExceptionMinimumTLSVersion).toEqual(undefined);
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(undefined);
                expect(d.NSRequiresCertificateTransparency).toEqual(true);

                d = exceptionDomains['server38-2.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(undefined);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(true);
                expect(d.NSExceptionMinimumTLSVersion).toEqual(undefined);
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(false);
                expect(d.NSRequiresCertificateTransparency).toEqual(true);

                d = exceptionDomains['server39.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(undefined);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(true);
                expect(d.NSExceptionMinimumTLSVersion).toEqual('TLSv1.1');
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(undefined);
                expect(d.NSRequiresCertificateTransparency).toEqual(undefined);

                d = exceptionDomains['server40.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(undefined);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(true);
                expect(d.NSExceptionMinimumTLSVersion).toEqual('TLSv1.1');
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(false);
                expect(d.NSRequiresCertificateTransparency).toEqual(undefined);

                d = exceptionDomains['server40-1.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(undefined);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(true);
                expect(d.NSExceptionMinimumTLSVersion).toEqual('TLSv1.1');
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(undefined);
                expect(d.NSRequiresCertificateTransparency).toEqual(true);

                d = exceptionDomains['server40-2.com'];
                expect(d).toBeTruthy();
                expect(d.NSIncludesSubdomains).toEqual(undefined);
                expect(d.NSExceptionAllowsInsecureHTTPLoads).toEqual(true);
                expect(d.NSExceptionMinimumTLSVersion).toEqual('TLSv1.1');
                expect(d.NSExceptionRequiresForwardSecrecy).toEqual(false);
                expect(d.NSRequiresCertificateTransparency).toEqual(true);
            });
        });
        it('Test#019 : <allow-navigation> - should ignore wildcards like data:*, https:*, https://*', () => {
            return updateProject(cfg, p.locations).then(() => {
                const ats = plist.build.calls.mostRecent().args[0].NSAppTransportSecurity;
                const exceptionDomains = ats.NSExceptionDomains;
                expect(exceptionDomains['']).toBeUndefined();
                expect(exceptionDomains.null).toBeUndefined();
                expect(exceptionDomains.undefined).toBeUndefined();
            });
        });
        it('Test#020 : <name> - should write out the display name to info plist as CFBundleDisplayName', () => {
            cfg.shortName = () => 'MyApp';
            writeFileSyncSpy.and.callThrough();

            return updateProject(cfg, p.locations).then(() => {
                const proj = new XcodeProject(p.locations.pbxproj);
                proj.parseSync();
                const prop = proj.getBuildProperty('INFOPLIST_KEY_CFBundleDisplayName', undefined, 'App');
                expect(prop).toEqual('"MyApp"');
            });
        });
        it('Test#021 : <privacy-manifest> - should write out the privacy manifest ', () => {
            plist.parse.and.callThrough();
            writeFileSyncSpy.and.callThrough();
            const projectRoot = iosProject;
            const platformProjDir = path.join(projectRoot, 'platforms', 'ios', 'App');
            const PlatformConfigParser = require('../../lib/PlatformConfigParser');
            const my_config = new PlatformConfigParser(path.join(FIXTURES, 'prepare', 'privacy-manifest.xml'));
            const privacyManifest = my_config.getPrivacyManifest();
            const overwritePrivacyManifest = prepare.__get__('overwritePrivacyManifest');
            overwritePrivacyManifest(privacyManifest, p.locations);
            const privacyManifestPathDest = path.join(platformProjDir, 'PrivacyInfo.xcprivacy');
            expect(writeFileSyncSpy).toHaveBeenCalledWith(privacyManifestPathDest, jasmine.any(String), 'utf-8');
            const xml = writeFileSyncSpy.calls.all()[0].args[1];
            const json = plist.parse(xml);
            expect(json.NSPrivacyTracking).toBeTrue();
            expect(json.NSPrivacyAccessedAPITypes.length).toBe(0);
            expect(json.NSPrivacyTrackingDomains.length).toBe(0);
            expect(json.NSPrivacyCollectedDataTypes.length).toBe(1);
        });
        it('Test#022 : no <privacy-manifest> - should write out the privacy manifest ', () => {
            plist.parse.and.callThrough();
            writeFileSyncSpy.and.callThrough();
            const projectRoot = iosProject;
            const platformProjDir = path.join(projectRoot, 'platforms', 'ios', 'App');
            const PlatformConfigParser = require('../../lib/PlatformConfigParser');
            const my_config = new PlatformConfigParser(path.join(FIXTURES, 'prepare', 'no-privacy-manifest.xml'));
            const privacyManifest = my_config.getPrivacyManifest();
            const overwritePrivacyManifest = prepare.__get__('overwritePrivacyManifest');
            overwritePrivacyManifest(privacyManifest, p.locations);
            const privacyManifestPathDest = path.join(platformProjDir, 'PrivacyInfo.xcprivacy');
            expect(writeFileSyncSpy).toHaveBeenCalledWith(privacyManifestPathDest, jasmine.any(String), 'utf-8');
            const xml = writeFileSyncSpy.calls.all()[0].args[1];
            const json = plist.parse(xml);
            expect(json.NSPrivacyTracking).toBeFalse();
            expect(json.NSPrivacyAccessedAPITypes.length).toBe(0);
            expect(json.NSPrivacyTrackingDomains.length).toBe(0);
            expect(json.NSPrivacyCollectedDataTypes.length).toBe(0);
        });
    });

    describe('<resource-file> tests', () => {
        // image-8888.png target attribute is missing in config.xml as a test
        const images = [
            {
                src: 'image-5678.png',
                target: 'image-5678.png'
            },
            {
                src: 'image-1234.png',
                target: path.join('images', 'image-3456.png')
            },
            {
                src: 'image-8888.png',
                target: 'image-8888.png'
            }
        ];
        const projectRoot = path.join(FIXTURES, 'resource-file-support');
        const updateFileResources = prepare.__get__('updateFileResources');
        const cleanFileResources = prepare.__get__('cleanFileResources');
        const cfgResourceFiles = new ConfigParser(path.join(FIXTURES, 'resource-file-support', 'config.xml'));

        function findImageFileRef (pbxproj, imageFileName) {
            const buildfiles = pbxproj.pbxBuildFileSection();
            return Object.keys(buildfiles).filter(uuid => {
                const filename = buildfiles[uuid].fileRef_comment;
                return (filename === imageFileName);
            });
        }

        function findResourcesBuildPhaseRef (pbxproj, ref) {
            const resBuildPhase = pbxproj.buildPhaseObject('PBXResourcesBuildPhase', 'Resources');
            let resBuildPhaseFileRefs = [];
            if (resBuildPhase) {
                resBuildPhaseFileRefs = resBuildPhase.files.filter(item => item.value === ref);
            }

            return resBuildPhaseFileRefs;
        }

        it('<resource-file> prepare - copy', () => {
            const cordovaProject = {
                root: projectRoot,
                projectConfig: cfgResourceFiles,
                locations: {
                    plugins: path.join(projectRoot, 'plugins'),
                    www: path.join(projectRoot, 'www')
                }
            };

            updateFileResources(cordovaProject, p.locations);
            // try multiple times (3 in total)
            updateFileResources(cordovaProject, p.locations);
            updateFileResources(cordovaProject, p.locations);

            const project = projectFile.parse(p.locations);

            // for the 3 total file references attempted to be added above,
            // it should only have one file reference after the fact
            for (const image of images) {
                // check whether the file is copied to the target location
                const copiedImageFile = path.join(project.resources_dir, image.target);
                expect(fs.existsSync(copiedImageFile)).toEqual(true);

                // find PBXBuildFile file reference
                const imagefileRefs = findImageFileRef(project.xcode, path.basename(image.target));
                expect(imagefileRefs.length).toEqual(1);
                // find file reference in PBXResourcesBuildPhase
                const resBuildPhaseFileRefs = findResourcesBuildPhaseRef(project.xcode, imagefileRefs[0]);
                expect(resBuildPhaseFileRefs.length).toEqual(1);
            }
        });

        it('<resource-file> clean - remove', () => {
            cleanFileResources(projectRoot, cfgResourceFiles, p.locations);
            const project = projectFile.parse(p.locations);

            for (const image of images) {
                // check whether the file is removed from the target location
                const copiedImageFile = path.join(project.resources_dir, image.target);
                expect(fs.existsSync(copiedImageFile)).toEqual(false);

                // find PBXBuildFile file reference
                const imagefileRefs = findImageFileRef(project.xcode, path.basename(image.target));
                expect(imagefileRefs.length).toEqual(0);
                // find file reference in PBXResourcesBuildPhase
                const resBuildPhaseFileRefs = findResourcesBuildPhaseRef(project.xcode, imagefileRefs[0]);
                expect(resBuildPhaseFileRefs.length).toEqual(0);
            }
        });
    });

    describe('updateWww method', () => {
        const updateWww = prepare.__get__('updateWww');
        const logFileOp = prepare.__get__('logFileOp');

        beforeEach(() => {
            spyOn(FileUpdater, 'mergeAndUpdateDir').and.returnValue(true);
        });

        it('Test#021 : should update project-level www and with platform agnostic www and merges', () => {
            const project = {
                root: iosProject,
                locations: { www: path.join(iosProject, 'www') }
            };

            const merges_path = path.join(project.root, 'merges', 'ios');
            fs.mkdirSync(merges_path, { recursive: true });
            updateWww(project, p.locations);
            expect(FileUpdater.mergeAndUpdateDir).toHaveBeenCalledWith(
                ['www', path.join('platforms', 'ios', 'platform_www'), path.join('merges', 'ios')],
                path.join('platforms', 'ios', 'www'),
                { rootDir: iosProject },
                logFileOp);
        });
        it('Test#022 : should skip merges if merges directory does not exist', () => {
            const project = {
                root: iosProject,
                locations: { www: path.join(iosProject, 'www') }
            };

            const merges_path = path.join(project.root, 'merges', 'ios');
            fs.rmSync(merges_path, { recursive: true, force: true });
            updateWww(project, p.locations);
            expect(FileUpdater.mergeAndUpdateDir).toHaveBeenCalledWith(
                ['www', path.join('platforms', 'ios', 'platform_www')],
                path.join('platforms', 'ios', 'www'),
                { rootDir: iosProject },
                logFileOp);
        });
    });
});
