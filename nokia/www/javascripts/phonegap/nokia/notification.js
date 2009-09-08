
/*
 * this first line is unfortunate. but at the moment we must put an embed tag in the main
 * html page of the widget to access notification services. commented out below
 * are a couple of other options that are cleaner. i will leave them for now.
 */


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
	 this.sysinfo.beep(220,2000);
}

Notification.embedSysinfoObject = function() {
	var el = document.createElement("embed");
	el.setAttribute("type", "application/x-systeminfo-widget");
	el.setAttribute("hidden", "yes");
	document.getElementsByTagName("body")[0].appendChild(el);
	return;//document.embeds[0];
}

Notification.getSysinfoObject = function() {
	return document.embeds[0];
}
