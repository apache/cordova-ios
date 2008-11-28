/**
 * This file contains all the Geo classes as defined by W3C
 * Methods liks Geolocation::getCurrentPosition need to be implemented 
 * in a platform specific manner.
 */

function Position() {
	this.latitude = 0;
	this.longitude = 0;
	this.accuracy = 0;
	this.altitude = 0;
	this.altitudeAccuracy = 0;
	this.heading = 0;
	this.velocity = 0;
	this.timestamp = new Date().getTime();
}

function PositionOptions() {
	this.enableHighAccuracy = true;
	this.timeout = 10000;
}

function PositionError() {
	this.code = null;
	this.message = "";
}

PositionError.UNKNOWN_ERROR = 0;
PositionError.PERMISSION_DENIED = 1;
PositionError.POSITION_UNAVAILABLE = 2;
PositionError.TIMEOUT = 3;

function Geolocation() {
	this.lastPosition = null;
}

/**
 * Asynchronously aquires a new position.
 */
Geolocation.prototype.getCurrentPosition = function(successCallback, errorCallback, options) {
	// If the position is available then call success
	// If the position is not available then call error
}

/**
 * First get the current position as usual.
 *
 * Invoke the appropriate callback with a new Position object every time the implementation 
 * determines that the position of the hosting device has changed. 
 */
Geolocation.prototype.watchPosition = function(successCallback, errorCallback, options) {
	this.getCurrentPosition(successCallback, errorCallback, options);
	return setInterval(function() {
		navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options);
	}, 10000);
}

Geolocation.prototype.clearWatch = function(watchId) {
	clearInterval(watchId);
}

if (typeof navigator.geolocation == "undefined") navigator.geolocation = new Geolocation;