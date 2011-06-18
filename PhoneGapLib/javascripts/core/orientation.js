if (!PhoneGap.hasResource("orientation")) {
	PhoneGap.addResource("orientation");

/**
 * This class provides access to the device orientation.
 * @constructor
 */
Orientation  = function() {
	/**
	 * The current orientation, or null if the orientation hasn't changed yet.
	 */
	this.currentOrientation = null;
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
	// If the position is available then call success
	// If the position is not available then call error
};

/**
 * Asynchronously aquires the orientation repeatedly at a given interval.
 * @param {Function} successCallback The function to call each time the orientation
 * data is available.
 * @param {Function} errorCallback The function to call when there is an error 
 * getting the orientation data.
 */
Orientation.prototype.watchOrientation = function(successCallback, errorCallback) {
	// Invoke the appropriate callback with a new Position object every time the implementation 
	// determines that the position of the hosting device has changed. 
	this.getCurrentPosition(successCallback, errorCallback);
	return setInterval(function() {
		navigator.orientation.getCurrentOrientation(successCallback, errorCallback);
	}, 10000);
};

/**
 * Clears the specified orientation watch.
 * @param {String} watchId The ID of the watch returned from #watchOrientation.
 */
Orientation.prototype.clearWatch = function(watchId) {
	clearInterval(watchId);
};

Orientation.install = function()
{
    if (typeof navigator.orientation == "undefined") { 
		navigator.orientation = new Orientation();
	}
	
	var windowDispatchAvailable = !(window.dispatchEvent === undefined); // undefined in iOS 3.x
	if (windowDispatchAvailable) {
		return;
	} 
	
	// the code below is to capture window.add/remove eventListener calls on window
	// this is for iOS 3.x where listening on 'orientationchange' events don't work on document/window (don't know why)
	// however, window.onorientationchange DOES handle the 'orientationchange' event (sent through document), so...
	// then we multiplex the window.onorientationchange event (consequently - people shouldn't overwrite this)
	
	var self = this;
	var orientationchangeEvent = 'orientationchange';
	var newOrientationchangeEvent = 'orientationchange_pg';
	
	// backup original `window.addEventListener`, `window.removeEventListener`
    var _addEventListener = window.addEventListener;
    var _removeEventListener = window.removeEventListener;

	window.onorientationchange = function() {
		PhoneGap.fireEvent(newOrientationchangeEvent, window);
	}
	
    // override `window.addEventListener`
    window.addEventListener = function() {
        if (arguments[0] === orientationchangeEvent) {
			arguments[0] = newOrientationchangeEvent; 
		} 
													
		if (!windowDispatchAvailable) {
			return document.addEventListener.apply(this, arguments);
		} else {
			return _addEventListener.apply(this, arguments);
		}
    };	

    // override `window.removeEventListener'
    window.removeEventListener = function() {
        if (arguments[0] === orientationchangeEvent) {
			arguments[0] = newOrientationchangeEvent; 
		} 
		
		if (!windowDispatchAvailable) {
			return document.removeEventListener.apply(this, arguments);
		} else {
			return _removeEventListener.apply(this, arguments);
		}
    };	
};

PhoneGap.addConstructor(Orientation.install);

};
