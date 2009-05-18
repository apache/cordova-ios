/**
 * This class provides access to the device camera.
 * @constructor
 */
function Camera() {
	this.picture = null;
}

Camera.prototype.launch = function () {
	Device.exec("camera", ["obtain"], true);
}

/**
 * 
 * @param {Function} successCallback
 * @param {Function} errorCallback
 * @param {Object} options
 */
Camera.prototype.getPicture = function(successCallback, errorCallback, options) {
	Device.exec("camera", ["picture"], true);
}

if (typeof navigator.camera == "undefined") navigator.camera = new Camera();