navigator.media = {
	playSound: function(media) {
		window.device.exec("media",[media],true);
	}
};