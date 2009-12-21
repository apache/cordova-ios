/**
 * This class provides access to the device audio.
 * @constructor
 */
function Audio(src) {
	this.src = src;
	this.loop = false;
	this.error = null;
}

/**
 * This class contains information about any Media errors.
 * @constructor
 */
function MediaError() {
	this.code = null;
	this.message = "";
}

MediaError.MEDIA_ERR_ABORTED 		= 1;
MediaError.MEDIA_ERR_NETWORK 		= 2;
MediaError.MEDIA_ERR_DECODE 		= 3;
MediaError.MEDIA_ERR_NONE_SUPPORTED = 4;

Media.prototype.play = function(successCallback, errorCallback) {
	
	PhoneGap.exec("media",[this.src]);
};

Media.prototype.pause = function() {
	alert('Media pausing not implemented - yet.');
};

Media.prototype.stop = function() {
	alert('Media stopping not implemented - yet.');
};
