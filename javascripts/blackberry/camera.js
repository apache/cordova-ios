/**
 * This class provides access to the device camera.
 * @constructor
 */
function Camera() {
	this.picture = null;
}

Camera.prototype.launch = function () {
	if (device.hasCamera) device.exec("camera", ["obtain"], true);
	else alert("Camera not supported on this device.");
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
		device.exec("camera", ["picture"], true);
	} else alert("Camera not supported");
}

if (typeof navigator.camera == "undefined") navigator.camera = new Camera();