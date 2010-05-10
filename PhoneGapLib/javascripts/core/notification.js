/**
 * This class provides access to notifications on the device.
 */
function Notification() 
{

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
 * @param {String} [cancelLabel="Cancel"] Label ( if callback is provided )
 * @param {Function} [ callback = null ] allows use as a confirm dialog.
 */
Notification.prototype.alert = function(message, title, buttonLabel) 
{
	// ? Do we need to add this check in every PhoneGap call ? seems a little over the top
	// If phonegap is NOT available, seems we have bigger problems then how to show an alert ...
	// just sayin' -jm
    if (!PhoneGap.available)
	{
		return alert(message); // use the JS alert, no return val
	}
	else
	{
		var options = {};
	
		if (title) 
			options.title = title;
		if (buttonLabel) 
			options.buttonLabel = buttonLabel;

		PhoneGap.exec('Notification.alert', message, options);
		this._alertDelegate = {};
		return this._alertDelegate;
	}
};


/**
 * Open a native alert dialog, with a customizable title and button text.
 * @param {String} message Message to print in the body of the alert
 * @param {String} [title="Alert"] Title of the alert dialog (default: Alert)
 * @param {String} [buttonLabel="OK"] Label of the close button (default: OK)
 * @param {String} [cancelLabel="Cancel"] Label ( if callback is provided )
 * Returns a alertDelegate, to catch the return value add your own onAlertDismissed method
 * onAlertDismissed(index,label) // receives the index + the label of the button the user chose
 */
Notification.prototype.confirm = function(message, title, buttonLabels) 
{
	// ? Do we need to add this check in every PhoneGap call ? seems a little over the top
	// If phonegap is NOT available, seems we have bigger problems then how to show an alert ...
	// just sayin' -jm
    if (!PhoneGap.available)
	{
		return confirm(message); // use the JS confirm, return val is result
	}
	else
	{
		var labels = buttonLabels ? buttonLabels : "OK,Cancel";
		return this.alert(message, title, labels);
	}
};

Notification.prototype._alertCallback = function(index,label)
{
	this._alertDelegate.onAlertDismissed(index,label);
}



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

