/**
 * This class provides access to notifications on the device.
 */
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

/**
 * Open a native alert dialog, with a customizable title and button text.
 * @param {String} message Message to print in the body of the alert
 * @param {String} [title="Alert"] Title of the alert dialog (default: Alert)
 * @param {String} [buttonLabel="OK"] Label of the close button (default: OK)
 */
Notification.prototype.alert = function(message, title, buttonLabel) {
	try {
		//var controller = Mojo.Controller.getAppController().getActiveStageController().
		//debug.log(Object.toJSON(Mojo.Controller.getAppController()));
	PhoneGap.sceneController.showAlertDialog({
	    onChoose: function() {},
	    title: $L(title),
	    message: $L(message),
	    choices:[
	         {label:$L(buttonLabel), value:"true", type:'affirmative'}   
	    ]
	    });
	} catch (ex) { debug.log(ex.name + ": " + ex.message); }
};

if (typeof navigator.notification == 'undefined') navigator.notification = new Notification();