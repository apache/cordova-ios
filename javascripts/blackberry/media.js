Media.prototype.record = function() {
	alert('Media recording not implemented - yet.');
}

Media.prototype.play = function() {
	PhoneGap.exec("media",[this.src]);
}

Media.prototype.pause = function() {
	alert('Media pausing not implemented - yet.');
}

Media.prototype.stop = function() {
	alert('Media stopping not implemented - yet.');
}