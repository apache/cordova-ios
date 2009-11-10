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


var __device_debug_on__ = true;
var err_missing_argument = 1003;
var event_cancelled = 3;
var err_bad_argument = 1002;
var err_InvalidService_Argument = 1000;
var err_ServiceNotReady = 1006;
var err_ServiceNotSupported = 1004;

function __device_debug(text){
  //if(__device_debug_on__) alert(text);
}

function __device_handle_exception(e, text){
	__device_debug(text);
	throw(e);
}

function __device_typeof(value)
{
	// First check to see if the value is undefined.
	if (value == undefined) {
        return "undefined";
    }
	// Check for objects created with the "new" keyword.
	if (value instanceof Object) {
		// Check whether it's a string object.
		if (value instanceof String) {
			return "String";
		}
		// Check whether it's an array object/array literal.
		else 
			if (value instanceof Array) {
				return "Array";
			}
	}
	// dealing with a literal.
		if (typeof value) {
			if (typeof value == "object") {
				if (typeof value == "object" && !value) {
					return "null";
				}
			}
           // if not null check for other types
			
				// Check if it's a string literal.
			else if (typeof value == "string") {
					return "string";
				}
		}	 
}


// The top-level service object. It would be nice to use a namespace here 
// (com.nokia.device.service), but emulating namespaces still allows name clashes.
/*
var sp_device = {
        //services: null; // TBD: Make the services list a member of this object?
	load: __device_service_load,
        listServices: __device_service_list,
        listInterfaces: __device_service_interfaces,
        version: "0.1",
        info: "device prototype"
};
*/

if(undefined == com)
    var com={};

if( typeof com != "object")
    throw("com defined as non object");

if(undefined == com.nokia)
    com.nokia = {};

if( typeof com.nokia != "object")
    throw("com.nokia defined as non object");

if(undefined == com.nokia.device)
    com.nokia.device = {
        load: __device_service_load,
        listServices: __device_service_list,
        listInterfaces: __device_service_interfaces,
        version: "0.1",
        info: "device prototype",
        };
else
    throw("com.nokia.device already defined");

com.nokia.device.SORT_ASCENDING = 0;
com.nokia.device.SORT_DESCENDING = 1;

com.nokia.device.SORT_BY_DATE = 0;
com.nokia.device.SORT_BY_SENDER = 1;

com.nokia.device.STATUS_READ = 0;
com.nokia.device.STATUS_UNREAD = 1;


// Configure the services offered.

var __device_services_inited = false;

var __device_services = [

  // For now, the only service is the base "device"" service
  {
    "name":"com.nokia.device",
    "version": 0.1, 
    "interfaces": []
  }
];

// Initialize the configured services.

function __device_services_init(){
  if(__device_services_inited){
    return;
  }
  __device_services_inited = true;

  // Get the service-specific service entries. Note that these
  // need to be individually wrapped by try/catch blocks so that the
  // interpreter gracefully handles missing services. 

  try {
    __device_services[0].interfaces.push(__device_geolocation_service_entry);
  }catch (e){
    __device_debug("Missing library implementation: " + e);
  }
  try {
    __device_services[0].interfaces.push(__device_camera_service_entry);
  }catch (e){
    __device_debug("Missing library implementation: " + e);
  }
  try {
    __device_services[0].interfaces.push(__device_media_service_entry);
  }catch (e){
//    __device_debug("Missing library implementation: " + e);
  }
  try {
    __device_services[0].interfaces.push(__device_contacts_service_entry);
  }catch (e){
//    __device_debug("Missing library implementation: " + e);
  }
 try {
    __device_services[0].interfaces.push(__device_messaging_service_entry);
  }catch (e){
      __device_debug("Missing library implementation: " + e);
  }
  try {
    __device_services[0].interfaces.push(__device_calendar_service_entry);
  }catch (e){
      __device_debug("Missing library implementation: " + e);
  }
  try {
    __device_services[0].interfaces.push(__device_landmarks_service_entry);
  }catch (e){
      __device_debug("Missing library implementation: " + e);
  }
  try {
    __device_services[0].interfaces.push(__device_event_service_entry);
  }catch (e){
      __device_debug("Missing library implementation: " + e);
  }
  try {
    __device_services[0].interfaces.push(__device_sysinfo_service_entry);
  }catch (e){
      __device_debug("Missing library implementation: " + e);
  }
  try {
    __device_services[0].interfaces.push(__device_sensors_service_entry);
  }catch (e){
      __device_debug("Missing library implementation: " + e);
  }

}

function __device_get_implementation(i){
  //__device_debug("get_implementation: " + i);
  return  new i.proto(new(i.providers[0].instance));
}

function __device_get_descriptor(i){
  //__device_debug("get_descriptor: " + i);
  return new i.descriptor(new(i.providers[0].descriptor));
}

function __device_get_interface(s, interfaceName, version){
  //__device_debug("get_interface: " + s + " " + interfaceName);
  var i = s.interfaces;
  if((interfaceName == null) || (interfaceName == '')){
    // Interface name not specified, get first interface, ignoring version
    return __device_get_implementation(i[0]);
  }

  // Find first match of name and version
  for (var d in i){
  
    if(i[d].name == null){
      __device_update_descriptor(i[d]);
    }
    if(i[d].name == undefined){
      continue;
    }
    if (i[d].name == interfaceName){
      // Match version if specified
      if ((version == null) || (version == '') || (i[d].version >= version)){
	return __device_get_implementation(i[d]);
      }
    }
  }
  return null;
}

// Implemention of the load method

function __device_service_load(serviceName, interfaceName, version){

  __device_services_init();
  
  // Service name is specified
   if ((serviceName != null) && (serviceName != '') &&(serviceName != "*")){
    for(var s in __device_services){
      if (serviceName == __device_services[s].name){
	return __device_get_interface(__device_services[s], interfaceName, version);
      }
    }
  // Service name not specified, get first implementation 
  } else {
    //__device_debug("Trying to get interface implementations: ");
    for(var s in __device_services){
      //__device_debug("service_load: " + s + ":" +  __device_services[s].name + ": " + interfaceName);
      var i = __device_get_interface(__device_services[s], interfaceName, version);
      if (i != null){
	return i;
      }
    }
  }
  return null;
}

// Lazily fill in the descriptor table

function __device_update_descriptor(i){
  var d = __device_get_descriptor(i);
  i.name = d.interfaceName;
  i.version = d.version;  
}
// Get an array of interface descriptors for a service

function __device_interface_list(s){
  var retval = new Array();
  for(var i in s.interfaces){
    if(s.interfaces[i].name == null){
      __device_update_descriptor(s.interfaces[i]);
    }
    if(s.interfaces[i].name == undefined){
      continue;
    }
    retval[i] = new Object();
    retval[i].name = s.interfaces[i].name;
    retval[i].version = s.interfaces[i].version;
  }  
  return retval;
}

// Get a service description

function __device_service_descriptor(s){
  this.name = s.name;
  this.version = s.version;
  this.interfaces = __device_interface_list(s);
  this.toString = __device_service_descriptor_to_string;
}

function __device_service_descriptor_to_string(){
  var is = "\nInterfaces(s): ";

  for (i in this.interfaces){
    is += "\n" + this.interfaces[i].name + " " + this.interfaces[0].version;
  }
  return ("Service: " + this.name + is);
}

// Implement the listServices method 

function __device_service_list(serviceName, interfaceName, version){
  //__device_debug("__device_service_list: " + serviceName + " " + interfaceName);
  __device_services_init();
  var retval = new Array();
  var n = 0;
  
  //Treat empty service and interface names as wildcards
  if ((serviceName == null)|| (serviceName == '')/* || (serviceName == undefined)*/){
    serviceName = ".*"; 
  }
  if ((interfaceName == null) || (interfaceName == '') /*|| (serviceName == undefined)*/){
    interfaceName = ".*";
  }
 
  if ((typeof serviceName != "string") || (typeof interfaceName != "string")) {
  	return retval;
  }
  
  // This method does regular expression matching of service and interface

  var sregx = new RegExp(serviceName);
  var iregx = new RegExp(interfaceName);
 
  for(var s in __device_services){
   //__device_debug (serviceName + "==" + __device_services[s].name + "?:" + sregx.test(__device_services[s].name));
    if (sregx.test(__device_services[s].name)){
      // Find the first matching interface 
        
      for(var i in __device_services[s].interfaces){
        if(__device_services[s].interfaces[i].name == null){
          __device_update_descriptor(__device_services[s].interfaces[i]);
	}
        if(__device_services[s].interfaces[i].name == undefined){
	  continue;
	}
	//__device_debug (interfaceName + "==" + __device_services[s].interfaces[i].name + "?:" + iregx.test(__device_services[s].interfaces[i].name));
	if (iregx.test(__device_services[s].interfaces[i].name)){
	  if ((version == null) || (version == '') || (__device_services[s].interfaces[i].version >= version)){
            // An interface matched, we're done.
            retval[n] = new __device_service_descriptor(__device_services[s]);
            break; 
	  }
	}
      }
    }
    ++n;
  }
  return retval;
}

// Implement the listInterfaces method
    
function __device_service_interfaces(serviceName){
  __device_services_init();
  if(serviceName==null||serviceName==undefined||serviceName==''){
  	throw new DeviceError("Framework: listInterfaces: serviceName is missing", err_missing_argument);
  }
  for (var s in __device_services){
    if(__device_services[s].name == serviceName){
      return __device_interface_list(__device_services[s]);
    }
  }
  return null;
}

function modifyObjectBaseProp(obj){
  for (pro in obj) {
    if(typeof obj[pro] == "function" )
      obj[pro] = 0;
    }
};
