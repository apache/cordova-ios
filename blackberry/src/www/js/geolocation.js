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
    Device.exec("location", ["start"], true);
}

/**
 * Stops the GPS of the device
 */
Geolocation.prototype.start = function() {
    Device.exec("location", ["stop"], true);
}

/**
 * Maps current location
 */
Geolocation.prototype.start = function() {
    Device.exec("location", ["map"], true);
}

/**
 * Asynchronously adquires the current position.
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
	if (!this.started) alert("GPS not started");
	this.onSuccess = successCallback;
	this.locationTimeout = window.setInterval("navigator.geolocation._getCurrentPosition();", 1000);
}

Geolocation.prototype._getCurrentPosition = function() {
	this.lastPosition = null;
	Device.exec("location", ["check"], true);
	if (this.lastPosition != null) {
		window.clearTimeout(this.locationTimeout);
		if (this.onSuccess) this.onSuccess();
		this.onSuccess = null;
	}
}

addOnLoad(function() {
	if (typeof navigator.geolocation == "undefined")
		navigator.geolocation = new Geolocation();
});
