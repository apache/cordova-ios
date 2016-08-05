var fs = require('fs'),
	path = require('path'),
	cordova = require(path.resolve(__dirname, '..', '..', '..', '..', 'cordova-lib/cordova-lib/src/cordova/cordova'));

var dummyPluginWithSpec = {'path' : path.resolve(__dirname, 'fixtures/sample-cordova-plugin-with-spec'),
							'id' : 'sample-cordova-plugin-with-spec'};
var dummyPluginWithoutSpec = { 'path' : path.resolve(__dirname, 'fixtures/sample-cocoapod-plugin-no-spec-overlapping-dependency'),
								'id'  : 'sample-cocoapod-plugin-no-spec-overlapping-dependency'};
var pathToSampleProject = path.resolve(__dirname, 'fixtures', 'testProj');

var podfile = path.resolve(__dirname, 'fixtures/testProj/platforms/ios/Podfile');
var podsJSON = path.resolve(__dirname, 'fixtures/testProj/platforms/ios/pods.json');
var pod = 'AFNetworking';

describe('installPodSync works', function () {

	it('should add pod to Podfile and pods.json with and without spec', function(done) {
		
		process.chdir(pathToSampleProject);

		cordova.raw.plugin('add', dummyPluginWithSpec.path)
		.then(function () {
			fs.exists(podfile, function(podfileExists) {
				expect(podfileExists);
			});
			fs.exists(podsJSON, function(podsJSONExists){
				expect(podsJSONExists);
			});
			
			delete require.cache[podsJSON];
			var podsJSONContent = require(podsJSON);
			expect(podsJSONContent[pod] !== undefined);
			expect(podsJSONContent[pod].spec !== undefined);
			var podfileContent = fs.readFileSync(podfile, 'utf8');
			expect(podfileContent.includes(pod)).toBe(true);
			
			return cordova.raw.plugin('rm', dummyPluginWithSpec.id);
		})
		.then(function () { 
			return cordova.raw.plugin('add', dummyPluginWithoutSpec.path);
		})
		.then(function () {
			var podfileContent = fs.readFileSync(podfile, 'utf8');
			expect(podfileContent.includes(pod)).toBe(true);
			delete require.cache[podsJSON];
			var podsJSONContent = require(podsJSON);
			expect(podsJSONContent[pod] !== undefined);
			expect(podsJSONContent[pod].spec === undefined);
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

		process.chdir(pathToSampleProject);

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
			delete require.cache[podsJSON];
			var podsJSONContent = require(podsJSON);
			expect(podsJSONContent[pod] === undefined);

			return cordova.raw.plugin('add', dummyPluginWithSpec.path);
		})
		.then(function () {
			return cordova.raw.plugin('add', dummyPluginWithoutSpec.path);
		})
		.then(function () {
			delete require.cache[podsJSON];
			var podsJSONContent = require(podsJSON);
			var countAttributeIsTwo = podsJSONContent[pod].count == 2;
			expect(countAttributeIsTwo).toBe(true);

			return cordova.raw.plugin('rm', dummyPluginWithSpec.id);
		})
		.then(function () {
			var podfileContent = fs.readFileSync(podfile, 'utf8');
			expect(podfileContent.includes(pod)).toBe(true);
			// delete require.cache[podsJSON];
			var podsJSONContent = require(podsJSON);
			expect(podsJSONContent[pod].count).toEqual(1);
			expect(podsJSONContent[pod].spec === undefined);

			return cordova.raw.plugin('rm', dummyPluginWithoutSpec.id);
		})
		.fail(function(err) {
            console.error(err);
            expect(err).toBeUndefined();
        })
        .fin(done);
	}, 60000);
});
