/**
 * SysInfo.js
 * 
 * Nokia Web Runtime Service API emulation 
 * WRT v1.1
 * 
 * Copyright 2009 Nokia Corporation. All rights reserved.
*/

 
(function(){
	
	var provider = 'Service.SysInfo' ,
		Interface = 'ISysInfo';

	var supportedEntitiesAndKeys = {
		"battery":{
			"batterystrength":{"GetInfo":true,"SetInfo":false,"GetNotification":true,"GetInfoModeSync":false},
			"chargingstatus":{"GetInfo":true,"SetInfo":false,"GetNotification":true,"GetInfoModeSync":true}
		},
		"connectivity":{
			"bluetooth":{"GetInfo":true,"SetInfo":false,"GetNotification":true,"GetInfoModeSync":true},
			"infrared":{"GetInfo":true,"SetInfo":false,"GetNotification":true,"GetInfoModeSync":true},
			"activeconnections":{"GetInfo":true,"SetInfo":false,"GetNotification":false,"GetInfoModeSync":false},
			"connectionstatus":{"GetInfo":false,"SetInfo":false,"GetNotification":true,"GetInfoModeSync":false},
			"wlanmacaddress":{"GetInfo":true,"SetInfo":false,"GetNotification":false,"GetInfoModeSync":true}
		},
      	"device":{
			"firmwareversion":{"GetInfo":true,"SetInfo":false,"GetNotification":false,"GetInfoModeSync":true},
			"platformversion":{"GetInfo":true,"SetInfo":false,"GetNotification":false,"GetInfoModeSync":true},
			"producttype":{"GetInfo":true,"SetInfo":false,"GetNotification":false,"GetInfoModeSync":true},
			"manufacturer":{"GetInfo":true,"SetInfo":false,"GetNotification":false,"GetInfoModeSync":true},
			"machineid":{"GetInfo":true,"SetInfo":false,"GetNotification":false,"GetInfoModeSync":true},
			"phonemodel":{"GetInfo":true,"SetInfo":false,"GetNotification":false,"GetInfoModeSync":true},
			"imei":{"GetInfo":true,"SetInfo":false,"GetNotification":false,"GetInfoModeSync":true}
		},
      	"display":{
			"brightness":{"GetInfo":true,"SetInfo":false,"GetNotification":false,"GetInfoModeSync":true},
			"screensavertimeout":{"GetInfo":true,"SetInfo":false,"GetNotification":false,"GetInfoModeSync":true},
			"userinactivity":{"GetInfo":false,"SetInfo":false,"GetNotification":true,"GetInfoModeSync":false},
			"keyguardtime":{"GetInfo":true,"SetInfo":false,"GetNotification":false,"GetInfoModeSync":true},
			"autolocktime":{"GetInfo":true,"SetInfo":false,"GetNotification":false,"GetInfoModeSync":true},
			"autolockstatus":{"GetInfo":true,"SetInfo":false,"GetNotification":true,"GetInfoModeSync":true},
			"wallpaper":{"GetInfo":false,"SetInfo":true,"GetNotification":false,"GetInfoModeSync":false,"InputDataType":"string"},
			"lighttimeout":{"GetInfo":true,"SetInfo":false,"GetNotification":false,"GetInfoModeSync":true},
			"displayresolution":{"GetInfo":true,"SetInfo":false,"GetNotification":false,"GetInfoModeSync":true},
			"displayorientation":{"GetInfo":true,"SetInfo":false,"GetNotification":false,"GetInfoModeSync":true}
		},
      	"features":{
			"bluetooth":{"GetInfo":true,"SetInfo":false,"GetNotification":false,"GetInfoModeSync":true},
			"infrared":{"GetInfo":true,"SetInfo":false,"GetNotification":false,"GetInfoModeSync":true},
			"camera":{"GetInfo":true,"SetInfo":false,"GetNotification":false,"GetInfoModeSync":true},
			"memorycard":{"GetInfo":true,"SetInfo":false,"GetNotification":false,"GetInfoModeSync":true},
			"fmradio":{"GetInfo":true,"SetInfo":false,"GetNotification":false,"GetInfoModeSync":true},
			"qwerty":{"GetInfo":true,"SetInfo":false,"GetNotification":false,"GetInfoModeSync":true},
			"wlan":{"GetInfo":true,"SetInfo":false,"GetNotification":false,"GetInfoModeSync":true},
			"usb":{"GetInfo":true,"SetInfo":false,"GetNotification":false,"GetInfoModeSync":true},
			"pen":{"GetInfo":true,"SetInfo":false,"GetNotification":false,"GetInfoModeSync":true},
			"led":{"GetInfo":true,"SetInfo":false,"GetNotification":false,"GetInfoModeSync":true},
			"coverui":{"GetInfo":true,"SetInfo":false,"GetNotification":false,"GetInfoModeSync":true},
			"sidevolumekeys":{"GetInfo":true,"SetInfo":false,"GetNotification":false,"GetInfoModeSync":true},
			"vibra":{"GetInfo":true,"SetInfo":false,"GetNotification":false,"GetInfoModeSync":true}
		},
      	"general":{
			"accessorystatus":{"GetInfo":false,"SetInfo":false,"GetNotification":true,"GetInfoModeSync":false},
			"connectedaccessories":{"GetInfo":true,"SetInfo":false,"GetNotification":false,"GetInfoModeSync":true},
			"inputlanguage":{"GetInfo":true,"SetInfo":true,"GetNotification":true,"GetInfoModeSync":true},
			"supportedlanguages":{"GetInfo":true,"SetInfo":false,"GetNotification":false,"GetInfoModeSync":true},
			"predictivetext":{"GetInfo":true,"SetInfo":true,"GetNotification":true,"GetInfoModeSync":true},
			"vibraactive":{"GetInfo":true,"SetInfo":true,"GetNotification":true,"GetInfoModeSync":true},
			"availableusbmodes":{"GetInfo":true,"SetInfo":false,"GetNotification":false,"GetInfoModeSync":true},
			"activeusbmode":{"GetInfo":true,"SetInfo":false,"GetNotification":false,"GetInfoModeSync":true},
			"flipstatus":{"GetInfo":true,"SetInfo":false,"GetNotification":true,"GetInfoModeSync":true},
			"gripstatus":{"GetInfo":true,"SetInfo":false,"GetNotification":true,"GetInfoModeSync":true},
			
		},
      	"memory":{
			"driveinfo":{"GetInfo":true,"SetInfo":false,"GetNotification":false,"GetInfoModeSync":true},
			"listdrives":{"GetInfo":true,"SetInfo":false,"GetNotification":false,"GetInfoModeSync":true},
			"criticalmemory":{"GetInfo":false,"SetInfo":false,"GetNotification":true,"GetInfoModeSync":false},
			"memorycard":{"GetInfo":true,"SetInfo":false,"GetNotification":true,"GetInfoModeSync":true}
		},
      	"network":{
			"signalstrength":{"GetInfo":true,"SetInfo":false,"GetNotification":true,"GetInfoModeSync":false},
			"registrationstatus":{"GetInfo":true,"SetInfo":false,"GetNotification":true,"GetInfoModeSync":true},
			"networkmode":{"GetInfo":true,"SetInfo":false,"GetNotification":true,"GetInfoModeSync":true},
			"currentnetwork":{"GetInfo":true,"SetInfo":false,"GetNotification":true,"GetInfoModeSync":false},
			"locationarea":{"GetInfo":false,"SetInfo":false,"GetNotification":true,"GetInfoModeSync":false},
			"cellid":{"GetInfo":false,"SetInfo":false,"GetNotification":true,"GetInfoModeSync":false}
		}
	  };
	  
	/**
	 * SysInfo service
	 */
	var SysInfoService = function(){
		this.GetInfo 			= __GetInfo;
		this.SetInfo 			= __SetInfo;
		this.GetNotification 	= __GetNotification;
		this.Cancel 			= __Cancel;
	}

	device.implementation.extend(provider, Interface, new SysInfoService() );

	var	context = device.implementation.context,
		_t = context._t,
		method = '',
		result = false,
		DBase = null,
		default_device = 'default';
		
	/**
	 * SysInfo: GetInfo
	 * @param {Object} criteria
	 * @param {function} callback function for async call (optional)
	 */
	function __GetInfo(criteria, callback){
		var retVal = ValidateArguments("GetInfo",criteria,callback);
		if(retVal.ErrorCode != 0)
		{
			return retVal;
		}
		//	Async call
		if (typeof callback == 'function') {
			return context.callAsync(this, arguments.callee, criteria, callback);
		}

		DBase = context.getData(provider);
		var returnValue = DBase;
		returnValue = returnValue[criteria.Entity.toLowerCase()][criteria.Key.toLowerCase()];
		returnValue.Key = criteria.Key;
		returnValue.Entity = criteria.Entity;

		if(/^Connectivity$/i.test(criteria.Entity)&& /^ActiveConnections$/i.test(criteria.Key))
		{
			var temp = returnValue.ConnectionList;
			returnValue.ConnectionList = context.Iterator(temp);
		}
		else if(/^General$/i.test(criteria.Entity)&& /^ConnectedAccessories$/i.test(criteria.Key))
		{
			var temp = returnValue.AccessoryList;
			returnValue.AccessoryList = context.Iterator(temp);			
		}
		else if(/^Memory$/i.test(criteria.Entity)&& /^DriveInfo$/i.test(criteria.Key))
		{
			try {
				var temp = criteria.SystemData.Drive;
				if(temp.length > 3)
				{
					temp = temp.substring(0,3);
				}
				temp= returnValue.Drive[temp.toUpperCase()];
				if (!temp) {
					return error(device.implementation.ERR_BAD_ARGUMENT_TYPE, msg.no_msg);
				}
				var driveInfo = new Object();
				driveInfo.Key = returnValue.Key;
				driveInfo.Entity = returnValue.Entity;
				driveInfo.DriveInfo = temp;
				return context.Result(driveInfo);
			}
			catch(err)
			{
				return error(device.implementation.ERR_BAD_ARGUMENT_TYPE, msg.no_msg);
			}
			
		}
		return context.Result(returnValue);
	}
			

	/**
	 * SysInfo: SetInfo
	 * @param {Object} criteria
	 * @param {function} callback function for async call (optional)
	 */
	function __SetInfo(criteria, callback){
		var retVal = ValidateArguments("SetInfo",criteria,callback);
		if(retVal.ErrorCode != 0)
		{
			return retVal;
		}

		//	Current implementation support only for 'General' -> 'InputLanguage' || 'PredictiveText'
		if (/^General$/i.test(criteria.Entity) && ( /^InputLanguage$/i.test(criteria.Key) || /^PredictiveText/i.test(criteria.Key) || /^VibraActive/i.test(criteria.Key))) {
			//	get the DBase data
			DBase = context.getData(provider);
			var returnValue = DBase;
			
			//	Check the 'SupportedLanguages' entries for Setting the new Status
			if (/^InputLanguage$/i.test(criteria.Key)) {
				var found = false;
				var languageList = returnValue['general']['supportedlanguages']['LanguageList'];
				for (var key in languageList) {
					if (languageList[key] == criteria.SystemData.Status) {
						found = true;
					}
				}
				//	Update the 'InputLanguage' if the value value found in the ['SupportedLanguages']
				if (found) 
					returnValue[criteria.Entity.toLowerCase()][criteria.Key.toLowerCase()]['Status'] = criteria.SystemData.Status;
				else 
					return error(device.implementation.ERR_SERVICE_NOT_SUPPORTED, msg.not_supported);
			}
			else if (/^PredictiveText$/i.test(criteria.Key)) {
				if (criteria.SystemData.Status == 0 || criteria.SystemData.Status == 1) 
					returnValue[criteria.Entity.toLowerCase()][criteria.Key.toLowerCase()]['Status'] = criteria.SystemData.Status;
				else 
					return error(device.implementation.ERR_NOT_FOUND, msg.badType);
			}
			else if (/^VibraActive$/i.test(criteria.Key)) {
				if (criteria.SystemData.Status == 0 || criteria.SystemData.Status == 1) 
					returnValue[criteria.Entity.toLowerCase()][criteria.Key.toLowerCase()]['Status'] = criteria.SystemData.Status;
			}
			else {
				return error(device.implementation.ERR_SERVICE_NOT_SUPPORTED, msg.not_supported);
			}
		}
		else if(/^Display/i.test(criteria.Entity) && /^Wallpaper/i.test(criteria.Key)) {
			if(typeof criteria.SystemData.StringData == 'undefined')
				return error(device.implementation.ERR_MISSING_ARGUMENT, msg.missingArgs);
			returnValue[criteria.Entity.toLowerCase()][criteria.Key.toLowerCase()]['StringData'] = criteria.SystemData.StringData;
			return context.ErrorResult(device.implementation.ERR_SUCCESS);
		}
		return context.Result(result);
	}
			

	/**
	 * SysInfo: GetNotification
	 * @param {Object} criteria
	 * @param {function} callback function for async call
	 */
	function __GetNotification(criteria, callback){
		var retVal = ValidateArguments("GetNotification",criteria,callback);
		if(retVal.ErrorCode != 0)
		{
			return retVal;
		}
		
		// unsupported
		if (!/^(Battery|Memory)$/i.test(criteria.Entity) ||
			!/^(BatteryStrength|ChargingStatus|MemoryCard)$/i.test(criteria.Key)) {
			context.notify(_t('%s:: GetNotification : entity %s, key %s not implemented in preview.').arg(provider, criteria.Entity, criteria.Key));
			// register callback anyway so Cancel works. 
		}

		// evenType = 'entity.key'
		var eventType = criteria.Entity+'.'+criteria.Key;
						
		// process notify
		return context.addListener(provider, eventType, criteria, callback, notifyHandler);
	}
			
	function notifyHandler(transactionID, criteria, callback, data){
		
		var result,
			eventCode = {completed:2, error:4, progress:9},
			code = eventCode.progress;
		try{
			DBase = context.getData(provider);
			var entity = criteria.Entity.toLowerCase(),
				key = criteria.Key.toLowerCase();
						
			// make a copy of return value
			var returnValue = context.extend({},DBase[entity][key]);
			
			// augment with data
			context.extend(returnValue, data);

			result = context.Result(returnValue);
		} 
		catch(e){
			code = eventCode.error;
		}
		callback(transactionID, code, result);
	}
		
			

	/**
	 * SysInfo: Cancel
	 * @param {Object} criteria
	 */
	function __Cancel(criteria){
		method = 'Cancel';

		if (!criteria || !criteria.TransactionID)
			return error(device.implementation.ERR_MISSING_ARGUMENT, msg.missingTID);

		var found = context.removeListener(provider, null, criteria.TransactionID);
		if (!found)
			return error(device.implementation.ERR_NOT_FOUND);
		else
			return context.ErrorResult(device.implementation.ERR_SUCCESS);
	}


	
	/*******************************
	 * helper functions
	 *******************************/
	
	function error(code, msg /*, args...*/){

		var args = ['SysInfo',method].concat([].slice.call(arguments,2));
		msg = msg ? _t().arg.apply(msg,args) : undefined;
		return context.ErrorResult(code, msg);
	}

	function cancelRegisteredNotify(result)
	{
		__Cancel({'TransactionID':result.TransactionID});
		method = 'GetNotification';
	}

	/** 
	 * error messages
	 * order of %s args: Service name, method name, parameter name 
	 */
	var msg = {
		badType				: '%s: %s: Type is invalid',
		badSysInfo			: '%s: %s: SysInfoName is invalid',
		missingSysInfo		: '%s: %s: SysInfoName is missing',
		missingTID 			: '%s: %s: Transaction ID missing',
		not_supported 		: '%s: %s: Not Supported',
		is_invalid			: '%s: %s: Is invalid',
		missingArgs			: '%s: %s: SystemData Argument Missing',
		inSufficientArgs	: '%s: %s: Insufficient Arguments to process',
		missingInputParam	: '%s: %s: Input Parameter Missing',
		not_supportedSyncVer: '%s: %s: Sync Version Not Supported',
		noEntity			: '%s: %s: Entity: Input Parameter Missing',
		noKey				: '%s: %s: Key: Input Parameter Missing',
		IncorrectSytemData	: '%s: %s: Incorrect SystemData Type, SystemData Must be a Map',
		callbackNotFound	: '%s: %s: Callback object not found',
		commandNotFound		: '%s: %s: Command Not Supported',
		unsupInterface		: 'SysInfo:Requested interface not supported by the provider',
		no_msg				: '%s: %s: '
	};

	/**
	 * Common validator for all functions
	 * 	 
	 *  
	 * @param {arguments} function name and arguments of calling function
	 * @return {Result} Error object
	 */		
	  function ValidateArguments(funName,criteria,callback)
	  {
	  	method = funName;

		try {
			if (/^GetNotification$/i.test(funName) && typeof callback != "function") {
				return error(device.implementation.ERR_BAD_ARGUMENT_TYPE, msg.not_supportedSyncVer);
			}
			
			if (typeof criteria == "undefined" || typeof criteria.Entity == "undefined" || typeof criteria.Key == "undefined") {
				return error(device.implementation.ERR_MISSING_ARGUMENT, msg.inSufficientArgs);
			}
			
			if (criteria.Entity == "") {
				return error(device.implementation.ERR_MISSING_ARGUMENT, msg.noEntity);
			}
			
			if (criteria.Key == "") {
				return error(device.implementation.ERR_MISSING_ARGUMENT, msg.noKey);
			}
			
			if (/^SetInfo$/i.test(funName)) {
				if (typeof criteria.SystemData == "undefined" || criteria.SystemData == '') {
					return error(device.implementation.ERR_MISSING_ARGUMENT, msg.missingArgs);
				}
				if (typeof criteria.SystemData.StringData == "undefined" && typeof criteria.SystemData.Status == "undefined") {
					return error(device.implementation.ERR_MISSING_ARGUMENT, msg.missingArgs);
				}
			}
			
			if (typeof supportedEntitiesAndKeys[criteria.Entity.toLowerCase()] == 'undefined' || typeof supportedEntitiesAndKeys[criteria.Entity.toLowerCase()][criteria.Key.toLowerCase()] == 'undefined') {
				return error(device.implementation.ERR_NOT_FOUND, msg.no_msg);
			}
			
			if (!supportedEntitiesAndKeys[criteria.Entity.toLowerCase()][criteria.Key.toLowerCase()][funName]) {
				return error(device.implementation.ERR_NOT_FOUND, msg.no_msg);
			}
			
			if (funName == "GetInfo" && !supportedEntitiesAndKeys[criteria.Entity.toLowerCase()][criteria.Key.toLowerCase()]["GetInfoModeSync"] && typeof callback != "function") {
				return error(device.implementation.ERR_MISSING_ARGUMENT, msg.not_supportedSyncVer);
			}
			
			return context.ErrorResult(device.implementation.ERR_SUCCESS, "");
		}
		catch(err){
			return error(device.implementation.ERR_BAD_ARGUMENT_TYPE, msg.badType);
		}
		
	  }

}) ()