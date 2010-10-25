/**
 * This class provides access to notifications on the device.
 */
function Notification() 
{
	this.resultsCallback = null;
};

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
 *
 * @param {String} message              Message to print in the body of the alert
 * @param {Function} resultCallback     The callback that is called when user clicks on a button. 
 * @param {String} title                Title of the alert dialog (default: Alert)
 * @param {String} buttonLabel          Label for close button
 */
Notification.prototype.alert = function(message, resultCallback, title, buttonLabel) 
{
	var options = {};
	options.title = (title || "Alert");
	options.buttonLabel = (buttonLabel || "OK");
	this.resultsCallback = resultCallback;
	PhoneGap.exec('Notification.alert', message, options);
	return;
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
Notification.prototype.confirm = function(message, resultCallback, title, buttonLabels) 
{

	var confirmTitle = title ? title : "Confirm";
	var labels = buttonLabels ? buttonLabels : "OK,Cancel";
	return this.alert(message, resultCallback, confirmTitle, labels);
};

Notification.prototype._alertCallback = function(index)
{
	try {
        this.resultsCallback(index);
    }
    catch (e) {
        console.log("Error in user's result callback: " + e);
    }
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

