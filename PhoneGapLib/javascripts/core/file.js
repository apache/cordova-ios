

PhoneGap.addConstructor(function() { if (typeof navigator.fileMgr == "undefined") navigator.fileMgr = new FileMgr();});


function FileError() {
   this.code = null;
};

// File error codes
// Found in DOMException
FileError.NOT_FOUND_ERR = 1;
FileError.SECURITY_ERR = 2;
FileError.ABORT_ERR = 3;

// Added by this specification
FileError.NOT_READABLE_ERR = 4;
FileError.ENCODING_ERR = 5;
FileError.NO_MODIFICATION_ALLOWED_ERR = 6;
FileError.INVALID_STATE_ERR = 7;
FileError.SYNTAX_ERR = 8;

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
    	var evt = File._createEvent("loadstart", this.fileReaders[filePath]);
    	this.fileReaders[filePath].onloadstart(evt);
    },

    reader_onprogress:function(filePath,result){
    	this.fileReaders[filePath].result = decodeURIComponent(result);
    	// will need to create a ProgessEvent as well but onprogress not currently supported
    	var evt = File._createEvent("progress", this.fileReaders[filePath]);
    	this.fileReaders[filePath].onprogress(evt);
    },

    reader_onload:function(filePath,result){
    	this.fileReaders[filePath].result = decodeURIComponent(result);
    	var evt = File._createEvent("load", this.fileReaders[filePath]);
    	this.fileReaders[filePath].onload(evt);
    },

    reader_onerror:function(filePath,err){
    	var fe = new FileError();
    	fe.code = err;
    	this.fileReaders[filePath].error = fe;
    	var evt = File._createEvent("error", this.fileReaders[filePath]);
    	this.fileReaders[filePath].onerror(evt);
    },

    reader_onloadend:function(filePath,result){
        this.fileReaders[filePath].result = decodeURIComponent(result);
        var evt = File._createEvent("loadend", this.fileReaders[filePath]);
    	this.fileReaders[filePath].onloadend(evt);
    },
    
    /*******************************************
     *
     *	private writer callback delegation
     *	called from native code
    */
    writer_onerror:function(filePath,err){
    	var fe = new FileError();
    	fe.code = err;
        this.fileWriters[filePath].error = fe;
    	this.fileWriters[filePath].onerror(err);
    },

    writer_oncomplete:function(filePath,result) {

        var writer = this.fileWriters[filePath];
        writer.length = result;
        writer.position = result;

        var evt = File._createEvent("writeend", writer);
        writer.onwriteend(evt);

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



// *******************************  File Reader

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
    	this.readyState = FileReader.DONE;
    	this.result = null;

    	// set error
    	var error = new FileError();
    	error.code = error.ABORT_ERR;
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
    	// If load end callback
    	if (typeof this.onloadend == "function") {
        	var evt = File._createEvent("loadend", this);
       	 this.onloadend(evt);
    	}
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
	onwritestart:null,
	onprogress:null,
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
		// check for invalid state 
    	if (this.readyState === FileWriter.DONE || this.readyState === FileWriter.INIT) {
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
        if (typeof this.onwriteend == "function") {
            var evt = File._createEvent("writeend", this);
            this.onwriteend(evt);
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






