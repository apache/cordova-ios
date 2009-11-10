/**
 * Media/Audio override.
 *
 */
 
function Media(src, successCallback, errorCallback) {
	this.src = src;
	this.successCallback = successCallback;
	this.errorCallback = errorCallback;	
    
	if (this.src != null) {
		PhoneGap.exec("Sound.prepare", this.src, this.successCallback, this.errorCallback);
	}
}
 

Media.prototype.play = function() {
	if (this.src != null) {
		PhoneGap.exec("Sound.play", this.src);
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
