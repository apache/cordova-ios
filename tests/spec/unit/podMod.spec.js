var shell = require('shelljs'),
	Q = require('q'),
	fs = require('fs'),
	path = require('path'),
	cordova = require(path.resolve('../../../../cordova-lib/cordova-lib/src/cordova/cordova'));

var podModule = require(path.join('..', '..', '..', 'bin', 'templates', 'scripts', 'cordova', 'lib', 'podMod.js'));

var dummyPluginWithSpec = {'path' : path.resolve('./fixtures/sample-cordova-plugin-with-spec'),
							'id' : 'sample-cordova-plugin-with-spec'};
var dummyPluginWithoutSpec = { 'path' : path.resolve('./fixtures/sample-cocoapod-plugin-no-spec-overlapping-dependency'),
								'id'  : 'sample-cocoapod-plugin-no-spec-overlapping-dependency'};
var pathToSampleProject = path.resolve('fixtures', 'project');

var podfile = path.resolve('fixtures/project/platforms/ios/Podfile');
var podsJSON = path.resolve('fixtures/project/platforms/ios/pods.json');
var pod = 'AFNetworking';

// installPodSync (projectName, pathToProjectFile, nameOfPod, podSpec, podsJSON) {

	//check for when spec is and isn't specified
	//first pod being added vs podsJSON and podfile already exist
describe('installPodSync works', function () {

	it('should add pod to Podfile and pods.json with and without spec', function(done) {
		
		shell.cd(pathToSampleProject);

		cordova.raw.plugin('add', dummyPluginWithSpec.path)
		.then(function () {
			fs.exists(podfile, function(podfileExists) {
				expect(podfileExists);
			});
			fs.exists(podsJSON, function(podsJSONExists){
				expect(podsJSONExists);
			});
			var podfileContent = fs.readFileSync(podfile, 'utf8');
			expect(podfileContent.includes(pod)).toBe(true);
			delete require.cache[require.resolve(podsJSON)];
			var podsJSONContent = require(podsJSON);
			expect(podsJSONContent[pod]).toBeDefined;
			expect(podsJSONContent[pod].spec).toBeDefined;
			
			return cordova.raw.plugin('rm', dummyPluginWithSpec.id);
		})
		.then(function () { 
			return cordova.raw.plugin('add', dummyPluginWithoutSpec.path);
		})
		.then(function () {
			var podfileContent = fs.readFileSync(podfile, 'utf8');
			expect(podfileContent.includes(pod)).toBe(true);
			delete require.cache[require.resolve(podsJSON)];
			var podsJSONContent = require(podsJSON);
			expect(podsJSONContent[pod]).toBeDefined;
			expect(podsJSONContent[pod]['spec']).toBeUndefined;
		})
		.fail(function(err) {
            console.error(err);
            expect(err).toBeUndefined();
        })
        .fin(done);
	}, 60000);
});

describe('uninstallPodSync works', function () {

	it ('should remove pod from podfile when no other plugin depends on it and should not rm the pod when another plugin does depend on it', function(done) {

		shell.cd(pathToSampleProject);

		cordova.raw.plugin('add', dummyPluginWithSpec.path)
		.then(function () {
			var podfileContent = fs.readFileSync(podfile, 'utf8');
			expect(podfileContent.includes(pod)).toBe(true);
			return cordova.raw.plugin('rm', dummyPluginWithSpec.id);
		})
		.then(function () {
			fs.exists(podsJSON, function(podsJSONExists) {
				expect(podsJSONExists).toBe(true);
			});
			delete require.cache[require.resolve(podsJSON)];
			var podsJSONContent = require(podsJSON);
			expect(podsJSONContent[pod]).toBeUndefined;

			return cordova.raw.plugin('add', dummyPluginWithSpec.path);
		})
		.then(function () {
			return cordova.raw.plugin('add', dummyPluginWithoutSpec.path);
		})
		.then(function () {
			delete require.cache[require.resolve(podsJSON)];
			var podsJSONContent = require(podsJSON);
			var countAttributeIsTwo = podsJSONContent[pod].count == 2;
			expect(countAttributeIsTwo).toBe(true);

			return cordova.raw.plugin('rm', dummyPluginWithSpec.id);
		})
		.then(function () {
			var podfileContent = fs.readFileSync(podfile, 'utf8');
			expect(podfileContent.includes(pod)).toBe(true);
			delete require.cache[require.resolve(podsJSON)];
			var podsJSONContent = require(podsJSON);
			expect(podsJSONContent[pod].count).toEqual(1);
			expect(podsJSONContent[pod].spec).toBeUndefined;

			return cordova.raw.plugin('rm', dummyPluginWithoutSpec.id);
		})
		.then(function () {
			shell.exec('rm -rf platforms/ios/pods.json');
			shell.exec('rm -rf platforms/ios/Podfile');
			shell.exec('rm -rf platforms/ios/Pods');
			shell.exec('rm -rf platforms/ios/Podfile.lock');
		})
		.fail(function(err) {
            console.error(err);
            expect(err).toBeUndefined();
        })
        .fin(done);
	}, 60000);
});
