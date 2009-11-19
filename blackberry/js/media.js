/**
 * This class provides access to the device media, interfaces to both sound and video
 * @constructor
 */
function Media(src, successCallback, errorCallback) {
	this.src = src;
	this.successCallback = successCallback;
	this.errorCallback = errorCallback;												
}

/**
 * This class contains information about any Media errors.
 * @constructor
 */
function MediaError() {
	this.code = null,
	this.message = "";
}

MediaError.MEDIA_ERR_ABORTED 		= 1;
MediaError.MEDIA_ERR_NETWORK 		= 2;
MediaError.MEDIA_ERR_DECODE 		= 3;
MediaError.MEDIA_ERR_NONE_SUPPORTED = 4;


//if (typeof navigator.audio == "undefined") navigator.audio = new Media(src);

Media.prototype.record = function() {
	alert('Media recording not implemented - yet.');
};

Media.prototype.play = function() {
	PhoneGap.exec("media",[this.src]);
};

Media.prototype.pause = function() {
	alert('Media pausing not implemented - yet.');
};

Media.prototype.stop = function() {
	alert('Media stopping not implemented - yet.');
};
