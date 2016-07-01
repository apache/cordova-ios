var shell = require('shelljs'),
	Q = require('q'),
	fs = require('fs'),
    spec = __dirname,
    path = require('path'),
    util = require('util'),
    podMod = require('../../bin/templates/scripts/cordova/lib/podMod');

var cordova_bin = path.join(spec, '../..', 'bin');
var tmp = require('tmp').dirSync().name;

var projectName = 'test';


function createTempProj(projectname, projectid) {
    var return_code = 0;
    var command;

    // remove existing folder
    command =  path.join(tmp, projectname);
    shell.rm('-rf', command);

    // create the ios project
    command = util.format('"%s/create" "%s/%s" %s "%s"', cordova_bin, tmp, projectName, projectid, projectname);
    shell.echo(command);
    console.log(command);
    return_code = shell.exec(command).code;
    expect(return_code).toBe(0);

    // // build the project
    // command = util.format('"%s/cordova/build"', path.join(tmp, projectname));
    // shell.echo(command);
    // return_code = shell.exec(command, { silent: true }).code;
    // expect(return_code).toBe(0);
}

function deleteTempProj(projectname) {
	 // clean-up
    command =  path.join(tmp, projectname);
    shell.rm('-rf', command);
}

describe('pod install works properly', function () {
	it('', function(){
		Q()
		.then(function(){
			createTempProj();
			//create Podfile with pod setup
			var podfileText = util.format('platform :ios, \'8.0\'\n\ntarget \'%s\' do\n\n  project \'%s\'\n\n  \n\nend' , projectName, pathToProjectFile);
			fs.writeFileSync('Podfile', )
			//shell out 'pod install'
		}) 
		.then(function(){
			//expect workspace to have been created
			//expect();
		})
		.then(function(){
			deleteTempProj();
		})
	});
});

describe('install plugin depending on new pod', function(){

	it('should add the pod to the podfile', function(){
		//pod is found in Podfile
		Q()
		.then(function(){
			//create project
			createTempProj();
			//add plugin that contains a pod that is not currently in the workspace
			//podMod... 

		})
		.then(function(){
			//check if Podfile contains the pod added 
		})
		.then(function(){
			deleteTempProj();
		})
	});

	it('should run pod install', function(){
		//pod install is called
		//use a spy 
	});

	it('should update pods.json', function(){
		// pods json update function called
		//pod is found in pods.json
	});


});

describe('install plugin depending on existing pod', function(){
	it('should do nothing to the podfile', function(){
		//pod is in podfile
		//no dupes in podfile
		//spy -- podmod functions shouldn't be called
	});

	it('should not run pod install if same spec', function(){
		//pod install is not called
		//spy
	});

	it('should run pod install if diff spec and prompt user to choose spec', function(){
		//ToDo: @julia
		//prompts user to choose a spec bc pods doesn't handle multiple specs for a pod 
	});

	it('should update pods.json with count', function(){
		// pods json update function called
		//pod has a count variable 
	});
});

describe('uninstall plugin', function(){
	it('should remove pod from the podfile if not a dependency for another plugin', function(){
		// podfile does not have pod if count is 1 before uninstall called
	});

	it('should not remove pod from podfile if another plugin dependent on it', function(){
		// pod exists in podfile if count is > 1 before uninstall called
	});

	it('should run pod install', function(){
		// spy -- pod install called
	});

	it('should update pods.json', function(){
		// pods json update function called		
	});
});