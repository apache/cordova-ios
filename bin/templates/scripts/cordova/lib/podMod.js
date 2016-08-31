var fs = require('fs'),
    path = require('path'),
    util = require('util'),
    events = require('cordova-common').events,
    superspawn = require('cordova-common').superspawn,
    CordovaError = require('cordova-common').CordovaError;

var opts = {};
/*
-- After pods are installed in a .xcworkspace, all existing ios code needs to go into the WORKSPACE file -- will need to 
    create a workspace file and then embed the Xcode project  

        - Holly might have done some work on this, see the docs: 
          https://github.com/phonegap/phonegap-webview-ios not sure how applicable it can be to our case
*/
function removeProjectFromPath (pathToProjectFile) {
    var arrayOfDirectories = [];
    //remove the project from the path
    arrayOfDirectories = pathToProjectFile.split(path.sep);
    arrayOfDirectories.pop();
    var pathToProjectDirectory = arrayOfDirectories.join(path.sep);
    return pathToProjectDirectory;
}

function createPodfile (projectName, pathToProjectFile) {
    var pathToProjectDirectory = removeProjectFromPath(pathToProjectFile);
    var projectFileName = pathToProjectFile.split(path.sep).pop();
    var pathToPodfile = path.join(pathToProjectDirectory, 'Podfile');
    var podfileText = util.format('platform :ios, \'8.0\'\n\ntarget \'%s\' do\n\n  project \'%s\'\n\n  \n\nend' , projectName, projectFileName);
    fs.writeFileSync(pathToPodfile, podfileText);
}

function editPodfileSync (Podfile, pod, isRemoval) {
    var podfileContents = fs.readFileSync(Podfile, 'utf8');
    //split by \n, add in the pod after the project line, shift the rest down
    var podfileContentsArray = podfileContents.split('\n');

    if (isRemoval) {
        var linesInPodfileToKeep = podfileContentsArray.filter(function(lineInPodfile) {
            return (lineInPodfile.indexOf(pod) === -1);
        });
        
        podfileContents = linesInPodfileToKeep.join('\n');
    } else {
        var lineNumberForInjectionWithinPodfile = 5;
        podfileContentsArray.splice(lineNumberForInjectionWithinPodfile, 0, pod);
        podfileContents = podfileContentsArray.join('\n');
    }
    return podfileContents;
}

function installAllPods (path, isPathToProjectFile) {
    // change working directory for all calls of pod install to platforms/ios
    if (isPathToProjectFile){
        //if the path passed leads to the project, and not the dir that contains the proj
         //remove the project from the path
        path = removeProjectFromPath(path);
    }
    opts.cwd = path;
    superspawn.spawn('pod', ['install'], opts);
}

function addToPodfileSync (projectName, pathToProjectFile, nameOfPod, podSpec, podsJSON) {
    //  nameOfPod           = obj.src                   //from framework tag
    //  podSpec             = obj.spec                  //from framework tag   
    //  podsJSON            = pods.json file in cordovaProjectDir/platforms/ios/

    // readFileSync will currently truncate the Podfile if it exists
    // if a Podfile doesn't exist, one will be created

    // this code will be run during cordova plugin add x -- which has to be run in the cordova project dir
    
    //-----------
    //ERROR
    //
    //if no podName is specified, console err 
    if (nameOfPod === '' || nameOfPod === ' '){
        throw new CordovaError('\nERROR: name of pod is not specified\n');
    }
    //-----------

    podSpec = podSpec || ''; //spec is optional
    
    var stringToWrite; //overwrites Podfile
    var lineToInjectInPodfile; //adds pod
    var pathToProject = removeProjectFromPath(pathToProjectFile);
    var podfile = path.join(pathToProject, 'Podfile');
    var podfileExistsInCurrentDirectory = fs.existsSync(podfile);
    var podExistsInPodsJSON = podsJSON[nameOfPod];
    var podRequestedForSpecChange;
   
    if (podSpec === '') {
        lineToInjectInPodfile = util.format('pod \'%s\'', nameOfPod);
        podRequestedForSpecChange = false;
    } else {
        if (podExistsInPodsJSON){
            if (podsJSON[nameOfPod].spec !== podSpec){
                podRequestedForSpecChange = true; 
            }
        } else {
            lineToInjectInPodfile = util.format('pod \'%s\', \'%s\'', nameOfPod, podSpec);
            podRequestedForSpecChange = false; 
        }
    }

    //does Podfile exist in the current directory?
    if (podfileExistsInCurrentDirectory) {
        events.emit('verbose', 'Podfile found in platforms/ios');
        //is the pod already in the Podfile? 
        if (podExistsInPodsJSON) {
            events.emit('verbose', 'Selected pod already exists in Podfile according to pods.json');
            //if pod is in Podfile, is there a change in spec? 
            if (podRequestedForSpecChange) {
                //if spec change requested, it won't make it to this point-- TODO: rm this line 
                events.emit('verbose', 'Pod requested for spec change');
            } // no change in spec handled above
        } else if (!podExistsInPodsJSON) {
            //if pod not already in Podfile, inject the line in the existing Podfile
            events.emit('verbose', 'Pod not found in Podfile. Injecting now...');
            stringToWrite = editPodfileSync(podfile, lineToInjectInPodfile);
        }
    } else if (!podfileExistsInCurrentDirectory) {
        //create the Podfile and inject the line
        events.emit('verbose', 'Creating new Podfile in platforms/ios');
        createPodfile(projectName, pathToProjectFile);
        events.emit('verbose', 'Adding pod to Podfile');
        stringToWrite = editPodfileSync(podfile, lineToInjectInPodfile);
    }
    
    if (stringToWrite) {
        events.emit('verbose', 'Overwriting Podfile');
        fs.writeFileSync(podfile, stringToWrite, 'utf8');
    } else {
        //the code should have returned early by now
    }
    events.emit('verbose', 'Pods installed in xcode workspace in platforms/ios');
}

function removeFromPodfileSync (projectDirectory, pod) {
    var podfile = path.join(projectDirectory, 'Podfile');
    var stringToWrite = editPodfileSync(podfile, pod, true);
    fs.writeFileSync(podfile, stringToWrite);
}

module.exports = {
    addToPodfileSync        : addToPodfileSync,
    removeFromPodfileSync   : removeFromPodfileSync,
    installAllPods          : installAllPods
};