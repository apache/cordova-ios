if (!Cordova.hasResource("notification")) {
	Cordova.addResource("notification");

/**
 * This class provides access to notifications on the device.
 */
Notification = function() {
};

/**
 * Open a native alert dialog, with a customizable title and button text.
 *
 * @param {String} message              Message to print in the body of the alert
 * @param {Function} completeCallback   The callback that is called when user clicks on a button.
 * @param {String} title                Title of the alert dialog (default: Alert)
 * @param {String} buttonLabel          Label of the close button (default: OK)
 */
Notification.prototype.alert = function(message, completeCallback, title, buttonLabel) {
    var _title = title;
    if (title == null || typeof title === 'undefined') {
        _title = "Alert";
    }
    var _buttonLabel = (buttonLabel || "OK");
    Cordova.exec(completeCallback, null, "org.apache.cordova.notification", "alert", [message,{ "title": _title, "buttonLabel": _buttonLabel}]);
};

/**
 * Open a native confirm dialog, with a customizable title and button text.
 * The result that the user selects is returned to the result callback.
 *
 * @param {String} message              Message to print in the body of the alert
 * @param {Function} resultCallback     The callback that is called when user clicks on a button.
 * @param {String} title                Title of the alert dialog (default: Confirm)
 * @param {String} buttonLabels         Comma separated list of the labels of the buttons (default: 'OK,Cancel')
 */
Notification.prototype.confirm = function(message, resultCallback, title, buttonLabels) {
    var _title = (title || "Confirm");
    var _buttonLabels = (buttonLabels || "OK,Cancel");
    this.alert(message, resultCallback, _title, _buttonLabels);
};

/**
 * Causes the device to blink a status LED.
 * @param {Integer} count The number of blinks.
 * @param {String} colour The colour of the light.
 */
Notification.prototype.blink = function(count, colour) {
// NOT IMPLEMENTED	
};

Notification.prototype.vibrate = function(mills) {
	Cordova.exec(null, null, "org.apache.cordova.notification", "vibrate", []);
};

Notification.prototype.beep = function(count, volume) {
	// No Volume yet for the iphone interface
	// We can use a canned beep sound and call that
	new Media('beep.wav').play();
};

Cordova.addConstructor(function() {
    if (typeof navigator.notification == "undefined") navigator.notification = new Notification();
});
};
