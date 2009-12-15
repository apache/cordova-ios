/**
 * This class provides access to the device orientation.
 * @constructor
 */
function Orientation() {
	/**
	 * The current orientation, or null if the orientation hasn't changed yet.
	 */
	this.currentOrientation = null;
	this.started = false;
}

/**
 * Set the current orientation of the phone.  This is called from the device automatically.
 * 
 * When the orientation is changed, the DOMEvent \c orientationChanged is dispatched against
 * the document element.  The event has the property \c orientation which can be used to retrieve
 * the device's current orientation, in addition to the \c Orientation.currentOrientation class property.
 *
 * @param {Number} orientation The orientation to be set
 */
Orientation.prototype.setOrientation = function(orientation) {
    Orientation.currentOrientation = orientation;
    var e = document.createEvent('Events');
    e.initEvent('orientationChanged', 'false', 'false');
    e.orientation = orientation;
    document.dispatchEvent(e);
};

/**
 * Asynchronously aquires the current orientation.
 * @param {Function} successCallback The function to call when the orientation
 * is known.
 * @param {Function} errorCallback The function to call when there is an error 
 * getting the orientation.
 */
Orientation.prototype.getCurrentOrientation = function(successCallback, errorCallback) {
	if (typeof successCallback != 'function')
		successCallback = function () {};
	if (typeof errorCallback != 'function')
		errorCallback = function () {};
	
	if (!this.started)
		this.start(successCallback);
	else if (this.currentOrientation)
		successCallback(this.currentOrientation);
	else
		errorCallback();
};

/*
 * Starts the native orientationchange event listener.
 */
Orientation.prototype.start = function (successCallback) {
	var that = this;
	Mojo.Event.listen(document, "orientationchange", function(event) {
		var orient = null;
		switch (event.position) {
			case 0: orient = DisplayOrientation.FACE_UP; break;
			case 1: orient = DisplayOrientation.FACE_DOWN; break;
			case 2: orient = DisplayOrientation.PORTRAIT; break;
			case 3: orient = DisplayOrientation.REVERSE_PORTRAIT; break;
			case 4: orient = DisplayOrientation.LANDSCAPE_RIGHT_UP; break;
			case 5: orient = DisplayOrientation.LANDSCAPE_LEFT_UP; break;
			default: return; 	//orientationchange event seems to get thrown sometimes with a null event position
		}
		that.setOrientation(orient);
		successCallback(orient);
	});
	this.started = true;
}

/**
 * Asynchronously aquires the orientation repeatedly at a given interval.
 * @param {Function} successCallback The function to call each time the orientation
 * data is available.
 * @param {Function} errorCallback The function to call when there is an error 
 * getting the orientation data.
 */
Orientation.prototype.watchOrientation = function(successCallback, errorCallback, options) {
	// Invoke the appropriate callback with a new Position object every time the implementation 
	// determines that the position of the hosting device has changed. 
	this.getCurrentOrientation(successCallback, errorCallback);
	var interval = 1000;
	if (options && !isNaN(options.interval))
		interval = options.interval;
	var that = this;
	return setInterval(function() {
		that.getCurrentOrientation(successCallback, errorCallback);
	}, interval);
};

/**
 * Clears the specified orientation watch.
 * @param {String} watchId The ID of the watch returned from #watchOrientation.
 */
Orientation.prototype.clearWatch = function(watchId) {
	clearInterval(watchId);
};

/**
 * This class encapsulates the possible orientation values.
 * @constructor
 */
function DisplayOrientation() {
	this.code = null;
	this.message = "";
}

DisplayOrientation.PORTRAIT = 0;
DisplayOrientation.REVERSE_PORTRAIT = 1;
DisplayOrientation.LANDSCAPE_LEFT_UP = 2;
DisplayOrientation.LANDSCAPE_RIGHT_UP = 3;
DisplayOrientation.FACE_UP = 4;
DisplayOrientation.FACE_DOWN = 5;

if (typeof navigator.orientation == "undefined") navigator.orientation = new Orientation();
