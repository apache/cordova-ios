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

/**
 * Asynchronously aquires the current position.
 * @param {Function} successCallback The function to call when the position
 * data is available
 * @param {Function} errorCallback The function to call when there is an error 
 * getting the position data.
 * @param {PositionOptions} options The options for getting the position data
 * such as timeout.
 */
Geolocation.prototype.getCurrentPosition = function(successCallback, errorCallback, options) {
    var referenceTime = 0;
    if (this.lastPosition)
        referenceTime = this.lastPosition.timestamp;
    else
        this.start(options);

    var timeout = 20000;
    var interval = 500;
    if (typeof(options) == 'object' && options.interval)
        interval = options.interval;

    if (typeof(successCallback) != 'function')
        successCallback = function() {};
    if (typeof(errorCallback) != 'function')
        errorCallback = function() {};

    var dis = this;
    var delay = 0;
    var timer = setInterval(function() {
        delay += interval;
		//if we have a new position, call success and cancel the timer
        if (dis.lastPosition && dis.lastPosition.timestamp > referenceTime) {
            successCallback(dis.lastPosition);
            clearInterval(timer);
        } else if (delay >= timeout) { //else if timeout has occured then call error and cancel the timer
            errorCallback();
            clearInterval(timer);
        }
		//else the interval gets called again
    }, interval);
};

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
        if (typeof options == 'object' && options.frequency)
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

Geolocation.prototype.start = function(options) {
	var so = device.getServiceObject("Service.Location", "ILocation");
	
	//construct the criteria for our location request
	var updateOptions = new Object();
	// Specify that location information need not be guaranteed. This helps in
	// that the widget doesn't need to wait for that information possibly indefinitely.
	updateOptions.PartialUpdates = true;
	
	//default 15 seconds
	if (typeof(options) == 'object' && options.timeout) 
		//options.timeout in in ms, updateOptions.UpdateTimeout in microsecs
		updateOptions.UpdateTimeOut = options.timeout * 1000;

	//default 1 second
	if (typeof(options) == 'object' && options.interval) 
		//options.timeout in in ms, updateOptions.UpdateTimeout in microsecs
		updateOptions.UpdateInterval = options.interval * 1000;
	
	// Initialize the criteria for the GetLocation call
	var trackCriteria = new Object();
	// could use "BasicLocationInformation" or "GenericLocationInfo"
	trackCriteria.LocationInformationClass = "GenericLocationInfo";
	trackCriteria.Updateoptions = updateOptions;
	
	var dis = this;
	so.ILocation.Trace(trackCriteria, function(transId, eventCode, result) {
		var retVal = result.ReturnValue;

		if (result.ErrorCode != 0 || isNaN(retVal.Latitude))
			return;
		
		// heading options: retVal.TrueCourse, retVal.MagneticHeading, retVal.Heading, retVal.MagneticCourse
		// but retVal.Heading was the only field being returned with data on the test device (Nokia 5800)
		// WRT does not provide accuracy
		var newCoords = new Coordinates(retVal.Latitude, retVal.Longitude, retVal.Altitude, null, retVal.Heading, retVal.HorizontalSpeed);
		var positionObj = { coords: newCoords, timestamp: (new Date()).getTime() };

		dis.lastPosition = positionObj;
	});
	
}


if (typeof navigator.geolocation == "undefined") navigator.geolocation = new Geolocation();

