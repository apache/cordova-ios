/**
 * Logging.js
 * 
 * Nokia Web Runtime Service API emulation 
 * WRT v1.1
 * 
 * Copyright 2009 Nokia Corporation. All rights reserved.
*/

 
(function(){
	
	var provider = 'Service.Logging',
		Interface = 'IDataSource';

	/**
	 * Landmark service
	 */
	var LoggingService = function(){
		this.Add 					= __Add;
		this.GetList 				= __GetList;
		this.Delete					= __Delete;
		this.RequestNotification	= __RequestNotification;		
		this.Cancel					= __Cancel;		

	}

	device.implementation.extend(provider, Interface, new LoggingService() );


	/******************************************************/	
	/******************************************************/	
	/******************************************************/	

	var	context = device.implementation.context,
		_t = context._t,
		method = '',
		result = false,
		DBase = null;

	var transactionIds = new Array();
	var tTransactionId = -1;
	var isTraceInProgress = false;
	var criteriaReq;
	var callbackReq;

	/**
	 * Logging: Add
	 * @param {Object} criteria
	 * @param (function) callback
	 */
	function __Add(criteria, callback, flag){
		method = "Add";
		//	Async call
		flag = flag || false;

		if (!flag) {
			var result = ValidateAdd(criteria, callback);
			if (result.ErrorCode != 0) 
				return result;
		}			
		
		
		if(typeof callback == 'function')
		{
			return context.callAsync(this, arguments.callee, criteria, callback);
		}
		DBase = context.getData(provider);
		var returnValue = DBase[criteria.Type];
		criteria.Item.id = 	GenerateRandomNumber()+'';
		criteria.Item["EventTime"] = GetCurrDate();
		returnValue.push(criteria.Item);
		return context.Result(criteria.Item.id,0);
	}

	/**
	 * Logging: GetList
	 * @param {Object} criteria
	 * @param (function) callback
	 */
	function __GetList(criteria, callback, flag){	
		method = "GetList";
		//	Async call
		flag = flag || false;

		if (!flag) {
			var result = ValidateGetList(criteria, callback);
			if (result.ErrorCode != 0) 
				return result;
		}			
		
		
		if(typeof callback == 'function')
		{
			return context.callAsync(this, arguments.callee, criteria, callback);
		}
		if(criteria.Filter){
			context.notify(_t('%s:: GetList : filter not implemented in preview').arg(provider));
		}
				
		DBase = context.getData(provider);
		var returnValue;
		// @todo: apply filter criteria
		returnValue = context.Iterator( DBase[criteria.Type] || [] );
		
		return context.Result(returnValue,0);
	}

	/**
	 * Logging: Delete
	 * @param {Object} criteria
	 * @param (function) callback
	 */
	function __Delete(criteria, callback, flag){
		method = "Delete";
		//	Async call
		flag = flag || false;		
		if (!flag) {
			if (!criteria || !criteria.Type) 
				return error(device.implementation.ERR_MISSING_ARGUMENT, msg.msgTypeMissing);

			if (typeof criteria.Type != 'string') 
				return error(device.implementation.ERR_BAD_ARGUMENT_TYPE, msg.msgTypeInvalid);
			
			if (criteria.Type != 'Log') 
				return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.msgTypeInvalid);
			
			if (!criteria.Data) 
				return error(device.implementation.ERR_MISSING_ARGUMENT, msg.msgDataMissing);
			
			if(typeof criteria.Data != 'object')
				return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.msgDataInvalid);

			if(typeof criteria.Data.id == 'undefined')
				return error(device.implementation.ERR_MISSING_ARGUMENT, msg.msgid);
			
			if (typeof criteria.Data.id != "string") 
				return error(device.implementation.ERR_BAD_ARGUMENT_TYPE, msg.msgidInvalid);
				
			if(criteria.Data.id == '')
				return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.msgidInvalid);
		}
		DBase = context.getData(provider);
		var returnValue,found = false;
		returnValue = DBase[criteria.Type];
		for(var i=0; i<returnValue.length; i++){
			if(returnValue[i].id == criteria.Data.id)
			{
				found = true;
				returnValue.splice(i,1);
			}			
		}
		if(!found)
			return error(device.implementation.ERR_NOT_FOUND, msg.msgidInvalid);
		
		return context.Result(undefined,0);
	}

	/**
	 * Logging: RequestNotification
	 * @param {Object} criteria
	 * @param (function) callback
	 */
	function __RequestNotification(criteria, callback, flag){
		method = "RequestNotification";
		
		//	Async call
		flag = flag || false;		
		if (!flag) {
			if (!criteria || !criteria.Type) 
				return error(device.implementation.ERR_MISSING_ARGUMENT, msg.msgTypeMissing);

			if (typeof criteria.Type != 'string') 
				return error(device.implementation.ERR_BAD_ARGUMENT_TYPE, msg.msgTypeInvalid);
			
			if (criteria.Type != 'Log') 
				return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.msgTypeInvalid);
			
			if (!criteria.Filter)
				return error(device.implementation.ERR_MISSING_ARGUMENT, msg.msgFilterMissing);

			if(typeof criteria.Filter != 'object') 
				return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.msgFilterInvalid);
			
			if(typeof criteria.Filter.DelayTime == 'undefined') 
				return error(device.implementation.ERR_MISSING_ARGUMENT, msg.msgDelayTimeMissing);
			
			if(typeof criteria.Filter.DelayTime != 'number')
				return error(device.implementation.ERR_BAD_ARGUMENT_TYPE, msg.msgDelayTimeInvalid);
			if(criteria.Filter.DelayTime <= 0)
				return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.msgDelayTimeInvalid);
			
			if(criteria.Filter.DelayTime < 1000000 )
			{
				criteria.Filter.DelayTime = 1000000;
				context.notify(_t('%s:: RequestNotification : Using DelayTime = 1000000').arg(provider));
			}
		}
		if(typeof callback != 'function')
				return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.msgMissingCallback);

		criteriaReq = criteria;
		callbackReq = callback;
		isTraceInProgress = true;

		return notificationCall(criteria,callback);
	}

	/**
	 * Logging: Cancel
	 * @param {Object} criteria
	 * @param (function) callback
	 */
	function __Cancel(criteria){
			method = "Cancel";
			if (!criteria || typeof criteria.TransactionID == 'undefined') 
				return error(device.implementation.ERR_MISSING_ARGUMENT, msg.msgTransactionIdMissing);
			
			if (typeof criteria.TransactionID != 'number') 
				return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.msgTransactionIdInvalid);
			
			clearTimeout(criteria.TransactionID);
			if (criteria.TransactionID == tTransactionId) {
				isTraceInProgress = false;
				tTransactionId = -1;
			}
		return context.ErrorResult(device.implementation.ERR_SUCCESS);

	}
	

	/**
	 * Location: error
	 * @param {number,string} ErrorCode and ErrorString
	 * Replaces Error String with method name
	 */
	function error(code, msg /*, args...*/){

		var args = ['Logging',method].concat([].slice.call(arguments,2));
		msg = msg ? _t().arg.apply(msg,args) : undefined;
		return context.ErrorResult(code, msg);
	}
	
	/**
	 * Logging: notificationCall
	 * @param {} 
	 * This function Calls callback function after given delay
	 */
	function notificationCall(){
		var tid = setTimeout(function(){
		if(!isTraceInProgress)
			return;
			
		DBase = context.getData(provider);
		var returnValue;
		returnValue = context.Iterator( DBase[criteriaReq.Type] || [] );

		var result,
			eventCode = {completed:2, error:4, progress:9},
		code = eventCode.completed;

		callbackReq(tTransactionId,code,context.Result(returnValue,0));
		//notificationCall();
		}, criteriaReq.Filter.DelayTime/1000);
		if(tTransactionId == -1)
			tTransactionId = tid;
		return context.AsyncResult(tTransactionId);
	}
	
	/**
	 * Helper functions
	 */

	/**
	 * GenerateRandomNumber
	 * @param {}array of log data for getting unique ID 
	 * 
	 */
	function GenerateRandomNumber(arr)
	{
		var randomnumber = Math.floor(Math.random() * 10001);
		randomnumber +=200;
		return randomnumber;
	}

	/**
	 * GetCurrDate
	 * @param {}Gets date in internet format
	 * 
	 */
	function GetCurrDate()
	{
		var d_names = new Array("Sunday", "Monday", "Tuesday",
		"Wednesday", "Thursday", "Friday", "Saturday");
		
		var m_names = new Array("January", "February", "March", 
		"April", "May", "June", "July", "August", "September", 
		"October", "November", "December");
		
		var ampm = "am";
		
		var d = new Date();
		var curr_day = d.getDay();
		var curr_date = d.getDate();
		if(curr_date <10)
			curr_date = "0"+curr_date;
		var curr_month = d.getMonth();
		var curr_year = d.getFullYear();
		var curr_hour = d.getHours();
		if(curr_hour > 11)
		{
			ampm = "pm";
		}
		else if(curr_hour <10)
		{
			curr_hour = "0"+curr_hour;
		}	
		var curr_min = d.getMinutes();
		if(curr_min <10)
			curr_min = "0"+curr_min;
	
		var curr_sec = d.getSeconds();
		if(curr_sec <10)
			curr_sec = "0"+curr_sec;
		
		var strDate = d_names[curr_day]+', '+curr_date+' '+m_names[curr_month]+', '+curr_year+' '+curr_hour+':'+curr_min+':'+curr_sec+' '+ampm;
		return strDate;
	}	

	/**
	 * ValidateAdd
	 * @param {object,function}
	 * Validates ADD arguments
	 */	
	function ValidateAdd(criteria,callback)
	{
		var type;
		if(!criteria || !criteria.Type)
			return error(device.implementation.ERR_MISSING_ARGUMENT,msg.msgTypeMissing);

		if (typeof criteria.Type != 'string') 
			return error(device.implementation.ERR_BAD_ARGUMENT_TYPE, msg.msgTypeInvalid);
		
		if(criteria.Type != 'Log')
			return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT,msg.msgTypeInvalid);
		
		if (!criteria.Item)
			return error(device.implementation.ERR_MISSING_ARGUMENT, msg.msgItemMissing);

		if(typeof criteria.Item != 'object') 
			return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.msgItemInvalid);
		
		
		if(typeof criteria.Item.EventType == "undefined")
			return error(device.implementation.ERR_MISSING_ARGUMENT,msg.msgEventTypeMissing);

		if(typeof criteria.Item.EventType != "number" )
			return error(device.implementation.ERR_BAD_ARGUMENT_TYPE,msg.msgEventTypeInvalid);
		
		if(typeof criteria.Item.EventType == "number" && !(criteria.Item.EventType >=0 && criteria.Item.EventType <=4))
			return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT,msg.msgEventTypeInvalid);
		
		type = typeof criteria.Item.RemoteParty;
		if(type != 'undefined' &&  type != "string")
			return error(device.implementation.ERR_BAD_ARGUMENT_TYPE,msg.msgRemotePartyInvalid);
		
		type = typeof criteria.Item.Direction;
		if (type != 'undefined') {
			if (type != "number") 
				return error(device.implementation.ERR_BAD_ARGUMENT_TYPE, msg.msgDirectionInvalid);
			
			if (type == "number" && (criteria.Item.Direction < 0 || criteria.Item.Direction > 6)) 
				return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.msgDirectionInvalid);
		}

		type = typeof criteria.Item.EventDuration;
		if(type != 'undefined' &&  type != "number")
			return error(device.implementation.ERR_BAD_ARGUMENT_TYPE,msg.msgEventDurationInvalid);
			
		type = typeof criteria.Item.DeliveryStatus;
		if (type != 'undefined') {
			if (type != "number") 
				return error(device.implementation.ERR_BAD_ARGUMENT_TYPE, msg.msgDeliveryStatusInvalid);
			
			if (type == "number" && (criteria.Item.DeliveryStatus < 0 || criteria.Item.DeliveryStatus > 6)) 
				return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.msgDeliveryStatusInvalid);
		}
		
		type = typeof criteria.Item.Subject;
		if(type != 'undefined' &&  type != "string")
			return error(device.implementation.ERR_BAD_ARGUMENT_TYPE,msg.msgSubjectInvalid);

		type = typeof criteria.Item.PhoneNumber;
		if(type != 'undefined' &&  type != "string")
			return error(device.implementation.ERR_BAD_ARGUMENT_TYPE,msg.msgPhoneNumberInvalid);

		type = typeof criteria.Item.Link;
		if(type != 'undefined' &&  type != "number")
			return error(device.implementation.ERR_BAD_ARGUMENT_TYPE,msg.msgLinkInvalid);

		type = typeof criteria.Item.LogFlags;
		if(type != 'undefined' && (type != "number" || (criteria.Item.LogFlags != 1 && criteria.Item.LogFlags != 0)))
			return error(device.implementation.ERR_BAD_ARGUMENT_TYPE,msg.msgLogFlagsInvalid);

		return context.ErrorResult(device.implementation.ERR_SUCCESS, "");
	}	

	/**
	 * ValidateGetList
	 * @param {object,function}
	 * Validates GetList function
	 */	
	function ValidateGetList(criteria,callback)
	{
		var type;
		if(!criteria || !criteria.Type)
			return error(device.implementation.ERR_MISSING_ARGUMENT,msg.msgTypeMissing);

		if (typeof criteria.Type != 'string') 
			return error(device.implementation.ERR_BAD_ARGUMENT_TYPE, msg.msgTypeInvalid);
		
		if(criteria.Type != 'Log')
			return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT,msg.msgTypeInvalid);

		type = typeof criteria.Filter;
		if(type != 'undefined' &&  type != "object")
			return error(device.implementation.ERR_BAD_ARGUMENT_TYPE,msg.msgFilterInvalid);
		
		if(type == 'undefined')
			return context.ErrorResult(device.implementation.ERR_SUCCESS, "");		
		
		type = typeof criteria.Filter.id;
		if(type != 'undefined' &&  type != "string")
			return error(device.implementation.ERR_BAD_ARGUMENT_TYPE,msg.msgid);
		
		if(type != 'undefined')
			return context.ErrorResult(device.implementation.ERR_SUCCESS, "");  // if id is given all other filters will be ignored

		type = typeof criteria.Filter.EventType;
		if (type != 'undefined') {
			if (type != "number") 
				return error(device.implementation.ERR_BAD_ARGUMENT_TYPE, msg.msgEventTypeInvalid);
		
			if (type != "number" || !(criteria.Filter.EventType >= 0 && criteria.Filter.EventType <= 4)) 
				return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.msgEventTypeInvalid);
		}		
		type = typeof criteria.Filter.RecentList;
		if (type != 'undefined') {
			if (type != "number") 
				return error(device.implementation.ERR_BAD_ARGUMENT_TYPE, msg.msgRecentListInvalid);
			if (type == "number" && (criteria.Filter.RecentList < -1 || criteria.Filter.RecentList > 3)) 
				return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.msgRecentListInvalid);
		}
		
		type = typeof criteria.Filter.RemoteParty;
		if(type != 'undefined' &&  type != "string")
			return error(device.implementation.ERR_BAD_ARGUMENT_TYPE,msg.msgRemotePartyInvalid);
		
		type = typeof criteria.Filter.Direction;
		if (type != 'undefined') {
			if (type != "number") 
				return error(device.implementation.ERR_BAD_ARGUMENT_TYPE, msg.msgDirectionInvalid);
			if (type == "number" && (criteria.Filter.Direction < 0 || criteria.Filter.Direction > 6)) 
				return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.msgDirectionInvalid);
		}
		
		type = typeof criteria.Filter.DeliveryStatus;
		if (type != 'undefined') {
			if (type != "number") 
				return error(device.implementation.ERR_BAD_ARGUMENT_TYPE, msg.msgDeliveryStatusInvalid);
			if (type == "number" && (criteria.Filter.DeliveryStatus < 0 || criteria.Filter.DeliveryStatus > 6)) 
				return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.msgDeliveryStatusInvalid);
		}

		type = typeof criteria.Filter.EndTime;
		if(type != 'undefined' && (type != "object" ||  typeof criteria.Filter.EndTime.getTime != "function"))
			return error(device.implementation.ERR_BAD_ARGUMENT_TYPE,msg.msgEndTimeInvalid);

		type = typeof criteria.Filter.PhoneNumber;
		if(type != 'undefined' &&  type != "string")
			return error(device.implementation.ERR_BAD_ARGUMENT_TYPE,msg.msgPhoneNumberInvalid);


		type = typeof criteria.Filter.LogFlags;
		if (type != 'undefined') {
			if (type != "number") 
				return error(device.implementation.ERR_BAD_ARGUMENT_TYPE, msg.msgLogFlagsInvalid);
			if (type == "number" && (criteria.Filter.LogFlags != 1 && criteria.Filter.LogFlags != 0)) 
				return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.msgLogFlagsInvalid);
		}
		return context.ErrorResult(device.implementation.ERR_SUCCESS, "");
	}	


	/** 
	 * error messages
	 * order of %s args: Service name, method name, parameter name 
	 */
	var msg = {
		msgTypeInvalid 				: '%s:%s:TypeInvalid',
		msgTypeMissing				: '%s:%s:Type Missing',
		msgFilterInvalid			: '%s:%s:FilterInvalid',
		msgidInvalid				: '%s:%s:idInvalid',
		msgRecentListInvalid		: '%s:%s:RecentListInvalid',
		msgPhoneNumberInvalid		: '%s:%s:PhoneNumberInvalid',
		msgDirectionInvalid			: '%s:%s:DirectionInvalid',
		msgDeliveryStatusInvalid	: '%s:%s:DeliveryStatusInvalid',
		msgLogFlagsInvalid			: '%s:%s:LogFlagsInvalid',
		msgEndTimeInvalid			: '%s:%s:EndTimeInvalid',
		msgRemotePartyInvalid		: '%s:%s:RemotePartyInvalid',
		msgEventTypeInvalid			: '%s:%s:EventTypeInvalid',
		msgItemInvalid				: '%s:%s:ItemInvalid',
		msgItemMissing				: '%s:%s:ItemMissing',
		msgEventTypeInvalid			: '%s:%s:EventTypeInvalid',
		msgEventTypeMissing			: '%s:%s:EventType Missing',
		msgEventDurationInvalid		: '%s:%s:EventDurationInvalid',
		msgSubjectInvalid			: '%s:%s:SubjectInvalid',
		msgEventDataInvalid			: '%s:%s:EventDataInvalid',
		msgLinkInvalid				: '%s:%s:LinkInvalid',
		msgDataInvalid				: '%s:%s:DataInvalid',
		msgDataMissing				: '%s:%s:Data Missing',
		msgid						: '%s:%s:id',
		msgFilterInvalid			: '%s:%s:FilterInvalid',
		msgFilterMissing			: '%s:%s:Filter Missing',
		msgDelayTimeInvalid			: '%s:%s:DelayTimeInvalid',
		msgDelayTimerMissing		: '%s:%s:DelayTimerMissing',
		msgTransactionIdInvalid		: '%s:%s:TransactionIdInvalid',
		msgTransactionIdMissing		: '%s:%s:TransactionID Missing',
		msgMissingCallback			: '%s:%s:Missing Callback',
		msgNoMsg					: '%s:%s:'
	};
		

}) ()

