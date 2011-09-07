if (!PhoneGap.hasResource("compass")) {
	PhoneGap.addResource("compass");

CompassError = function(){
   this.code = null;
};

// Capture error codes
CompassError.COMPASS_INTERNAL_ERR = 0;
CompassError.COMPASS_NOT_SUPPORTED = 20;

CompassHeading = function() {
	this.magneticHeading = null;
	this.trueHeading = null;
	this.headingAccuracy = null;
	this.timestamp = null;
}	
/**
 * This class provides access to device Compass data.
 * @constructor
 */
Compass = function() {
    /**
     * List of compass watch timers
     */
    this.timers = {};
};

/**
 * Asynchronously acquires the current heading.
 * @param {Function} successCallback The function to call when the heading
 * data is available
 * @param {Function} errorCallback The function to call when there is an error 
 * getting the heading data.
 * @param {PositionOptions} options The options for getting the heading data (not used).
 */
Compass.prototype.getCurrentHeading = function(successCallback, errorCallback, options) {
 	// successCallback required
    if (typeof successCallback !== "function") {
        console.log("Compass Error: successCallback is not a function");
        return;
    }

    // errorCallback optional
    if (errorCallback && (typeof errorCallback !== "function")) {
        console.log("Compass Error: errorCallback is not a function");
        return;
    }

    // Get heading
    PhoneGap.exec(successCallback, errorCallback, "com.phonegap.geolocation", "getCurrentHeading", []);
};

/**
 * Asynchronously acquires the heading repeatedly at a given interval.
 * @param {Function} successCallback The function to call each time the heading
 * data is available
 * @param {Function} errorCallback The function to call when there is an error 
 * getting the heading data.
 * @param {HeadingOptions} options The options for getting the heading data
 * such as timeout and the frequency of the watch.
 */
Compass.prototype.watchHeading= function(successCallback, errorCallback, options) 
{
	// Default interval (100 msec)
    var frequency = (options !== undefined) ? options.frequency : 100;

    // successCallback required
    if (typeof successCallback !== "function") {
        console.log("Compass Error: successCallback is not a function");
        return;
    }

    // errorCallback optional
    if (errorCallback && (typeof errorCallback !== "function")) {
        console.log("Compass Error: errorCallback is not a function");
        return;
    }

    // Start watch timer to get headings
    var id = PhoneGap.createUUID();
    navigator.compass.timers[id] = setInterval(
        function() {
            PhoneGap.exec(successCallback, errorCallback, "com.phonegap.geolocation", "getCurrentHeading", [{repeats: 1}]);
        }, frequency);

    return id;
};


/**
 * Clears the specified heading watch.
 * @param {String} watchId The ID of the watch returned from #watchHeading.
 */
Compass.prototype.clearWatch = function(id) 
{
	// Stop javascript timer & remove from timer list
    if (id && navigator.compass.timers[id]) {
        clearInterval(navigator.compass.timers[id]);
        delete navigator.compass.timers[id];
    }
    if (navigator.compass.timers.length == 0) {
    	// stop the 
    	PhoneGap.exec(null, null, "com.phonegap.geolocation", "stopHeading", []);
    }
};

/** iOS only
 * Asynchronously fires when the heading changes from the last reading.  The amount of distance 
 * required to trigger the event is specified in the filter paramter.
 * @param {Function} successCallback The function to call each time the heading
 * data is available
 * @param {Function} errorCallback The function to call when there is an error 
 * getting the heading data.
 * @param {HeadingOptions} options The options for getting the heading data
 * 			@param {filter} number of degrees change to trigger a callback with heading data (float)
 *
 * In iOS this function is more efficient than calling watchHeading  with a frequency for updates.
 * Only one watchHeadingFilter can be in effect at one time.  If a watchHeadingFilter is in effect, calling
 * getCurrentHeading or watchHeading will use the existing filter value for specifying heading change. 
  */
Compass.prototype.watchHeadingFilter = function(successCallback, errorCallback, options) 
{
 
 	if (options === undefined || options.filter === undefined) {
 		console.log("Compass Error:  options.filter not specified");
 		return;
 	}

    // successCallback required
    if (typeof successCallback !== "function") {
        console.log("Compass Error: successCallback is not a function");
        return;
    }

    // errorCallback optional
    if (errorCallback && (typeof errorCallback !== "function")) {
        console.log("Compass Error: errorCallback is not a function");
        return;
    }
    PhoneGap.exec(successCallback, errorCallback, "com.phonegap.geolocation", "watchHeadingFilter", [options]);
}
Compass.prototype.clearWatchFilter = function() 
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
