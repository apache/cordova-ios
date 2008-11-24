Geolocation.prototype.getCurrentPosition = function(successCallback, errorCallback, options) {
	this.successCallback = successCallback;
	this.errorCallback = errorCallback;
	this.options = options;
	if (Device.available) {
		try {
			document.location = "gap:" + command;
		} catch(e) {
			alert("Error executing command '" + command + "'.");
		}
	}
}

Geolocation.prototype._getCurrentPosition = function(position, error) {
	if (error != null)
		this.errorCallback(new PositionError(error));
	else
		this.successCallback(new Position());
}