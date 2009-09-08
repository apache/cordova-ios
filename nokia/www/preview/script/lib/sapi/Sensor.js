/**
 * Sensor.js
 * 
 * Nokia Web Runtime Service API emulation 
 * WRT v1.1
 * 
 * Copyright 2009 Nokia Corporation. All rights reserved.
*/

(function(){

	var provider = 'Service.Sensor',
		Interface = 'ISensor';
	var transID = new Array();
	/**
	 * Sensor service
	 */
	var SensorService = function(){
		this.FindSensorChannel 			= __FindSensorChannel;
		this.RegisterForNotification	= __RegisterForNotification;
		this.Cancel						= __Cancel;
		this.GetChannelProperty			= __GetChannelProperty;		
	}

	device.implementation.extend(provider, Interface, new SensorService() );

	/******************************************************/	
	/******************************************************/	
	/******************************************************/	

	var	context = device.implementation.context,
		_t = context._t,
		method = '',
		result = false,
		DBase = null;


	/**
	 * Sensor: FindSensorChannel
	 * @param {Object} criteria
	 */
	function __FindSensorChannel(criteria){
		method = 'FindSensorChannel';
		if(!criteria)
			return error(device.implementation.ERR_MISSING_ARGUMENT, msg.msgCriteriaMissing);
			
		if(typeof criteria != 'object')
			return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.msgCriteriaMissing);
						
		if(typeof criteria.SearchCriterion == 'undefined')
			return error(device.implementation.ERR_MISSING_ARGUMENT, msg.msgDataMissing);

		if(typeof criteria.SearchCriterion != 'string')
			return error(device.implementation.ERR_BAD_ARGUMENT_TYPE, msg.msgidInvalid);

		if(!(criteria.SearchCriterion== "All" || criteria.SearchCriterion== "AccelerometerAxis" || criteria.SearchCriterion=="AccelerometerDoubleTapping" || criteria.SearchCriterion=="Orientation" || criteria.SearchCriterion=="Rotation"))
		 	return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.msgSearchParamInvalid);

		if(arguments.length > 1)
			return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.msgCriteriaMissing);			

		DBase = context.getData(provider);
		var returnValue;
		returnValue = DBase[criteria.SearchCriterion] || [] ;
		
		return context.Result(returnValue,0);			
	}



	/**
	 * Sensor: RegisterForNotification
	 * @param {Object} criteria, callback
	 */
	function __RegisterForNotification(criteria, callback, flag){
		flag = flag || false;
		method = 'RegisterForNotification';
		context.notify(_t('%s:: RegisterForNotification not implemented in preview').arg(provider));
		
		if(arguments.length >2 && (typeof flag != "undefined" && typeof flag != "boolean"))
			return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.msgCriteriaMissing);

		if(typeof callback != 'function')
			return error(device.implementation.ERR_MISSING_ARGUMENT, msg.msgInsufficentArgument);
		
		
		if(!criteria)
			return error(device.implementation.ERR_MISSING_ARGUMENT, msg.msgIncompleteInput);
			
		if(typeof criteria != 'object')
			return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.msgIncompleteInput);
						
		if(typeof criteria.ListeningType == 'undefined' || typeof criteria.ChannelInfoMap == 'undefined')
			return error(device.implementation.ERR_MISSING_ARGUMENT, msg.msgIncompleteInput);

		if(typeof criteria.ListeningType != 'string')
			return error(device.implementation.ERR_BAD_ARGUMENT_TYPE, msg.msgListenTypeInvalid);
			
		if(typeof criteria.ChannelInfoMap != 'object')
			return error(device.implementation.ERR_BAD_ARGUMENT_TYPE, msg.msgChannelInfoMapInvalid);
		
		if(!(criteria.ListeningType== "ChannelData" ))
		 	return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.msgOutofRange);

		if(typeof callback == 'function')
		{
			var result = context.callAsync(this, arguments.callee, criteria, callback);
			transID.push(result.TransactionID);
			return result;
		}
		if(flag)
			transID.shift();
				
		return context.ErrorResult();
	}


	/**
	 * Sensor: Cancel
	 * @param {Object} criteria
	 */
	function __Cancel(criteria){
		method = 'Cancel';

		if(arguments.length > 1 && typeof criteria != "object" && typeof criteria.TransactionID != "number" && arguments[1])
			return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.msgCriteriaMissing);

		if (!criteria || typeof criteria.TransactionID == 'undefined') 
			return error(device.implementation.ERR_MISSING_ARGUMENT, msg.msgTransIDMissing);

		if (criteria.TransactionID == Infinity || criteria.TransactionID == -Infinity) 
			return error(device.implementation.ERR_BAD_ARGUMENT_TYPE, msg.msgTransIDMissing);
		
		if (typeof criteria.TransactionID != 'number') 
			return error(device.implementation.ERR_BAD_ARGUMENT_TYPE, msg.msgIncorrectTransID);		

		for (var i=0; i<transID.length; i++) {
			if (criteria.TransactionID == transID[i]){
				clearTimeout(criteria.TransactionID);
				return context.ErrorResult();
			}
		};
		
		return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.msgInvalidTransID);

	}


	/**
	 * Sensor: GetChannelProperty
	 * @param {Object} criteria
	 */
	function __GetChannelProperty(criteria){
		method = 'GetChannelProperty';

		if(!criteria)
			return error(device.implementation.ERR_MISSING_ARGUMENT, msg.msgIncompleteInput);
			
		if(typeof criteria != 'object')
			return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.msgIncompleteInput);

		if(typeof criteria.ChannelInfoMap == 'undefined' || typeof criteria.PropertyId == 'undefined')
			return error(device.implementation.ERR_MISSING_ARGUMENT, msg.msgIncompleteInput);
		
		if(typeof criteria.ChannelInfoMap != 'object')
			return error(device.implementation.ERR_BAD_ARGUMENT_TYPE, msg.msgChannelInfoMapInvalid);
		
		if(typeof criteria.PropertyId != 'string')
			return error(device.implementation.ERR_BAD_ARGUMENT_TYPE, msg.msgInvalidPropertyID);
		
		if(criteria.PropertyId != 'Availability' && criteria.PropertyId != "ChannelAccuracy" && criteria.PropertyId != "ChannelDataFormat" && criteria.PropertyId != "ChannelScale" && criteria.PropertyId != "ChannelUnit" && criteria.PropertyId != "ConnectionType" && criteria.PropertyId != "DataRate" && criteria.PropertyId != "Description" && criteria.PropertyId != "MeasureRange" && criteria.PropertyId != "ScaledRange" && criteria.PropertyId != "SensorModel")
			return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.msgInvalidPropertyID);

		if(arguments.length > 1)
			return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.msgCriteriaMissing);			

		DBase = context.getData(provider);
		var property = DBase['SensorProperty'];
		if(typeof criteria.ChannelInfoMap['ChannelId'] == 'undefined' || typeof criteria.ChannelInfoMap['ChannelId'] != 'number')
			return error(device.implementation.ERR_BAD_ARGUMENT_TYPE, msg.msgChannelInfoMapInvalid);

		var channel = null;
		if(criteria.ChannelInfoMap['ChannelId'] == 7)
		{
			channel = 'AccelerometerAxis';
		}
		else if(criteria.ChannelInfoMap['ChannelId'] == 8)
		{
			channel = 'AccelerometerDoubleTapping';
		}
		else if(criteria.ChannelInfoMap['ChannelId'] == 10)
		{
			channel = 'Orientation';
		}
		else if(criteria.ChannelInfoMap['ChannelId'] == 11)
		{
			channel = 'Rotation';
		}
	
		if(channel == null)
			return error(device.implementation.ERR_BAD_ARGUMENT_TYPE, msg.msgChannelInfoMapInvalid);
		
		var returnValue = property[channel][criteria.PropertyId];
		if(typeof returnValue == 'undefined')
			return context.ErrorResult(device.implementation.ERR_NOT_FOUND);
		return context.Result(returnValue,0)
	}

	/**
	 * Sensor: error
	 * @param {number,string} ErrorCode and ErrorString
	 * Replaces Error String with method name
	 */
	function error(code, msg /*, args...*/){

		var args = ['Sensors',method].concat([].slice.call(arguments,2));
		msg = msg ? _t().arg.apply(msg,args) : undefined;
		return context.ErrorResult(code, msg);
	}


	/** 
	 * error messages
	 * order of %s args: Service name, method name, parameter name 
	 */
	var msg = {	
		msgInterfaceNotSupported 	: '%s:Requested interface not supported by the provider',
		msgInterfaceMissing 		: '%s:Interface name missing',
		msgInsufficentArgument 		: '%s:%s:Insufficent argument for asynchronous request',
		msgListenTypeMissing 		: '%s:%s:Listening type missing',
		msgListenTypeInvalid		: '%s:%s:Listening type is invalid',
		msgChannelInfoMissing		: '%s:%s:ChannelInfoMap missing',
		msgIncompleteInput			: '%s:%s:Incomplete input param list',
		msgOutofRange				: '%s:%s:Listening type is out of allowed range',
		msgCallbackMissing			: '%s:%s:Callback missing',
		msgAlreadyRegistered		: '%s:%s:Notification is already registered on this channel',
		msgCriteriaMissing			: '%s:%s:Search criterion is missing',
		msgInvalidSearchCriteria	: '%s:%s:Invalid Search Criterion',
		msgChannelSearchInvalid		: '%s:%s:Channel search param type invalid',
		msgSearchParamInvalid		: '%s:%s:Invalid channel search param',
		msgTransIDMissing			: '%s:%s:Transaction id is missing',
		msgIncorrectTransID			: '%s:%s:Incorrect TransactionID',
		msgInvalidTransID			: '%s:%s:Invalid TransactionID',
		msgPropertyIDMissing		: '%s:%s:Property id missing',
		msgInvalidPropertyID		: '%s:%s:Property id is invalid',
		msgChannelNotSupported		: '%s:%s:Channel property not supported',
		msgChannelInfoMapInvalid	: '%s:%s:ChannelInfoMap Type Invalid'
	};

}) ()