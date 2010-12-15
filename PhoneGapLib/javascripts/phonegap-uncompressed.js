/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010, IBM Corporation
 */

/* Helper code to resolve anonymous callback functions,

If the function callback can be resolved by name it is returned unaltered.
If the function is defined in an unknown scope and can't be resolved, an internal reference to the function is added to the internal map.

Callbacks added to the map are one time use only, they will be deleted once called.  

example 1:

function myCallback(){};

fString = GetFunctionName(myCallback);

- result, the function is defined in the global scope, and will be returned as is because it can be resolved by name.

example 2:

fString = GetFunctionName(function(){};);

- result, the function is defined in place, so it will be returned unchanged.

example 3:

function myMethod()
{
    var funk = function(){};
    fString = GetFunctionName(funk);
}

- result, the function CANNOT be resolved by name, so an internal reference wrapper is created and returned.


*/


var _anomFunkMap = {};
var _anomFunkMapNextId = 0; 

function anomToNameFunk(fun)
{
	var funkId = "f" + _anomFunkMapNextId++;
	var funk = function()
	{
		fun.apply(this,arguments);
		_anomFunkMap[funkId] = null;
		delete _anomFunkMap[funkId];	
	}
	_anomFunkMap[funkId] = funk;

	return "_anomFunkMap." + funkId;
}

function GetFunctionName(fn)
{
  if (fn) 
  {
      var m = fn.toString().match(/^\s*function\s+([^\s\(]+)/);
      return m ? m[1] : anomToNameFunk(fn);
  } else {
    return null;
  }
}
if (typeof(DeviceInfo) != 'object')
    DeviceInfo = {};

/**
 * This represents the PhoneGap API itself, and provides a global namespace for accessing
 * information about the state of PhoneGap.
 * @class
 */
PhoneGap = {
    queue: {
        ready: true,
        commands: [],
        timer: null
    },
    _constructors: []
};

/**
 * Boolean flag indicating if the PhoneGap API is available and initialized.
 */ // TODO: Remove this, it is unused here ... -jm
PhoneGap.available = DeviceInfo.uuid != undefined;

/**
 * Add an initialization function to a queue that ensures it will run and initialize
 * application constructors only once PhoneGap has been initialized.
 * @param {Function} func The function callback you want run once PhoneGap is initialized
 */
PhoneGap.addConstructor = function(func) {
    var state = document.readyState;
    if ( ( state == 'loaded' || state == 'complete' ) && DeviceInfo.uuid != null )
	{
		func();
	}
    else
	{
        PhoneGap._constructors.push(func);
	}
};

(function() 
 {
    var timer = setInterval(function()
	{
							
		var state = document.readyState;
							
        if ( ( state == 'loaded' || state == 'complete' ) && DeviceInfo.uuid != null )
		{
			clearInterval(timer); // stop looking
			// run our constructors list
			while (PhoneGap._constructors.length > 0) 
			{
				var constructor = PhoneGap._constructors.shift();
				try 
				{
					constructor();
				} 
				catch(e) 
				{
					if (typeof(debug['log']) == 'function')
					{
						debug.log("Failed to run constructor: " + debug.processMessage(e));
					}
					else
					{
						alert("Failed to run constructor: " + e.message);
					}
				}
            }
			// all constructors run, now fire the deviceready event
			var e = document.createEvent('Events'); 
			e.initEvent('deviceready');
			document.dispatchEvent(e);
		}
    }, 1);
})();


/**
 * Execute a PhoneGap command in a queued fashion, to ensure commands do not
 * execute with any race conditions, and only run when PhoneGap is ready to
 * recieve them.
 * @param {String} command Command to be run in PhoneGap, e.g. "ClassName.method"
 * @param {String[]} [args] Zero or more arguments to pass to the method
 * object paramters are passed as an array object [object1, object2] each object will be passed as JSON strings
 */
PhoneGap.exec = function() {
    PhoneGap.queue.commands.push(arguments);
    if (PhoneGap.queue.timer == null)
        PhoneGap.queue.timer = setInterval(PhoneGap.run_command, 10);
};

/**
 * Internal function used to dispatch the request to PhoneGap.  It processes the
 * command queue and executes the next command on the list.  Simple parameters are passed
 * as arguments on the url.  JavaScript objects converted into a JSON string and passed as a
 * query string argument of the url.  
 * @private
 */
PhoneGap.run_command = function() {
    if (!PhoneGap.available || !PhoneGap.queue.ready)
        return;

    PhoneGap.queue.ready = false;

    var args = PhoneGap.queue.commands.shift();
    if (PhoneGap.queue.commands.length == 0) {
        clearInterval(PhoneGap.queue.timer);
        PhoneGap.queue.timer = null;
    }

    var uri = [];
    var dict = null;
    for (var i = 1; i < args.length; i++) {
        var arg = args[i];
        if (arg == undefined || arg == null)
            arg = '';
        if (typeof(arg) == 'object')
            dict = arg;
        else
            uri.push(encodeURIComponent(arg));
    }
    var url = "gap://" + args[0] + "/" + uri.join("/");
    if (dict != null) {
        url += "?" + encodeURIComponent(JSON.stringify(dict));
    }
    document.location = url;

};
/**
 * This class contains acceleration information
 * @constructor
 * @param {Number} x The force applied by the device in the x-axis.
 * @param {Number} y The force applied by the device in the y-axis.
 * @param {Number} z The force applied by the device in the z-axis.
 */
function Acceleration(x, y, z) {
	/**
	 * The force applied by the device in the x-axis.
	 */
	this.x = x;
	/**
	 * The force applied by the device in the y-axis.
	 */
	this.y = y;
	/**
	 * The force applied by the device in the z-axis.
	 */
	this.z = z;
	/**
	 * The time that the acceleration was obtained.
	 */
	this.timestamp = new Date().getTime();
}

/**
 * This class specifies the options for requesting acceleration data.
 * @constructor
 */
function AccelerationOptions() {
	/**
	 * The timeout after which if acceleration data cannot be obtained the errorCallback
	 * is called.
	 */
	this.timeout = 10000;
}
/**
 * This class provides access to device accelerometer data.
 * @constructor
 */
function Accelerometer() 
{
	/**
	 * The last known acceleration.
	 */
	this.lastAcceleration = new Acceleration(0,0,0);
}

/**
 * Asynchronously aquires the current acceleration.
 * @param {Function} successCallback The function to call when the acceleration
 * data is available
 * @param {Function} errorCallback The function to call when there is an error 
 * getting the acceleration data.
 * @param {AccelerationOptions} options The options for getting the accelerometer data
 * such as timeout.
 */
Accelerometer.prototype.getCurrentAcceleration = function(successCallback, errorCallback, options) {
	// If the acceleration is available then call success
	// If the acceleration is not available then call error
	
	// Created for iPhone, Iphone passes back _accel obj litteral
	if (typeof successCallback == "function") {
		successCallback(this.lastAcceleration);
	}
}

// private callback called from Obj-C by name
Accelerometer.prototype._onAccelUpdate = function(x,y,z)
{
   this.lastAcceleration = new Acceleration(x,y,z);
}

/**
 * Asynchronously aquires the acceleration repeatedly at a given interval.
 * @param {Function} successCallback The function to call each time the acceleration
 * data is available
 * @param {Function} errorCallback The function to call when there is an error 
 * getting the acceleration data.
 * @param {AccelerationOptions} options The options for getting the accelerometer data
 * such as timeout.
 */

Accelerometer.prototype.watchAcceleration = function(successCallback, errorCallback, options) {
	//this.getCurrentAcceleration(successCallback, errorCallback, options);
	// TODO: add the interval id to a list so we can clear all watches
 	var frequency = (options != undefined && options.frequency != undefined) ? options.frequency : 10000;
	var updatedOptions = {
		desiredFrequency:frequency 
	}
	PhoneGap.exec("Accelerometer.start",options);

	return setInterval(function() {
		navigator.accelerometer.getCurrentAcceleration(successCallback, errorCallback, options);
	}, frequency);
}

/**
 * Clears the specified accelerometer watch.
 * @param {String} watchId The ID of the watch returned from #watchAcceleration.
 */
Accelerometer.prototype.clearWatch = function(watchId) {
	PhoneGap.exec("Accelerometer.stop");
	clearInterval(watchId);
}

PhoneGap.addConstructor(function() {
    if (typeof navigator.accelerometer == "undefined") navigator.accelerometer = new Accelerometer();
});


/**
 * This class provides access to the device camera.
 * @constructor
 */
function Camera() {
	
}

/**
 * 
 * @param {Function} successCallback
 * @param {Function} errorCallback
 * @param {Object} options
 */
Camera.prototype.getPicture = function(successCallback, errorCallback, options) {
	PhoneGap.exec("Camera.getPicture", GetFunctionName(successCallback), GetFunctionName(errorCallback), options);
}

/** 
 * Defines integers to match iPhone UIImagePickerControllerSourceType enum
*/
Camera.prototype.PictureSourceType = {
		PHOTOLIBRARY : 0,
		CAMERA : 1,
		SAVEDPHOTOALBUM : 2
};
/**
 * Format of image that returned from getPicture.
 *
 * Example: navigator.camera.getPicture(success, fail,
 *              { quality: 80,
 *                destinationType: Camera.DestinationType.DATA_URL,
 *                sourceType: Camera.PictureSourceType.PHOTOLIBRARY})
 */
Camera.DestinationType = {
    DATA_URL: 0,                // Return base64 encoded string
    FILE_URI: 1                 // Return file uri 
};
Camera.prototype.DestinationType = Camera.DestinationType;


PhoneGap.addConstructor(function() {
    if (typeof navigator.camera == "undefined") navigator.camera = new Camera();
});



/**
 * This class provides access to the device contacts.
 * @constructor
 */

function Contact(jsonObject) {
	this.firstName = "";
	this.lastName = "";
    this.name = "";
    this.phones = {};
    this.emails = {};
	this.address = "";
}

Contact.prototype.displayName = function()
{
    // TODO: can be tuned according to prefs
	return this.name;
}

function ContactManager() {
	// Dummy object to hold array of contacts
	this.contacts = [];
	this.timestamp = new Date().getTime();
}

ContactManager.prototype.getAllContacts = function(successCallback, errorCallback, options) {
	PhoneGap.exec("Contacts.allContacts", GetFunctionName(successCallback), options);
}

// THE FUNCTIONS BELOW ARE iPHONE ONLY FOR NOW

ContactManager.prototype.newContact = function(contact, successCallback, options) {
    if (!options) options = {};
    options.successCallback = GetFunctionName(successCallback);
    
    PhoneGap.exec("Contacts.newContact", contact.firstName, contact.lastName, contact.phoneNumber,
        options);
}

ContactManager.prototype.chooseContact = function(successCallback, options) {
    PhoneGap.exec("Contacts.chooseContact", GetFunctionName(successCallback), options);
}

ContactManager.prototype.displayContact = function(contactID, errorCallback, options) {
    PhoneGap.exec("Contacts.displayContact", contactID, GetFunctionName(errorCallback), options);
}

ContactManager.prototype.removeContact = function(contactID, successCallback, options) {
    PhoneGap.exec("Contacts.removeContact", contactID, GetFunctionName(successCallback), options);
}

ContactManager.prototype.contactsCount = function(successCallback, errorCallback) {
	PhoneGap.exec("Contacts.contactsCount", GetFunctionName(successCallback));
}

PhoneGap.addConstructor(function() {
    if (typeof navigator.contacts == "undefined") navigator.contacts = new ContactManager();
});
/**
 * This class provides access to the debugging console.
 * @constructor
 */
function DebugConsole(isDeprecated) {
    this.logLevel = DebugConsole.INFO_LEVEL;
    this.isDeprecated = isDeprecated ? true : false;
}

// from most verbose, to least verbose
DebugConsole.ALL_LEVEL    = 1; // same as first level
DebugConsole.INFO_LEVEL   = 1;
DebugConsole.WARN_LEVEL   = 2;
DebugConsole.ERROR_LEVEL  = 4;
DebugConsole.NONE_LEVEL   = 8;
													
DebugConsole.prototype.setLevel = function(level) {
    this.logLevel = level;
}

/**
 * Utility function for rendering and indenting strings, or serializing
 * objects to a string capable of being printed to the console.
 * @param {Object|String} message The string or object to convert to an indented string
 * @private
 */
DebugConsole.prototype.processMessage = function(message) {
    if (typeof(message) != 'object') {
        return (this.isDeprecated ? "WARNING: debug object is deprecated, please use console object \n" + message : message);
    } else {
        /**
         * @function
         * @ignore
         */
        function indent(str) {
            return str.replace(/^/mg, "    ");
        }
        /**
         * @function
         * @ignore
         */
        function makeStructured(obj) {
            var str = "";
            for (var i in obj) {
                try {
                    if (typeof(obj[i]) == 'object') {
                        str += i + ":\n" + indent(makeStructured(obj[i])) + "\n";
                    } else {
                        str += i + " = " + indent(String(obj[i])).replace(/^    /, "") + "\n";
                    }
                } catch(e) {
                    str += i + " = EXCEPTION: " + e.message + "\n";
                }
            }
            return str;
        }
        
        return ((this.isDeprecated ? "WARNING: debug object is deprecated, please use console object\n" :  "") + "Object:\n" + makeStructured(message));
    }
};

/**
 * Print a normal log message to the console
 * @param {Object|String} message Message or object to print to the console
 */
DebugConsole.prototype.log = function(message) {
    if (PhoneGap.available && this.logLevel <= DebugConsole.INFO_LEVEL)
        PhoneGap.exec('DebugConsole.log',
            this.processMessage(message),
            { logLevel: 'INFO' }
        );
    else
        console.log(message);
};

/**
 * Print a warning message to the console
 * @param {Object|String} message Message or object to print to the console
 */
DebugConsole.prototype.warn = function(message) {
    if (PhoneGap.available && this.logLevel <= DebugConsole.WARN_LEVEL)
        PhoneGap.exec('DebugConsole.log',
            this.processMessage(message),
            { logLevel: 'WARN' }
        );
    else
        console.error(message);
};

/**
 * Print an error message to the console
 * @param {Object|String} message Message or object to print to the console
 */
DebugConsole.prototype.error = function(message) {
    if (PhoneGap.available && this.logLevel <= DebugConsole.ERROR_LEVEL)
        PhoneGap.exec('DebugConsole.log',
            this.processMessage(message),
            { logLevel: 'ERROR' }
        );
    else
        console.error(message);
};

PhoneGap.addConstructor(function() {
    window.console = new DebugConsole();
    window.debug = new DebugConsole(true);
});
/**
 * this represents the mobile device, and provides properties for inspecting the model, version, UUID of the
 * phone, etc.
 * @constructor
 */
function Device() 
{
    this.platform = null;
    this.version  = null;
    this.name     = null;
    this.phonegap      = null;
    this.uuid     = null;
    try 
	{      
		this.platform = DeviceInfo.platform;
		this.version  = DeviceInfo.version;
		this.name     = DeviceInfo.name;
		this.phonegap = DeviceInfo.gap;
		this.uuid     = DeviceInfo.uuid;

    } 
	catch(e) 
	{
        // TODO: 
    }
	this.available = PhoneGap.available = this.uuid != null;
}

PhoneGap.addConstructor(function() {
    navigator.device = window.device = new Device();
});


PhoneGap.addConstructor(function() { if (typeof navigator.fileMgr == "undefined") navigator.fileMgr = new FileMgr();});


// File error codes
// Found in DOMException ( 1-3 )
// Added by this specification ( 4 - 8 )

FileError = {
    NOT_IMPLEMENTED:-1,
    NOT_FOUND_ERR:1,
    SECURITY_ERR:2,
    ABORT_ERR:3,
    NOT_READABLE_ERR:4,
    ENCODING_ERR:5,
    NO_MODIFICATION_ALLOWED_ERR:6,
    INVALID_STATE_ERR:7,
    SYNTAX_ERR:8
};

/**
 * Create an event object since we can't set target on DOM event.
 *
 * @param type
 * @param target
 *
 */
File._createEvent = function(type, target) {
    // Can't create event object, since we can't set target (its readonly)
    //var evt = document.createEvent('Events');
    //evt.initEvent("onload", false, false);
    var evt = {"type": type};
    evt.target = target;
    return evt;
};
    


/**
 * This class provides iPhone read and write access to the mobile device file system.
 * Based loosely on http://www.w3.org/TR/2009/WD-FileAPI-20091117/#dfn-empty
 */
function FileMgr() 
{
	this.getFileBasePaths();
	this.getFreeDiskSpace();
}

FileMgr.seperator = "/";

FileMgr.prototype = {
 
 	fileWriters:{},// empty maps
 	
	fileReaders:{},
	
    // these should likely be static :: File.documentsDirectory
	docsFolderPath:"./../Documents/",
	// File.applicationStorageDirectory
	libFolderPath:"./../Library/",
	
	tempFolderPath:"./../tmp/",
	
	freeDiskSpace:-1,
    
    // private, called from Native Code
    _setPaths:function(docs,temp,lib){
        
        
    	this.docsFolderPath = docs;
    	
    	this.tempFolderPath = temp;
    	
        this.libFolderPath = lib;
    
    },
    
    /* coming soon
    resolvePath:function(path){
        
        // app:/
        // app-storage:/
        // 
        
        if(path.indexOf("docs:/") == 0)
        {
            
        }
        else if(path.indexOf("lib:/") == 0)
        {
            
        }
        else if(path.indexOf("tmp:/") == 0)
        {
            
        }
        else
        {
            
        }
        
    },
    */

    // private, called from Native Code
    _setFreeDiskSpace:function(val){
    	this.freeDiskSpace = val;
    },

    // FileWriters add/remove
    // called internally by writers
    addFileWriter:function(filePath,fileWriter){
    	this.fileWriters[filePath] = fileWriter;
    	return fileWriter;
    },

    removeFileWriter:function(filePath){
    	this.fileWriters[filePath] = null;
    },

    // File readers add/remove
    // called internally by readers
    addFileReader:function(filePath,fileReader){
    	this.fileReaders[filePath] = fileReader;
    	return fileReader;
    },

    removeFileReader:function(filePath){
    	this.fileReaders[filePath] = null;
    },
    
    /*******************************************
     *
     *	private reader callback delegation
     *	called from native code
     */
    reader_onloadstart:function(filePath,result)
    {
    	this.fileReaders[filePath].result = unescape(result);
    	var evt = File._createEvent("loadstart", this.fileReaders[filePath]);
    	this.fileReaders[filePath].onloadstart(evt);
    },

    reader_onprogress:function(filePath,result){
    	this.fileReaders[filePath].result = unescape(result);
    	var evt = File._createEvent("progress", this.fileReaders[filePath]);
    	this.fileReaders[filePath].onprogress(evt);
    },

    reader_onload:function(filePath,result){
    	this.fileReaders[filePath].result = unescape(result);
    	var evt = File._createEvent("load", this.fileReaders[filePath]);
    	this.fileReaders[filePath].onload(evt);
    },

    reader_onerror:function(filePath,err){
    	this.fileReaders[filePath].result = err;
    	this.fileReaders[filePath].result = unescape(result);
    	var evt = File._createEvent("error", this.fileReaders[filePath]);
    	this.fileReaders[filePath].onerror(evt);
    },

    reader_onloadend:function(filePath,result){
        this.fileReaders[filePath].result = unescape(result);
        var evt = File._createEvent("loadend", this.fileReaders[filePath]);
    	this.fileReaders[filePath].onloadend(evt);
    },
    
    /*******************************************
     *
     *	private writer callback delegation
     *	called from native code
    */
    writer_onerror:function(filePath,err){
        this.fileWriters[filePath].error = err;
    	this.fileWriters[filePath].onerror(err);
    },

    writer_oncomplete:function(filePath,result) {

        var writer = this.fileWriters[filePath];
        writer.length = result;
        writer.position = result;

        var evt = File._createEvent("writeend", writer);
        writer.onwriteend(evt);

        evt.type = "complete";
    	writer.oncomplete(evt); // result contains bytes written
    },
    
    
    // Public interface
    

    
    getRootPaths:function(){
        return [ this.docsFolderPath, this.libFolderPath, this.tempFolderPath];
    },
    
    getFileBasePaths:function(){
    	PhoneGap.exec("File.getFileBasePaths");
    },
    
    testFileExists:function(fileName, win, fail){
    	this.successCallback = function(b){win(b);};
    	this.errorCallback = function(b){fail(b);};
    	PhoneGap.exec("File.testFileExists",fileName);
    },
    
    testDirectoryExists:function(dirName, win, fail) {
    	this.successCallback = function(b){win(b);};
    	this.errorCallback = function(b){fail(b);};
    	PhoneGap.exec("File.testDirectoryExists",dirName);
    },
    
    createDirectory:function(dirName, successCallback, errorCallback) {
    	this.successCallback = successCallback;
    	this.errorCallback = errorCallback;
    	PhoneGap.exec("File.createDirectory",dirName);
    },
    
    deleteDirectory:function(dirName, successCallback, errorCallback){
    	this.successCallback = successCallback;
    	this.errorCallback = errorCallback;
    	PhoneGap.exec("File.deleteDirectory",dirName);
    },
    
    deleteFile:function(fileName, successCallback, errorCallback){
    	this.successCallback = successCallback;
    	this.errorCallback = errorCallback;
    	PhoneGap.exec("File.deleteFile",fileName);
    },
    
    getFreeDiskSpace:function(successCallback, errorCallback){
    	if(this.freeDiskSpace > 0)
    	{
    	    successCallback(this.freeDiskSpace);
    		return this.freeDiskSpace;
    	}
    	else
    	{
    		this.successCallback = successCallback;
    		this.errorCallback = errorCallback;
    		PhoneGap.exec("File.getFreeDiskSpace");
    	}
    }
}



//*******************************  File Reader

function FileReader(filename){this.fileName = filename;}

// States
FileReader.EMPTY = 0;
FileReader.LOADING = 1;
FileReader.DONE = 2;

FileReader.prototype = {
	fileName:null,
	result:null,
	onloadstart:null,
	onprogress:null,
	onload:null,
	onerror:null,
	onloadend:null,
	abort:function(){
	    
	},
	
	readAsBinaryString:function(filename){
	    // TODO - Can't return binary data to browser.
	},
	
	readAsDataURL:function(url){
	    
	},
	
	readAsArrayBuffer:function(filename){
	    // TODO - Can't return binary data to browser.
	},
	
	readAsText:function(fname) {
	    
    	if(this.fileName && this.fileName.length > 0)
    	{
    		navigator.fileMgr.removeFileReader(this.fileName,this);
    	}
    	this.fileName = fname;
    	navigator.fileMgr.addFileReader(this.fileName,this);
    	PhoneGap.exec("File.readFile",this.fileName);
    }
}



// File Writer
function FileWriter(filename) 
{ 
    if(navigator.fileMgr.fileWriters[filename] != null)
    {
        return navigator.fileMgr.fileWriters[filename];
    }
    else 
    {
        this.fileName = filename;
    }
}

// States
FileWriter.INIT = 0;
FileWriter.WRITING = 1;
FileWriter.DONE = 2;

FileWriter.prototype = {

	fileName:"",
	result:null,
	readyState:0, // 0 | 1 | 2 == INIT | WRITING | DONE
	onerror:null,
	oncomplete:null,
	onwritestart:null,
	onprogress:null,
	onload:null,
	onabort:null,
	onerror:null,
	onwriteend:null,
	length:0,  // readonly
	position:0, // readonly
	error:null,
	
	// Writes data to the file.
	write:function(text) 
	{	    
	    return this.writeAsText(this.fileName,text);
	},
	
	// Shortens the file to the length specified.
	// Note that length does not change postition UNLESS position has become invalid
	truncate:function(offset){
	    
	    //alert("truncate" + this.fileName);
        if(this.readyState == FileWriter.WRITING)
	    {
	        throw FileError.INVALID_STATE_ERR;
	    }
	    
	    // WRITING state
        this.readyState = FileWriter.WRITING;
	    
    	if(this.fileName && this.fileName.length > 0)
    	{
    		navigator.fileMgr.removeFileWriter(this.fileName);
    	}
    	
    	navigator.fileMgr.addFileWriter(this.fileName,this);
    	this.readyState = 0; // EMPTY
    	this.result = null;
    	PhoneGap.exec("File.truncateFile",this.fileName,offset);	
	},
	
	// Moves the file pointer to the byte specified.
	seek:function(offset){
	    // Throw an exception if we are already writing a file
          if (this.readyState === FileWriter.WRITING) {
              throw FileError.INVALID_STATE_ERR;
          }

          if (!offset) {
              return;
          }
          
          // Seek back from end of file.
              if (offset < 0) {
          		this.position = Math.max(offset + this.length, 0);
          	}
              // Offset is bigger then file size so set position 
              // to the end of the file.
          	else if (offset > this.length) {
          		this.position = this.length;
          	}
              // Offset is between 0 and file size so set the position
              // to start writing.
          	else {
          		this.position = offset;
          	}
	},
	
	
/* http://www.w3.org/TR/2010/WD-file-writer-api-20101026/#widl-FileWriter-write
1. If readyState is DONE or INIT, throw a FileException with error code INVALID_STATE_ERR and terminate this overall series of steps.
2. Terminate any steps having to do with writing a file.
3. Set the error attribute to a FileError object with the appropriate code (in this case, ABORT_ERR; see error conditions).
4. Dispatch a progress event called error.
5. Dispatch a progress event called abort
6. Set readyState to DONE.
7. Dispatch a progress event called writeend
8. Stop dispatching any further progress events.
*/ 
//Aborts writing file.
	abort:function(){

	    if(this.readyState != FileWriter.WRITING)
	    {
	        throw FileError.INVALID_STATE_ERR;
	    }
	    
	    var error = new FileError();
            error.code = FileError.ABORT_ERR;
            this.error = error;
            
        // If error callback
        if (typeof this.onerror == "function") {
            var evt = File._createEvent("error", this);
            this.onerror(evt);
        }
        // If abort callback
        if (typeof this.onabort == "function") {
            var evt = File._createEvent("abort", this);
            this.onabort(evt);
        }

        this.readyState = FileWriter.DONE;

        // If load end callback
        if (typeof this.onloadend == "function") {
            var evt = File._createEvent("writeend", this);
            this.onloadend(evt);
        }
	},
	
	writeAsText:function(fname,text)
    {
        if(this.readyState == FileWriter.WRITING)
	    {
	        throw FileError.INVALID_STATE_ERR;
	    }
	    
	    // WRITING state
        this.readyState = FileWriter.WRITING;
	    
    	if(this.fileName && this.fileName.length > 0)
    	{
    		navigator.fileMgr.removeFileWriter(this.fileName);
    	}
    	this.fileName = fname;

    	navigator.fileMgr.addFileWriter(this.fileName,this);
    	this.readyState = 0; // EMPTY
    	this.result = null;
    	PhoneGap.exec("File.write",this.fileName,text,this.position);
    }
}






function PositionError()
{
	this.code = 0;
	this.message = "";
}

PositionError.PERMISSION_DENIED = 1;
PositionError.POSITION_UNAVAILABLE = 2;
PositionError.TIMEOUT = 3;

/**
 * This class provides access to device GPS data.
 * @constructor
 */
function Geolocation() {
    /**
     * The last known GPS position.
     */
    this.lastPosition = null;
    this.lastError = null;
};

/**
 * Asynchronously aquires the current position.
 * @param {Function} successCallback The function to call when the position
 * data is available
 * @param {Function} errorCallback The function to call when there is an error 
 * getting the position data.
 * @param {PositionOptions} options The options for getting the position data
 * such as timeout.
 * PositionOptions.forcePrompt:Bool default false, 
 * - tells iPhone to prompt the user to turn on location services.
 * - may cause your app to exit while the user is sent to the Settings app
 * PositionOptions.distanceFilter:double aka Number
 * - used to represent a distance in meters.
PositionOptions
{
   desiredAccuracy:Number
   - a distance in meters 
		< 10   = best accuracy  ( Default value )
		< 100  = Nearest Ten Meters
		< 1000 = Nearest Hundred Meters
		< 3000 = Accuracy Kilometers
		3000+  = Accuracy 3 Kilometers
		
	forcePrompt:Boolean default false ( iPhone Only! )
    - tells iPhone to prompt the user to turn on location services.
	- may cause your app to exit while the user is sent to the Settings app
	
	distanceFilter:Number
	- The minimum distance (measured in meters) a device must move laterally before an update event is generated.
	- measured relative to the previously delivered location
	- default value: null ( all movements will be reported )
	
}

 */
Geolocation.prototype.getCurrentPosition = function(successCallback, errorCallback, options) 
{
    var referenceTime = 0;
	
	if(this.lastError != null)
	{
		if(typeof(errorCallback) == 'function')
		{
			errorCallback.call(null,this.lastError);
		}
		this.stop();
		return;
	}

	this.start(options);

    var timeout = 30000; // defaults
    var interval = 2000;
	
    if (options && options.interval)
        interval = options.interval;

    if (typeof(successCallback) != 'function')
        successCallback = function() {};
    if (typeof(errorCallback) != 'function')
        errorCallback = function() {};

    var dis = this;
    var delay = 0;
	var timer;
	var onInterval = function()
	{
		delay += interval;
		if(dis.lastPosition != null && dis.lastPosition.timestamp > referenceTime)
		{
			clearInterval(timer);
            successCallback(dis.lastPosition);
		}
		else if(delay > timeout)
		{
			clearInterval(timer);
            errorCallback("Error Timeout");
		}
		else if(dis.lastError != null)
		{
			clearInterval(timer);
			errorCallback(dis.lastError);
		}
	}
    timer = setInterval(onInterval,interval);     
};

/**
 * Asynchronously aquires the position repeatedly at a given interval.
 * @param {Function} successCallback The function to call each time the position
 * data is available
 * @param {Function} errorCallback The function to call when there is an error 
 * getting the position data.
 * @param {PositionOptions} options The options for getting the position data
 * such as timeout and the frequency of the watch.
 */
Geolocation.prototype.watchPosition = function(successCallback, errorCallback, options) {
	// Invoke the appropriate callback with a new Position object every time the implementation 
	// determines that the position of the hosting device has changed. 
	
	this.getCurrentPosition(successCallback, errorCallback, options);
	var frequency = (options && options.frequency) ? options.frequency : 10000; // default 10 second refresh

	var that = this;
	return setInterval(function() 
	{
		that.getCurrentPosition(successCallback, errorCallback, options);
	}, frequency);

};


/**
 * Clears the specified position watch.
 * @param {String} watchId The ID of the watch returned from #watchPosition.
 */
Geolocation.prototype.clearWatch = function(watchId) {
	clearInterval(watchId);
};

/**
 * Called by the geolocation framework when the current location is found.
 * @param {PositionOptions} position The current position.
 */
Geolocation.prototype.setLocation = function(position) 
{
	this.lastError = null;
    this.lastPosition = position;

};

/**
 * Called by the geolocation framework when an error occurs while looking up the current position.
 * @param {String} message The text of the error message.
 */
Geolocation.prototype.setError = function(error) {
    this.lastError = error;
};

Geolocation.prototype.start = function(args) {
    PhoneGap.exec("Location.startLocation", args);
};

Geolocation.prototype.stop = function() {
    PhoneGap.exec("Location.stopLocation");
};

// replace origObj's functions ( listed in funkList ) with the same method name on proxyObj
// this is a workaround to prevent UIWebView/MobileSafari default implementation of GeoLocation
// because it includes the full page path as the title of the alert prompt
function __proxyObj(origObj,proxyObj,funkList)
{
    var replaceFunk = function(org,proxy,fName)
    { 
        org[fName] = function()
        { 
           return proxy[fName].apply(proxy,arguments); 
        }; 
    };
	 
    for(var v in funkList) { replaceFunk(origObj,proxyObj,funkList[v]);}
}


PhoneGap.addConstructor(function() 
{
    if (typeof navigator._geo == "undefined") 
    {
        navigator._geo = new Geolocation();
        __proxyObj(navigator.geolocation, navigator._geo,
                 ["setLocation","getCurrentPosition","watchPosition",
                  "clearWatch","setError","start","stop"]);

    }

});
/**
 * This class provides access to device Compass data.
 * @constructor
 */
function Compass() {
    /**
     * The last known Compass position.
     */
	this.lastHeading = null;
    this.lastError = null;
	this.callbacks = {
		onHeadingChanged: [],
        onError:           []
    };
};

/**
 * Asynchronously aquires the current heading.
 * @param {Function} successCallback The function to call when the heading
 * data is available
 * @param {Function} errorCallback The function to call when there is an error 
 * getting the heading data.
 * @param {PositionOptions} options The options for getting the heading data
 * such as timeout.
 */
Compass.prototype.getCurrentHeading = function(successCallback, errorCallback, options) {
	if (this.lastHeading == null) {
		this.start(options);
	}
	else 
	if (typeof successCallback == "function") {
		successCallback(this.lastHeading);
	}
};

/**
 * Asynchronously aquires the heading repeatedly at a given interval.
 * @param {Function} successCallback The function to call each time the heading
 * data is available
 * @param {Function} errorCallback The function to call when there is an error 
 * getting the heading data.
 * @param {HeadingOptions} options The options for getting the heading data
 * such as timeout and the frequency of the watch.
 */
Compass.prototype.watchHeading= function(successCallback, errorCallback, options) {
	// Invoke the appropriate callback with a new Position object every time the implementation 
	// determines that the position of the hosting device has changed. 
	
	this.getCurrentHeading(successCallback, errorCallback, options);
	var frequency = 100;
    if (typeof(options) == 'object' && options.frequency)
        frequency = options.frequency;

	var self = this;
	return setInterval(function() {
		self.getCurrentHeading(successCallback, errorCallback, options);
	}, frequency);
};


/**
 * Clears the specified heading watch.
 * @param {String} watchId The ID of the watch returned from #watchHeading.
 */
Compass.prototype.clearWatch = function(watchId) {
	clearInterval(watchId);
};


/**
 * Called by the geolocation framework when the current heading is found.
 * @param {HeadingOptions} position The current heading.
 */
Compass.prototype.setHeading = function(heading) {
    this.lastHeading = heading;
    for (var i = 0; i < this.callbacks.onHeadingChanged.length; i++) {
        var f = this.callbacks.onHeadingChanged.shift();
        f(heading);
    }
};

/**
 * Called by the geolocation framework when an error occurs while looking up the current position.
 * @param {String} message The text of the error message.
 */
Compass.prototype.setError = function(message) {
    this.lastError = message;
    for (var i = 0; i < this.callbacks.onError.length; i++) {
        var f = this.callbacks.onError.shift();
        f(message);
    }
};

Compass.prototype.start = function(args) {
    PhoneGap.exec("Location.startHeading", args);
};

Compass.prototype.stop = function() {
    PhoneGap.exec("Location.stopHeading");
};

PhoneGap.addConstructor(function() {
    if (typeof navigator.compass == "undefined") navigator.compass = new Compass();
});

/**
 * Media/Audio override.
 *
 */
 
function Media(src, successCallback, errorCallback, downloadCompleteCallback) {
	
	if (!src) {
		src = "documents://" + String((new Date()).getTime()).replace(/\D/gi,''); // random
	}
	this.src = src;
	this.successCallback = successCallback;
	this.errorCallback = errorCallback;	
	this.downloadCompleteCallback = downloadCompleteCallback;
    
	if (this.src != null) {
		PhoneGap.exec("Sound.prepare", this.src, this.successCallback, this.errorCallback, this.downloadCompleteCallback);
	}
}
 
Media.prototype.play = function(options) {
	if (this.src != null) {
		PhoneGap.exec("Sound.play", this.src, options);
	}
}

Media.prototype.pause = function() {
	if (this.src != null) {
		PhoneGap.exec("Sound.pause", this.src);
	}
}

Media.prototype.stop = function() {
	if (this.src != null) {
		PhoneGap.exec("Sound.stop", this.src);
	}
}

Media.prototype.startAudioRecord = function(options) {
	if (this.src != null) {
		PhoneGap.exec("Sound.startAudioRecord", this.src, options);
	}
}

Media.prototype.stopAudioRecord = function() {
	if (this.src != null) {
		PhoneGap.exec("Sound.stopAudioRecord", this.src);
	}
}

/**
 * This class contains information about any Media errors.
 * @constructor
 */
function MediaError() {
	this.code = null,
	this.message = "";
}

MediaError.MEDIA_ERR_ABORTED 		= 1;
MediaError.MEDIA_ERR_NETWORK 		= 2;
MediaError.MEDIA_ERR_DECODE 		= 3;
MediaError.MEDIA_ERR_NONE_SUPPORTED = 4;


//if (typeof navigator.audio == "undefined") navigator.audio = new Media(src);
/**
 * This class provides access to notifications on the device.
 */
function Notification() 
{
	this.resultsCallback = null;
};

/**
 * Causes the device to blink a status LED.
 * @param {Integer} count The number of blinks.
 * @param {String} colour The colour of the light.
 */
Notification.prototype.blink = function(count, colour) {
	
};

Notification.prototype.vibrate = function(mills) {
	PhoneGap.exec("Notification.vibrate");
};

Notification.prototype.beep = function(count, volume) {
	// No Volume yet for the iphone interface
	// We can use a canned beep sound and call that
	new Media('beep.wav').play();
};

/**
 * Open a native alert dialog, with a customizable title and button text.
 *
 * @param {String} message              Message to print in the body of the alert
 * @param {Function} resultCallback     The callback that is called when user clicks on a button. 
 * @param {String} title                Title of the alert dialog (default: Alert)
 * @param {String} buttonLabel          Label for close button
 */
Notification.prototype.alert = function(message, resultCallback, title, buttonLabel) 
{
	var options = {};
	options.title = (title || "Alert");
	options.buttonLabel = (buttonLabel || "OK");
	this.resultsCallback = resultCallback;
	PhoneGap.exec('Notification.alert', message, options);
	return;
};


/**
 * Open a native confirm dialog, with a customizable title and button text.
 * The result that the user selects is returned to the result callback.
 *
 * @param {String} message              Message to print in the body of the alert
 * @param {Function} resultCallback     The callback that is called when user clicks on a button.
 * @param {String} title                Title of the alert dialog (default: Confirm)
 * @param {String} buttonLabels         Comma separated list of the labels of the buttons (default: 'OK,Cancel')
 */
Notification.prototype.confirm = function(message, resultCallback, title, buttonLabels) 
{

	var confirmTitle = title ? title : "Confirm";
	var labels = buttonLabels ? buttonLabels : "OK,Cancel";
	return this.alert(message, resultCallback, confirmTitle, labels);
};

Notification.prototype._alertCallback = function(index)
{
	try {
        this.resultsCallback(index);
    }
    catch (e) {
        console.log("Error in user's result callback: " + e);
    }
};



Notification.prototype.activityStart = function() {
    PhoneGap.exec("Notification.activityStart");
};
Notification.prototype.activityStop = function() {
    PhoneGap.exec("Notification.activityStop");
};

Notification.prototype.loadingStart = function(options) {
    PhoneGap.exec("Notification.loadingStart", options);
};
Notification.prototype.loadingStop = function() {
    PhoneGap.exec("Notification.loadingStop");
};

PhoneGap.addConstructor(function() {
    if (typeof navigator.notification == "undefined") navigator.notification = new Notification();
});

/**
 * This class provides access to the device orientation.
 * @constructor
 */
function Orientation() {
	/**
	 * The current orientation, or null if the orientation hasn't changed yet.
	 */
	this.currentOrientation = null;
}

/**
 * Set the current orientation of the phone.  This is called from the device automatically.
 * 
 * When the orientation is changed, the DOMEvent \c orientationChanged is dispatched against
 * the document element.  The event has the property \c orientation which can be used to retrieve
 * the device's current orientation, in addition to the \c Orientation.currentOrientation class property.
 *
 * @param {Number} orientation The orientation to be set
 */
Orientation.prototype.setOrientation = function(orientation) {
    Orientation.currentOrientation = orientation;
    var e = document.createEvent('Events');
    e.initEvent('orientationChanged', 'false', 'false');
    e.orientation = orientation;
    document.dispatchEvent(e);
};

/**
 * Asynchronously aquires the current orientation.
 * @param {Function} successCallback The function to call when the orientation
 * is known.
 * @param {Function} errorCallback The function to call when there is an error 
 * getting the orientation.
 */
Orientation.prototype.getCurrentOrientation = function(successCallback, errorCallback) {
	// If the position is available then call success
	// If the position is not available then call error
};

/**
 * Asynchronously aquires the orientation repeatedly at a given interval.
 * @param {Function} successCallback The function to call each time the orientation
 * data is available.
 * @param {Function} errorCallback The function to call when there is an error 
 * getting the orientation data.
 */
Orientation.prototype.watchOrientation = function(successCallback, errorCallback) {
	// Invoke the appropriate callback with a new Position object every time the implementation 
	// determines that the position of the hosting device has changed. 
	this.getCurrentPosition(successCallback, errorCallback);
	return setInterval(function() {
		navigator.orientation.getCurrentOrientation(successCallback, errorCallback);
	}, 10000);
};

/**
 * Clears the specified orientation watch.
 * @param {String} watchId The ID of the watch returned from #watchOrientation.
 */
Orientation.prototype.clearWatch = function(watchId) {
	clearInterval(watchId);
};

PhoneGap.addConstructor(function() {
    if (typeof navigator.orientation == "undefined") navigator.orientation = new Orientation();
});
/**
 * This class contains position information.
 * @param {Object} lat
 * @param {Object} lng
 * @param {Object} acc
 * @param {Object} alt
 * @param {Object} altAcc
 * @param {Object} head
 * @param {Object} vel
 * @constructor
 */
function Position(coords, timestamp) {
	this.coords = coords;
        this.timestamp = new Date().getTime();
}

function Coordinates(lat, lng, alt, acc, head, vel, altAcc) {
	/**
	 * The latitude of the position.
	 */
	this.latitude = lat;
	/**
	 * The longitude of the position,
	 */
	this.longitude = lng;
	/**
	 * The accuracy of the position.
	 */
	this.accuracy = acc;
	/**
	 * The altitude of the position.
	 */
	this.altitude = alt;
	/**
	 * The direction the device is moving at the position.
	 */
	this.heading = head;
	/**
	 * The velocity with which the device is moving at the position.
	 */
	this.speed = vel;
	/**
	 * The altitude accuracy of the position.
	 */
	this.altitudeAccuracy = (altAcc != 'undefined') ? altAcc : null; 
}

/**
 * This class specifies the options for requesting position data.
 * @constructor
 */
function PositionOptions() {
	/**
	 * Specifies the desired position accuracy.
	 */
	this.enableHighAccuracy = true;
	/**
	 * The timeout after which if position data cannot be obtained the errorCallback
	 * is called.
	 */
	this.timeout = 10000;
}

/**
 * This class contains information about any GSP errors.
 * @constructor
 */
function PositionError() {
	this.code = null;
	this.message = "";
}

PositionError.UNKNOWN_ERROR = 0;
PositionError.PERMISSION_DENIED = 1;
PositionError.POSITION_UNAVAILABLE = 2;
PositionError.TIMEOUT = 3;
/**
 * This class provides access to the device SMS functionality.
 * @constructor
 */
function Sms() {

}

/**
 * Sends an SMS message.
 * @param {Integer} number The phone number to send the message to.
 * @param {String} message The contents of the SMS message to send.
 * @param {Function} successCallback The function to call when the SMS message is sent.
 * @param {Function} errorCallback The function to call when there is an error sending the SMS message.
 * @param {PositionOptions} options The options for accessing the GPS location such as timeout and accuracy.
 */
Sms.prototype.send = function(number, message, successCallback, errorCallback, options) {
	
}

PhoneGap.addConstructor(function() {
    if (typeof navigator.sms == "undefined") navigator.sms = new Sms();
});
/**
 * This class provides access to the telephony features of the device.
 * @constructor
 */
function Telephony() {
	
}

/**
 * Calls the specifed number.
 * @param {Integer} number The number to be called.
 */
Telephony.prototype.call = function(number) {
	
}

PhoneGap.addConstructor(function() {
    if (typeof navigator.telephony == "undefined") navigator.telephony = new Telephony();
});


/**
 * This class contains information about any NetworkStatus.
 * @constructor
 */
function NetworkStatus() {
	this.code = null;
	this.message = "";
}

NetworkStatus.NOT_REACHABLE = 0;
NetworkStatus.REACHABLE_VIA_CARRIER_DATA_NETWORK = 1;
NetworkStatus.REACHABLE_VIA_WIFI_NETWORK = 2;

/**
 * This class provides access to device Network data (reachability).
 * @constructor
 */
function Network() {
    /**
     * The last known Network status.
	 * { hostName: string, ipAddress: string, 
		remoteHostStatus: int(0/1/2), internetConnectionStatus: int(0/1/2), localWiFiConnectionStatus: int (0/2) }
     */
	this.lastReachability = null;
};

/**
 * 
 * @param {Function} successCallback
 * @param {Function} errorCallback
 * @param {Object} options (isIpAddress:boolean)
 */
Network.prototype.isReachable = function(hostName, successCallback, options) {
	PhoneGap.exec("Network.isReachable", hostName, GetFunctionName(successCallback), options);
}

/**
 * Called by the geolocation framework when the reachability status has changed.
 * @param {Reachibility} reachability The current reachability status.
 */
Network.prototype.updateReachability = function(reachability) {
    this.lastReachability = reachability;
};

PhoneGap.addConstructor(function() {
    if (typeof navigator.network == "undefined") navigator.network = new Network();
});
