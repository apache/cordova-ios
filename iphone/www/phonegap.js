
if (typeof window.Device == 'undefined') {
	var Device = {};
	Device.platform = 'WebPage';
}

/**
* Acceleration class contains accelerometer data.
* @class
*/

function Acceleration(x, y, z) {
	/**
	 * The force applied by the device in the x-axis.
	 */
	this.x = x;
	/**
	 * The force applied by the device in the y-axis.
	 */
	this.y = y;
	/**
	 * The force applied by the device in the z-axis.
	 */
	this.z = z;
	/**
	 * The time that the acceleration was obtained.
	 */
	this.timestamp = new Date().getTime();
}
/**
* Accelerometer class
* @class
*/
var Accelerometer = function() {
	this.lastAccelerometer = null;
}

/**
* Aquires the current acceleration. This function is asyncronous.
* @param {Function} successCallback The function to call when the
* accelerometer data is ready.
* @param {Function} errorCallback The function to call when there is
* an error getting the accelerometer data.
* @param {AccelerometerOptions} options The options for accessing the 
* accelerometer data such as timeout and accuracy.
* @type {String} Returns the ID of the accelerometer listener that is used
* to clear the listener.
*/
Accelerometer.prototype.getCurrentAcceleration = function(successCallback, errorCallback, options) {
	// If the position is available then call success
	// If the position is not available then call error
}

/**
* Retrieves the accelerometer data at a certain interval.
* @param {Function} successCallback The function to call when the
* accelerometer data is ready.
* @param {Function} errorCallback The function to call when there is
* an error getting the accelerometer data.
* @param {AccelerometerOptions} options The options for accessing the 
* accelerometer data.
* @type {String} Returns the ID of the accelerometer listener that is used
* to clear the listener.
*/
Accelerometer.prototype.watchAcceleration = function(successCallback, errorCallback, options) {
	this.getCurrentPosition(successCallback, errorCallback, options);
	return setInterval(function() {
		navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options);
	}, 10000);
}

/**
* Clears the accelerometer listener.
* @param {String} watchId The ID of the listener to clear.
*/
Accelerometer.prototype.clearWatch = function(watchId) {
	clearInterval(watchId);
}

if (typeof navigator.accelerometer == "undefined") navigator.accelerometer = new Accelerometer();


/**
* Camera class.
* @class
*/
var Camera = function() {}

if (typeof navigator.camera == "undefined") navigator.camera = new Camera();


/**
* Contacts class.
* @class
* returns an Array of contacts from the device
*/
//var Contacts = function() {}

if (typeof navigator.contacts == "undefined") navigator.contacts = new Contacts();


/**
* File class provides generic read and write access to the mobile 
* device file system.
* @class
*/
File = function() {}

/**
* Reads a file from the mobile device. This function is asyncronous.
* @param {String} fileName The name (including the path) to the file 
* on the mobile device. The file name will likely be device dependant.
* @param {Function} successCallback The function to call when the file
* is successfully read.
* @param {Function} errorCallback The function to call when there is
* an error reading the file from the device.
*/
File.prototype.read = function(fileName, successCallback, errorCallback) {}

/**
* @private
*/
File.prototype._readReady = function() {}

/**
* Writes a file to the mobile device.
* @param {String} fileName The name (including the path) of the file
* that the data should be saved to. The file name will likely be device 
* dependant.
* @param {String} data The data to be saved to the file.
*/
File.prototype.write = function(fileName, data) {}

if (typeof navigator.file == "undefined") navigator.file = new File();


/**
* Position class.
* @class
*/
function Position(lat, lng, acc, alt, altacc, head, vel) {
	this.latitude = lat;
	this.longitude = lng;
	this.accuracy = acc;
	this.altitude = alt;
	this.altitudeAccuracy = altacc;
	this.heading = head;
	this.velocity = vel;
	this.timestamp = new Date().getTime();
}

/**
* Options for retrieving a GPS location.
* @class
*/
function PositionOptions() {
	this.enableHighAccuracy = true;
	this.timeout = 10000;
}

/**
* PositionError class contains information about the error when
* a GPS location is not accessible.
* @class
*/
function PositionError() {
	this.code = null;
	this.message = "";
}

PositionError.UNKNOWN_ERROR = 0;
PositionError.PERMISSION_DENIED = 1;
PositionError.POSITION_UNAVAILABLE = 2;
PositionError.TIMEOUT = 3;

/**
* Geolocation class provides access to the mobile device location
* through GPS.
* @class
*/
function Geolocation() {
	this.lastPosition = null;
}

/**
* Aquires the current GPS location. This function is asyncronous.
* @param {Function} successCallback The function to call when the
* GPS location is ready.
* @param {Function} errorCallback The function to call when there is
* an error getting the GPS location.
* @param {PositionOptions} options The options for accessing the GPS
* location such as timeout and accuracy.
*/
Geolocation.prototype.getCurrentPosition = function(successCallback, errorCallback, options) {
	// If the position is available then call success
	// If the position is not available then call error
}

/**
* Retrieves the GPS location at a certain interval.
* @param {Function} successCallback The function to call when the
* GPS location is ready.
* @param {Function} errorCallback The function to call when there is
* an error getting the GPS location.
* @param {PositionOptions} options The options for accessing the GPS
* location such as timeout and accuracy.
* @type {String} Returns the ID of the position listener that is used
* to clear the listener.
*/
Geolocation.prototype.watchPosition = function(successCallback, errorCallback, options) {
	this.getCurrentPosition(successCallback, errorCallback, options);
	return setInterval(function() {
		navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options);
	}, 10000);
}

/**
* Clears the position listener.
* @param {String} watchId The ID of the listener to clear.
*/
Geolocation.prototype.clearWatch = function(watchId) {
	clearInterval(watchId);
}

if (typeof navigator.geolocation == "undefined") navigator.geolocation = new Geolocation();


/**
* Maps class provides access to native mobile device mapping applications.
* @class
*/
function Map() {};

/**
* Displays a map with the given positions on it.
* @param {Array} positions An array of positions to plot.
*/
Map.prototype.show = function(positions) {}

if (typeof navigator.map == "undefined") navigator.map = new Map();


/**
* Notification class provides access to various notification methods 
* on the mobile device.
* @class
*/
function Notification() {}

/**
* Causes the mobile device to vibrate.
* @param {Integer} mills The number of milliseconds to vibrate for.
*/
Notification.prototype.vibrate = function(mills) {
	throw("Not implemented");
}

/**
* Causes the mobile device to beep.
* @param {Integer} count The number of times to beep.
*/
Notification.prototype.beep = function(count) {
	throw("Not implemented");
}

/**
* Causes the mobile device to blink.
* @param {Integer} count The number of times to blink.
* @param {String} color The color of the light.
*/
Notification.prototype.blink = function(count, color) {
	throw("Not implemented");
}

if (typeof navigator.notification == "undefined") navigator.notification = new Notification();


/**
* Orientation class.
* @class
*/
function Orientation() {}

/**
* Aquires the current mobile device orientation. This function is asyncronous.
* @param {Function} successCallback The function to call when the
* orientation data is ready.
* @param {Function} errorCallback The function to call when there is
* an error getting the orientation data.
* @param {AccelerometerOptions} options The options for accessing the 
* orientation data.
* @type {String} Returns the ID of the orientation listener that is used
* to clear the listener.
*/
Orientation.prototype.getCurrentOrientation = function(successCallback, errorCallback, options) {}

Orientation.prototype._getCurrentOrientation = function(successCallback, errorCallback, options) {}


/**
* Telephony class.
* @class
*/
function Telephony() {}

/**
* Calls the specified phone number.
* @param {String} number The phone number to call.
*/
Telephony.prototype.call = function(number) {}

if (typeof navigator.telephony == "undefined") navigator.telephony = new Telephony();


/**
* Sms class.
* @class
*/
function Sms() {};

/**
* @param {Integer} number The phone number to send the message to.
* @param {String} message The contents of the SMS message to send.
* @param {Function} successCallback The function to call when the
* SMS message is sent.
* @param {Function} errorCallback The function to call when there is
* an error sending the SMS message.
* @param {PositionOptions} options The options for accessing the GPS
* location such as timeout and accuracy.
*/
Sms.prototype.send =  function(number, message, successCallback, errorCallback) {
}

Sms.prototype._send =  function(successCallback, errorCallback, options) {
}

if (typeof navigator.sms == "undefined") navigator.sms = new Sms();

