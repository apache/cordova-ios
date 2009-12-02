function Notification() {
}

<<<<<<< HEAD

//TODO: currently giving error "palm//com.palm.vibrate is not running"
=======
>>>>>>> 7bb4bef07d3cedff20a7b41531ef8d18ed7c9eaa
Notification.prototype.vibrate = function () {

	//can't seem to control the duration or intensity
	Mojo.Controller.getAppController().playSoundNotification("vibrate");
	
	//doesn't work
<<<<<<< HEAD
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



=======
	//Mojo.Service.Request("palm://com.palm.vibrate", { method: 'vibrate', parameters: { 'period': 0,'duration': 250 } });
}

>>>>>>> 7bb4bef07d3cedff20a7b41531ef8d18ed7c9eaa
if (typeof navigator.notification == 'undefined') navigator.notification = new Notification();