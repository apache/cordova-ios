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
 *  {Camera.EncodingType} - encodingType default = JPEG
 *  {boolean} correctOrientation - Rotate the image to correct for the orientation of the device during capture (iOS only)
 *  {boolean} saveToPhotoAlbum - Save the image to the photo album on the device after capture (iOS only)
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
 * Encoding of image returned from getPicture. 
 * 
 * Example: navigator.camera.getPicture(success, fail, 
 *              { quality: 80, 
 *                destinationType: Camera.DestinationType.DATA_URL, 
 *                sourceType: Camera.PictureSourceType.CAMERA, 
 *                encodingType: Camera.EncodingType.PNG}) 
 */ 
Camera.EncodingType = { 
	JPEG: 0,                    // Return JPEG encoded image 
	PNG: 1                      // Return PNG encoded image 
};
Camera.prototype.EncodingType = Camera.EncodingType;

/** 
 * Type of pictures to select from.  Only applicable when
 *	PictureSourceType is PHOTOLIBRARY or SAVEDPHOTOALBUM 
 * 
 * Example: navigator.camera.getPicture(success, fail, 
 *              { quality: 80, 
 *                destinationType: Camera.DestinationType.DATA_URL, 
 *                sourceType: Camera.PictureSourceType.PHOTOLIBRARY, 
 *                mediaType: Camera.MediaType.PICTURE}) 
 */ 
Camera.MediaType = { 
	PICTURE: 0,             // allow selection of still pictures only. DEFAULT. Will return format specified via DestinationType
	VIDEO: 1,                // allow selection of video only, ONLY RETURNS URL
	ALLMEDIA : 2			// allow selection from all media types
};
Camera.prototype.MediaType = Camera.MediaType;

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
	
	PhoneGap.exec(successCallback, errorCallback, "com.phonegap.camera","getPicture",[options]);
};



PhoneGap.addConstructor(function() {
    if (typeof navigator.camera == "undefined") navigator.camera = new Camera();
});
};

