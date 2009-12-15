
/**
 * This class provides access to notifications on the device.
 */
function Notification() {
	
}

Notification.prototype.vibrate = function(mills)
{
	
	if (!Notification.getSysinfoObject())
		Notification.embedSysinfoObject();
	
	this.sysinfo = Notification.getSysinfoObject();
	this.sysinfo.startvibra(mills, 100);
}

//TODO: this is not beeping
Notification.prototype.beep = function(count, volume)
{
	if (!Notification.getSysinfoObject())
		Notification.embedSysinfoObject();
	
	this.sysinfo = Notification.getSysinfoObject();	
	this.sysinfo.beep(220,2000);
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
 * Start spinning the activity indicator on the statusbar
 */
Notification.prototype.activityStart = function() {
};

/**
 * Stop spinning the activity indicator on the statusbar, if it's currently spinning
 */
Notification.prototype.activityStop = function() {
};

/**
 * Causes the device to blink a status LED.
 * @param {Integer} count The number of blinks.
 * @param {String} colour The colour of the light.
 */
Notification.prototype.blink = function(count, colour) {
	
};

Notification.embedSysinfoObject = function() {
	var el = document.createElement("embed");
	el.setAttribute("type", "application/x-systeminfo-widget");
	el.setAttribute("hidden", "yes");
	document.getElementsByTagName("body")[0].appendChild(el);
	return;
}

Notification.getSysinfoObject = function() {
	return document.embeds[0];
}

if (typeof navigator.notification == "undefined") navigator.notification = new Notification();
