if (!PhoneGap.hasResource("compass")) {
	PhoneGap.addResource("compass");
	
/**
 * This class provides access to device Compass data.
 * @constructor
 */
Compass = function() {
    /**
     * The last known Compass position.
     */
    // lastHeading actually contains a bit more info than what we return to our callbacks 
    // timestamp, magneticHeading, trueHeading, headingAccuracy, x, y, z
    // docs specify that the return value is a simple 'heading'
    // if possible we will use trueHeading, otherwise magneticHeading is returned
    // trueHeading is only available if location services is ON
	this.lastHeading = null;
    this.lastError = null;
	this.callbacks = {
		onHeadingChanged: [],
        onError:           []
    };
};

/**
 * Asynchronously aquires the current heading.
 * @param {Function} successCallback The function to call when the heading
 * data is available
 * @param {Function} errorCallback The function to call when there is an error 
 * getting the heading data.
 * @param {PositionOptions} options The options for getting the heading data
 * such as timeout.
 */
Compass.prototype.getCurrentHeading = function(successCallback, errorCallback, options) {
	if (this.lastHeading == null) {
        this.callbacks.onHeadingChanged.push(successCallback);
        this.callbacks.onError.push(errorCallback);
		this.start(options);
	}
	else
	{
	    if(options.maximumAge)
        {
            var now = new Date().getTime();
            if(now - this.lastHeading.timestamp > options.maximumAge)
            {
                this.callbacks.onHeadingChanged.push(successCallback);
                this.callbacks.onError.push(errorCallback);
                
                this.start(options); // we have a cached value that is old ...
                return;
            }
        } 

        // we have a last heading + it is NOT older than maximumAge, or maximumAge is not specified
        if (typeof successCallback == "function") 
    	{
    	    var returnHeading = -1;
    	    if(this.lastHeading.trueHeading > -1)
    	    {
    	        returnHeading = this.lastHeading.trueHeading;
    	    }
    	    else if( this.lastHeading.magneticHeading )
    	    {
    	        returnHeading = this.lastHeading.magneticHeading;
    	    }
    		successCallback(returnHeading);
    	}
	}
	
};

/**
 * Asynchronously aquires the heading repeatedly at a given interval.
 * @param {Function} successCallback The function to call each time the heading
 * data is available
 * @param {Function} errorCallback The function to call when there is an error 
 * getting the heading data.
 * @param {HeadingOptions} options The options for getting the heading data
 * such as timeout and the frequency of the watch.
 */
Compass.prototype.watchHeading= function(successCallback, errorCallback, options) 
{
	// Invoke the appropriate callback with a new Position object every time the implementation 
	// determines that the position of the hosting device has changed. 
	
	var frequency = (options && options.frequency) ? options.frequency : 1000;
	var self = this;
	var funk = function() 
	{
		self.getCurrentHeading(successCallback, errorCallback, options);
	};
	funk();
	return setInterval(funk, frequency);
};


/**
 * Clears the specified heading watch.
 * @param {String} watchId The ID of the watch returned from #watchHeading.
 */
Compass.prototype.clearWatch = function(watchId) 
{
	clearInterval(watchId);
};


/**
 * Called by the geolocation framework when the current heading is found.
 * @param {heading} heading The current heading.
 */
Compass.prototype.setHeading = function(heading) 
{
    this.lastHeading = heading;
    // the last heading we are storing has lots more info, but the current API docs only state that 
    // the direction value is returned.
    var returnHeading = -1;
    if(this.lastHeading.trueHeading > -1)
    {
        returnHeading = this.lastHeading.trueHeading;
    }
    else if( this.lastHeading.magneticHeading )
    {
        returnHeading = this.lastHeading.magneticHeading;
    }
    
    var arr = this.callbacks.onHeadingChanged;
    for (var i = 0, len = arr.length; i < len; i++) 
    {
        arr[i](returnHeading);
    }
    // callbacks are only used once, so cleanup
    this.callbacks.onHeadingChanged = [];
    this.callbacks.onError = [];
};

/**
 * Called by the geolocation framework when an error occurs while looking up the current position.
 * @param {String} message The text of the error message.
 */
Compass.prototype.setError = function(message) 
{
    this.lastError = message;
    var arr = this.callbacks.onError;
    for (var i = 0,len = arr.length; i < len; i++) 
    {
        arr[i](message);
    }
    // callbacks are only used once, so cleanup
    this.callbacks.onHeadingChanged = [];
    this.callbacks.onError = [];
    this.stop();
};

Compass.prototype.start = function(options) 
{
    PhoneGap.exec(null, null, "com.phonegap.geolocation", "startHeading", [options]);
};

Compass.prototype.stop = function() 
{
    PhoneGap.exec(null, null, "com.phonegap.geolocation", "stopHeading", []);
};

PhoneGap.addConstructor(function() 
{
    if (typeof navigator.compass == "undefined") 
    {
        navigator.compass = new Compass();
    }
});
};
