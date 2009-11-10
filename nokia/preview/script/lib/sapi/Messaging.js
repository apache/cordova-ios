/**
 * Messaging.js
 * 
 * Nokia Web Runtime Service API emulation 
 * WRT v1.1
 * 
 * Copyright 2009 Nokia Corporation. All rights reserved.
*/
  
(function(){
	
	var provider = 'Service.Messaging' ,
		Interface = 'IMessaging';
		
	/**
	 * Messaging service
	 */
	var MessagingService = function(){
		this.GetList			 	= __GetList;
		this.Send 					= __Send;
		this.RegisterNotification	= __RegisterNotification;
		this.CancelNotification 	= __CancelNotification;
		this.ChangeStatus 			= __ChangeStatus;
		this.Delete					= __Delete;
		this.Cancel 				= __Cancel;
	}

	device.implementation.extend(provider, Interface, new MessagingService() );


	/******************************************************/	
	/******************************************************/	
	/******************************************************/	

	var	context = device.implementation.context,
		_t = context._t,
		method = '',
		result = false,
		DBase = null;
	
	/**
	 * Messaging: GetList
	 * @param {Object} criteria
	 */
	function __GetList(criteria){

		if ((result = validator.apply('GetList', arguments)) !== false)
			return result; 
	
		if (!criteria.Type)
			return error(device.implementation.ERR_MISSING_ARGUMENT, msg.missingType);

		if (!/^Inbox$/i.test(criteria.Type))
			return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.badType);
	
		var returnValue = [], 
			match = null,
			filter = criteria.Filter || null;
 
		DBase = context.getData(provider);

		// filter by MessageId
		if (filter && filter.MessageId) {
			returnValue = findByKey(DBase.Inbox, filter.MessageId, 'MessageId'); 
			if (returnValue.length == 0)
				return error(device.implementation.ERR_NOT_FOUND);
		}
		// return all messages
		else {
			returnValue = DBase.Inbox;
		}

		// unsupported filters 
		if (filter 
			&& (match = context.keys(filter).join().match(/MessageTypeList|SenderList|Subject|StartDate|EndDate/ig)) ) {
			context.notify(_t('%s:: GetList : filter %s not implemented in preview').arg(provider, match.join()));
		}
		// unsupported sort			
		if (criteria.Sort) { 
			context.notify(_t('%s:: GetList : sort not implemented in preview').arg(provider));
		}
		return context.Result(context.Iterator(returnValue));
	}
			
	/**
	 * Messaging: Send
	 * @param {Object} criteria
	 * @param {Function} [callback] function for async call (optional)
	 */
	function __Send(criteria, callback){

		if ((result = validator.apply('Send', arguments)) !== false)
			return result; 

		if (!criteria.MessageType)
			return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.missingMessageType);
			
		if (!/^(SMS|MMS)$/i.test(criteria.MessageType))
			return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.badMessageType);

		if (!criteria.To)
			return error(device.implementation.ERR_MISSING_ARGUMENT, msg.missingTo);
		
		// async call?
		if (typeof callback == 'function') {
			return context.callAsync(this, arguments.callee, criteria, callback);
		}

		context.notify(_t('%s:: Send : message sent!').arg(provider));

		// return success
		return error(device.implementation.ERR_SUCCESS);
	}
			

	/**
	 * Messaging: RegisterNotification
	 * @param {Object} criteria
	 * @param {function} callback function for async call (mandatory)
	 */
	function __RegisterNotification(criteria, callback){

		if ((result = validator.apply('RegisterNotification', arguments)) !== false)
			return result; 

		// callback is mandatory
		if (typeof callback != 'function')
			return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.badAsync);
		
		// continue validation after callback check		
		if (typeof criteria.Type == 'undefined') 
			return error(device.implementation.ERR_MISSING_ARGUMENT, msg.missingType);
		
		if (!/^NewMessage$/i.test(criteria.Type)) 
			return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.badType);

		var eventType =  'NewMessage';

		// check for multiple registration
		if (context.hasListener(provider, eventType))
			return error(device.implementation.ERR_ENTRY_EXISTS);
				
		// process notify
		return context.addListener(provider, eventType, criteria, callback, notifyHandler);
	}
			
	function notifyHandler(transactionID, criteria, callback, data){
		
		var result,
			eventCode = {completed:2, error:4, progress:9},
			code = eventCode.progress;
		try{
			DBase = context.getData(provider);
			
			// make new message
			var now = new Date();
			var message = {
			 	"MessageType": "SMS",
				"Sender": "0435445454",
				"Subject": "new message",
				"Time": _t("%s, %s").arg(now.toString().substr(0,3), now.toLocaleString()),
				"Priority": "Medium",
				"Attachment": false,
				"Unread": true,
				"MessageId": context.getUniqueID(),
				"BodyText": "My hovercraft is full of eels!"
			};
			
			// extend with optional data
			data = typeof data=='object' && !(data instanceof Array) ? data : {};
			var returnValue = context.extend(message, data);

			result = context.Result(returnValue);
			
			/// add to top of inbox
			DBase.Inbox.unshift(message);
		} 
		catch(e){
			code = eventCode.error;
		}
		callback(transactionID, code, result);
	}
	
	/**
	 * Messaging: CancelNotification
	 * @param {Object} criteria
	 */
	function __CancelNotification(criteria){

		if ((result = validator.apply('CancelNotification', arguments)) !== false)
			return result; 

		if (typeof criteria.Type == 'undefined') 
			return error(device.implementation.ERR_MISSING_ARGUMENT, msg.missingType);

		if (!/^NewMessage$/i.test(criteria.Type)) 
			return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.badType);

		var eventType = 'NewMessage';
		context.removeListener(provider, eventType);
		return context.ErrorResult(device.implementation.ERR_SUCCESS);
	}
			
			
	/**
	 * Messaging: ChangeStatus
	 * @param {Object} criteria
	 */
	function __ChangeStatus(criteria){

		if ((result = validator.apply('ChangeStatus', arguments)) !== false)
			return result; 

		if (!criteria.MessageId)
			return error(device.implementation.ERR_MISSING_ARGUMENT, msg.is_missing ,'MessageId');
			
		if (typeof criteria.MessageId != 'number')
			return error(device.implementation.ERR_BAD_ARGUMENT_TYPE, msg.badMessageIdType);
			
		if (!criteria.Status)
			return error(device.implementation.ERR_MISSING_ARGUMENT, msg.is_missing ,'Status');

		if (!/^(Read|Unread|Replied|Forwarded)$/i.test(criteria.Status))
			return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.badStatus);
	
		// check if a callback was provided
		if (arguments.length > 1)
			return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.badAsync2);
			
		DBase = context.getData(provider);

		var i,item, found = false;
		for (i in DBase.Inbox) {
			item = DBase.Inbox[i];
			if (criteria.MessageId == item.MessageId) {
				item.Unread = /Unread/i.test(criteria.Status);
				found = true;
			}
		}
		if (!found)
			return error(device.implementation.ERR_NOT_FOUND);

		// return success
		return error(device.implementation.ERR_SUCCESS);				
	}
						
	/**
	 * Messaging: Delete
	 * @param {Object} criteria
	 */
	function __Delete(criteria){
		
		if ((result = validator.apply('Delete', arguments)) !== false)
			return result; 

		if (typeof criteria.MessageId == 'undefined')
			return error(device.implementation.ERR_MISSING_ARGUMENT, msg.missingMessageId);

		if (typeof criteria.MessageId != 'number')
			return error(device.implementation.ERR_BAD_ARGUMENT_TYPE, msg.badMessageIdType);
					
		if (criteria.MessageId < 0)
			return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.badMessageId);
			
		DBase = context.getData(provider);

		var i,item, found = false;
		for (i in DBase.Inbox) {
			item = DBase.Inbox[i];
			if (criteria.MessageId == item.MessageId) {
				DBase.Inbox.splice(i, 1);
				found = true;
			}
		}
		if (!found)
			return error(device.implementation.ERR_NOT_FOUND);
			
		// return success
		return error(device.implementation.ERR_SUCCESS);				
	}
			

	/**
	 * Messaging: Cancel
	 * @param {Object} criteria
	 */
	function __Cancel(criteria){
		method = 'Cancel';
		if (!criteria || !criteria.TransactionID)
			return error(device.implementation.ERR_MISSING_ARGUMENT, msg.is_missing, 'TransactionID');
		
		clearTimeout(criteria.TransactionID);
		return context.ErrorResult(device.implementation.ERR_SUCCESS);
	}

	
	/*******************************
	 * helper functions
	 *******************************/
	
	function error(code, msg /*, args...*/){

		var args = ['Messaging',method].concat([].slice.call(arguments,2));
		msg = msg ? _t().arg.apply(msg,args) : undefined;
		return context.ErrorResult(code, msg);
	}

	/**
	 * validate common input arguments
	 * 'this' is string (object) name of calling function
	 * 
	 * @param {arguments} arguments of calling function
	 * @return {Result} Result object if error, false if no error.
	 */
	function validator() {
		method = ''+this;
		var	failed = false,
			criteria = arguments[0] || false;

		if (!criteria || typeof criteria != 'object')
			return error(device.implementation.ERR_MISSING_ARGUMENT, 
				method == 'Send' 
				? msg.missingMessageType 
				: (/ChangeStatus|Delete/.test(method) 
					? msg.missingMessageId 
					: msg.missingType) );
			
		return failed;
	}


	function findByKey(dbase, value, key){
		var result = [];
		for (var i in dbase) {
			if (value == dbase[i][key]) {
				result.push(dbase[i]);
			}
		}
		return result;
	}

	/** 
	 * error messages
	 * order of %s args: Service name, method name, parameter name 
	 */
	var msg = {
		missingType		: '%s:%s:Type Missing',
		badType			: '%s:%s:Type Value Incorrect',
		missingTo		: '%s:%s:To Missing',
		badTo			: '%s:%s:To Value Incorrect',
		missingMessageType	: '%s:%s:MessageType Missing',
		badMessageType	: '%s:%s:MessageType Value Incorrect',
		badAsync		: '%s:%s:Synchronous Operation not supported',
		badAsync2		: '%s:%s:Asynchronous Operation not supported',
		missingMessageId	: '%s:%s:MessageId Missing',
		badMessageIdType: '%s:%s:MessageId Type Invalid',
		badMessageId	: '%s:%s:MessageId Value Incorrect',
		badStatus		: '%s:%s:Status Value Incorrect',

		is_missing		: '%s:%s:%s Missing',
		is_invalid		: '%s:%s:%s Value Incorrect'
	};
		

}) ()

