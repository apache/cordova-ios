
if (!PhoneGap.hasResource("media")) {
	PhoneGap.addResource("media");

/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010,2011 IBM Corporation
 */

/**
 * List of media objects.
 * PRIVATE
 */
PhoneGap.mediaObjects = {};

/**
 * Object that receives native callbacks.
 * PRIVATE
 */
PhoneGap.Media = function() {};


/**
 * Get the media object.
 * PRIVATE
 *
 * @param id            The media object id (string)
 */
PhoneGap.Media.getMediaObject = function(id) {
    return PhoneGap.mediaObjects[id];
};

/**
 * Audio has status update.
 * PRIVATE
 *
 * @param id            The media object id (string)
 * @param msg           The status message (int)
 * @param value        The status code (int)
 */
PhoneGap.Media.onStatus = function(id, msg, value) {
    var media = PhoneGap.mediaObjects[id];

    // If state update
    if (msg == Media.MEDIA_STATE) {
        if (value == Media.MEDIA_STOPPED) {
            if (media.successCallback) {
                media.successCallback();
            }
        }
        if (media.statusCallback) {
            media.statusCallback(value);
        }
    }
    else if (msg == Media.MEDIA_DURATION) {
        media._duration = value;
    }
    else if (msg == Media.MEDIA_ERROR) {
        if (media.errorCallback) {
            media.errorCallback(value);
        }
    }
    else if (msg == Media.MEDIA_POSITION) {
    	media._position = value;
    }
};

/**
 * This class provides access to the device media, interfaces to both sound and video
 *
 * @param src                   The file name or url to play
 * @param successCallback       The callback to be called when the file is done playing or recording.
 *                                  successCallback() - OPTIONAL
 * @param errorCallback         The callback to be called if there is an error.
 *                                  errorCallback(int errorCode) - OPTIONAL
 * @param statusCallback        The callback to be called when media status has changed.
 *                                  statusCallback(int statusCode) - OPTIONAL
 * @param positionCallback      The callback to be called when media position has changed.
 *                                  positionCallback(long position) - OPTIONAL
 */
Media = function(src, successCallback, errorCallback, statusCallback, positionCallback) {

    // successCallback optional
    if (successCallback && (typeof successCallback != "function")) {
        console.log("Media Error: successCallback is not a function");
        return;
    }

    // errorCallback optional
    if (errorCallback && (typeof errorCallback != "function")) {
        console.log("Media Error: errorCallback is not a function");
        return;
    }

    // statusCallback optional
    if (statusCallback && (typeof statusCallback != "function")) {
        console.log("Media Error: statusCallback is not a function");
        return;
    }

    // positionCallback optional -- NOT SUPPORTED
    if (positionCallback && (typeof positionCallback != "function")) {
        console.log("Media Error: positionCallback is not a function");
        return;
    }

    this.id = PhoneGap.createUUID();
    PhoneGap.mediaObjects[this.id] = this;
    this.src = src;
    this.successCallback = successCallback;
    this.errorCallback = errorCallback;
    this.statusCallback = statusCallback;
    this.positionCallback = positionCallback;
    this._duration = -1;
    this._position = -1;
};

// Media messages
Media.MEDIA_STATE = 1;
Media.MEDIA_DURATION = 2;
Media.MEDIA_POSITION = 3;
Media.MEDIA_ERROR = 9;

// Media states
Media.MEDIA_NONE = 0;
Media.MEDIA_STARTING = 1;
Media.MEDIA_RUNNING = 2;
Media.MEDIA_PAUSED = 3;
Media.MEDIA_STOPPED = 4;
Media.MEDIA_MSG = ["None", "Starting", "Running", "Paused", "Stopped"];

// TODO: Will MediaError be used?
/**
 * This class contains information about any Media errors.
 * @constructor
 */

MediaError = function() {
	this.code = null,
	this.message = "";
}

MediaError.MEDIA_ERR_ABORTED        = 1;
MediaError.MEDIA_ERR_NETWORK        = 2;
MediaError.MEDIA_ERR_DECODE         = 3;
MediaError.MEDIA_ERR_NONE_SUPPORTED = 4;

/**
 * Start or resume playing audio file.
 */
Media.prototype.play = function(options) {
    PhoneGap.exec(null, null, "com.phonegap.media", "play", [this.id, this.src, options]);
};

/**
 * Stop playing audio file.
 */
Media.prototype.stop = function() {
    PhoneGap.exec(null, null, "com.phonegap.media","stop", [this.id, this.src]);
};

/**
 * Pause playing audio file.
 */
Media.prototype.pause = function() {
    PhoneGap.exec(null, null, "com.phonegap.media","pause", [this.id, this.src]);
};

/**
 * Seek or jump to a new time in the track..
 */
Media.prototype.seekTo = function(milliseconds) {
    PhoneGap.exec(null, null, "com.phonegap.media", "seekTo", [this.id, this.src, milliseconds]);
};

/**
 * Get duration of an audio file.
 * The duration is only set for audio that is playing, paused or stopped.
 *
 * @return      duration or -1 if not known.
 */
Media.prototype.getDuration = function() {
    return this._duration;
};

/**
 * Get position of audio.
 *
 * @return
 */
Media.prototype.getCurrentPosition = function(successCB, errorCB) {
	var errCallback = (errorCB == undefined || errorCB == null) ? null : errorCB;
    PhoneGap.exec(successCB, errorCB, "com.phonegap.media", "getCurrentPosition", [this.id, this.src]);
};

// iOS only.  prepare/load the audio in preparation for playing
Media.prototype.prepare = function(successCB, errorCB) {
	PhoneGap.exec(successCB, errorCB, "com.phonegap.media", "prepare", [this.id, this.src]);
}

/**
 * Start recording audio file.
 */
Media.prototype.startRecord = function() {
    PhoneGap.exec(null, null, "com.phonegap.media","startAudioRecord", [this.id, this.src]);
};

/**
 * Stop recording audio file.
 */
Media.prototype.stopRecord = function() {
    PhoneGap.exec(null, null, "com.phonegap.media","stopAudioRecord", [this.id, this.src]);
};

/**
 * Release the resources.
 */
Media.prototype.release = function() {
    PhoneGap.exec(null, null, "com.phonegap.media","release", [this.id, this.src]);
};

};
