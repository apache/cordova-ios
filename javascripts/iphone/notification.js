Notification.prototype.vibrate = function(mills) {
	PhoneGap.exec("Vibrate.vibrate");
}

Notification.prototype.beep = function(count, volume) {
	// No Volume yet for the iphone interface
	// We can use a canned beep sound and call that
	new Media('beep.wav').play();
}
