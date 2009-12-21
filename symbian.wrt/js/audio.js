/**
 * This class provides access to the device media, interfaces to both sound and video
 * @constructor
 */
function Audio(src, successCallback, errorCallback) {
	this.src = src;
	this.successCallback = successCallback;
	this.errorCallback = errorCallback;												
}

Audio.prototype.record = function() {
}

Audio.prototype.play = function() {
try {
	if (document.getElementById('gapsound'))
		document.body.removeChild(document.getElementById('gapsound'));
	var obj;
	obj = document.createElement("embed");
	obj.setAttribute("id", "gapsound");
	obj.setAttribute("type", "audio/x-mpeg");
	obj.setAttribute("width", "0");
	obj.setAttribute("width", "0");
	obj.setAttribute("hidden", "true");
	obj.setAttribute("autostart", "true");
	obj.setAttribute("src", this.src);
	document.body.appendChild(obj);
} catch (ex) { debug.log(ex.name + ": " + ex.message) }
}

Audio.prototype.pause = function() {
}

Audio.prototype.stop = function() {
	document.body.removeChild(document.getElementById('gapsound'));
}
