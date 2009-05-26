Geolocation.prototype.getCurrentPosition = function(successCallback, errorCallback, options) {
	document.cookie = 'bb_command={command:'+phonegap.LOCATION+'}';
	// Blackberry 4.5 does not let you use function pointers in setInterval. idiots.
	geoSuccessCallback = successCallback;
	geoErrorCallback = errorCallback;
	geoOptions = options;
	locationTimeout = window.setInterval('navigator.geolocation._getCurrentPosition()', 1000);
}

Geolocation.prototype._getCurrentPosition = function(successCallback, errorCallback, options) {
	var cookies = document.cookie.split(';');
	for (var i=0; i<cookies.length; i++) {
		var cookie = cookies[i].split('=');
		if (cookie[0] == 'bb_response') {
			var obj = eval('('+cookie[1]+')');
			var geo = obj.geolocation;
			if (geo != null)
			{
				window.clearTimeout(locationTimeout);
				if (geo.error != null) {
					if (typeof geoErrorCallback == "function") {
						geoErrorCallback(new PositionError(geo.error));
					}
				} else if (typeof geoSuccessCallback == "function") {
					geoSuccessCallback(new Position(geo.lat, geo.lng));
				}
				break;
			}
		}
	}
}

Geolocation.prototype.showMap = function(lat, lng) {
	document.cookie = 'bb_command={command:1,args:{points:[{lat:'+lat+',lng:'+lng+',label:\'Nitobi\'}]}}';
}
