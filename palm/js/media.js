/**
 * This class provides access to the device media, interfaces to both sound and video
 * @constructor
 */


// There is already a Media class in media.js 
Media = function() {
	//this.src = src;							
}

Media.prototype.play = function(src) {
	this.src = src;
	// The 'end' event listener doesn't seem to work, so we have to call stop before playing
	// otherwise, we'll never be able to play again
	if (this.paused && !this.stopped) {
		this.paused = false;
		this.playing = true;	
		this.audioPlayer.play();
	} else {
		if (this.audioPlayer)
			this.stop();
		if (!this.playing) {
			this.paused = false;
			this.playing = true;	
			this.stopped = false;
			this.audioPlayer = new Audio();
			var file = Mojo.appPath + this.src;
			if (this.audioPlayer.palm) {
				this.audioPlayer.mojo.audioClass = "media";
			}
			this.audioPlayer.src = file;
		
			//event doesn't work, see above
			this.audioPlayer.addEventListener('end', this.endHandler, false);
			this.audioPlayer.play();
		}
	}
};

Media.prototype.pause = function() {
	if (this.stopped)
		return;
	this.paused = true;	
	if (this.playing) {
		this.playing = false;
		this.stopped = false;
		this.audioPlayer.pause();
	} else {
		this.playing = false;	
		this.paused = false;
		this.stopped = true;
	}
};

Media.prototype.stop = function() {
	this.audioPlayer.pause();	
	this.audioPlayer.src = null;
	this.playing = false;	
	this.paused = false;
	this.stopped = true;
};

Media.prototype.endHandler = function () {
	this.audioPlayer.removeEventListener('end', endHandler, false);
	this.audioPlayer.pause();	
	this.audioPlayer.src = null;
	this.paused = false;
	this.stopped = true;
}

/**
 * This class contains information about any Media errors.
 * @constructor
 */
MediaError = function() {
	this.code = null,
	this.message = "";
}

MediaError.MEDIA_ERR_ABORTED 		= 1;
MediaError.MEDIA_ERR_NETWORK 		= 2;
MediaError.MEDIA_ERR_DECODE 		= 3;
MediaError.MEDIA_ERR_NONE_SUPPORTED = 4;

if (typeof navigator.media == 'undefined') navigator.media = new Media();
