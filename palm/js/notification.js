/**
 * This class provides access to notifications on the device.
 */
function Notification() {
}
/*
 * This function vibrates the device
 * @param {number} duration The duration in ms to vibrate for.
 * @param {number} intensity The intensity of the vibration
 */
Notification.prototype.vibrate = function (duration, intensity) {
	//the intensity for palm is inverted; 0=high intensity, 100=low intensity
	//this is opposite from our api, so we invert
	if (isNaN(intensity) || intensity > 100 || intensity <= 0)
		intensity = 0;
	else
		intensity = 100 - intensity;
	
	//if the app id does not have the namespace "com.palm.", an error will be thrown here
	this.vibhandle = new Mojo.Service.Request("palm://com.palm.vibrate", { 
		method: 'vibrate', 
		parameters: { 
			'period': intensity,
			'duration': duration
		},
	}, false);
}

Notification.prototype.beep = function () {
	this.beephandle = new Mojo.Service.Request('palm://com.palm.audio/systemsounds', {
	    method: "playFeedback",
	    parameters: {
			//the system sounds available are all ridiculous.
			//http://developer.palm.com/index.php?option=com_content&view=article&id=1618
			name: "error_01"
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