/**
 * This class provides access to the device camera.
 * @constructor
 */
function Camera() {
	this.success_callback = null;
	this.error_callback = null;
}

/**
 * We use the Platform Services 2.0 API here. So we must include a portion of the
 * PS 2.0 source code (camera API). 
 * @param {Function} successCallback
 * @param {Function} errorCallback
 * @param {Object} options
 */
Camera.prototype.getPicture = function(successCallback, errorCallback, options){
	try {
		if (!this.serviceObj) {
			this.serviceObj = com.nokia.device.load("", "com.nokia.device.camera", "");
		}
		if (!this.serviceObj) {
			throw {
				name: "CameraError",
				message: "could not load camera service"
			};
		}
		var obj = this;
		
		obj.success_callback = successCallback;
		obj.error_callback = errorCallback;
		this.serviceObj.startCamera( function(transactionID, errorCode, outPut) { 
			//outPut should be an array of image urls (local), or an error code
			if (errorCode == 0) {
				obj.success_callback(outPut);
			}
			else {
				obj.error_callback({
					name: "CameraError",
					message: errorCode
				});
			}
		});
		
	} catch (ex) {
		errorCallback.call(ex);
	}
	
}

if (typeof navigator.camera == "undefined") navigator.camera = new Camera();