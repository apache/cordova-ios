function PositionError()
{
	this.code = 0;
	this.message = "";
}

PositionError.PERMISSION_DENIED = 1;
PositionError.POSITION_UNAVAILABLE = 2;
PositionError.TIMEOUT = 3;

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
};

/**
 * Asynchronously aquires the current position.
 * @param {Function} successCallback The function to call when the position
 * data is available
 * @param {Function} errorCallback The function to call when there is an error 
 * getting the position data.
 * @param {PositionOptions} options The options for getting the position data
 * such as timeout.
 * PositionOptions.forcePrompt:Bool default false, 
 * - tells iPhone to prompt the user to turn on location services.
 * - may cause your app to exit while the user is sent to the Settings app
 * PositionOptions.distanceFilter:double aka Number
 * - used to represent a distance in meters.
PositionOptions
{
   desiredAccuracy:Number
   - a distance in meters 
		< 10   = best accuracy  ( Default value )
		< 100  = Nearest Ten Meters
		< 1000 = Nearest Hundred Meters
		< 3000 = Accuracy Kilometers
		3000+  = Accuracy 3 Kilometers
		
	forcePrompt:Boolean default false ( iPhone Only! )
    - tells iPhone to prompt the user to turn on location services.
	- may cause your app to exit while the user is sent to the Settings app
	
	distanceFilter:Number
	- The minimum distance (measured in meters) a device must move laterally before an update event is generated.
	- measured relative to the previously delivered location
	- default value: null ( all movements will be reported )
	
}

 */
Geolocation.prototype.getCurrentPosition = function(successCallback, errorCallback, options) 
{
    var referenceTime = 0;
	
	if(this.lastError != null)
	{
		if(typeof(errorCallback) == 'function')
		{
			errorCallback.call(null,this.lastError);
		}
		this.stop();
		return;
	}

	this.start(options);

    var timeout = 30000; // defaults
    var interval = 2000;
	
    if (options && options.interval)
        interval = options.interval;

    if (typeof(successCallback) != 'function')
        successCallback = function() {};
    if (typeof(errorCallback) != 'function')
        errorCallback = function() {};

    var dis = this;
    var delay = 0;
	var timer;
	var onInterval = function()
	{
		delay += interval;
		if(dis.lastPosition != null && dis.lastPosition.timestamp > referenceTime)
		{
			clearInterval(timer);
            successCallback(dis.lastPosition);
		}
		else if(delay > timeout)
		{
			clearInterval(timer);
            errorCallback("Error Timeout");
		}
		else if(dis.lastError != null)
		{
			clearInterval(timer);
			errorCallback(dis.lastError);
		}
	}
    timer = setInterval(onInterval,interval);     
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
	var frequency = (options && options.frequency) ? options.frequency : 10000; // default 10 second refresh

	var that = this;
	return setInterval(function() 
	{
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
Geolocation.prototype.setLocation = function(position) 
{
	this.lastError = null;
    this.lastPosition = position;

};

/**
 * Called by the geolocation framework when an error occurs while looking up the current position.
 * @param {String} message The text of the error message.
 */
Geolocation.prototype.setError = function(error) {
    this.lastError = error;
};

Geolocation.prototype.start = function(args) {
    PhoneGap.exec("Location.startLocation", args);
};

Geolocation.prototype.stop = function() {
    PhoneGap.exec("Location.stopLocation");
};

// replace origObj's functions ( listed in funkList ) with the same method name on proxyObj
// this is a workaround to prevent UIWebView/MobileSafari default implementation of GeoLocation
// because it includes the full page path as the title of the alert prompt
function __proxyObj(origObj,proxyObj,funkList)
{
    var replaceFunk = function(org,proxy,fName)
    { 
        org[fName] = function()
        { 
           return proxy[fName].apply(proxy,arguments); 
        }; 
    };
	 
    for(var v in funkList) { replaceFunk(origObj,proxyObj,funkList[v]);}
}


PhoneGap.addConstructor(function() 
{
    if (typeof navigator._geo == "undefined") 
    {
        navigator._geo = new Geolocation();
        __proxyObj(navigator.geolocation, navigator._geo,
                 ["setLocation","getCurrentPosition","watchPosition",
                  "clearWatch","setError","start","stop"]);

    }

});
