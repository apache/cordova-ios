/**
 * This class provides access to device accelerometer data.
 * @constructor
 */
function Accelerometer() {
	/**
	 * The last known acceleration.
	 */
	this.lastAcceleration = null;
}

/**
 * Asynchronously aquires the current acceleration.
 * @param {Function} successCallback The function to call when the acceleration
 * data is available
 * @param {Function} errorCallback The function to call when there is an error 
 * getting the acceleration data.
 * @param {AccelerationOptions} options The options for getting the accelerometer data
 * such as timeout.
 */

Accelerometer.prototype.getCurrentAcceleration = function(successCallback, errorCallback, options) {
	// If the acceleration is available then call success
	// If the acceleration is not available then call error
	
	try {
	
		if (!this.serviceObj) 
			this.serviceObj = this.getServiceObj();
		
		if (this.serviceObj == null) 
			throw {
				name: "DeviceErr",
				message: "Could not initialize service object"
			};
		
		//get the sensor channel
		var SensorParams = {
			SearchCriterion: "AccelerometerAxis"
		};
		var returnvalue = this.serviceObj.ISensor.FindSensorChannel(SensorParams);
		
		var error = returnvalue["ErrorCode"];
		var errmsg = returnvalue["ErrorMessage"];
		if (!(error == 0 || error == 1012)) {
			var ex = {
				name: "Unable to find Sensor Channel: " + error,
				message: errmsg
			};
			throw ex;
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
		
		//create a closure to persist this instance of Accelerometer into the RegisterForNofication callback
		var obj = this;
		
		this.serviceObj.ISensor.RegisterForNotification(criteria, function(transId, eventCode, result){
			try {
				
				var criteria = {
					TransactionID: transId
				};
				obj.serviceObj.ISensor.Cancel(criteria);
				
				var accel = new Acceleration(result.ReturnValue.XAxisData, result.ReturnValue.YAxisData, result.ReturnValue.ZAxisData);
				Accelerometer.lastAcceleration = accel;
				
				obj.success_callback(accel);
				
			} 
			catch (ex) {
				obj.serviceObj.ISensor.Cancel(criteria);
				obj.error_callback(ex);
			}
			
		});
		
	} catch (ex) {
		errorCallback(ex);
	}

}


/**
 * Asynchronously aquires the acceleration repeatedly at a given interval.
 * @param {Function} successCallback The function to call each time the acceleration
 * data is available
 * @param {Function} errorCallback The function to call when there is an error 
 * getting the acceleration data.
 * @param {AccelerationOptions} options The options for getting the accelerometer data
 * such as timeout.
 */

Accelerometer.prototype.watchAcceleration = function(successCallback, errorCallback, options) {
	this.getCurrentAcceleration(successCallback, errorCallback, options);
	// TODO: add the interval id to a list so we can clear all watches
 	var frequency = (options != undefined)? options.frequency : 10000;
	return setInterval(function() {
		navigator.accelerometer.getCurrentAcceleration(successCallback, errorCallback, options);
	}, frequency);
}

/**
 * Clears the specified accelerometer watch.
 * @param {String} watchId The ID of the watch returned from #watchAcceleration.
 */
Accelerometer.prototype.clearWatch = function(watchId) {
	clearInterval(watchId);
}

//gets the Acceleration Service Object from WRT
Accelerometer.prototype.getServiceObj = function() {
	var so;
	
    try {
        so = device.getServiceObject("Service.Sensor", "ISensor");
    } catch (ex) {
		throw {
			name: "DeviceError",
			message: "Could not initialize accel service object (" + ex.name + ": " + ex.message + ")"
		};
    }		
	return so;
}

if (typeof navigator.accelerometer == "undefined") navigator.accelerometer = new Accelerometer();