Geolocation.prototype.getCurrentPosition = function(successCallback, errorCallback, options) {
	geoSuccessCallback = successCallback;
	geoErrorCallback = errorCallback;
	geoOptions = options;
//	locationTimeout = window.setInterval("navigator.geolocation._getCurrentPosition();", 1000); // Works in Webkit
	locationTimeout = window.setInterval("Geolocation.prototype._getCurrentPosition();", 1000); // Works in FireFox
}

Geolocation.prototype._getCurrentPosition = function() {
	document.location = "gap://getloc/null";		

	if (geo.lng != 0) {
		window.clearTimeout(locationTimeout);
		if (geo.error != null) {
			if (typeof geoErrorCallback == "function") {
				geoErrorCallback(new PositionError(geo.error));
			} 		
		} else if (typeof geoSuccessCallback == "function") {
			var position = new Position(geo.lat, geo.lng);
			Geolocation.lastPosition = position;
			geoSuccessCallback(position);
		} 
	}
}