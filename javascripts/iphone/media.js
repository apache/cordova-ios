/**
 * Media/Audio override.
 *
 */
 
function Media(src, successCallback, errorCallback) {
	
	if (!src) {
		src = "document://" + String((new Date()).getTime()).replace(/\D/gi,''); // random
	}
	this.src = src;
	this.successCallback = successCallback;
	this.errorCallback = errorCallback;	
    
	if (this.src != null) {
		PhoneGap.exec("Sound.prepare", this.src, this.successCallback, this.errorCallback);
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
