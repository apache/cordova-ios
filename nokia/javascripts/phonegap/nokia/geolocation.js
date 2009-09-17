/*
 * The device used for test rarely seemed to return a value for speed, and was flaky with heading.
 * Nonetheless, they are included, and we can use whatever data we manage to get.
 */

// This allows us to override the constructor keeping all the original prototype methods.
/*
var geoPlaceholder = Geolocation.prototype;
Geolocation = function() {

    this.lastPosition = null;
    this.lastError = null;
    this.callbacks = {
        onLocationChanged: [],
        onError:           []
    };
	
	this.serviceObj = InitializeLocationServiceObject();
};
Geolocation.prototype = geoPlaceholder;
*/

Geolocation.prototype.getCurrentPosition = function(successCallback, errorCallback, options) {
	
	if (!this.serviceObj)
		this.serviceObj = InitializeLocationServiceObject();
	
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
        successCallback = function() {};
    if (typeof(errorCallback) != 'function')
        errorCallback = function() {};	
		
	var result;
    try {
		//WRT
        result = this.serviceObj.ILocation.GetLocation(trackCriteria);  
    } catch (ex) {
        alert("error:" + ex.name + " " + ex.message);
		errorCallback(ex);
        return;
    }
	
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

	successCallback();
}

//gets the Location Service Object from WRT
function InitializeLocationServiceObject() {
	var so;
	
    try {
        so = device.getServiceObject("Service.Location", "ILocation");
    } catch (ex) {
		alert('Error: failed to load location service: ' + ex.name + " " + ex.message);
        return null;
    }		
	return so;
}
