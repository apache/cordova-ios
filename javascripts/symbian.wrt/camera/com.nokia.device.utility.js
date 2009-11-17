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


// utility.js
//
// This file contains some utility functions for S60 providers


// Start an application and wait for it to exit

//TBD: Get rid of this global, use closures instead

DeviceError.prototype = new Error(); //inheritance occurs here
DeviceError.prototype.constructor = DeviceError; //If this not present then, it uses default constructor of Error

//constructor for DeviceError.
function DeviceError(message,code) 
{
	this.toString = concatenate;
	this.code = code;
	this.name = "DeviceException";//we can even overwrite default name "Error"
	this.message=message; 
}

function concatenate()
{
	return (this.name+":"+" "+this.message+" "+this.code);
}

function splitErrorMessage(errmessage)
{
	if(errmessage.search(/:/)!=-1)
	{
		if((errmessage.split(":").length)==2)
		{
			return errmessage.split(":")[1];
		}
		if((errmessage.split(":").length)>2)
		{
			return errmessage.split(":")[2];
		}
	}
	return errmessage;
}


var __s60_start_and_wait_cb;

function __s60_on_app_exit(){
  widget.onshow = null;
  if(__s60_start_and_wait_cb != null){
    __s60_start_and_wait_cb();
  }
}

function __s60_on_app_start(){
  widget.onhide = null;
  widget.onshow = __s60_on_app_exit;
}

// This function cannot actually force JS to wait,
// but it does supply a callback the apps can use
// to continue processing on return from the app.
// Apps should take care not to reinvoke this and
// should be careful about any other processing
// that might happen while the app is running.

function __s60_start_and_wait(id, args, app_exit_cb){
  __s60_start_and_wait_cb = app_exit_cb;
  widget.onhide = __s60_on_app_start;
  widget.openApplication(id, args);
}

function __s60_api_not_supported(){
  throw(err_ServiceNotSupported);
}

function __s60_enumerate_object(object, namespace, func, param){
    var key;
    for(key in object){
       
        var propname;
       	if(namespace){
	    propname = namespace + "." + key;
	}
	else{
	    propname = key;
	}
        var value = object[key];
        if(typeof value == "object"){
	  __s60_enumerate_object(value, propname, func, param);
	}
	else {
	  func(propname,value, param);
	}
    }
}
