/**
 * This class provides access to the device camera.
 * @constructor
 */
function Camera() {
	this.onSuccess = null;
	this.onError = null;
}

/**
 * 
 * @param {Function} successCallback
 * @param {Function} errorCallback
 * @param {Object} options
 */
Camera.prototype.getPicture = function(successCallback, errorCallback, options) {
	if (device.hasCamera) {
		if (successCallback) this.onSuccess = successCallback;
		else this.onSuccess = null;
		if (errorCallback) this.onError = errorCallback;
		else this.onError = null;
		PhoneGap.exec("camera", ["picture"]);
	} else errorCallback("[PhoneGap] Camera not supported on this device.");
}

if (typeof navigator.camera == "undefined") navigator.camera = new Camera();
