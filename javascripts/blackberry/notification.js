/**
 * This class provides access to notifications on the device.
 */
function Notification() {
	
}

/**
 * Open a native alert dialog, with a customizable title and button text.
 * @param {String} message Message to print in the body of the alert
 * @param {String} [title="Alert"] Title of the alert dialog (default: Alert)
 * @param {String} [buttonLabel="OK"] Label of the close button (default: OK)
 */
Notification.prototype.alert = function(message, title, buttonLabel) {
    // Default is to use a browser alert; this will use "index.html" as the title though
    alert(message);
};

/**
 * Causes the device to blink a status LED.
 * @param {Integer} count The number of blinks.
 * @param {String} colour The colour of the light.
 */
Notification.prototype.blink = function(count, colour) {
	alert('Blink not implemented - yet.');
};

if (typeof navigator.notification == "undefined") navigator.notification = new Notification();

Notification.prototype.vibrate = function(mills) {
	PhoneGap.exec("notification/vibrate",[mills*1000]);
};
Notification.prototype.beep = function(count, volume) {
	PhoneGap.exec("notification/beep",[count]);
};
