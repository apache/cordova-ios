    
    /**
     * This class contains acceleration information
     * @constructor
     * @param {Number} x The force applied by the device in the x-axis.
     * @param {Number} y The force applied by the device in the y-axis.
     * @param {Number} z The force applied by the device in the z-axis.
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
     * This class specifies the options for requesting acceleration data.
     * @constructor
     */
    function AccelerationOptions() {
    	/**
    	 * The timeout after which if acceleration data cannot be obtained the errorCallback
    	 * is called.
    	 */
    	this.timeout = 10000;
    }
    
    
    /**
     * This class provides access to device accelerometer data.
     * @constructor
     */
    function Accelerometer() {
    	/**
    	 * The last known acceleration.
    	 */
    	this.lastAcceleration = null;
    }
    
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
    	
    	// Created for iPhone, Iphone passes back _accel obj litteral
    	if (typeof successCallback == "function") {
    		var accel = new Acceleration(_accel.x,_accel.y,_accel.z);
    		Accelerometer.lastAcceleration = accel;
    		successCallback(accel);
    	}
    }
    
    /**
     * Asynchronously aquires the acceleration repeatedly at a given interval.
     * @param {Function} successCallback The function to call each time the acceleration
     * data is available
     * @param {Function} errorCallback The function to call when there is an error 
     * getting the acceleration data.
     * @param {AccelerationOptions} options The options for getting the accelerometer data
     * such as timeout.
     */
    
    Accelerometer.prototype.watchAcceleration = function(successCallback, errorCallback, options) {
    	this.getCurrentAcceleration(successCallback, errorCallback, options);
    	// TODO: add the interval id to a list so we can clear all watches
     	var frequency = (options != undefined)? options.frequency : 10000;
    	return setInterval(function() {
    		navigator.accelerometer.getCurrentAcceleration(successCallback, errorCallback, options);
    	}, frequency);
    }
    
    /**
     * Clears the specified accelerometer watch.
     * @param {String} watchId The ID of the watch returned from #watchAcceleration.
     */
    Accelerometer.prototype.clearWatch = function(watchId) {
    	clearInterval(watchId);
    }
    
    if (typeof navigator.accelerometer == "undefined") navigator.accelerometer = new Accelerometer();
    
    
    
    /**
     * This class provides access to the device media, interfaces to both sound and video
     * @constructor
     */
    function Media(src) {
    	this.src = src;
    }
    
    Media.prototype.play = function() {
    }
    
    Media.prototype.pause = function() {
    }
    
    Media.prototype.stop = function() {
    }
    
    
    /**
     * This class contains information about any Media errors.
     * @constructor
     */
    function MediaError() {
    	this.code = null,
    	this.message = "";
    }
    
    MediaError.MEDIA_ERR_ABORTED 		= 1;
    MediaError.MEDIA_ERR_NETWORK 		= 2;
    MediaError.MEDIA_ERR_DECODE 		= 3;
    MediaError.MEDIA_ERR_NONE_SUPPORTED = 4;
    
    
    //if (typeof navigator.audio == "undefined") navigator.audio = new Media(src);
    
    
    /**
     * This class provides access to the device camera.
     * @constructor
     */
    function Camera() {
    	
    }
    
    /**
     * 
     * @param {Function} successCallback
     * @param {Function} errorCallback
     * @param {Object} options
     */
    Camera.prototype.getPicture = function(successCallback, errorCallback, options) {
    	
    }
    
    if (typeof navigator.camera == "undefined") navigator.camera = new Camera();
    
    
    /**
     * This class provides access to the device contacts.
     * @constructor
     */
    function Contact() {
    	this.name = "";
    	this.phone = "";
    	this.address = "";
    }
    
    /**
     * 
     * @param {Object} successCallback
     * @param {Object} errorCallback
     * @param {Object} options
     */
    Contact.prototype.get = function(successCallback, errorCallback, options) {
    	
    }
    
    
    function ContactManager() {
    	// Dummy object to hold array of contacts
    	this.contacts = [];
    	this.timestap = new Date().getTime();
    }
    
    ContactManager.prototype.get = function(successCallback, errorCallback, options) {
    	// Interface
    }
    
    if (typeof navigator.ContactManager == "undefined") navigator.ContactManager = new ContactManager();
    
    
    /**
     * This class provides generic read and write access to the mobile device file system.
     */
    function File() {
    	/**
    	 * The data of a file.
    	 */
    	this.data = "";
    	/**
    	 * The name of the file.
    	 */
    	this.name = "";
    }
    
    /**
     * Reads a file from the mobile device. This function is asyncronous.
     * @param {String} fileName The name (including the path) to the file on the mobile device. 
     * The file name will likely be device dependant.
     * @param {Function} successCallback The function to call when the file is successfully read.
     * @param {Function} errorCallback The function to call when there is an error reading the file from the device.
     */
    File.prototype.read = function(fileName, successCallback, errorCallback) {
    	
    }
    
    /**
     * Writes a file to the mobile device.
     * @param {File} file The file to write to the device.
     */
    File.prototype.write = function(file) {
    	
    }
    
    if (typeof navigator.file == "undefined") navigator.file = new File();
    
    
    /**
     * This class provides access to device GPS data.
     * @constructor
     */
    function Geolocation() {
    	/**
    	 * The last known GPS position.
    	 */
    	this.lastPosition = null;
    }
    
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
    	// If the position is available then call success
    	// If the position is not available then call error
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
    	var frequency = (options != undefined)? options.frequency : 10000;
    	
    	var that = this;
    	return setInterval(function() {
    		that.getCurrentPosition(successCallback, errorCallback, options);
    		//navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options);
    	}, frequency);
    }
    
    
    /**
     * Clears the specified position watch.
     * @param {String} watchId The ID of the watch returned from #watchPosition.
     */
    Geolocation.prototype.clearWatch = function(watchId) {
    	clearInterval(watchId);
    }
    
    if (typeof navigator.geolocation == "undefined") navigator.geolocation = new Geolocation();
    
    
    /**
     * This class provides access to native mapping applications on the device.
     */
    function Map() {
    	
    }
    
    /**
     * Shows a native map on the device with pins at the given positions.
     * @param {Array} positions
     */
    Map.prototype.show = function(positions) {
    	
    }
    
    if (typeof navigator.map == "undefined") navigator.map = new Map();
    
    
    /**
     * This class provides access to notifications on the device.
     */
    function Notification() {
    	
    }
    
    /**
     * Causes the device to blink a status LED.
     * @param {Integer} count The number of blinks.
     * @param {String} colour The colour of the light.
     */
    Notification.prototype.blink = function(count, colour) {
    	
    }
    
    /**
     * Causes the device to vibrate.
     * @param {Integer} mills The number of milliseconds to vibrate for.
     */
    Notification.prototype.vibrate = function(mills) {
    	
    }
    
    /**
     * Causes the device to beep.
     * @param {Integer} count The number of beeps.
     * @param {Integer} volume The volume of the beep.
     */
    Notification.prototype.beep = function(count, volume) {
    	
    }
    
    // TODO: of course on Blackberry and Android there notifications in the UI as well
    
    if (typeof navigator.notification == "undefined") navigator.notification = new Notification();
    
    
    /**
     * This class provides access to the device orientation.
     * @constructor
     */
    function Orientation() {
    	/**
    	 * The last known orientation.
    	 */
    	this.lastOrientation = null;
    }
    
    /**
     * Asynchronously aquires the current orientation.
     * @param {Function} successCallback The function to call when the orientation
     * is known.
     * @param {Function} errorCallback The function to call when there is an error 
     * getting the orientation.
     */
    Orientation.prototype.getCurrentOrientation = function(successCallback, errorCallback) {
    	// If the position is available then call success
    	// If the position is not available then call error
    }
    
    /**
     * Asynchronously aquires the orientation repeatedly at a given interval.
     * @param {Function} successCallback The function to call each time the orientation
     * data is available.
     * @param {Function} errorCallback The function to call when there is an error 
     * getting the orientation data.
     */
    Orientation.prototype.watchOrientation = function(successCallback, errorCallback) {
    	// Invoke the appropriate callback with a new Position object every time the implementation 
    	// determines that the position of the hosting device has changed. 
    	this.getCurrentPosition(successCallback, errorCallback);
    	return setInterval(function() {
    		navigator.orientation.getCurrentOrientation(successCallback, errorCallback);
    	}, 10000);
    }
    
    /**
     * Clears the specified orientation watch.
     * @param {String} watchId The ID of the watch returned from #watchOrientation.
     */
    Orientation.prototype.clearWatch = function(watchId) {
    	clearInterval(watchId);
    }
    
    if (typeof navigator.orientation == "undefined") navigator.orientation = new Orientation();
    
    
    /**
     * This class contains position information.
     * @param {Object} lat
     * @param {Object} lng
     * @param {Object} acc
     * @param {Object} alt
     * @param {Object} altacc
     * @param {Object} head
     * @param {Object} vel
     * @constructor
     */
    function Position(lat, lng, acc, alt, altacc, head, vel) {
    	/**
    	 * The latitude of the position.
    	 */
    	this.latitude = lat;
    	/**
    	 * The longitude of the position,
    	 */
    	this.longitude = lng;
    	/**
    	 * The accuracy of the position.
    	 */
    	this.accuracy = acc;
    	/**
    	 * The altitude of the position.
    	 */
    	this.altitude = alt;
    	/**
    	 * The altitude accuracy of the position.
    	 */
    	this.altitudeAccuracy = altacc;
    	/**
    	 * The direction the device is moving at the position.
    	 */
    	this.heading = head;
    	/**
    	 * The velocity with which the device is moving at the position.
    	 */
    	this.velocity = vel;
    	/**
    	 * The time that the position was obtained.
    	 */
    	this.timestamp = new Date().getTime();
    }
    
    /**
     * This class specifies the options for requesting position data.
     * @constructor
     */
    function PositionOptions() {
    	/**
    	 * Specifies the desired position accuracy.
    	 */
    	this.enableHighAccuracy = true;
    	/**
    	 * The timeout after which if position data cannot be obtained the errorCallback
    	 * is called.
    	 */
    	this.timeout = 10000;
    }
    
    /**
     * This class contains information about any GSP errors.
     * @constructor
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
     * This class provides access to the device SMS functionality.
     * @constructor
     */
    function Sms() {
    
    }
    
    /**
     * Sends an SMS message.
     * @param {Integer} number The phone number to send the message to.
     * @param {String} message The contents of the SMS message to send.
     * @param {Function} successCallback The function to call when the SMS message is sent.
     * @param {Function} errorCallback The function to call when there is an error sending the SMS message.
     * @param {PositionOptions} options The options for accessing the GPS location such as timeout and accuracy.
     */
    Sms.prototype.send = function(number, message, successCallback, errorCallback, options) {
    	
    }
    
    if (typeof navigator.sms == "undefined") navigator.sms = new Sms();
    
    
    /**
     * This class provides access to the telephony features of the device.
     * @constructor
     */
    function Telephony() {
    	
    }
    
    /**
     * Calls the specifed number.
     * @param {Integer} number The number to be called.
     */
    Telephony.prototype.call = function(number) {
    	
    }
    
    if (typeof navigator.telephony == "undefined") navigator.telephony = new Telephony();
    
    
    
    
    
    File.prototype.read = function(fileName, successCallback, errorCallback) {
    	document.cookie = 'bb_command={command:8,args:{name:"'+fileName+'"}}';
    	navigator.file.successCallback = successCallback;
    	navigator.file.errorCallback = errorCallback;
    	navigator.file.readTimeout = window.setInterval('navigator.file._readReady()', 1000);
    }
    
    File.prototype._readReady = function() {
    	var cookies = document.cookie.split(';');
    	for (var i=0; i<cookies.length; i++) {
    		var cookie = cookies[i].split('=');
    		if (cookie[0] == 'bb_response') {
    			var obj = eval('('+cookie[1]+')');
    
    			// TODO: This needs to be in ONE cookie reading loop I think so that it can find 
    			// various different data coming back from the phone at any time (poll piggy-backing)
    			var file = obj.readfile;
    			if (file != null)
    			{
    				window.clearTimeout(navigator.file.readTimeout);
    				if (file.length > 0)
    				{
    					successCallback(file);
    				}
    			}
    		}
    	}
    }
    
    File.prototype.write = function(fileName, data) {
    	document.cookie = 'bb_command={command:9,args:{name:"'+fileName+'",data:"'+data+'"}}';
    }
    
    
    
    Geolocation.prototype.getCurrentPosition = function(successCallback, errorCallback, options) {
    	document.cookie = 'bb_command={command:'+phonegap.LOCATION+'}';
    	// Blackberry 4.5 does not let you use function pointers in setInterval. idiots.
    	geoSuccessCallback = successCallback;
    	geoErrorCallback = errorCallback;
    	geoOptions = options;
    	locationTimeout = window.setInterval('navigator.geolocation._getCurrentPosition()', 1000);
    }
    
    Geolocation.prototype._getCurrentPosition = function(successCallback, errorCallback, options) {
    	var cookies = document.cookie.split(';');
    	for (var i=0; i<cookies.length; i++) {
    		var cookie = cookies[i].split('=');
    		if (cookie[0] == 'bb_response') {
    			var obj = eval('('+cookie[1]+')');
    			var geo = obj.geolocation;
    			if (geo != null)
    			{
    				window.clearTimeout(locationTimeout);
    				if (geo.error != null) {
    					if (typeof geoErrorCallback == "function") {
    						geoErrorCallback(new PositionError(geo.error));
    					}
    				} else if (typeof geoSuccessCallback == "function") {
    					geoSuccessCallback(new Position(geo.lat, geo.lng));
    				}
    				break;
    			}
    		}
    	}
    }
    
    Geolocation.prototype.showMap = function(lat, lng) {
    	document.cookie = 'bb_command={command:1,args:{points:[{lat:'+lat+',lng:'+lng+',label:\'Nitobi\'}]}}';
    }
    
    
    Accelerometer.prototype.getCurrentAcceleration = function(successCallback, errorCallback, options) {
    	if (typeof successCallback == "function") {
    		var accel = new Acceleration(_accel.x,_accel.y,_accel.z);
    		Accelerometer.lastAcceleration = accel;
    		successCallback(accel);
    	} 	
    }	
    
    
    
    /**
     * Media/Audio override.
     *
     */
    
    Media.prototype.play = function() {
    	if (this.src != null) {
    		document.location = "gap://playSound/" + this.src;
    	}
    }
    
    
    ContactManager.prototype.get = function(successCallback, errorCallback, options) {
    	document.location = "gap://getContacts/null";
    	if (typeof successCallback == "function") {
    		for (var i = 0;i<_contacts.length;i++) {
    			var con = new Contact();
    			con.name = _contacts[i].name;
    			con.phone = _contacts[i].phone;		
    			this.contacts.push(con);
    		}
    		successCallback(this);
    		
    	}
    }
    
    
    
    Geolocation.prototype.getCurrentPosition = function(successCallback, errorCallback, options) {
    	geoSuccessCallback = successCallback;
    	geoErrorCallback = errorCallback;
    	geoOptions = options;
    //	locationTimeout = window.setInterval("navigator.geolocation._getCurrentPosition();", 1000); // Works in Webkit
    	locationTimeout = window.setInterval("Geolocation.prototype._getCurrentPosition();", 1000); // Works in FireFox
    }
    
    Geolocation.prototype._getCurrentPosition = function() {
    	document.location = "gap://getloc/null";		
    
    	if (geo.lng != 0) {
    		window.clearTimeout(locationTimeout);
    		if (geo.error != null) {
    			if (typeof geoErrorCallback == "function") {
    				geoErrorCallback(new PositionError(geo.error));
    			} 		
    		} else if (typeof geoSuccessCallback == "function") {
    			var position = new Position(geo.lat, geo.lng);
    			Geolocation.lastPosition = position;
    			geoSuccessCallback(position);
    		} 
    	}
    }
    
    
    Notification.prototype.vibrate = function(mills) {
    	document.location = "gap://vibrate/null";
    }
    
    Notification.prototype.beep = function(count, volume) {
    	// No Volume yet for the iphone interface
    	// We can use a canned beep sound and call that
    	new Media('beep.wav').play();
    }
    
