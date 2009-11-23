/**
 * This class provides access to device GPS data.
 * @constructor
 */
function Geolocation() {
    /**
     * The last known GPS position.
     */
    this.lastPosition = null;
    this.lastError = null;
    this.callbacks = {
        onLocationChanged: [],
        onError:           []
    };
};


Geolocation.prototype.getCurrentPosition = function(successCallback, errorCallback, options) {

    try {
		if (!this.serviceObj) 
			this.serviceObj = this.getServiceObj();
		
		//construct the criteria for our location request
		var updateOptions = new Object();
		// Specify that location information need not be guaranteed. This helps in
		// that the widget doesn't need to wait for that information possibly indefinitely.
		updateOptions.PartialUpdates = true;
		
		if (typeof(options) == 'object' && options.timeout) 
			//options.timeout in in ms, updateOptions.UpdateTimeout in microsecs
			updateOptions.UpdateTimeOut = options.timeout * 1000;
		
		// Initialize the criteria for the GetLocation call
		var trackCriteria = new Object();
		// could use "BasicLocationInformation" or "GenericLocationInfo"
		trackCriteria.LocationInformationClass = "GenericLocationInfo";
		trackCriteria.Updateoptions = updateOptions;
		
		if (typeof(successCallback) != 'function') 
			successCallback = function(){
			};
		if (typeof(errorCallback) != 'function') 
			errorCallback = function(){
			};
		
		var result;
		
		//WRT
		result = this.serviceObj.ILocation.GetLocation(trackCriteria);
		
		if (result.ReturnValue == undefined) {
			errorCallback();
			return;
		}
		
		var retVal = result.ReturnValue;
		
		// heading options: retVal.TrueCourse, retVal.MagneticHeading, retVal.Heading, retVal.MagneticCourse
		// but retVal.Heading was the only field being returned with data on the test device (Nokia 5800)
		// WRT does not provide accuracy
		var coords = new Coordinates(retVal.Latitude, retVal.Longitude, retVal.Altitude, null, retVal.Heading, retVal.HorizontalSpeed);
		var positionObj = new Position(coords, new Date().getTime());
		
		this.lastPosition = positionObj;
	} 
	catch (ex) {
		errorCallback({
			name: "GeoError",
			message: ex.name + ": " + ex.message
		});
		return;
	}

	successCallback(positionObj);
}

//gets the Location Service Object from WRT
Geolocation.prototype.getServiceObj = function() {
	var so;
	
    try {
        so = device.getServiceObject("Service.Location", "ILocation");
    } catch (ex) {
		throw { name:"DeviceError", message: "Could not initialize geolocation service object (" + ex.name + ": " + ex.message + ")"};
    }		
	return so;
}

/**
 * Asynchronously aquires the position repeatedly at a given interval.
 * @param {Function} successCallback The function to call each time the position
 * data is available
 * @param {Function} errorCallback The function to call when there is an error 
 * getting the position data.
 * @param {PositionOptions} options The options for getting the position data
 * such as timeout and the frequency of the watch.
 */
Geolocation.prototype.watchPosition = function(successCallback, errorCallback, options) {
	// Invoke the appropriate callback with a new Position object every time the implementation 
	// determines that the position of the hosting device has changed. 
	
	this.getCurrentPosition(successCallback, errorCallback, options);
	var frequency = 10000;
        if (typeof(options) == 'object' && options.frequency)
            frequency = options.frequency;
	
	var that = this;
	return setInterval(function() {
		that.getCurrentPosition(successCallback, errorCallback, options);
	}, frequency);
};


/**
 * Clears the specified position watch.
 * @param {String} watchId The ID of the watch returned from #watchPosition.
 */
Geolocation.prototype.clearWatch = function(watchId) {
	clearInterval(watchId);
};

/**
 * Called by the geolocation framework when the current location is found.
 * @param {PositionOptions} position The current position.
 */
Geolocation.prototype.setLocation = function(position) {
    this.lastPosition = position;
    for (var i = 0; i < this.callbacks.onLocationChanged.length; i++) {
        var f = this.callbacks.onLocationChanged.shift();
        f(position);
    }
};

if (typeof navigator.geolocation == "undefined") navigator.geolocation = new Geolocation();
