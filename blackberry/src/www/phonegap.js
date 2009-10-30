if (typeof(DeviceInfo) != 'object')
    DeviceInfo = {};

/**
 * This represents the PhoneGap API itself, and provides a global namespace for accessing
 * information about the state of PhoneGap.
 * @class
 */
PhoneGap = {
    queue: {
        ready: true,
        commands: [],
        timer: null
    }
};

/**
 * Boolean flag indicating if the PhoneGap API is available and initialized.
 */
PhoneGap.available = Device.uuid != undefined;

/**
 * Execute a PhoneGap command in a queued fashion, to ensure commands do not
 * execute with any race conditions, and only run when PhoneGap is ready to
 * recieve them.
 * @param {String} command Command to be run in PhoneGap, e.g. "ClassName.method"
 * @param {String[]} [args] Zero or more arguments to pass to the method
 */
PhoneGap.exec = function() {
	var args = '';
	if (arguments.length == 1) {
		args = arguments[0];
	} else {
		for (var i = 0; i < arguments.length; i++) {
			if (typeof(arguments[i]) == "string") {
				args += arguments[i] + '/';
			} else {
				if (typeof(arguments[i])=="object" && arguments[i].length > 1) {
					args += arguments[i].join('/') + '/';
				} else {
					args += arguments[i] + '/';
				}
			}
		}
		args = args.substr(0,args.length-1);
	}
	var command = "PhoneGap=" + args;
	//alert(command);
	document.cookie = command;
};
/**
 * Internal function used to dispatch the request to PhoneGap.  This needs to be implemented per-platform to
 * ensure that methods are called on the phone in a way appropriate for that device.
 * @private
 */
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
};

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
};
/**
 * This class provides access to device accelerometer data.
 * @constructor
 */
function Accelerometer() {
	/**
	 * The last known acceleration.
	 */
	this.lastAcceleration = null;
};

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
};

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
};

/**
 * Clears the specified accelerometer watch.
 * @param {String} watchId The ID of the watch returned from #watchAcceleration.
 */
Accelerometer.prototype.clearWatch = function(watchId) {
	clearInterval(watchId);
};

if (typeof navigator.accelerometer == "undefined") navigator.accelerometer = new Accelerometer();
/**
 * This class provides access to the device camera.
 * @constructor
 */
function Camera() {
	
};

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

function Contact(jsonObject) {
	this.firstName = "";
	this.lastName = "";
    this.name = "";
    this.phones = {};
    this.emails = {};
	this.address = "";
};

Contact.prototype.displayName = function()
{
    // TODO: can be tuned according to prefs
	return this.name;
};

function ContactManager() {
	// Dummy object to hold array of contacts
	this.contacts = [];
	this.timestamp = new Date().getTime();
};

ContactManager.prototype.getAllContacts = function(successCallback, errorCallback, options) {
	// Interface
};

if (typeof navigator.ContactManager == "undefined") navigator.ContactManager = new ContactManager();
/**
 * This class provides access to the debugging console.
 * @constructor
 */
function DebugConsole() {
};

/**
 * Utility function for rendering and indenting strings, or serializing
 * objects to a string capable of being printed to the console.
 * @param {Object|String} message The string or object to convert to an indented string
 * @private
 */
DebugConsole.prototype.processMessage = function(message) {
    if (typeof(message) != 'object') {
        return message;
    } else {
        /**
         * @function
         * @ignore
         */
        function indent(str) {
            return str.replace(/^/mg, "    ");
        }
        /**
         * @function
         * @ignore
         */
        function makeStructured(obj) {
            var str = "";
            for (var i in obj) {
                try {
                    if (typeof(obj[i]) == 'object') {
                        str += i + ":\n" + indent(makeStructured(obj[i])) + "\n";
                    } else {
                        str += i + " = " + indent(String(obj[i])).replace(/^    /, "") + "\n";
                    }
                } catch(e) {
                    str += i + " = EXCEPTION: " + e.message + "\n";
                }
            }
            return str;
        }
        return "Object:\n" + makeStructured(message);
    }
};

/**
 * Print a normal log message to the console
 * @param {Object|String} message Message or object to print to the console
 */
DebugConsole.prototype.log = function(message) {
};

/**
 * Print a warning message to the console
 * @param {Object|String} message Message or object to print to the console
 */
DebugConsole.prototype.warn = function(message) {
};

/**
 * Print an error message to the console
 * @param {Object|String} message Message or object to print to the console
 */
DebugConsole.prototype.error = function(message) {
};
window.debug = new DebugConsole();
/**
 * this represents the mobile device, and provides properties for inspecting the model, version, UUID of the
 * phone, etc.
 * @constructor
 */
function Device() {
    this.available = PhoneGap.available;
    this.platform = null;
    this.version  = null;
    this.name     = null;
    this.gap      = null;
    this.uuid     = null;
    try {
        if (window.DroidGap) {
            this.available = true;
            this.uuid = window.DroidGap.getUuid();
            this.version = window.DroidGap.getOSVersion();
            this.gapVersion = window.DroidGap.getVersion();
            this.platform = window.DroidGap.getPlatform();
            this.name = window.DroidGap.getProductName();  
        } else {          
            this.platform = DeviceInfo.platform;
            this.version  = DeviceInfo.version;
            this.name     = DeviceInfo.name;
            this.gap      = DeviceInfo.gap;
            this.uuid     = DeviceInfo.uuid;
        }
    } catch(e) {
        this.available = false;
    }
}
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
};

/**
 * Reads a file from the mobile device. This function is asyncronous.
 * @param {String} fileName The name (including the path) to the file on the mobile device. 
 * The file name will likely be device dependent.
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
        if (dis.lastPosition && typeof(dis.lastPosition) == 'object' && dis.lastPosition.timestamp > referenceTime) {
            successCallback(dis.lastPosition);
            clearInterval(timer);
        } else if (delay >= timeout) {
            errorCallback();
            clearInterval(timer);
        } else {
        	PhoneGap.exec("location",["check"]);
        }
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

/**
 * Called by the geolocation framework when an error occurs while looking up the current position.
 * @param {String} message The text of the error message.
 */
Geolocation.prototype.setError = function(message) {
    this.lastError = message;
    for (var i = 0; i < this.callbacks.onError.length; i++) {
        var f = this.callbacks.onError.shift();
        f(message);
    }
};

if (typeof navigator.geolocation == "undefined") navigator.geolocation = new Geolocation();
/**
 * This class provides access to device Compass data.
 * @constructor
 */
function Compass() {
    /**
     * The last known Compass position.
     */
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
		this.start(options);
	}
	else 
	if (typeof successCallback == "function") {
		successCallback(this.lastHeading);
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
Compass.prototype.watchHeading= function(successCallback, errorCallback, options) {
	// Invoke the appropriate callback with a new Position object every time the implementation 
	// determines that the position of the hosting device has changed. 
	
	this.getCurrentHeading(successCallback, errorCallback, options);
	var frequency = 100;
    if (typeof(options) == 'object' && options.frequency)
        frequency = options.frequency;

	var self = this;
	return setInterval(function() {
		self.getCurrentHeading(successCallback, errorCallback, options);
	}, frequency);
};


/**
 * Clears the specified heading watch.
 * @param {String} watchId The ID of the watch returned from #watchHeading.
 */
Compass.prototype.clearWatch = function(watchId) {
	clearInterval(watchId);
};


/**
 * Called by the geolocation framework when the current heading is found.
 * @param {HeadingOptions} position The current heading.
 */
Compass.prototype.setHeading = function(heading) {
    this.lastHeading = heading;
    for (var i = 0; i < this.callbacks.onHeadingChanged.length; i++) {
        var f = this.callbacks.onHeadingChanged.shift();
        f(heading);
    }
};

/**
 * Called by the geolocation framework when an error occurs while looking up the current position.
 * @param {String} message The text of the error message.
 */
Compass.prototype.setError = function(message) {
    this.lastError = message;
    for (var i = 0; i < this.callbacks.onError.length; i++) {
        var f = this.callbacks.onError.shift();
        f(message);
    }
};

if (typeof navigator.compass == "undefined") navigator.compass = new Compass();
/**
 * This class provides access to native mapping applications on the device.
 */
function Map() {
	
};

/**
 * Shows a native map on the device with pins at the given positions.
 * @param {Array} positions
 */
Map.prototype.show = function(positions) {
	
}

if (typeof navigator.map == "undefined") navigator.map = new Map();

/**
 * This class provides access to the device media, interfaces to both sound and video
 * @constructor
 */
function Media(src, successCallback, errorCallback) {
	this.src = src;
	this.successCallback = successCallback;
	this.errorCallback = errorCallback;												
};

Media.prototype.record = function() {
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
/**
 * This class contains information about any NetworkStatus.
 * @constructor
 */
function NetworkStatus() {
	this.code = null;
	this.message = "";
};

NetworkStatus.NOT_REACHABLE = 0;
NetworkStatus.REACHABLE_VIA_CARRIER_DATA_NETWORK = 1;
NetworkStatus.REACHABLE_VIA_WIFI_NETWORK = 2;

/**
 * This class provides access to device Network data (reachability).
 * @constructor
 */
function Network() {
    /**
     * The last known Network status.
	 * { hostName: string, ipAddress: string, 
		remoteHostStatus: int(0/1/2), internetConnectionStatus: int(0/1/2), localWiFiConnectionStatus: int (0/2) }
     */
	this.lastReachability = null;
};

/**
 * 
 * @param {Function} successCallback
 * @param {Function} errorCallback
 * @param {Object} options  (isIpAddress:boolean)
 */
Network.prototype.isReachable = function(hostName, successCallback, options) {
}

/**
 * Called by the geolocation framework when the reachability status has changed.
 * @param {Reachibility} reachability The current reachability status.
 */
Network.prototype.updateReachability = function(reachability) {
    this.lastReachability = reachability;
};

if (typeof navigator.network == "undefined") navigator.network = new Network();
/**
 * This class provides access to notifications on the device.
 */
function Notification() {
	
};

/**
 * Open a native alert dialog, with a customizable title and button text.
 * @param {String} message Message to print in the body of the alert
 * @param {String} [title="Alert"] Title of the alert dialog (default: Alert)
 * @param {String} [buttonLabel="OK"] Label of the close button (default: OK)
 */
Notification.prototype.alert = function(message, title, buttonLabel) {
    // Default is to use a browser alert; this will use "index.html" as the title though
    alert(message);
};

/**
 * Start spinning the activity indicator on the statusbar
 */
Notification.prototype.activityStart = function() {
};

/**
 * Stop spinning the activity indicator on the statusbar, if it's currently spinning
 */
Notification.prototype.activityStop = function() {
};

/**
 * Causes the device to blink a status LED.
 * @param {Integer} count The number of blinks.
 * @param {String} colour The colour of the light.
 */
Notification.prototype.blink = function(count, colour) {
	
};

/**
 * Causes the device to vibrate.
 * @param {Integer} mills The number of milliseconds to vibrate for.
 */
Notification.prototype.vibrate = function(mills) {
	
};

/**
 * Causes the device to beep.
 * @param {Integer} count The number of beeps.
 * @param {Integer} volume The volume of the beep.
 */
Notification.prototype.beep = function(count, volume) {
	
};

if (typeof navigator.notification == "undefined") navigator.notification = new Notification();
/**
 * This class provides access to the device orientation.
 * @constructor
 */
function Orientation() {
	/**
	 * The current orientation, or null if the orientation hasn't changed yet.
	 */
	this.currentOrientation = null;
};

/**
 * Set the current orientation of the phone.  This is called from the device automatically.
 * 
 * When the orientation is changed, the DOMEvent \c orientationChanged is dispatched against
 * the document element.  The event has the property \c orientation which can be used to retrieve
 * the device's current orientation, in addition to the \c Orientation.currentOrientation class property.
 *
 * @param {Number} orientation The orientation to be set
 */
Orientation.prototype.setOrientation = function(orientation) {
    Orientation.currentOrientation = orientation;
    var e = document.createEvent('Events');
    e.initEvent('orientationChanged', 'false', 'false');
    e.orientation = orientation;
    document.dispatchEvent(e);
};

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
};

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
};

/**
 * Clears the specified orientation watch.
 * @param {String} watchId The ID of the watch returned from #watchOrientation.
 */
Orientation.prototype.clearWatch = function(watchId) {
	clearInterval(watchId);
};

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
function Position(coords, timestamp) {
	this.coords = coords;
    this.timestamp = new Date().getTime();
};

function Coordinates(lat, lng, alt, acc, head, vel) {
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
	 * The direction the device is moving at the position.
	 */
	this.heading = head;
	/**
	 * The velocity with which the device is moving at the position.
	 */
	this.speed = vel;
};

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
};

/**
 * This class contains information about any GSP errors.
 * @constructor
 */
function PositionError() {
	this.code = null;
	this.message = "";
};

PositionError.UNKNOWN_ERROR = 0;
PositionError.PERMISSION_DENIED = 1;
PositionError.POSITION_UNAVAILABLE = 2;
PositionError.TIMEOUT = 3;
/**
 * This class provides access to the device SMS functionality.
 * @constructor
 */
function Sms() {

};

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
	
};

/**
 * Calls the specifed number.
 * @param {Integer} number The number to be called.
 */
Telephony.prototype.call = function(number) {
	
}

if (typeof navigator.telephony == "undefined") navigator.telephony = new Telephony();

ContactManager.prototype.formParams = function(options, startArray) {
	var params = [];
	if (startArray) params = startArray;
	if (options.pageSize && options.pageSize > 0) params.push("pageSize:" + options.pageSize);
	if (options.pageNumber) params.push("pageNumber:" + options.pageNumber);
	if (options.nameFilter) params.push("nameFilter:" + options.nameFilter);
	if (options.contactID) params.push("contactID:" + options.contactID);
	return params;	
};
ContactManager.prototype.chooseContact = function(successCallback, options) {
	this.choose_onSuccess = successCallback;
	var params = ["choose"];
	params = this.formParams(options,params);
	PhoneGap.exec("contacts", params);
};
ContactManager.prototype.displayContact = function(successCallback, errorCallback, options) {
	if (options.nameFilter && options.nameFilter.length > 0) {
		var params = ["search"];
		params = this.formParams(options,params);
		this.search_onSuccess = successCallback;
		this.search_onError = errorCallback;
		PhoneGap.exec("contacts", params);
	} else {
		ContactManager.getAllContacts(successCallback,errorCallback,options);
		return;
	}
};
ContactManager.prototype.getAllContacts = function(successCallback, errorCallback, options) {
	this.global_onSuccess = successCallback;
	this.global_onError = errorCallback;
	var params = ["getall"];
	params = this.formParams(options,params);
	PhoneGap.exec("contacts", params);
};

ContactManager.prototype.newContact = function(contact, successCallback, errorCallback, options) {
	if (!contact) {
		alert("[PhoneGap Error] newContact function not provided with a contact parameter.");
		return;
	} else {
		if (!contact.firstName || !contact.lastName || !contact.phoneNumber || !contact.address || !contact.email) {
			alert("[PhoneGap Error] newContact function parameter 'contact' does not have proper contact members (firstName, lastName, phoneNumber, address and email).");
			return;
		}
		options.push("firstName:" + contact.firstName);
		options.push("lastName:" + contact.lastName);
		options.push("address:" + contact.address);
		// Create a phone number parameter that we can parse on the BlackBerry end.
		var phones = '';
		for (var i = 0; i < contact.phoneNumber.length; i++) {
			phones += contact.phoneNumber[i].label + '=';
			phones += contact.phoneNumber[i].value + '|';
		}
		options.push("phoneNumber:" + phones.substr(0,phones.length-1));
		var emails = '';
		for (var j = 0; j < contact.email.length; j++) {
			emails += contact.email[j].label + '=';
			emails += contact.email[j].value + '|';
		}
		options.push("email:" + emails.substr(0,emails.length-1));
		this.new_onSuccess = successCallback;
		this.new_onError = errorCallback;
		var params = ["new"];
		params = this.formParams(options,params);
		PhoneGap.exec("contacts", params);
	}
};

Device.prototype.poll = function(callback) {
    var result = document.cookie;
    eval(result + (callback ? ";callback();" : ""));
    clearTimeout(this.poller);
    this.poller = setTimeout('Device.poll();',500);
};

Device.prototype.init = function() {
    this.isIPhone = false;
    this.isIPod = false;
    this.isBlackBerry = true;
	this.poller = false;
    try {
        PhoneGap.exec("initialize");
		this.poll(function() {
			var done = typeof(Device.name) == "string";
			PhoneGap.available = done;
		});
    } catch(e) {
        alert("[PhoneGap Error] Error initializing, " + e.message);
    }
};

window.Device = new Device();
window.Device.init();

File.prototype.read = function(fileName, successCallback, errorCallback) {
	alert('File I/O not implemented in PhoneGap BlackBerry - yet.');
	/*document.cookie = 'bb_command={command:8,args:{name:"'+fileName+'"}}';
	navigator.file.successCallback = successCallback;
	navigator.file.errorCallback = errorCallback;
	navigator.file.readTimeout = window.setInterval('navigator.file._readReady()', 1000);*/
};

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
};

File.prototype.write = function(fileName, data) {
	alert('File I/O not implemented in PhoneGap BlackBerry - yet.');
//	document.cookie = 'bb_command={command:9,args:{name:"'+fileName+'",data:"'+data+'"}}';
};
/**
 * Starts the GPS of the device
 */
Geolocation.prototype.start = function() {
	if (this.started) {
		return;
	} else {
		PhoneGap.exec("location", ["start"]);
	}
};

/**
 * Stops the GPS of the device
 */
Geolocation.prototype.stop = function() {
	if (!this.started) {
		return;
	} else {
		PhoneGap.exec("location", ["stop"]);
	}
};

/**
 * Maps current location
 */
Geolocation.prototype.map = function() {
	if (this.lastPosition == null) {
		alert("[PhoneGap] No position to map yet.");
		return;
	} else {
		PhoneGap.exec("location", ["map"]);
	}
};
Compass.prototype.start = function(args) {
    alert('Compass support not implemented - yet.');
};

Compass.prototype.stop = function() {
    alert('Compass support not implemented - yet.');
};
Media.prototype.record = function() {
	alert('Media recording not implemented - yet.');
};

Media.prototype.play = function() {
	PhoneGap.exec("media",[this.src]);
};

Media.prototype.pause = function() {
	alert('Media pausing not implemented - yet.');
};

Media.prototype.stop = function() {
	alert('Media stopping not implemented - yet.');
};
Network.prototype.isReachable = function(hostName, successCallback, options) {
	this.isReachable_success = successCallback;
	PhoneGap.exec("network",["reach"]);
};
// Temporary implementation of XHR. Soon-to-be modeled as the w3c implementation.
Network.prototype.XHR = function(URL, POSTdata, successCallback) {
	var req = URL;
	if (POSTdata != null) {
		req += "|" + POSTdata;
	}
	this.XHR_success = successCallback;
	PhoneGap.exec("network",["xhr",req]);
};
Notification.prototype.vibrate = function(mills) {
	PhoneGap.exec("notification/vibrate",[mills*1000]);
};
Notification.prototype.beep = function(count, volume) {
	PhoneGap.exec("notification/beep",[count]);
};// TODO: Have to implement SMS!
Telephony.prototype.call = function(number) {
	this.number = number;
	PhoneGap.exec("call", [this.number]);
};