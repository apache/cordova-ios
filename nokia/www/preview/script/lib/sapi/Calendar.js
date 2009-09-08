/**
 * Calendar.js
 * 
 * Nokia Web Runtime Service API emulation 
 * WRT v1.1
 * 
 * Copyright 2009 Nokia Corporation. All rights reserved.
*/

 
(function(){
	
	var provider = 'Service.Calendar' ,
		Interface = 'IDataSource';

	/**
	 * Calendar service
	 */
	var CalendarService = function(){
		this.GetList 	= __GetList;
		this.Add 		= __Add;
		this.Delete 	= __Delete;
		this.Import 	= __Import;
		this.Export 	= __Export;
		this.Cancel 	= __Cancel;
		this.RequestNotification = __RequestNotification;
	}

	device.implementation.extend(provider, Interface, new CalendarService() );


	/******************************************************/	
	/******************************************************/	
	/******************************************************/	

	var	context = device.implementation.context,
		_t = context._t,
		method = '',
		result = false,
		DBase = null,
		default_calendar = 'C:Calendar';
	
	/**
	 * Calendar: GetList
	 * @param {Object} criteria
	 */
	function __GetList(criteria){
		if ((result = validator.apply('GetList', arguments)) !== false)
			return result; 

		var returnValue = [], 
			match = null,
			filter = criteria.Filter || null;
 
		DBase = context.getData(provider);

		// Type = Calendar
		if (!/CalendarEntry/i.test(criteria.Type)){
			var cals = [default_calendar];
			if (filter && filter.DefaultCalendar === false)
				cals = context.keys(DBase)

			returnValue = cals;

		} else {
		// Type = CalendarEntry
			var cal = default_calendar;
			if (filter && filter.CalendarName)
				cal = filter.CalendarName;
			
			if (!(cal in DBase))
				return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.badCalendar);

			// filter by id or LocalId
			if (filter && (filter.id || filter.LocalId)) {
				var which = filter.id ? 'id' : 'LocalId', 
					id = filter[which];
					
				for (var i in DBase[cal]) {
					if (id == DBase[cal][i][which]) {
						returnValue.push(DBase[cal][i]);
					}
				}
			}
			// filter by type 
			else if (filter && filter.Type && !/IncludeAll/i.test(filter.Type)) {
				for (var i in DBase[cal]) {
					// match on type is case insensitive
					if (filter.Type.toLowerCase() == DBase[cal][i].Type.toLowerCase()) {
						returnValue.push(DBase[cal][i]);
					}
				}
			}
			// unsupported filters 
			else if (filter 
				&& (match = context.keys(filter).join().match(/StartRange|EndRange|SearchText/ig)) ) {
				context.notify(_t('%s:: GetList : filter %s not implemented in preview').arg(provider, match.join()));
			}
			// return everything 
			else {
				returnValue = DBase[cal];
			}
		}

		return context.Result(context.Iterator(returnValue));
	}
			
	/**
	 * Calendar: Add
	 * @param {Object} criteria
	 */
	function __Add(criteria){
		if ((result = validator.apply('Add', arguments)) !== false)
			return result; 
		
		var Item = criteria.Item || false; 
		
		DBase = context.getData(provider);

		// Type = Calendar
		if (!/CalendarEntry/i.test(criteria.Type)){

			if (!Item || !Item.CalendarName)
				return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.missingCalendar);
				
			var cal = Item.CalendarName;
			if (cal in DBase) {
				return error(device.implementation.ERR_ENTRY_EXISTS);
			}

			// @todo: validate calendar name <drive>:<name>
			// return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.badCalendar);
			
			// create new calendar
			device.implementation.loadData(provider, cal, []);
			return error(device.implementation.ERR_SUCCESS);

		} else {
		// Type = CalendarEntry

			if (!Item)
				return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.is_missing, 'Item');
				
			var cal = Item.CalendarName || default_calendar;

			// if calendar doesn't exist and it's the default, create it
			if (!(cal in DBase) && cal == default_calendar)
				device.implementation.loadData(provider, cal, []);
			
			if (!(cal in DBase))
				return error(device.implementation.ERR_NOT_FOUND);

			// update existing item?
			if ('LocalId' in Item) {
				
				if (!Item.LocalId && Item.LocalId !== 0)
					return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.is_invalid, 'LocalId');
				
				if ('InstanceStartTime' in Item)
					context.notify(_t('%s:: Add : InstanceStartTime not implemented in preview.').arg(provider));

				// can't update id
				delete Item.id;
				
				//  search for and update item
				var found = false;
				for (var i in DBase[cal]) {
					var entry = DBase[cal][i];
					if (entry.LocalId == Item.LocalId) {
						context.extend(entry, Item);
						Item.id = entry.id;
						found = true;
						break;
					}
				}
				if (!found)
					return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.is_invalid, 'LocalId');

			} else {
			// add new item
				// generate new id and localId 
				// -- in calendar id's are string!
				Item.id = String(context.getUniqueID());
				Item.LocalId = String(context.getUniqueID());
				DBase[cal].push(Item);
			} 
		} 
		// return success
		return context.Result(Item.id, device.implementation.ERR_SUCCESS);
	}
			

	/**
	 * Calendar: Delete
	 * @param {Object} criteria
	 * @param {function} callback function for async call (optional - valid only for CalendarEntry)
	 */
	function __Delete(criteria, callback){
		
		if ((result = validator.apply('Delete', arguments)) !== false)
			return result; 

		var Data = criteria.Data || false; 
		if (!Data || typeof Data != 'object')
			return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.is_invalid, 'Data');
		
		// only sync call supported for Calendar
		if (!/CalendarEntry/i.test(criteria.Type) && typeof callback == 'function')
			return error(device.implementation.ERR_SERVICE_NOT_SUPPORTED, msg.noAsync);

		DBase = context.getData(provider);
		var cal = Data.CalendarName || default_calendar;			
		if (!(cal in DBase))
			return error(device.implementation.ERR_NOT_FOUND);
		
		// Type = Calendar
		if (!/CalendarEntry/i.test(criteria.Type)) {
			// CalendarName is mandatory
			if (!Data.CalendarName)
				return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.is_missing, 'CalendarName');
						
			DBase[cal] = null;
			delete DBase[cal];
		}
		else {
		// Type = CalendarEntry

			if (!context.keys(Data).join().match(/IdList|LocalIdList|DeleteAll|StartRange|EndRange/ig))
				return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.is_missing, 'Data');

			if (typeof callback == 'function') {
				return context.callAsync(this, arguments.callee, criteria, callback);
			}

			var which = Data.IdList ? 'IdList' : 'LocalIdList',
				idList = Data[which] || false;
				
			if (idList) {
				//  search for and delete items
				for (var id in idList) {
					id = idList[id];
					for (var i in DBase[cal]) {
						if (id == DBase[cal][i][which]) {
							DBase[cal].splice(i, 1);
						}
					}
				}
			}
			else if (Data.DeleteAll && Data.DeleteAll === true){
				delete DBase[cal];
				DBase[cal] = [];
			}

			if (Data.StartRange || Data.EndRange) {
				context.notify(_t('%s:: Delete : StartRange / EndRange not implemented in preview.').arg(provider));
			}
		}
		// return success
		return context.ErrorResult(device.implementation.ERR_SUCCESS);				
	}
			

	/**
	 * Calendar: Import
	 * @param {Object} criteria
	 * @param {function} callback function for async call (optional)
	 */
	function __Import(criteria, callback){

		if ((result = validator.apply('Import', arguments)) !== false)
			return result; 

		var Data = criteria.Data || false; 
		if (!Data)
			return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.is_invalid, 'Data');
		
		if (!Data.FileName)
			return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.is_invalid, 'FileName');

		if (!Data.Format)
			return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.is_invalid, 'Format');

		if (typeof callback == 'function') {
			return context.callAsync(this, arguments.callee, criteria, callback);
		}

		context.notify(_t('%s:: Import : not implemented in preview.').arg(provider));
		var returnValue = context.Iterator([]);
		return context.Result(returnValue, device.implementation.ERR_SUCCESS);		
	}
			

	/**
	 * Calendar: Export
	 * @param {Object} criteria
	 * @param {function} callback function for async call (optional)
	 */
	function __Export(criteria, callback){

		if ((result = validator.apply('Export', arguments)) !== false)
			return result; 

		var Data = criteria.Data || false; 
		if (!Data)
			return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.is_invalid, 'Data');

		if (!Data.Format)
			return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.is_invalid, 'Format');

		if (typeof callback == 'function') {
			return context.callAsync(this, arguments.callee, criteria, callback);
		}
		context.notify(_t('%s:: Export : not implemented in preview.').arg(provider));
		var returnValue = '';
		return context.Result(returnValue, device.implementation.ERR_SUCCESS);		
	}
			

	/**
	 * Calendar: RequestNotification
	 * @param {Object} criteria
	 * @param {function} callback function for async call 
	 */
	function __RequestNotification(criteria, callback){

		if ((result = validator.apply('RequestNotification', arguments)) !== false)
			return result; 

		if (typeof callback != 'function')
			return error(device.implementation.ERR_SERVICE_NOT_SUPPORTED, msg.badAsync);

		context.notify(_t('%s:: RequestNotification : not implemented in preview.').arg(provider));
		var result = context.ErrorResult(device.implementation.ERR_SUCCESS);
		result.TransactionID = 0;
		return result;		
	}
			

	/**
	 * Calendar: Cancel
	 * @param {Object} criteria
	 */
	function __Cancel(criteria){
		method = 'Cancel';
		if (!criteria || !criteria.TransactionID)
			return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.missingTID);
		
		clearTimeout(criteria.TransactionID);
		return context.ErrorResult(device.implementation.ERR_SUCCESS);
	}


	
	/*******************************
	 * helper functions
	 *******************************/
	
	function error(code, msg /*, args...*/){

		var args = ['Calendar',method].concat([].slice.call(arguments,2));
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
			
		if (!criteria)
			return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.badType);
			
		if (typeof criteria != 'object' || typeof criteria.Type == 'undefined')
			return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.badType);
		
		var TypeRE = /Import|Export|RequestNotification/i.test(method)
			? /^CalendarEntry$/i
			: /^(Calendar|CalendarEntry)$/i;
		 
		if (!TypeRE.test(criteria.Type)) 
			return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.badType);
		
		return failed;
	}

	/** 
	 * error messages
	 * order of %s args: Service name, method name, parameter name 
	 */
	var msg = {
		badType			: '%s : %s : Type is invalid',
		badCalendar		: '%s : %s : CalendarName is invalid',
		missingCalendar	: '%s : %s : CalendarName is missing',
		missingTID 		: '%s : %s : TransactionID is missing',
		badAsync		: '%s : %s : Invalid async parameters',
		noAsync			: '%s : %s : Async not supported',
		is_missing		: '%s : %s : %s is missing',
		is_invalid		: '%s : %s : %s is invalid'
	};
		

}) ();

