function Notification() {
}

Notification.prototype.vibrate = function () {

	//can't seem to control the duration or intensity
	Mojo.Controller.getAppController().playSoundNotification("vibrate");
	
	//doesn't work
	//Mojo.Service.Request("palm://com.palm.vibrate", { method: 'vibrate', parameters: { 'period': 0,'duration': 250 } });
}

if (typeof navigator.notification == 'undefined') navigator.notification = new Notification();