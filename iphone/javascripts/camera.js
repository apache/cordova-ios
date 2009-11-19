// Gets the function name of a Function object, else uses "alert" if anonymous
function GetFunctionName(fn)
{
  if (fn) {
      var m = fn.toString().match(/^\s*function\s+([^\s\(]+)/);
      return m ? m[1] : "alert";
  } else {
    return null;
  }
}

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
	PhoneGap.exec("Camera.getPicture", GetFunctionName(successCallback), GetFunctionName(errorCallback), options);
}

PhoneGap.addConstructor(function() {
    if (typeof navigator.camera == "undefined") navigator.camera = new Camera();
});
