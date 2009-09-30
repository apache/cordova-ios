/**
 * Media/Audio override.
 *
 */

Media.prototype.play = function() {
	if (this.src != null) {
		PhoneGap.exec("Sound.play", this.src, this.successCallback, this.errorCallback);
	}
}
