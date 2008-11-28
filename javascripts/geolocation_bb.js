Geolocation.prototype.getCurrentPosition = function(successCallback, errorCallback, options) {
	document.cookie = 'bb_command='+phonegap.LOCATION;
	locationTimeout = window.setInterval('navigator.geolocation._getCurrentPosition()', 200);
}

Geolocation.prototype._getCurrentPosition = function(successCallback, errorCallback, options) {
	var cookies = document.cookie.split(';');
	for (var i=0; i<cookies.length; i++) {
		var cookie = cookies[i].split('=');
		if (cookie[0] == 'bb_response') {
			window.clearTimeout(locationTimeout);
			var obj = eval('('+cookies[1]+')');
			(obj.error != null ? errorCallback(new PositionError(obj.error) : successCallback(new Position(obj.lat, obj.lng));
			break;
		}
	}
}