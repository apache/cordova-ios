/**
 * MediaManagement.js
 * 
 * Nokia Web Runtime Service API emulation 
 * WRT v1.1
 * 
 * Copyright 2009 Nokia Corporation. All rights reserved.
*/

 
(function(){
	
	var provider = 'Service.MediaManagement' ,
		Interface = 'IDataSource';

	/**
	 * MediaManagement service
	 */
	var MediaManagementService = function(){
		this.GetList 	= __GetList;
		this.Cancel 	= __Cancel;
	}

	device.implementation.extend(provider, Interface, new MediaManagementService() );


	/******************************************************/	
	/******************************************************/	
	/******************************************************/	

	var	context = device.implementation.context,
		_t = context._t,
		method = '',
		result = false,
		DBase = null;
	
	/**
	 * MediaManagement: GetList
	 * @param {Object} criteria
	 * @param {Function} callback function for async call (mandatory)
	 */
	function __GetList(criteria, callback, _flag){

		if ((result = validator.apply('GetList', arguments)) !== false)
			return result; 

		// _flag=true indicates re-called state
		_flag = _flag || false;
		if (!_flag) {

			// callback is mandatory
			if (typeof callback != 'function')
				return error(device.implementation.ERR_MISSING_ARGUMENT, msg.badAsync);
			
			// continue validation after callback check		
			if (!criteria.Filter) 
				return error(device.implementation.ERR_MISSING_ARGUMENT, msg.is_missing, 'Filter');
			
			if (!criteria.Filter.FileType) 
				return error(device.implementation.ERR_MISSING_ARGUMENT, msg.is_missing, 'FileType');
			
			if (!/^(Music|Sound|Image|Video|StreamingURL)$/i.test(criteria.Filter.FileType)) 
				return error(device.implementation.ERR_BAD_ARGUMENT_TYPE);
			
			// process callback
			_flag = true;
			return context.callAsync(this, arguments.callee, criteria, callback, _flag);
		}
		
		var returnValue = [], 
			match = null,
			fileType = criteria.Filter.FileType,
			filter = criteria.Filter;
 
 		// normalize filetype
		fileType = fileType[0].toUpperCase() + fileType.substr(1).toLowerCase();
		fileType = fileType.replace(/url/i, 'URL');
		
		DBase = context.getData(provider);

		// unsupported filters 
		if (filter 
			&& (match = context.keys(filter).join().match(/Key|StartRange|EndRange/ig)) ) {
			context.notify(_t('%s:: GetList : filter %s not implemented in preview').arg(provider, match.join()));
		}
		// unsupported sort			
		if (criteria.Sort) { 
			context.notify(_t('%s:: GetList : sort not implemented in preview').arg(provider));
		}

		returnValue = DBase[fileType];
		return context.Result(context.Iterator(returnValue));
	}
			
			
	/**
	 * MediaManagement: Cancel
	 * @param {Object} criteria
	 */
	function __Cancel(criteria){
		method = 'Cancel';
		if (!criteria || !criteria.TransactionID)
			return error(device.implementation.ERR_MISSING_ARGUMENT, msg.missingTID);
		
		clearTimeout(criteria.TransactionID);
		return context.ErrorResult(device.implementation.ERR_SUCCESS);
	}


	
	/*******************************
	 * helper functions
	 *******************************/
	
	function error(code, msg /*, args...*/){

		var args = ['MediaMgmt',method].concat([].slice.call(arguments,2));
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
			return error(device.implementation.ERR_MISSING_ARGUMENT, msg.is_missing, 'Type');
		
		if (!/^FileInfo$/i.test(criteria.Type)) 
			return error(device.implementation.ERR_SERVICE_NOT_SUPPORTED, msg.badType);

		return failed;
	}

	/** 
	 * error messages
	 * order of %s args: Service name, method name, parameter name 
	 */
	var msg = {
		badType			: '%s : %s : Type not supported',
		missingTID 		: '%s : %s : TransactionID is missing',
		badAsync		: '%s : %s : Insufficient arguments for async request',
		is_missing		: '%s : %s : %s is missing',
		is_invalid		: '%s : %s : %s is invalid'
	};
		

}) ()

