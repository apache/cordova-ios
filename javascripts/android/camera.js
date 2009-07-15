/**
 * This class provides access to the device camera.
 * @constructor
 */
function Camera() {
	
}

/**
 * 
 * @param {Function} successCallback
 * @param {Function} errorCallback
 * @param {Object} options
 */
Camera.prototype.getPicture = function(successCallback, errorCallback, options) {
	// Load the Overlay, and do a callback depending on what happens	
}

PhoneGap.addConstructor(function() {
    if (typeof navigator.camera == "undefined") navigator.camera = new Camera();
});
