/**
 * This class provides access to device GPS data.
 * @constructor
 */
function Geolocation() {
	/**
	 * Was the GPS started?
	 */
	this.started = false;

	/**
	 * The last known GPS position.
	 */
	 this.lastPosition = null;
}

/**
 * Starts the GPS of the device
 */
Geolocation.prototype.start = function() {
	if (this.started) {
		alert("GPS already started");
		return;
	}
    device.exec("location", ["start"], true);
}

/**
 * Stops the GPS of the device
 */
Geolocation.prototype.stop = function() {
	if (!this.started) {
		alert("GPS not started");
		return;
	}
	if (this.locationTimeout) window.clearTimeout(this.locationTimeout);
    device.exec("location", ["stop"], true);
}

/**
 * Maps current location
 */
Geolocation.prototype.map = function() {
	if (this.lastPosition == null) {
		alert("No position to map yet");
		return;
	}
    device.exec("location", ["map"], true);
}

/**
 * Asynchronously acquires the current position.
 *
 * @param {Function} successCallback The function to call when the position
 * data is available
 *
 * @param {Function} errorCallback The function to call when there is an error 
 * getting the position data.
 *
 * @param {PositionOptions} options The options for getting the position data
 * such as timeout.
 */
Geolocation.prototype.getCurrentPosition = function(successCallback, errorCallback, options) {
	if (!this.started) {
		this.start();
	}
	this.onSuccess = successCallback;
	this.locationTimeout = window.setInterval("navigator.geolocation._getCurrentPosition();", 1000);
}

Geolocation.prototype._getCurrentPosition = function() {
	this.lastPosition = null;
	device.exec("location", ["check"], true);
	if (this.lastPosition != null) {
		window.clearTimeout(this.locationTimeout);
		if (this.onSuccess) this.onSuccess(this.lastPosition);
		this.onSuccess = null;
	}
}

if (typeof navigator.geolocation == "undefined") navigator.geolocation = new Geolocation();
