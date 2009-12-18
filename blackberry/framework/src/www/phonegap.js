
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
    },
    _constructors: []
};

/**
 * Boolean flag indicating if the PhoneGap API is available and initialized.
 */
PhoneGap.available = DeviceInfo.uuid != undefined;

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
 
Accelerometer.prototype.getCurrentAcceleration = function(successCallback, errorCallback, options) {
	alert('Accelerometer not supported in PhoneGap BlackBerry - yet.');
};

/**
 * Asynchronously aquires the acceleration repeatedly at a given interval.
 * @param {Function} successCallback The function to call each time the acceleration
 * data is available
 * @param {Function} errorCallback The function to call when there is an error 
 * getting the acceleration data.
 * @param {AccelerationOptions} options The options for getting the accelerometer data
 * such as timeout.
 

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
 
Accelerometer.prototype.clearWatch = function(watchId) {
	clearInterval(watchId);
}
*/
if (typeof navigator.accelerometer == "undefined") navigator.accelerometer = new Accelerometer();
/**
 * This class provides access to the device camera.
 * @constructor
 */
function Camera() {
	this.onSuccess = null;
	this.onError = null;
}

/**
 * 
 * @param {Function} successCallback
 * @param {Function} errorCallback
 * @param {Object} options
 */
Camera.prototype.getPicture = function(successCallback, errorCallback, options) {
	if (device.hasCamera) {
		if (successCallback) this.onSuccess = successCallback;
		else this.onSuccess = null;
		if (errorCallback) this.onError = errorCallback;
		else this.onError = null;
		PhoneGap.exec("camera", ["picture"]);
	} else errorCallback("[PhoneGap] Camera not supported on this device.");
}

if (typeof navigator.camera == "undefined") navigator.camera = new Camera();
/**
 * This class provides access to the device contacts.
 * @constructor
 */

function Contact(jsonObject) {
    this.name = {
		formatted:''
	};
    this.phones = [];
    this.emails = [];
  	this.id = "";
}

Contact.prototype.displayName = function() {
	return this.name.formatted;
}

function Contacts() {
	// Dummy object to hold array of contacts
	this.contacts = [];
	this.timestamp = new Date().getTime();
}

if (typeof navigator.contacts == "undefined") navigator.contacts = new Contacts();

Contacts.prototype.formParams = function(options, startArray) {
	var params = [];
	if (startArray) params = startArray;
	if (options.limit && options.limit > 0) params.push("pageSize:" + options.limit);
	if (options.page) params.push("pageNumber:" + options.page);
	return params;	
};
Contacts.prototype.chooseContact = function(successCallback, options) {
	this.choose_onSuccess = successCallback;
	var params = ["choose"];
	params = this.formParams(options,params);
	PhoneGap.exec("contacts", params);
};
Contacts.prototype.find = function(filter, successCallback, errorCallback, options) {
	if (typeof(filter) != 'object') {
		alert('[PhoneGap Error] filter parameter passed into navigator.contacts.find must be of type object.');
		return;
	}
	if (filter.name && filter.name.length > 0) {
		var params = ["search"];
		params.push('nameFilter:' + filter.name);
		params = this.formParams(options,params);
		this.search_onSuccess = successCallback;
		this.search_onError = errorCallback;
		PhoneGap.exec("contacts", params);
	} else {
		this.getAllContacts(successCallback,errorCallback,options);
	}
};
Contacts.prototype.getAllContacts = function(successCallback, errorCallback, options) {
	this.global_onSuccess = successCallback;
	this.global_onError = errorCallback;
	var params = ["getall"];
	params = this.formParams(options,params);
	PhoneGap.exec("contacts", params);
};/**
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

navigator.device = window.device = new Device();

Device.prototype.poll = function(callback) {
    var result = document.cookie;
    eval(result + (callback ? ";callback();" : ""));
    clearTimeout(this.poller);
    this.poller = setTimeout('window.device.poll();',500);
}

Device.prototype.init = function() {
    this.isIPhone = false;
    this.isIPod = false;
    this.isBlackBerry = true;
	this.poller = false;
    try {
        PhoneGap.exec("initialize");
		this.poll(function() {
			PhoneGap.available = typeof DeviceInfo.name == "string";
			/* TODO: dispatch the event if at all possible on blackberry
			var event = document.createEvent("Events");
			event.initEvent('deviceReady', false, false);
			document.dispatchEvent(event);
			*/
		});
		this.poller = setTimeout('window.device.poll();',500);
    } catch(e) {
        alert("[PhoneGap Error] Error initializing.");
    }
};
window.device.init();/**
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

if (typeof navigator.file == "undefined") navigator.file = new File();

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
 * This class provides access to device GPS data.
 * @constructor
 */
function Geolocation() {
    /**
     * The last known GPS position.
     */
	this.started = false;
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
        referenceTime = this.lastPosition.timeout;
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
        if (dis.lastPosition != null && dis.lastPosition.timestamp > referenceTime) {
            successCallback(dis.lastPosition);
            clearInterval(timer);
        } else if (delay >= timeout) {
            errorCallback();
            clearInterval(timer);
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
}

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

Compass.prototype.start = function(args) {
    alert('Compass support not implemented - yet.');
};

Compass.prototype.stop = function() {
    alert('Compass support not implemented - yet.');
};
/**
 * This class provides access to the device media, interfaces to both sound and video
 * @constructor
 */
function Media(src, successCallback, errorCallback) {
	this.src = src;
	this.successCallback = successCallback;
	this.errorCallback = errorCallback;												
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
/**
 * This class contains information about any NetworkStatus.
 * @constructor
 */
function NetworkStatus() {
	this.code = null;
	this.message = "";
}

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
 * Called by the geolocation framework when the reachability status has changed.
 * @param {Reachibility} reachability The current reachability status.
 */
Network.prototype.updateReachability = function(reachability) {
    this.lastReachability = reachability;
};

if (typeof navigator.network == "undefined") navigator.network = new Network();

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
/**
 * This class provides access to notifications on the device.
 */
function Notification() {
	
}

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
 * Causes the device to blink a status LED.
 * @param {Integer} count The number of blinks.
 * @param {String} colour The colour of the light.
 */
Notification.prototype.blink = function(count, colour) {
	alert('Blink not implemented - yet.');
};

if (typeof navigator.notification == "undefined") navigator.notification = new Notification();

Notification.prototype.vibrate = function(mills) {
	PhoneGap.exec("notification/vibrate",[mills*1000]);
};
Notification.prototype.beep = function(count, volume) {
	PhoneGap.exec("notification/beep",[count]);
};
/**
 * This class provides access to the device orientation.
 * @constructor
 */
function Orientation() {
	/**
	 * The current orientation, or null if the orientation hasn't changed yet.
	 */
	this.currentOrientation = null;
}

/**
 * Set the current orientation of the phone.  This is called from the device automatically.
 * 
 * When the orientation is changed, the DOMEvent \c orientationChanged is dispatched against
 * the document element.  The event has the property \c orientation which can be used to retrieve
 * the device's current orientation, in addition to the \c Orientation.currentOrientation class property.
 *
 * @param {Number} orientation The orientation to be set
 
Orientation.prototype.setOrientation = function(orientation) {
	alert('Orientation not implemented - yet.');
	/*
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
 
Orientation.prototype.getCurrentOrientation = function(successCallback, errorCallback) {
	alert('Orientation not implemented - yet.');
	// If the position is available then call success
	// If the position is not available then call error
};

/**
 * Asynchronously aquires the orientation repeatedly at a given interval.
 * @param {Function} successCallback The function to call each time the orientation
 * data is available.
 * @param {Function} errorCallback The function to call when there is an error 
 * getting the orientation data.
 
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
 
Orientation.prototype.clearWatch = function(watchId) {
	clearInterval(watchId);
};
*/
if (typeof navigator.orientation == "undefined") navigator.orientation = new Orientation();

function Position(coords) {
	this.coords = coords;
    this.timestamp = new Date().getTime();
}

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
	this.success = null;
	this.error = null;
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
	var params = [number];
	params.push(message);
	this.success = successCallback;
	this.error = errorCallback;
	PhoneGap.exec("send", params);
};

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
Telephony.prototype.send = function(number) {
	this.number = number;
	PhoneGap.exec("send", [this.number]);
}

if (typeof navigator.telephony == "undefined") navigator.telephony = new Telephony();
function Utility() {
	
};

/**
 * Closes the application.
 */
Utility.prototype.exit = function() {
	var params = [];
	PhoneGap.exec("exit", params);
}

if (typeof navigator.utility == "undefined") navigator.utility = new Utility();
