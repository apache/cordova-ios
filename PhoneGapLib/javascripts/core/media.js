
/**
 * Media/Audio override.
 *
 */
 
function Media(src, successCallback, errorCallback, downloadCompleteCallback) {
	
	if (!src) {
		src = "documents://" + String((new Date()).getTime()).replace(/\D/gi,''); // random
	}
	this.src = src;
	var successCB = (successCallback == undefined || successCallback == null) ? null : GetFunctionName(successCallback);
	var errorCB = (errorCallback == undefined || errorCallback == null) ? null : GetFunctionName(errorCallback);
	var downloadCB = (downloadCompleteCallback == undefined || downloadCompleteCallback == null) ? null : GetFunctionName(downloadCompleteCallback);
	
	this.successCallback = successCallback || null;
	this.errorCallback = errorCallback || null;	
	this.downloadCompleteCallback = downloadCompleteCallback || null;
    
	if (this.src != null) {
		PhoneGap.exec("Sound.prepare", this.src, successCB, errorCB, downloadCB);
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
