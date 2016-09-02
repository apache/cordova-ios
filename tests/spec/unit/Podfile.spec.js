var	path = require('path'),
	util = require('util'),
	CordovaError = require('cordova-common').CordovaError;

var Podfile = require(path.resolve(path.join(__dirname, '..', '..', '..', 'bin', 'templates', 'scripts', 'cordova', 'lib', 'Podfile.js'))).Podfile;
var fixturePodfile = path.resolve(__dirname, 'fixtures', 'testProj', 'platforms', 'ios', 'Podfile');

// tests are nested in a describe to ensure clean up happens after all unit tests are run
describe('unit tests for Podfile module', function () {
	var podfile = new Podfile(fixturePodfile, 'testProj');

	describe('tests', function () {

		it ('throws CordovaError when the path filename is not named Podfile', function () {
			var dummyPath = 'NotAPodfile';
			expect( function () { 
				new Podfile(dummyPath);	 
			})
			.toThrow(new CordovaError(util.format('Podfile: The file at %s is not `%s`.', dummyPath, Podfile.FILENAME)));
		});

		it ('throws CordovaError when no projectName provided when creating a Podfile', function () {
			expect( function () { 
				new Podfile(fixturePodfile);	 
			})
			.toThrow(new CordovaError('Podfile: The projectName was not specified in the constructor.'));
		});

		it ('throws CordovaError when no pod name provided when adding a spec', function () {
			expect( function () { 
				podfile.addSpec(null);	 
			})
			.toThrow(new CordovaError('Podfile addSpec: name is not specified.'));
		});

		it ('adds the spec', function () {
			expect(podfile.existsSpec('Foo')).toBe(false);
			podfile.addSpec('Foo', '1.0');
			expect(podfile.existsSpec('Foo')).toBe(true);
		});

		it ('removes the spec', function () {
			podfile.addSpec('Baz', '3.0');
			expect(podfile.existsSpec('Baz')).toBe(true);
			podfile.removeSpec('Baz');
			expect(podfile.existsSpec('Baz')).toBe(false);
		});

		it ('clears all specs', function () {
			podfile.addSpec('Bar', '2.0');
			podfile.clear();

			expect(podfile.existsSpec('Foo')).toBe(false);
			expect(podfile.existsSpec('Bar')).toBe(false);
		});

		it ('isDirty tests', function () {
			podfile.addSpec('Foo', '1.0');
			expect(podfile.isDirty()).toBe(true);

			podfile.write();
			expect(podfile.isDirty()).toBe(false);

			podfile.removeSpec('Foo');
			expect(podfile.isDirty()).toBe(true);
			
			podfile.clear();
			expect(podfile.isDirty()).toBe(true);

			podfile.write();
			expect(podfile.isDirty()).toBe(false);
		});

		it ('writes specs to the Podfile', function () {
			podfile.clear();
			
			podfile.addSpec('Foo', '1.0');
			podfile.addSpec('Bar', '2.0');
			podfile.addSpec('Baz', '3.0');

			podfile.write();

			// verify by reading it back in a new Podfile 
			var newPodfile = new Podfile(fixturePodfile, 'testProj2');
			expect(newPodfile.existsSpec('Foo')).toBe(true);
			expect(newPodfile.existsSpec('Bar')).toBe(true);
			expect(newPodfile.existsSpec('Baz')).toBe(true);

			expect(newPodfile.getSpec('Foo')).toBe(podfile.getSpec('Foo'));
			expect(newPodfile.getSpec('Bar')).toBe(podfile.getSpec('Bar'));
			expect(newPodfile.getSpec('Baz')).toBe(podfile.getSpec('Baz'));
			
		});

	});

	it('tear down', function () {
		podfile.destroy();
	});
});

