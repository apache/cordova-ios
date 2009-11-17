/**
 * This class provides access to notifications on the device.
 */
function Notification() {
	
}

/**
 * Causes the device to blink a status LED.
 * @param {Integer} count The number of blinks.
 * @param {String} colour The colour of the light.
 */
Notification.prototype.blink = function(count, colour) {
	
};

Notification.prototype.vibrate = function(mills) {
	PhoneGap.exec("Notification.vibrate");
};

Notification.prototype.beep = function(count, volume) {
	// No Volume yet for the iphone interface
	// We can use a canned beep sound and call that
	new Media('beep.wav').play();
};

/**
 * Open a native alert dialog, with a customizable title and button text.
 * @param {String} message Message to print in the body of the alert
 * @param {String} [title="Alert"] Title of the alert dialog (default: Alert)
 * @param {String} [buttonLabel="OK"] Label of the close button (default: OK)
 */
Notification.prototype.alert = function(message, title, buttonLabel) {
    var options = {};
    if (title) options.title = title;
    if (buttonLabel) options.buttonLabel = buttonLabel;

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

Notification.prototype.loadingStart = function(options) {
    PhoneGap.exec("Notification.loadingStart", options);
};
Notification.prototype.loadingStop = function() {
    PhoneGap.exec("Notification.loadingStop");
};

PhoneGap.addConstructor(function() {
    if (typeof navigator.notification == "undefined") navigator.notification = new Notification();
});

