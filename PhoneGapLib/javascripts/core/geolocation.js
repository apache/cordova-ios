if (!PhoneGap.hasResource("geolocation")) {
	PhoneGap.addResource("geolocation");

/**
 * This class provides access to device GPS data.
 * @constructor
 */
Geolocation = function() {
    // The last known GPS position.
    this.lastPosition = null;
    this.listener = null;
    this.timeoutTimerId = 0;

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
    // create an always valid local success callback
    var win = successCallback;
    if (!win || typeof(win) != 'function')
    {
        win = function(position) {};
    }
    
    // create an always valid local error callback
    var fail = errorCallback;
    if (!fail || typeof(fail) != 'function')
    {
        fail = function(positionError) {};
    }	

    var self = this;
    var totalTime = 0;
	var timeoutTimerId;
	
	// set params to our default values
	var params = new PositionOptions();
	
    if (options) 
    {
        if (options.maximumAge) 
        {
            // special case here if we have a cached value that is younger than maximumAge
            if(this.lastPosition)
            {
                var now = new Date().getTime();
                if((now - this.lastPosition.timestamp) < options.maximumAge)
                {
                    win(this.lastPosition); // send cached position immediately 
                    return;                 // Note, execution stops here -jm
                }
            }
            params.maximumAge = options.maximumAge;
        }
        if (options.enableHighAccuracy) 
        {
            params.enableHighAccuracy = (options.enableHighAccuracy == true); // make sure it's truthy
        }
        if (options.timeout) 
        {
            params.timeout = options.timeout;
        }
    }
    
    this.listener = {"success":win,"fail":fail};
    this.start(params);
	
	var onTimeout = function()
	{
	    self.setError(new PositionError(PositionError.TIMEOUT,"Geolocation Error: Timeout."));
	};

    clearTimeout(this.timeoutTimerId);
    this.timeoutTimerId = setTimeout(onTimeout, params.timeout); 
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

	var self = this; // those == this & that
	
	var params = new PositionOptions();

    if(options)
    {
        if (options.maximumAge) {
            params.maximumAge = options.maximumAge;
        }
        if (options.enableHighAccuracy) {
            params.enableHighAccuracy = options.enableHighAccuracy;
        }
        if (options.timeout) {
            params.timeout = options.timeout;
        }
    }

	var that = this;
    var lastPos = that.lastPosition? that.lastPosition.clone() : null;
    
	var intervalFunction = function() {
        
		var filterFun = function(position) {
            if (lastPos == null || !position.equals(lastPos)) {
                // only call the success callback when there is a change in position, per W3C
                successCallback(position);
            }
            
            // clone the new position, save it as our last position (internal var)
            lastPos = position.clone();
        };
		
		that.getCurrentPosition(filterFun, errorCallback, params);
	};
	
    // Retrieve location immediately and schedule next retrieval afterwards
	intervalFunction();
	
	return setInterval(intervalFunction, params.timeout);
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
    var _position = new Position(position.coords, position.timestamp);

    if(this.timeoutTimerId)
    {
        clearTimeout(this.timeoutTimerId);
        this.timeoutTimerId = 0;
    }
    
	this.lastError = null;
    this.lastPosition = _position;
    
    if(this.listener && typeof(this.listener.success) == 'function')
    {
        this.listener.success(_position);
    }
    
    this.listener = null;
};

/**
 * Called by the geolocation framework when an error occurs while looking up the current position.
 * @param {String} message The text of the error message.
 */
Geolocation.prototype.setError = function(error) 
{
	var _error = new PositionError(error.code, error.message);
	
    if(this.timeoutTimerId)
    {
        clearTimeout(this.timeoutTimerId);
        this.timeoutTimerId = 0;
    }
    
    this.lastError = _error;
    // call error handlers directly
    if(this.listener && typeof(this.listener.fail) == 'function')
    {
        this.listener.fail(_error);
    }
    this.listener = null;

};

Geolocation.prototype.start = function(positionOptions) 
{
    PhoneGap.exec(null, null, "com.phonegap.geolocation", "startLocation", [positionOptions]);

};

Geolocation.prototype.stop = function() 
{
    PhoneGap.exec(null, null, "com.phonegap.geolocation", "stopLocation", []);
};


PhoneGap.addConstructor(function() 
{
    if (typeof navigator._geo == "undefined") 
    {
        // replace origObj's functions ( listed in funkList ) with the same method name on proxyObj
        // this is a workaround to prevent UIWebView/MobileSafari default implementation of GeoLocation
        // because it includes the full page path as the title of the alert prompt
        var __proxyObj = function (origObj,proxyObj,funkList)
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
        navigator._geo = new Geolocation();
        __proxyObj(navigator.geolocation, navigator._geo,
                 ["setLocation","getCurrentPosition","watchPosition",
                  "clearWatch","setError","start","stop"]);

    }

});
};
