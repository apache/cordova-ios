function Notification() {
}

Notification.prototype.vibrate = function () {

	//can't seem to control the duration or intensity
	//Mojo.Controller.getAppController().playSoundNotification("vibrate");
	
	//TODO: currently giving error "palm//com.palm.vibrate is not running"
	this.vibhandle = new Mojo.Service.Request("palm://com.palm.vibrate", { 
		method: 'vibrate', 
		parameters: { 
			'period': 0,
			'duration': 75
		},
    	onSuccess: function (response) { },
    	onFailure: function (response) { Mojo.Log.error("failure: " + Object.toJSON(response)); }
	}, true);
}

Notification.prototype.beep = function () {
	this.beephandle = new Mojo.Service.Request('palm://com.palm.audio/systemsounds', {
	    method: "playFeedback",
	    parameters: {
			name: "alert_buzz"
		},
    	onSuccess: function (response) { },
    	onFailure: function (response) { Mojo.Log.error("failure: " + Object.toJSON(response)); }
	}, true);
}

if (typeof navigator.notification == 'undefined') navigator.notification = new Notification();