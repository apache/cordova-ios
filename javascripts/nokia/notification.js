
/*
 * this first line is unfortunate. but at the moment we must put an embed tag in the main
 * html page of the widget to access notification services. commented out below
 * are a couple of other options that are cleaner. i will leave them for now.
 */

/*
var placeholder = Notification.prototype;
Notification = function () {
	var el = document.createElement("embed");
	el.setAttribute("type", "application/x-systeminfo-widget");
	el.setAttribute("hidden", "yes");
	
	alert(el);
	
	document.getElementsByTagName("head")[0].appendChild(el);
	
	this.sysinfo = document.embeds[0];
	
	alert(this.sysinfo);
}
Notification.prototype = placeholder;
*/

/*
var placeholder = Notification.prototype;
Notification = function () {
	this.sysinfo = com.nokia.device.load("", "com.nokia.device.sysinfo", "");
}
Notification.prototype = placeholder;
*/

var sysinfo = document.embeds[0];

Notification.prototype.vibrate = function(mills)
{
	//quickfix: couldn't get vibrate to work unless it was called asynchronously
	setTimeout('sysinfo.startvibra(2000, 100);',0);
}

//not doing anything
Notification.prototype.beep = function(count, volume)
{
	 sysinfo.beep(220,2000);
}