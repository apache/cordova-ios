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
	
	if (!this.serviceObj)
		this.serviceObj = InitializeAccelerationServiceObject();
	
	//get the sensor channel
	var SensorParams = { SearchCriterion : "AccelerometerAxis" };
	var returnvalue = this.serviceObj.ISensor.FindSensorChannel(SensorParams);

	var error = returnvalue["ErrorCode"];
	var errmsg = returnvalue["ErrorMessage"];	
	if( !(error == 0 || error == 1012) )
	{
		var ex = { name: "Unable to find Sensor Channel: " + error, message: errmsg };
		errorCallback(ex);
	}
	var channelInfoMap = returnvalue["ReturnValue"][0];
	var criteria = { ChannelInfoMap: channelInfoMap, ListeningType: "ChannelData" };
	
    if (typeof(successCallback) != 'function')
        successCallback = function() {};
    if (typeof(errorCallback) != 'function')
        errorCallback = function() {};
		
	this.success_callback = successCallback;
	this.error_callback = errorCallback;
	
	//create a closure to persist this instance of Accelerometer into the RegisterForNofication callback
	var obj = this;
	
	this.serviceObj.ISensor.RegisterForNotification(criteria, function(transId, eventCode, result){
		var criteria = { TransactionID: transId };
		try {
			obj.serviceObj.ISensor.Cancel(criteria);
			
			var accel = new Acceleration(result.ReturnValue.XAxisData, result.ReturnValue.YAxisData, result.ReturnValue.ZAxisData);
			Accelerometer.lastAcceleration = accel;
			
			obj.success_callback(accel);
			
		} catch (ex) {
			obj.serviceObj.ISensor.Cancel(criteria);
			alert("accel listener - " + ex.name + ": " + ex.message);
			obj.error_callback(ex);
		}
		
	});

}

//gets the Acceleration Service Object from WRT
function InitializeAccelerationServiceObject() {
	var so;
	
    try {
        so = device.getServiceObject("Service.Sensor", "ISensor");
    } catch (ex) {
		alert('Error: failed to load acceleration service: ' + ex.name + " " + ex.message);
        return null;
    }		
	return so;
}