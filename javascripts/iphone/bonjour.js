// --- BjV Additions for 360/iDev
Bonjour = function() {
}

Bonjour.prototype.port = 0;
Bonjour.prototype.start = function(name) {
	document.location = "gap://Bonjour.start/null";
}
Bonjour.prototype.stop = function() {
	document.location = "gap://Bonjour.stop/null";
}
Bonjour.prototype.delegate = null;