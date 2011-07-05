if (!PhoneGap.hasResource("camera")) {
	PhoneGap.addResource("camera");
	

/**
 * This class provides access to the device camera.
 * @constructor
 */
Camera = function() {
	
}
/**
 *  Available Camera Options
 *  {boolean} allowEdit - true to allow editing image, default = false
 *	{number} quality 0-100 (low to high) default =  100
 *  {Camera.DestinationType} destinationType default = DATA_URL
 *	{Camera.PictureSourceType} sourceType default = CAMERA
 *	{number} targetWidth - width in pixels to scale image default = 0 (no scaling)
 *  {number} targetHeight - height in pixels to scale image default = 0 (no scaling)
 */
/**
 * Format of image that is returned from getPicture.
 *
 * Example: navigator.camera.getPicture(success, fail,
 *              { quality: 80,
 *                destinationType: Camera.DestinationType.DATA_URL,
 *                sourceType: Camera.PictureSourceType.PHOTOLIBRARY})
 */
Camera.DestinationType = {
    DATA_URL: 0,                // Return base64 encoded string
    FILE_URI: 1                 // Return file uri 
};
Camera.prototype.DestinationType = Camera.DestinationType;

/**
 * Source to getPicture from.
 *
 * Example: navigator.camera.getPicture(success, fail,
 *              { quality: 80,
 *                destinationType: Camera.DestinationType.DATA_URL,
 *                sourceType: Camera.PictureSourceType.PHOTOLIBRARY})
 */
Camera.PictureSourceType = {
    PHOTOLIBRARY : 0,           // Choose image from picture library 
    CAMERA : 1,                 // Take picture from camera
    SAVEDPHOTOALBUM : 2         // Choose image from picture library 
};
Camera.prototype.PictureSourceType = Camera.PictureSourceType;

/**
 * Gets a picture from source defined by "options.sourceType", and returns the
 * image as defined by the "options.destinationType" option.

 * The defaults are sourceType=CAMERA and destinationType=DATA_URL.
 *
 * @param {Function} successCallback
 * @param {Function} errorCallback
 * @param {Object} options
 */
Camera.prototype.getPicture = function(successCallback, errorCallback, options) {
	console.warn("Camera.getPicture is deprecated and will be removed in 1.0, and put in the plugins repo. Plese use the Media Capture API instead.");
	// successCallback required
	if (typeof successCallback != "function") {
        console.log("Camera Error: successCallback is not a function");
        return;
    }

    // errorCallback optional
    if (errorCallback && (typeof errorCallback != "function")) {
        console.log("Camera Error: errorCallback is not a function");
        return;
    }
	
	PhoneGap.exec(successCallback, errorCallback, "Camera","getPicture",[options]);
};



PhoneGap.addConstructor(function() {
    if (typeof navigator.camera == "undefined") navigator.camera = new Camera();
});
};

