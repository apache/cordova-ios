/**
 * This class provides access to the device orientation.
 * @constructor
 */
function Orientation() {
	/**
	 * The current orientation, or null if the orientation hasn't changed yet.
	 */
	this.currentOrientation = null;
}

/**
 * Set the current orientation of the phone.  This is called from the device automatically.
 * 
 * When the orientation is changed, the DOMEvent \c orientationChanged is dispatched against
 * the document element.  The event has the property \c orientation which can be used to retrieve
 * the device's current orientation, in addition to the \c Orientation.currentOrientation class property.
 *
 * @param {Number} orientation The orientation to be set
 */
Orientation.prototype.setOrientation = function(orientation) {
		if (orientation == this.currentOrientation) 
			return;
		var old = this.currentOrientation;

		this.currentOrientation = orientation;
		var e = document.createEvent('Events');
		e.initEvent('orientationChanged', 'false', 'false');
		e.orientation = orientation;
		e.oldOrientation = old;
		document.dispatchEvent(e);
};

/**
 * Asynchronously aquires the current orientation.
 * @param {Function} successCallback The function to call when the orientation
 * is known.
 * @param {Function} errorCallback The function to call when there is an error 
 * getting the orientation.
 */
Orientation.prototype.getCurrentOrientation = function(successCallback, errorCallback) {
	// If the orientation is available then call success
	// If the orientation is not available then call error
	try {
		if (!this.serviceObj) 
			this.serviceObj = this.getServiceObj();
		
		if (this.serviceObj == null) 
			errorCallback({
				name: "DeviceErr",
				message: "Could not initialize service object"
			})
		
		//get the sensor channel
		var SensorParams = {
			SearchCriterion: "Orientation"
		};
		var returnvalue = this.serviceObj.ISensor.FindSensorChannel(SensorParams);
		
		var error = returnvalue["ErrorCode"];
		var errmsg = returnvalue["ErrorMessage"];
		if (!(error == 0 || error == 1012)) {
			var ex = {
				name: "Unable to find Sensor Channel: " + error,
				message: errmsg
			};
			errorCallback(ex);
		}
		var channelInfoMap = returnvalue["ReturnValue"][0];
		var criteria = {
			ChannelInfoMap: channelInfoMap,
			ListeningType: "ChannelData"
		};
		
		if (typeof(successCallback) != 'function') 
			successCallback = function(){
			};
		if (typeof(errorCallback) != 'function') 
			errorCallback = function(){
			};
		
		this.success_callback = successCallback;
		this.error_callback = errorCallback;
		
		//create a closure to persist this instance of orientation object into the RegisterForNofication callback
		var obj = this;
		
		// TODO: this call crashes WRT, but there is no other way to read the orientation sensor
		// http://discussion.forum.nokia.com/forum/showthread.php?t=182151&highlight=memory+leak
		this.serviceObj.ISensor.RegisterForNotification(criteria, function(transId, eventCode, result){
			var criteria = {
				TransactionID: transId
			};
			try {
				//var orientation = result.ReturnValue.DeviceOrientation;
				obj.serviceObj.ISensor.Cancel(criteria);
				
				var orientation = null;
				switch (result.ReturnValue.DeviceOrientation) {
					case "DisplayUpwards": orientation = DisplayOrientation.FACE_UP; break;
					case "DisplayDownwards": orientation = DisplayOrientation.FACE_DOWN; break;
					case "DisplayUp": orientation = DisplayOrientation.PORTRAIT; break;
					case "DisplayDown": orientation = DisplayOrientation.REVERSE_PORTRAIT; break;
					case "DisplayRightUp": orientation = DisplayOrientation.LANDSCAPE_RIGHT_UP; break;
					case "DisplayLeftUp": orientation = DisplayOrientation.LANDSCAPE_LEFT_UP; break;
					
				}
				
				obj.setOrientation(orientation);
				
				obj.success_callback(orientation);
				
			} 
			catch (ex) {
				obj.serviceObj.ISensor.Cancel(criteria);
				obj.error_callback(ex);
			}
			
		});
	} catch (ex) {
		errorCallback({ name: "OrientationError", message: ex.name + ": " + ex.message });
	}
};

/**
 * Asynchronously aquires the orientation repeatedly at a given interval.
 * @param {Function} successCallback The function to call each time the orientation
 * data is available.
 * @param {Function} errorCallback The function to call when there is an error 
 * getting the orientation data.
 */
Orientation.prototype.watchOrientation = function(successCallback, errorCallback, options) {
	// Invoke the appropriate callback with a new Position object every time the implementation 
	// determines that the position of the hosting device has changed. 
	this.getCurrentOrientation(successCallback, errorCallback);
	var frequency = (options != undefined)? options.frequency : 1000;
	return setInterval(function() {
		navigator.orientation.getCurrentOrientation(successCallback, errorCallback);
	}, frequency);
};

/**
 * Clears the specified orientation watch.
 * @param {String} watchId The ID of the watch returned from #watchOrientation.
 */
Orientation.prototype.clearWatch = function(watchId) {
	clearInterval(watchId);
};

//gets the Acceleration Service Object from WRT
Orientation.prototype.getServiceObj = function() {
	var so;
	
    try {
        so = device.getServiceObject("Service.Sensor", "ISensor");
    } catch (ex) {
		throw {
			name: "DeviceError",
			message: ex.name + ": " + ex.message
		};
    }		
	return so;
}


/**
 * This class encapsulates the possible orientation values.
 * @constructor
 */
function DisplayOrientation() {
	this.code = null;
	this.message = "";
}

DisplayOrientation.PORTRAIT = 0;
DisplayOrientation.REVERSE_PORTRAIT = 1;
DisplayOrientation.LANDSCAPE_LEFT_UP = 2;
DisplayOrientation.LANDSCAPE_RIGHT_UP = 3;
DisplayOrientation.FACE_UP = 4;
DisplayOrientation.FACE_DOWN = 5;

if (typeof navigator.orientation == "undefined") navigator.orientation = new Orientation();
