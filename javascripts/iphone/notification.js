Notification.prototype.vibrate = function(mills) {
	PhoneGap.exec("Vibrate.vibrate");
};

Notification.prototype.beep = function(count, volume) {
	// No Volume yet for the iphone interface
	// We can use a canned beep sound and call that
	new Media('beep.wav').play();
};

Notification.prototype.alert = function(message, title, buttonLabel) {
    var options = {
        title: title,
        buttonLabel: buttonLabel
    };
    if (PhoneGap.available)
        PhoneGap.exec('Notification.alert', message, options);
    else
        alert(message);
};

Notification.prototype.activityStart = function() {
    PhoneGap.exec("Notification.activityStart");
};
Notification.prototype.activityStop = function() {
    PhoneGap.exec("Notification.activityStop");
};
