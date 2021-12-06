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
const fs = require('fs-extra');

const EventEmitter = require('events');
const path = require('path');
const plist = require('plist');
const xcode = require('xcode');
const XcodeProject = xcode.project;
const rewire = require('rewire');
const prepare = rewire('../../../lib/prepare');
const projectFile = require('../../../lib/projectFile');
const FileUpdater = require('cordova-common').FileUpdater;

const tmpDir = path.join(__dirname, '../../../tmp');
const FIXTURES = path.join(__dirname, 'fixtures');

const iosProjectFixture = path.join(FIXTURES, 'ios-config-xml');
const iosProject = path.join(tmpDir, 'prepare');
const iosPlatform = path.join(iosProject, 'platforms/ios');

const ConfigParser = require('cordova-common').ConfigParser;

describe('prepare', () => {
    let p;
    let Api;
    beforeEach(() => {
        Api = rewire('../../../lib/Api');

        fs.ensureDirSync(iosPlatform);
        fs.copySync(iosProjectFixture, iosPlatform);
        p = new Api('ios', iosPlatform, new EventEmitter());
    });

    afterEach(() => {
        fs.removeSync(tmpDir);
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
            const projectRoot = iosProject;

            it('should find the Assets.xcassets file in a project with an asset catalog', () => {
                const platformProjDir = path.join('platforms', 'ios', 'SampleApp');
                const assetCatalogPath = path.join(iosProject, platformProjDir, 'Assets.xcassets');
                const expectedPath = path.join(platformProjDir, 'Assets.xcassets', 'LaunchStoryboard.imageset/');

                expect(fs.existsSync(assetCatalogPath)).toEqual(true);

                const returnPath = getLaunchStoryboardImagesDir(projectRoot, platformProjDir);
                expect(returnPath).toEqual(expectedPath);
            });

            it('should NOT find the Assets.xcassets file in a project with no asset catalog', () => {
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
                const platformProjDir = path.join('platforms', 'ios', 'SampleApp');
                const storyboardImagesDir = getLaunchStoryboardImagesDir(projectRoot, platformProjDir);

                // create a suitable mock project for our method
                const project = {
                    root: iosProject,
                    locations: p.locations,
                    projectConfig: new ConfigParser(path.join(FIXTURES, 'launch-storyboard-support', 'configs', 'modern-only.xml'))
                };

                // copy the splash screen fixtures to the iOS project
                fs.copySync(path.join(FIXTURES, 'launch-storyboard-support', 'res'), path.join(iosProject, 'res'));

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
                        expectedResourceMap[storyboardImagesDir + k] = expectedResourceMap[k];
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
                const platformProjDir = path.join('platforms', 'ios', 'SampleApp');
                const storyboardImagesDir = getLaunchStoryboardImagesDir(projectRoot, platformProjDir);
                const project = {
                    root: iosProject,
                    locations: p.locations,
                    projectConfig: new ConfigParser(path.join(FIXTURES, 'launch-storyboard-support', 'configs', 'modern-only.xml'))
                };

                fs.copySync(path.join(FIXTURES, 'launch-storyboard-support', 'res'), path.join(iosProject, 'res'));
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
                        expectedResourceMap[storyboardImagesDir + k] = null;
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
            cfg.name = () => 'SampleApp'; // this is to match p's original project name (based on .xcodeproj)
            cfg.packageName = () => 'testpkg';
            cfg.version = () => 'one point oh';

            spyOn(cfg, 'getPreference');
        });

        it('should resolve', () => {
            // the original name here will be `SampleApp` (based on the xcodeproj basename) from p
            cfg2.name = () => 'SampleApp'; // new config does *not* have a name change
            return updateProject(cfg2, p.locations); // since the name has not changed it *should not* error
        });

        it('should reject when the app name has changed', () => {
            // the original name here will be `SampleApp` (based on the xcodeproj basename) from p
            cfg2.name = () => 'NotSampleApp'; // new config has name change
            return updateProject(cfg2, p.locations).then( // since the name has changed it *should* error
                () => fail('Expected promise to be rejected'),
                err => expect(err).toEqual(jasmine.any(Error))
            );
        });

        it('should write target-device preference', () => {
            cfg2.name = () => 'SampleApp'; // new config does *not* have a name change
            writeFileSyncSpy.and.callThrough();

            return updateProject(cfg2, p.locations).then(() => {
                const proj = new XcodeProject(p.locations.pbxproj);
                proj.parseSync();
                const prop = proj.getBuildProperty('TARGETED_DEVICE_FAMILY');
                expect(prop).toEqual('"1"'); // 1 is handset
            });
        });
        it('should write deployment-target preference', () => {
            cfg2.name = () => 'SampleApp'; // new config does *not* have a name change
            writeFileSyncSpy.and.callThrough();

            return updateProject(cfg2, p.locations).then(() => {
                const proj = new XcodeProject(p.locations.pbxproj);
                proj.parseSync();
                const prop = proj.getBuildProperty('IPHONEOS_DEPLOYMENT_TARGET');
                expect(prop).toEqual('11.0');
            });
        });
        it('should write SwiftVersion preference (4.1)', () => {
            cfg3.name = () => 'SampleApp'; // new config does *not* have a name change
            writeFileSyncSpy.and.callThrough();
            return updateProject(cfg3, p.locations).then(() => {
                const proj = new XcodeProject(p.locations.pbxproj);
                proj.parseSync();
                const prop = proj.getBuildProperty('SWIFT_VERSION');
                expect(prop).toEqual('4.1');
            });
        });
        it('should write SwiftVersion preference (3.3)', () => {
            cfg3.name = () => 'SampleApp'; // new config does *not* have a name change
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
                const prop = proj.getBuildProperty('PRODUCT_BUNDLE_IDENTIFIER', undefined, 'SampleApp');
                expect(prop).toEqual('testpkg');
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
                const prop = proj.getBuildProperty('PRODUCT_BUNDLE_IDENTIFIER', undefined, 'SampleApp');
                expect(prop).toEqual('testpkg_ios');
            });
        });
        it('Test#004 : should write out the app version to info plist as CFBundleVersion', () => {
            return updateProject(cfg, p.locations).then(() => {
                expect(plist.build.calls.mostRecent().args[0].CFBundleShortVersionString).toEqual('one point oh');
            });
        });
        it('Test#005 : should write out the orientation preference value', () => {
            cfg.getPreference.and.callThrough();
            return updateProject(cfg, p.locations).then(() => {
                expect(plist.build.calls.mostRecent().args[0].UISupportedInterfaceOrientations).toEqual(['UIInterfaceOrientationPortrait', 'UIInterfaceOrientationPortraitUpsideDown']);
                expect(plist.build.calls.mostRecent().args[0]['UISupportedInterfaceOrientations~ipad']).toEqual(['UIInterfaceOrientationPortrait', 'UIInterfaceOrientationPortraitUpsideDown']);
                expect(plist.build.calls.mostRecent().args[0].UIInterfaceOrientation).toEqual(['UIInterfaceOrientationPortrait']);
            });
        });
        it('Test#006 : should handle no orientation', () => {
            cfg.getPreference.and.returnValue('');
            return updateProject(cfg, p.locations).then(() => {
                expect(plist.build.calls.mostRecent().args[0].UISupportedInterfaceOrientations).toBeUndefined();
                expect(plist.build.calls.mostRecent().args[0]['UISupportedInterfaceOrientations~ipad']).toBeUndefined();
                expect(plist.build.calls.mostRecent().args[0].UIInterfaceOrientation).toBeUndefined();
            });
        });
        it('Test#007 : should handle default orientation', () => {
            cfg.getPreference.and.returnValue('default');
            return updateProject(cfg, p.locations).then(() => {
                expect(plist.build.calls.mostRecent().args[0].UISupportedInterfaceOrientations).toEqual(['UIInterfaceOrientationPortrait', 'UIInterfaceOrientationLandscapeLeft', 'UIInterfaceOrientationLandscapeRight']);
                expect(plist.build.calls.mostRecent().args[0]['UISupportedInterfaceOrientations~ipad']).toEqual(['UIInterfaceOrientationPortrait', 'UIInterfaceOrientationPortraitUpsideDown', 'UIInterfaceOrientationLandscapeLeft', 'UIInterfaceOrientationLandscapeRight']);
                expect(plist.build.calls.mostRecent().args[0].UIInterfaceOrientation).toBeUndefined();
            });
        });
        it('Test#008 : should handle portrait orientation', () => {
            cfg.getPreference.and.returnValue('portrait');
            return updateProject(cfg, p.locations).then(() => {
                expect(plist.build.calls.mostRecent().args[0].UISupportedInterfaceOrientations).toEqual(['UIInterfaceOrientationPortrait', 'UIInterfaceOrientationPortraitUpsideDown']);
                expect(plist.build.calls.mostRecent().args[0].UIInterfaceOrientation).toEqual(['UIInterfaceOrientationPortrait']);
            });
        });
        it('Test#009 : should handle landscape orientation', () => {
            cfg.getPreference.and.returnValue('landscape');
            return updateProject(cfg, p.locations).then(() => {
                expect(plist.build.calls.mostRecent().args[0].UISupportedInterfaceOrientations).toEqual(['UIInterfaceOrientationLandscapeLeft', 'UIInterfaceOrientationLandscapeRight']);
                expect(plist.build.calls.mostRecent().args[0].UIInterfaceOrientation).toEqual(['UIInterfaceOrientationLandscapeLeft']);
            });
        });
        it('Test#010 : should handle all orientation on ios', () => {
            cfg.getPreference.and.returnValue('all');
            return updateProject(cfg, p.locations).then(() => {
                expect(plist.build.calls.mostRecent().args[0].UISupportedInterfaceOrientations).toEqual(['UIInterfaceOrientationPortrait', 'UIInterfaceOrientationPortraitUpsideDown', 'UIInterfaceOrientationLandscapeLeft', 'UIInterfaceOrientationLandscapeRight']);
                expect(plist.build.calls.mostRecent().args[0].UIInterfaceOrientation).toEqual(['UIInterfaceOrientationPortrait']);
            });
        });
        it('Test#011 : should handle custom orientation', () => {
            cfg.getPreference.and.returnValue('some-custom-orientation');
            return updateProject(cfg, p.locations).then(() => {
                expect(plist.build.calls.mostRecent().args[0].UISupportedInterfaceOrientations).toEqual(['UIInterfaceOrientationPortrait', 'UIInterfaceOrientationLandscapeLeft', 'UIInterfaceOrientationLandscapeRight']);
                expect(plist.build.calls.mostRecent().args[0]['UISupportedInterfaceOrientations~ipad']).toEqual(['UIInterfaceOrientationPortrait', 'UIInterfaceOrientationPortraitUpsideDown', 'UIInterfaceOrientationLandscapeLeft', 'UIInterfaceOrientationLandscapeRight']);
                expect(plist.build.calls.mostRecent().args[0].UIInterfaceOrientation).toBeUndefined();
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
            // original name here is 'SampleApp' based on p
            // we are not testing a name change here, but testing a new config being used (name change test is above)
            // so we set it to the name expected
            cfg2.name = () => 'SampleApp'; // new config does *not* have a name change

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
            return updateProject(cfg, p.locations).then(() => {
                expect(plist.build.calls.mostRecent().args[0].CFBundleDisplayName).toEqual('MyApp');
            });
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

        const project = {
            root: iosProject,
            locations: { www: path.join(iosProject, 'www') }
        };

        it('Test#021 : should update project-level www and with platform agnostic www and merges', () => {
            const merges_path = path.join(project.root, 'merges', 'ios');
            fs.ensureDirSync(merges_path);
            updateWww(project, p.locations);
            expect(FileUpdater.mergeAndUpdateDir).toHaveBeenCalledWith(
                ['www', path.join('platforms', 'ios', 'platform_www'), path.join('merges', 'ios')],
                path.join('platforms', 'ios', 'www'),
                { rootDir: iosProject },
                logFileOp);
        });
        it('Test#022 : should skip merges if merges directory does not exist', () => {
            const merges_path = path.join(project.root, 'merges', 'ios');
            fs.removeSync(merges_path);
            updateWww(project, p.locations);
            expect(FileUpdater.mergeAndUpdateDir).toHaveBeenCalledWith(
                ['www', path.join('platforms', 'ios', 'platform_www')],
                path.join('platforms', 'ios', 'www'),
                { rootDir: iosProject },
                logFileOp);
        });
    });
});
