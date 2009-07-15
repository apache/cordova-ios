
/**
 * This class provides access to the device media, interfaces to both sound and video
 * @constructor
 */
var MEDIA_AUDIO = "mp3";

function Media(src) {
	this.src = src;
}

Media.prototype.record = function() {
	var fileparse = this.src.split('.');
	var filetype = fileparse[fileparse.length - 1];
	if ( filetype == MEDIA_AUDIO )
	{
		// Queue up Audio API		
	}
	else
	{
		// Start Camera Preview for Video Recording
	}
}

Media.prototype.play = function() {
	var fileparse = this.src.split('.');
	var filetype = fileparse[fileparse.length - 1];
	if ( filetype = MEDIA_AUDIO)
	{
		// Play Audio
	}
	else
	{
		// Bring up Video Overlay
		// (Note: On HTML 5 Browsers (iPhone), this should
		// create a DIV with a VIDEO tag in it)
	}
}

Media.prototype.pause = function() {
	// Do some pausing
}

Media.prototype.stop = function() {
	// Stop playback
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
