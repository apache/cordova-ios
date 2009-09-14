function Media() = {
};
Media.prototype.playSound = function(media) {
	window.device.exec("media",[media]);
}

if (typeof navigator.media == "undefined") navigator.media = new Media();