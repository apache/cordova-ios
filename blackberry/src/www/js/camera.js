/**
 * This class provides access to the device camera.
 * @constructor
 */
function Camera() {
	this.picture = null;
}

Camera.prototype.launch = function () {
	if (Device.hasCamera) Device.exec("camera", ["obtain"], true);
	else alert("Camera not supported");
}

/**
 * 
 * @param {Function} successCallback
 * @param {Function} errorCallback
 * @param {Object} options
 */
Camera.prototype.getPicture = function(successCallback, errorCallback, options) {
	if (Device.hasCamera) Device.exec("camera", ["picture"], true);
	else alert("Camera not supported");
}

if (typeof navigator.camera == "undefined") navigator.camera = new Camera();