
/**
 * Media/Audio override.
 *
 */
 
function Media(src, successCallback, errorCallback, downloadCompleteCallback) {
	
	if (!src) {
		src = "documents://" + String((new Date()).getTime()).replace(/\D/gi,''); // random
	}
	this.src = src;
	this.successCallback = successCallback;
	this.errorCallback = errorCallback;	
	this.downloadCompleteCallback = downloadCompleteCallback;
    
	if (this.src != null) {
		PhoneGap.exec("Sound.prepare", this.src, this.successCallback, this.errorCallback, this.downloadCompleteCallback);
	}
}
 
Media.prototype.play = function(options) {
	if (this.src != null) {
		PhoneGap.exec("Sound.play", this.src, options);
	}
}

Media.prototype.pause = function() {
	if (this.src != null) {
		PhoneGap.exec("Sound.pause", this.src);
	}
}

Media.prototype.stop = function() {
	if (this.src != null) {
		PhoneGap.exec("Sound.stop", this.src);
	}
}

Media.prototype.startAudioRecord = function(options) {
	if (this.src != null) {
		PhoneGap.exec("Sound.startAudioRecord", this.src, options);
	}
}

Media.prototype.stopAudioRecord = function() {
	if (this.src != null) {
		PhoneGap.exec("Sound.stopAudioRecord", this.src);
	}
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
