/**
 * Starts the GPS of the device
 */
Geolocation.prototype.start = function() {
	if (this.started) {
		return;
	} else {
		device.exec("location", ["start"]);
	}
    
}

/**
 * Stops the GPS of the device
 */
Geolocation.prototype.stop = function() {
	if (!this.started) {
		return;
	} else {
		device.exec("location", ["stop"]);
	}
}

/**
 * Maps current location
 */
Geolocation.prototype.map = function() {
	if (this.lastPosition == null) {
		alert("[PhoneGap] No position to map yet.");
		return;
	} else {
		device.exec("location", ["map"]);
	}
}