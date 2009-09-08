/**
 * Contact.js
 * 
 * Nokia Web Runtime Service API emulation 
 * WRT v1.1
 * 
 * Copyright 2009 Nokia Corporation. All rights reserved.
*/

 
(function(){
	
	var provider = 'Service.Contact' ,
		Interface = 'IDataSource';

	/**
	 * Contact service
	 */
	var ContactService = function(){
		this.GetList 	= __GetList;
		this.Add 		= __Add;
		this.Delete 	= __Delete;
		this.Import 	= __Import;
		this.Export 	= __Export;
		this.Organise	= __Organise;
		this.Cancel 	= __Cancel;
	}

	device.implementation.extend(provider, Interface, new ContactService() );


	/******************************************************/	
	/******************************************************/	
	/******************************************************/	

	var	context = device.implementation.context,
		_t = context._t,
		method = '',
		result = false,
		DBase = null;
	
	/**
	 * Contact: GetList
	 * @param {Object} criteria
	 * @param {Function} [callback] function for async call (optional)
	 */
	function __GetList(criteria, callback){

		if ((result = validator.apply('GetList', arguments)) !== false)
			return result; 
	
		if (!/^(Contact|Group|Database)$/i.test(criteria.Type))
			return error(device.implementation.ERR_BAD_ARGUMENT_TYPE, msg.badType);
	
		if (typeof callback == 'function') {
			return context.callAsync(this, arguments.callee, criteria, callback);
		}

		var returnValue = [], 
			match = null,
			filter = criteria.Filter || null;
 
		DBase = context.getData(provider);

		// Type = Database
		if (/Database/i.test(criteria.Type)){
			returnValue = DBase.Database;
		} 
		// Type = Group
		else if (/Group/i.test(criteria.Type)){
			// filter by id
			if (filter && filter.id) {
				returnValue = findById(DBase.Group, filter.id);
				if (returnValue.length == 0)
					return error(device.implementation.ERR_NOT_FOUND);
			}
			// return all groups 
			else {
				returnValue = DBase.Group;
			}
		}				
		// Type = Contact
		else if (/Contact/i.test(criteria.Type)){

			// filter by id
			if (filter && filter.id) {
				returnValue = findById(DBase.Contact, filter.id); 
				if (returnValue.length == 0)
					return error(device.implementation.ERR_NOT_FOUND);
			}
			// return all contacts 
			else {
				returnValue = DBase.Contact;
			}

			// unsupported filters 
			if (filter 
				&& (match = context.keys(filter).join().match(/SearchVal|DBUri/ig)) ) {
				context.notify(_t('%s:: GetList : filter %s not implemented in preview').arg(provider, match.join()));
			}
			// unsupported sort			
			if (criteria.Sort) { 
				context.notify(_t('%s:: GetList : sort not implemented in preview').arg(provider));
			}
		}
		return context.Result(context.Iterator(returnValue));
	}
			
	/**
	 * Contact: Add
	 * @param {Object} criteria
	 * @param {Function} [callback] function for async call (optional)
	 */
	function __Add(criteria, callback){

		if ((result = validator.apply('Add', arguments)) !== false)
			return result; 
		
		if (!/^(Contact|Group)$/i.test(criteria.Type))
			return error(device.implementation.ERR_BAD_ARGUMENT_TYPE, msg.badType2);

		if (typeof callback == 'function') {
			return context.callAsync(this, arguments.callee, criteria, callback);
		}

		DBase = context.getData(provider);
		var Data = criteria.Data,
			item;

		// unsupported!			
		if (Data.DBUri) {
			context.notify(_t('%s:: Add : Data.DBUri not implemented in preview').arg(provider));
		}

		// Type = Group
		if (/Group/i.test(criteria.Type)){

			if (!Data.GroupLabel)
				return error(device.implementation.ERR_BAD_ARGUMENT_TYPE, msg.missingGroupLabel);

			// update
			if (Data.id) {
				returnValue = findById(DBase.Group, Data.id); 
				if (returnValue.length == 0)
					return error(device.implementation.ERR_BAD_ARGUMENT_TYPE);
				
				returnValue[0].GroupLabel = Data.GroupLabel;
				//@todo: group contents!?
			}
			// new
			else {
				item = context.extend({}, Data); 
				item.id = String(context.getUniqueID());
				DBase.Group.push(item);
			}
		} 
		// Type = Contact
		else {
			// update
			if (Data.id) {
				returnValue = findById(DBase.Contact, Data.id); 
				if (returnValue.length == 0)
					return error(device.implementation.ERR_BAD_ARGUMENT_TYPE);
				
				context.extend(returnValue[0], Data); 
			}
			// new
			else {
				item = context.extend({}, Data); 
				item.id = String(context.getUniqueID());
				DBase.Contact.push(item);
			}
		} 
		// return success
		return error(device.implementation.ERR_SUCCESS);
	}
			

	/**
	 * Contact: Delete
	 * @param {Object} criteria
	 * @param {Function} [callback] function for async call (optional)
	 */
	function __Delete(criteria, callback){
		
		if ((result = validator.apply('Delete', arguments)) !== false)
			return result; 

		if (!/^(Contact|Group)$/i.test(criteria.Type))
			return error(device.implementation.ERR_BAD_ARGUMENT_TYPE, msg.badType2);

		var Data = criteria.Data;
		if (!Data.IdList)
			return error(device.implementation.ERR_MISSING_ARGUMENT, msg.missingIdList);
		if (typeof Data.IdList != 'object')
			return error(device.implementation.ERR_BAD_ARGUMENT_TYPE, msg.badIdList);
		
		DBase = context.getData(provider);
		var type = criteria.Type;

		// unsupported!			
		if (Data.DBUri) {
			context.notify(_t('%s:: Delete : Data.DBUri not implemented in preview').arg(provider));
		}

		if (typeof callback == 'function') {
			return context.callAsync(this, arguments.callee, criteria, callback);
		}

		// for both Group & Contact:
		var i,j,id,item;
		for (j in Data.IdList) {
			id = Data.IdList[j];
			for (i in DBase[type]) {
				item = DBase[type][i];
				if (id == item.id) {
					DBase[type].splice(i, 1);
				}
			}
		}
		// return success
		return error(device.implementation.ERR_SUCCESS);				
	}
			

	/**
	 * Contact: Import
	 * @param {Object} criteria
	 * @param {Function} [callback] function for async call (optional)
	 */
	function __Import(criteria, callback){

		if ((result = validator.apply('Import', arguments)) !== false)
			return result; 

		if (!/^(Contact)$/i.test(criteria.Type))
			return error(device.implementation.ERR_BAD_ARGUMENT_TYPE, msg.badType3);

		var Data = criteria.Data;
		if (!Data.SourceFile)
			return error(device.implementation.ERR_MISSING_ARGUMENT, msg.missingSourceFile);

		if (typeof callback == 'function') {
			return context.callAsync(this, arguments.callee, criteria, callback);
		}

		context.notify(_t('%s:: Import : not implemented in preview.').arg(provider));
		return error(device.implementation.ERR_SUCCESS);		
	}
			

	/**
	 * Contact: Export
	 * @param {Object} criteria
	 * @param {Function} [callback] function for async call (optional)
	 */
	function __Export(criteria, callback){

		if ((result = validator.apply('Export', arguments)) !== false)
			return result; 

		if (!/^(Contact)$/i.test(criteria.Type))
			return error(device.implementation.ERR_BAD_ARGUMENT_TYPE, msg.badType4);

		var Data = criteria.Data;
		if (!Data.DestinationFile)
			return error(device.implementation.ERR_MISSING_ARGUMENT, msg.missingDestinationFile);

		if (!Data.id)
			return error(device.implementation.ERR_MISSING_ARGUMENT, msg.missingId);

		if (typeof callback == 'function') {
			return context.callAsync(this, arguments.callee, criteria, callback);
		}

		context.notify(_t('%s:: Export : not implemented in preview.').arg(provider));
		return error(device.implementation.ERR_SUCCESS);		
	}
			

	/**
	 * Contact: Organise
	 * @param {Object} criteria
	 * @param {Function} [callback] function for async call (optional)
	 */
	function __Organise(criteria, callback){

		if ((result = validator.apply('Organise', arguments)) !== false)
			return result; 

		if (!/^(Group)$/i.test(criteria.Type))
			return error(device.implementation.ERR_MISSING_ARGUMENT, msg.badType5);

		var Data = criteria.Data;
		if (!Data.id)
			return error(device.implementation.ERR_MISSING_ARGUMENT, msg.missingId2);

		if (!Data.IdList)
			return error(device.implementation.ERR_MISSING_ARGUMENT, msg.missingIdList);

		if (typeof Data.IdList != 'object')
			return error(device.implementation.ERR_BAD_ARGUMENT_TYPE, msg.badIdList);

		if (!/^(Associate|Disassociate)$/i.test(criteria.OperationType))
			return error(device.implementation.ERR_BAD_ARGUMENT_TYPE, msg.badOperationType);

		if (typeof callback == 'function') {
			return context.callAsync(this, arguments.callee, criteria, callback);
		}

		context.notify(_t('%s:: Organise : not implemented in preview.').arg(provider));
		return error(device.implementation.ERR_SUCCESS);		
	}
			

	/**
	 * Contact: Cancel
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

		var args = ['Contacts',method].concat([].slice.call(arguments,2));
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
			
		if (!criteria || typeof criteria != 'object' || typeof criteria.Type == 'undefined')
			return error(device.implementation.ERR_MISSING_ARGUMENT, msg.missingType, method);

		if (method == 'GetList') return failed;

		var Data = criteria.Data || false; 
		if (!Data)
			return error(device.implementation.ERR_MISSING_ARGUMENT, msg.missingData, method);
		if (typeof Data != 'object')
			return error(device.implementation.ERR_MISSING_ARGUMENT, msg.badData);
		 
		return failed;
	}


	function findById(dbase, id){
		var result = [];
		for (var i in dbase) {
			if (id == dbase[i]['id']) {
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
		missingType		: '%s : %s : Type is Missing',
		badType			: '%s: %s : Invalid value for Type, Must be Contact/Group/Database',
		badType2		: '%s : %s : Invalid Type, must be Contact/Group',
		badType3		: '%s : %s : Invalid Type,it must be Contact',
		badType4		: '%s : %s : Invalid Type, it must be Contact',
		badType5		: '%s : %s : Invalid Content Type, It must be Group',
		badOperationType: '%s : %s : Invalid Operation Type',
		missingGroupLabel: '%s : %s : Group Label is Missing',
		missingTID 		: 'Contact : Cancel : TransactionID is missing',	// not 'Contacts'!!
		badAsync		: '%s : %s : Invalid async parameters',
		missingData		: '%s : %s : %s data Missing',
		badData			: '%s : %s : Invalid Type of Data , Map is required',
		missingIdList	: '%s : %s : List of Ids is missing',
		badIdList		: '%s : %s : Type of IdList is wrong, List is required',
		missingSourceFile: '%s : %s : Import Source Filename is Missing',
		missingDestinationFile: '%s : %s : Export Destination Filename is Missing',
		missingId		: '%s : %s : Contact Id to be exported is missing',
		missingId2		: '%s : %s : GroupId is missing',
		is_missing		: '%s : %s : %s is missing',
		is_invalid		: '%s : %s : %s is invalid'
	};
		

}) ()

