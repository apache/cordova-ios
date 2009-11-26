/*
Copyright © 2009 Nokia. All rights reserved.
Code licensed under the BSD License:
Software License Agreement (BSD License) Copyright © 2009 Nokia.
All rights reserved.
Redistribution and use of this software in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer. 
Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution. 
Neither the name of Nokia Corporation. nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission of Nokia Corporation. 
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

version: 1.0
*/


// S60 sp-based camera provider

function __sp_camera_descriptor(){
  //__device_debug("sp_camera_descriptor");
  //Read-only properties
  this.interfaceName = "com.nokia.device.camera";
  this.version = "0.1";
  //Class-static properties 
}

// TBD make local to closure funcs
var __sp_camera_start_date;

function __sp_camera_instance(){
  //__device_debug("sp_camera_instance");
  //Descriptor
  this.descriptor = new __sp_camera_descriptor();
  //Core methods
  this.startCamera = __sp_startCamera;
  this.stopViewfinder = __s60_api_not_supported;
  //Extended methods
  this.takePicture = __s60_api_not_supported;
  //Private data
}

var CAMERA_APP_ID = 0x101f857a;

//Apps should take care that this is not reinvoked
//while the viewfinder is running. 

function __sp_startCamera(camera_cb){

	//If callback is null , then return missing argument error
    if( camera_cb == null )
        throw new DeviceError("Camera:startCamera:callback is missing", err_missing_argument);
        
	//If the callback is not a function, then return bad type error
	if( typeof(camera_cb) != "function" )
	    throw new DeviceError("Camera:startCamera:callback is a non-function", err_bad_argument);

  var finished = function (){
    var invoker = function (arg1, arg2, arg3){
      //__device_debug("invoker with: " + camera_cb);
      var it = arg3.ReturnValue;
      var item;
      var items = new Array();
      while (( item = it.getNext()) != undefined){
          var d = new Date(Date.parse(item.FileDate));
          //__device_debug(item.FileName + " " + d );
          // Items returned in reverse date order, so stop iterating before
          // reaching initial date. (Should be able to do this more efficiently
          // with sp filter, but that doesn't seem to work right now.)
          if (d > __sp_camera_start_date) {
              var pathname = item.FileNameAndPath.replace(/\\/g, "/");
              var fileScheme = "file:///";
              //Non-patched builds don't allow file scheme TBD: change this for patched builds
              items.unshift(fileScheme + pathname);
          }
      }
      var dummyTransID = 0;
      var dummyStatusCode = 0;
      camera_cb(dummyTransID, dummyStatusCode, items);
    };

    
    //When camera returns, get the image(s) created
    try {
      var mso = device.getServiceObject("Service.MediaManagement", "IDataSource");
    }
    catch(e) {
      __device_handle_exception (e, "media service not available : " + e);
    }
    
    var criteria = new Object();
	modifyObjectBaseProp(criteria);
    criteria.Type = 'FileInfo';
    criteria.Filter = new Object();
	modifyObjectBaseProp(criteria.Filter);
    criteria.Filter.FileType = 'Image';
    //criteria.Filter.Key = 'FileDate';
    //criteria.Filter.StartRange = null;
    //criteria.Filter.EndRange = null;
    criteria.Sort = new Object();
	modifyObjectBaseProp(criteria.Sort);
    criteria.Sort.Key = 'FileDate';
    criteria.Sort.Order = 'Descending';
    
    try {
      var rval = mso.IDataSource.GetList(criteria, invoker);
    }
    catch (e) {
      __device_handle_exception (e, "media service GetList failed: " + e);
    }
  };

  __sp_camera_start_date = new Date();
  __s60_start_and_wait(CAMERA_APP_ID, "", finished);
  var dummyTid = 0;
  return dummyTid;
}


