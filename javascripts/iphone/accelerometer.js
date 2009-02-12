Accelerometer.prototype.getCurrentAcceleration = function(successCallback, errorCallback, options) {
	if (typeof successCallback == "function") {
		var accel = new Acceleration(_accel.x,_accel.y,_accel.z);
		Accelerometer.lastAcceleration = accel;
		successCallback(accel);
	} 	
}	
