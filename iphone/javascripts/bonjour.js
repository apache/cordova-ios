// --- BjV Additions for 360/iDev
Bonjour = function() {
}

Bonjour.prototype.port = 0;
Bonjour.prototype.start = function(name) {
	PhoneGap.exec("Bonjour.start");
}
Bonjour.prototype.stop = function() {
	PhoneGap.exec("Bonjour.stop");
}
Bonjour.prototype.delegate = null;
