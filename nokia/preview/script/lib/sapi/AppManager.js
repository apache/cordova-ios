/**
 * AppManager.js
 * 
 * Nokia Web Runtime Service API emulation 
 * WRT v1.1
 * 
 * Copyright 2009 Nokia Corporation. All rights reserved.
*/

 
(function(){
	
	var provider = 'Service.AppManager',
		Interface = 'IAppManager';

	/**
	 * AppManager service
	 */
	var AppManagerService = function(){
		this.GetList 	= __GetList;
		this.LaunchApp	= __LaunchApp;
		this.LaunchDoc	= __LaunchDoc;
		this.Cancel 	= __Cancel;
	}

	device.implementation.extend(provider, Interface, new AppManagerService() );


	/******************************************************/	
	/******************************************************/	
	/******************************************************/	

	var	context = device.implementation.context,
		_t = context._t,
		method = '',
		result = false,
		DBase = null;
	
	/**
	 * AppManager: GetList
	 * @param {Object} criteria
	 */
	function __GetList(criteria){
		if ((result = validator.apply('GetList', arguments)) !== false)
			return result; 

		if (typeof criteria.Type == 'undefined') 
			return error(device.implementation.ERR_MISSING_ARGUMENT, msg.missingType);

		if (!/^(Application|UserInstalledPackage)$/i.test(criteria.Type)) 
			return error(device.implementation.ERR_BAD_ARGUMENT_TYPE);
		
		// check if a callback was provided
		if (arguments.length > 1)
			return error(device.implementation.ERR_SERVICE_NOT_SUPPORTED, msg.badAsync);
		
		var returnValue,
			filter = criteria.Filter || null;
 
		DBase = context.getData(provider);

		if (criteria.Filter)
			context.notify(_t('%s:: GetList : filter not implemented in preview').arg(provider));

		// Type = UserInstalledPackage
		if (!/UserInstalledPackage/i.test(criteria.Type)){

			returnValue = context.Iterator( DBase[criteria.Type] || [] );

		} else {
		// Type = Application
			// @todo: apply filter criteria
			
			returnValue = context.Iterator( DBase[criteria.Type] || [] );
		}

		return context.Result(returnValue);
	}
			
	/**
	 * AppManager: LaunchApp
	 * @param {Object} criteria
	 * @param {function} callback function for async call (optional)
	 */
	function __LaunchApp(criteria, callback){

		if ((result = validator.apply('LaunchApp', arguments)) !== false)
			return result; 
		
		if (typeof criteria.ApplicationID == 'undefined')
			return error(device.implementation.ERR_MISSING_ARGUMENT, msg.missingAppID);

		// app id must be in the form "s60uid://<appid>" where <appid> is 
		// what is returned by GetList.
		var appId = criteria.ApplicationID;
		
		if (!/^s60uid:\/\/0x/i.test(appId))
			return error(device.implementation.ERR_BAD_ARGUMENT_TYPE);
	
		if (criteria.CmdLind)
			context.notify(_t('%s:: LaunchApp : CmdLine not implemented in preview').arg(provider));

		if (criteria.Options)
			context.notify(_t('%s:: LaunchApp : Options not implemented in preview').arg(provider));


		if (typeof callback == 'function') {
			return context.callAsync(this, arguments.callee, criteria, callback);
		}

		appId = appId.replace(/^s60uid:\/\//i, '');	
		DBase = context.getData(provider);

		for(var type in DBase){
			for(var i in DBase[type]) {
				var item = DBase[type][i];
				if (item.Uid == appId) {
					// found!
					context.notify(_t('%s:: LaunchApp : application found & launched : id=%s').arg(provider, appId));
					return context.ErrorResult(device.implementation.ERR_SUCCESS);
				}
			}
		}
		// if not found
		return error(device.implementation.ERR_BAD_ARGUMENT_TYPE);
	}
			
	/**
	 * AppManager: LaunchDoc
	 * @param {Object} criteria
	 * @param {function} callback function for async call (optional)
	 */
	function __LaunchDoc(criteria, callback){

		if ((result = validator.apply('LaunchDoc', arguments)) !== false)
			return result; 

		if (typeof criteria.Document == 'undefined' && typeof criteria.MimeType == 'undefined')
			return error(device.implementation.ERR_MISSING_ARGUMENT, msg.missingDoc);

		if (typeof criteria.Document != 'undefined' && !criteria.Document.DocumentPath)
			return error(device.implementation.ERR_BAD_ARGUMENT_TYPE);

		if (criteria.Options)
			context.notify(_t('%s:: LaunchDoc : Options not implemented in preview').arg(provider));

		if (typeof callback == 'function') {
			return context.callAsync(this, arguments.callee, criteria, callback);
		}

		// nothing to launch in emulation, just notify user
		context.notify(_t('%s:: LaunchDoc : document launched').arg(provider));
		
		if (criteria.Document)
			// return success
			return context.ErrorResult(device.implementation.ERR_SUCCESS);
		else
			// for mimetype, return value name of document
			return context.Result('', device.implementation.ERR_SUCCESS);
	}

	

	/**
	 * AppManager: Cancel
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

		var args = ['AppManager',method].concat([].slice.call(arguments,2));
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
			return error(device.implementation.ERR_MISSING_ARGUMENT, msg.missingType);

		return failed;
	}

	/** 
	 * error messages
	 * order of %s args: Service name, method name, parameter name 
	 */
	var msg = {
		missingType		: '%s:%s:Content Type Missing',
		badAsync		: 'AppManger:GetList:Asynchronous version of API is not supported',	// typo on device!
		missingAppID	: '%s:%s:Application ID  Missing',	// double space between ID & missing!!
		missingDoc		: '%s:%s:Document/MimeType Missing/value more than expected length ',
		missingTID		: '%s:Incorrect TransactionID',
		is_invalid		: '%s:%s:%s is invalid'
	};
		

}) ()

