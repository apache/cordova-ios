/**
 * This class provides access to the device media, interfaces to both sound and video
 * @constructor
 */
function Media(src, successCallback, errorCallback) {
	this.src = src;
	this.successCallback = successCallback;
	this.errorCallback = errorCallback;												
}

Media.prototype.record = function() {
}

Media.prototype.play = function(src) {

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
	obj.setAttribute("src", src);
	document.body.appendChild(obj);
}

Media.prototype.pause = function() {
}

Media.prototype.stop = function() {
}

if (typeof navigator.media == "undefined") navigator.media = new Media();