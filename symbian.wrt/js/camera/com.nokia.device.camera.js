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


// Camera service interface

var __device_camera_service_entry =  {"name": null, 
					 "version": null,
					 "proto": __device_camera,
					 "descriptor": __device_camera_descriptor,
					 "providers": [{"descriptor": __sp_camera_descriptor, "instance": __sp_camera_instance}]
					};

function __device_camera_descriptor(provider){
  this.interfaceName = provider.interfaceName;
  this.version = provider.version;
}


// Private camera  prototype: called from service factory
function __device_camera(provider){
  //Private properties
  this.provider = provider;
  //Read-only properties
  this.interfaceName = provider.descriptor.interfaceName;
  this.version = provider.descriptor.version;
 // this.supportedMediaTypes = provider.supportedMediaTypes;
 // this.supportedSizes = provider.supportedSizes;
  //Core methods
  this.startCamera = __device_camera_startCamera;
  this.stopViewfinder = __device_camera_stopViewfinder;
  //Extended methods
  this.takePicture = __device_camera_takePicture;
}


//Why bother to define these methods? Because the camera
//object defines the contract for providers!

function __device_camera_startCamera(camera_cb){
  return this.provider.startCamera(camera_cb);
}

function __device_camera_stopViewfinder(){
  this.provider.stopViewfinder();
}

function __device_camera_takePicture(format){
  this.provider.takePicture(format);
}
