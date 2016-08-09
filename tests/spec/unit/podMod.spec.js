var fs = require('fs'),
	path = require('path'),
	util = require('util'),
	superspawn = require('cordova-common').superspawn,
	CordovaError = require('cordova-common').CordovaError;

var podMod = require(path.resolve(path.join(__dirname, '..', '..', '..', 'bin', 'templates', 'scripts', 'cordova', 'lib', 'podMod.js')));

var fixtureProject = { 'path' : path.resolve(__dirname, 'fixtures', 'testProj'), 
						'pathToProjectFile' : path.resolve(__dirname, 'fixtures', 'testProj', 'platforms', 'ios', 'HelloCordova.xcodeproj'),
						'pathToProjectDirectory' : path.resolve(__dirname, 'fixtures', 'testProj', 'platforms', 'ios'),
						'id' : 'testProj' };

var samplePods = { 'AFNetworking' : 'AFNetworking', 
					'emptyPod' : '' };
var sampleSpec = { 'AFNetworkingSpec' : '~> 2.0', 
					'emptySpec' : '' };
var samplePodsJSON = { 'AFNetworkingPodsJSON' : {'AFNetworking' : {'count': 1, 'spec' : '~> 2.0'}},
						'emptyPodsJSON' : {} };


var fixturePodfile = path.resolve(__dirname, 'fixtures', 'testProj', 'platforms', 'ios', 'Podfile');


// tests are nested in a describe to ensure clean up happens after all unit tests are run
describe('unit tests for pod module', function () {

	describe('tests', function () {
		describe('installPodSync', function () {
			beforeEach(function () {
				spyOn(fs, 'writeFileSync').andCallThrough();
			});

			afterEach(function () {
			    fs.writeFileSync(fixturePodfile, util.format('platform :ios, \'8.0\'\n\ntarget \'%s\' do\n\n  project \'%s\'\n\n  \n\nend' , fixtureProject.id, fixtureProject.pathToProjectFile));
			});

			it ('throws cordova error when no pod name provided', function () {
				//expect cordova error to have been thrown
				expect( function () { podMod.addToPodfileSync(fixtureProject.id, fixtureProject.pathToProjectFile, samplePods.emptyPod, sampleSpec.emptySpec, samplePodsJSON.emptyPodsJSON); } ).toThrow(new CordovaError('\nERROR: name of pod is not specified\n'));
			});

			it ('writes to the Podfile via fs.writeFileSync', function () {
				podMod.addToPodfileSync(fixtureProject.id, fixtureProject.pathToProjectFile, samplePods.AFNetworking, sampleSpec.AFNetworkingSpec, samplePodsJSON.emptyPodsJSON);
				expect(fs.writeFileSync).toHaveBeenCalled();
			});

			it ('does not write to Podfile when pod already installed', function () {
				podMod.addToPodfileSync(fixtureProject.id, fixtureProject.pathToProjectFile, samplePods.AFNetworking, sampleSpec.AFNetworkingSpec, samplePodsJSON.AFNetworkingPodsJSON);
				expect(fs.writeFileSync).not.toHaveBeenCalled();
			});
		});

		describe('uninstallPodSync', function () {
			beforeEach(function () {
				spyOn(fs, 'writeFileSync').andCallThrough();
			});

			afterEach(function () {
				fs.writeFileSync(fixturePodfile, util.format('platform :ios, \'8.0\'\n\ntarget \'%s\' do\n\n  project \'%s\'\n\n  \n\nend' , fixtureProject.id, fixtureProject.pathToProjectFile));
			});

			it ('removes pod from Podfile', function () {
				podMod.removeFromPodfileSync(fixtureProject.pathToProjectDirectory, samplePods.AFNetworking);

				expect(fs.writeFileSync).toHaveBeenCalled();
				var fixturePodfileContent = fs.readFileSync(fixturePodfile, 'utf8');
				expect(fixturePodfileContent.indexOf(samplePods.AFNetworking) === -1);
			});
		});

		describe('installPodSuperspawn', function () {
			beforeEach(function () {
				spyOn(superspawn, 'spawn').andCallThrough();
			});

			it ('calls superspawn with pod install', function () {
				podMod.installAllPods(fixtureProject.pathToProjectFile, true);
				expect(superspawn.spawn).toHaveBeenCalled();
			});
		});
	});

	it('tear down', function () {
		fs.unlinkSync(fixturePodfile);
	});
});