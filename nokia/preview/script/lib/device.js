/**
 * device.js
 * 
 * Nokia Web Runtime Service API emulation 
 * WRT v1.1
 * 
 * Copyright 2009 Nokia Corporation. All rights reserved.
*/


/**
 * device object. entry point to device service API (SAPI)
 */
var device = {
	/**
	 * device API public method
	 * 
	 * @method
	 * @param {string} provider Name of service provider, eg, "Service.Calendar"
	 * @param {string} Interface Name of interface, eg, "IDataSource"
	 * @return {Object} service object  
	 */
	getServiceObject: function(provider, Interface){

		if (!device.implementation.context)
			throw 'device implementation object not instantiated!'

		if (device.implementation.options.enabled) 
			return device.implementation.getInterface(provider, Interface);
		else {
			device.implementation.context.notify('device SAPI is disabled.');
			throw 'device not defined!';
		}
	}
};



/**
 * implementation of device emulation mode
 * 
 * @param {String} 		version - version number (default: current version)
 * @return {Object} 	returns new implementation context object 
 * @constructor 		
 */
device.implementation = function(version){

	this.version = version || '';
	
	// set context to current object
	device.implementation.context = this;	

	var libpath = 'preview/script/lib/',
		datapath = 'preview/data/';
	
	// load implementation files
	// this is done async by the browser engine, so be aware of sync conditions!!
	if (version == '1')
		loadSAPI(libpath + 'sapi1/');
	else if (!version)
		loadSAPI();
	else
		throw 'unsuppported SAPI version!';
	
	function loadSAPI(path){
		var path = path || (libpath + "sapi/");
		
		// load API
		loadScript(path + "AppManager.js");
		loadScript(path + "Calendar.js");
		loadScript(path + "Contact.js");
		loadScript(path + "Landmarks.js");
		loadScript(path + "Location.js");
		loadScript(path + "Logging.js");
		loadScript(path + "MediaManagement.js");
		loadScript(path + "Messaging.js");
		loadScript(path + "Sensor.js");
		loadScript(path + "SysInfo.js");
		
		// load sample data
		loadScript(datapath + "appManager_data.js");
		loadScript(datapath + "calendar_data.js");
		loadScript(datapath + "contact_data.js");
		loadScript(datapath + "landmarks_data.js");
		loadScript(datapath + "location_data.js");
		loadScript(datapath + "logging_data.js");
		loadScript(datapath + "mediaManagement_data.js");
		loadScript(datapath + "messaging_data.js");
		loadScript(datapath + "sensor_data.js");
		loadScript(datapath + "sysInfo_data.js");
	}
	
	function loadScript(src){
		var head = document.getElementsByTagName("head")[0] || document.documentElement, 
			script = document.createElement("script");
		
		script.type = "text/javascript";
		script.src = src;
		head.appendChild(script);
	}
};

(function(){
device.implementation.prototype = {
	
	/**
	 * Result object
	 * 
	 * object returned by API calls
	 * 
	 * @param {Object} value
	 * @param {Integer} code
	 * @param {String} msg
	 */
	Result : function(value, code, msg){
		return {
			ReturnValue	: value,
			ErrorCode	: code || 0,
			ErrorMessage: msg || undefined
		};
	},
	
	/**
	 * AsyncResult object
	 * 
	 * object returned by API calls with callbacks
	 * 
	 * @param {Integer} transaction id
	 * @param {Integer} code
	 * @param {String} msg
	 */
	AsyncResult : function(id, code, msg){
		return {
			TransactionID	: id,
			ErrorCode		: code || 0,
			ErrorMessage	: msg || undefined
		};
	},
	/**
	 * ErrorResult object
	 * 
	 * object returned by API calls when error
	 * 
	 * @param {Integer} code
	 * @param {String} msg
	 */
	ErrorResult : function(code, msg){
		device.implementation.context.debug(code, msg);		
		return {
			ErrorCode	: code || 0,
			ErrorMessage: msg || undefined
		};
	},
	
	/**
	 * Iterator object
	 * 
	 * object returned as ReturnValue by some API
	 * 
	 * @param {Array} data
	 */
	Iterator : function(data){
		var index = 0,
			data = data || [];
		return {
			/**
			 * reset
			 */
			reset : function(){
				index = 0;
			},
			
			/**
	 		* getNext
	 		*/
			getNext : function(){
				return index < data.length ? data[index++] : undefined;
			}
		}
	},
	
	
	/**
	 * internal __methods__
	 */
	
	$break: 	{}, // 'not implemented',
	
	debug: function() {
		if (device.implementation.options.debug && window.console && console.log) 
			console.log(arguments);
	},
	
	// notify developer of api action
	notify: function(msg){
		if (window.console && console.warn)
			console.warn('API Notice -- ' + msg);
	},
	
	getData : function(provider){
		if (!device.implementation.data[provider])
			throw "no data defined for provider '"+provider+"'";
		
		if (device.implementation.data[provider]['default'])
			return device.implementation.data[provider]['default'];
		else 
			return device.implementation.data[provider]; 
	},	
	
	getUniqueID : function(){
		return Number(''+Number(new Date())+ Math.floor(1000*Math.random()));
	},
	
	callAsync : function(object, method, criteria, callback, flag){
		flag = flag || false;
		var tid = setTimeout(function(){
			var result,
				eventCode = {completed:2, error:4, progress:9},
				code = eventCode.completed;
			try{
				// call method in object's context
				// flag is passed to trigger the method in case of mandatory callback arg
				if (flag)
					result = method.call(object, criteria, null, flag);
				else
					result = method.call(object, criteria);
			} 
			catch(e){
				code = eventCode.error;
			}
			callback(tid, code, result);
			
		}, device.implementation.options.callbackDelay);
		
		return this.AsyncResult(tid);
	},
		
	addListener : function(provider, eventType, criteria, callback, handler){
		if (!device.implementation.listeners[provider])
			device.implementation.listeners[provider] = {};
			
		var tid = this.getUniqueID();
		device.implementation.listeners[provider][eventType] = {
			'criteria': criteria,
			'callback': callback,
			'handler': handler,
			'transactionID' : tid
		};
		return this.AsyncResult(tid);
	},

	/*
	 * specify either eventType or transactionID
	 * return true if found and removed
	 */
	removeListener: function(provider, eventType, transactionID){
		transactionID = transactionID || null;
		if (transactionID) {
			var allEvents = device.implementation.listeners[provider];
			for (var i in allEvents) {
				var event = allEvents[i];
				if (event.transactionID == transactionID) {
					device.implementation.listeners[provider][i] = null;
					delete device.implementation.listeners[provider][i];
					return true;
				}
			}
		}
		else 
			if (eventType &&
			this.hasListener(provider, eventType)) {
				device.implementation.listeners[provider][eventType] = null;
				delete device.implementation.listeners[provider][eventType];
				return true;
			}
		return false;
	},

	hasListener: function(provider, eventType) {	
		if (!device.implementation.listeners[provider]
			|| !device.implementation.listeners[provider][eventType])
			return false;
				
		return true;
	},

	// pluck object properties as array	
	keys: function(obj) {
		var keys = [];
		for (var p in obj)
			keys.push(p);
		return keys;
	},
	
	// extend object properties 
	extend: function(root, ext) {
		for (var p in ext)
			root[p] = ext[p];
		return root;
	},
	
	// extended text string functionality 
	_t: function(str){
		
		str = typeof str != 'undefined' ? String(str) : '';
		return new StringEx(str);
	}		
};

	/**
	 * extended String object (available only within device.implementation.context through _t() method)
	 */ 
	var StringEx = function(str){
		// define base String non-transferrable methods!
		this.toString = function(){return str;};
		this.valueOf = function(){return str.valueOf();};
	};
	StringEx.prototype = new String();

	
	/**
	 * simple sprintf-type functionality
	 * 
	 * "string {title} %s and %s and {here} ".arg({title:'T', here:'H'}, 1, 'there')"
	 * ==> string T 1 and there and H
	 * hash (if present) must be first argument
	 *
	 * @param {Object} [hash] optional hash to replace {tags}
	 * @param {String,Number} data for %s tags
	 * @return {String} original string with tags replaced   
	 */
	StringEx.prototype.arg = function(){
	    var pattern = /\%s|\{\w+\}/g;
	    var args = arguments, 
			len = arguments.length, 
			hash = arguments[0],
			i = typeof hash == 'object' && !(hash instanceof String) ? 1 : 0;
			
	    return this.replace(pattern, function(capture){
			var key = capture != '%s' && capture.match(/\w+/);
			if (key)
				return hash && hash[key] ? hash[key] : capture;
			else		
				return i < len ? args[i++] : capture;
		});
	}
	
	/**
	 * trim whitespace from beginning and end of string
	 * @return {String} trimmed string
	 */
	StringEx.prototype.trim = function(){
		return this.replace(/^\s+/, '').replace(/\s+$/, '');
	}
	
	/**
	 * capitalize string
	 * @return {String} capitalized string
	 */
	StringEx.prototype.capitalize = function(){
    	return this.charAt(0).toUpperCase() + this.substring(1).toLowerCase();
	}
	
})();


/*
 * device.implementation static (class) properties
 */


/**
 * pointer to current instantiated device.implementation object.
 * use to access device.implemenation namespace.
 * 
 * @see device.implementation 
 */
device.implementation.context = null;	


/**
 * emulation settings options
 */
device.implementation.options = {
	
	/**
	 * callback delay (msec)
	 * @property {Number} 
	 */
	callbackDelay	: 1200,
	
	/**
	 * debug flag
	 * @property {Boolean} 
	 */
	debug			: false,
	
	/**
	 * enabled flag
	 * @property {Boolean} 
	 */
	enabled			: true
};


/**
 * store of interfaces (objects) in the current device implementation.
 * format: [provider][interface]
 * 
 * @property {Object} 
 */
device.implementation.interfaces = {};


/**
 * store of data objects defined for current implementation.
 * data is added useing the loadData method. 
 * 
 * @property {Object} format depends on data
 */
device.implementation.data = {};


/**
 * store of event listeners
 * format: [provider][eventType]
 */
device.implementation.listeners = {}; 


/*
 * device.implementation static (class) methods
 */


/**
 * Add a service provider to device implementation
 * 
 * @param {string} provider Name of service provider, eg, "Service.Calendar"
 * @param {string} Interface Name of interface, eg, "IDataService"
 * @param {Object} serviceProvider Service object
 * @return  none
 */
device.implementation.extend = function(provider, Interface, serviceProvider){

	if (!device.implementation.interfaces[provider])
		device.implementation.interfaces[provider] = {}; 
	
	device.implementation.interfaces[provider][Interface] = serviceProvider;
};


/**
 * Internal implementation to return a service provider interface object
 * 
 * @param {String} provider  Service provider name 
 * @param {String} Interface	Provider interface name
 * @exception {String} exception thrown if provider or interface is not implemented 
 * @return {Object} the service provider interface object or 'undefined'
 */	
device.implementation.getInterface = function(provider, Interface){
		
	if (device.implementation.interfaces[provider] 
		&& typeof device.implementation.interfaces[provider][Interface] == 'object') 
	{
		var service = new Object();
		service[Interface] = device.implementation.interfaces[provider][Interface];
		return service;
	}
	else
		throw 'Error: unknown error'; 
};


/**
 * Loads data to the data store
 * 
 * @param {String} provider  Service provider name 
 * @param {String} type Data name/label
 * @param {Function,Object,Array} dataFactory Function to generate the data object, or array/object
 * @return none
 */
device.implementation.loadData = function(provider, type, dataFactory){

	type = type || 'default';
	if (!device.implementation.data[provider]) 
		device.implementation.data[provider] = {};
		
	device.implementation.data[provider][type] = 
		typeof dataFactory == 'function' 
			? dataFactory()
			: dataFactory;
};


/**
 * trigger an event listener
 * 
 * @param {String} provider Service provider name
 * @param {String} eventType event type 
 * @param {Variant} data ReturnValue for callback function 
 */
device.implementation.triggerListener = function(provider, eventType, data){

	if (!device.implementation.context.hasListener(provider, eventType)) {
		device.implementation.context.notify('no listener defined for provider=' + provider + ', eventType=' + eventType);
		return;
	}
	var listener = device.implementation.listeners[provider][eventType];

	// call the provider's handler
	listener.handler(listener.transactionID, listener.criteria, listener.callback, data);
}



/*
 * ERROR CODES
 */
device.implementation.ERR_SUCCESS			 		= 0;
device.implementation.ERR_INVALID_SERVICE_ARGUMENT	= 1000;
device.implementation.ERR_UNKNOWN_ARGUMENT_NAME		= 1001;
device.implementation.ERR_BAD_ARGUMENT_TYPE			= 1002;
device.implementation.ERR_MISSING_ARGUMENT 			= 1003;
device.implementation.ERR_SERVICE_NOT_SUPPORTED		= 1004;
device.implementation.ERR_SERVICE_IN_USE 			= 1005;
device.implementation.ERR_SERVICE_NOT_READY 		= 1006;
device.implementation.ERR_NO_MEMORY		 			= 1007;
device.implementation.ERR_HARDWARE_NOT_AVAILABLE	= 1008;
device.implementation.ERR_SEVER_BUSY				= 1009;
device.implementation.ERR_ENTRY_EXISTS				= 1010;
device.implementation.ERR_ACCESS_DENIED				= 1011;
device.implementation.ERR_NOT_FOUND					= 1012;
device.implementation.ERR_UNKNOWN_FORMAT			= 1013;
device.implementation.ERR_GENERAL_ERROR				= 1014;
device.implementation.ERR_CANCEL_SUCCESS			= 1015;
device.implementation.ERR_SERVICE_TIMEDOUT			= 1016;
device.implementation.ERR_PATH_NOT_FOUND			= 1017;



// instantiate device imlementation
new device.implementation();

