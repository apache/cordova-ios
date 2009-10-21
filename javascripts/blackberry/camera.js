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