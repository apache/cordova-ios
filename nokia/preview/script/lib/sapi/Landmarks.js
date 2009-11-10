/**
 * Landmarks.js
 * 
 * Nokia Web Runtime Service API emulation 
 * WRT v1.1
 * 
 * Copyright 2009 Nokia Corporation. All rights reserved.
*/

 
(function(){
	
	var provider = 'Service.Landmarks',
		Interface = 'IDataSource';

	/**
	 * Landmark service
	 */
	var LandmarkService = function(){
		this.New 		= __New;
		this.GetList 	= __GetList;
		this.Add		= __Add;
		this.Delete		= __Delete;		
		this.Import 	= __Import;
		this.Export		= __Export;
		this.Organise	= __Organise;
		this.Cancel		= __Cancel;				
	}

	device.implementation.extend(provider, Interface, new LandmarkService() );


	/******************************************************/	
	/******************************************************/	
	/******************************************************/	

	var	context = device.implementation.context,
		_t = context._t,
		method = '',
		result = false,
		DBase = null;

	/**
	 * Landmarks: New
	 * @param {Object} criteria
	 */
	function __New(criteria){
		if ((result = validator.apply('New', arguments)) !== false)
			return result; 

		if (typeof criteria.Type == 'undefined') 
			return error(device.implementation.ERR_MISSING_ARGUMENT, msg.missingType);

		if (!/^(Landmark|Category)$/i.test(criteria.Type)) 
			return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.badType);		
		
		var returnValue;
		
		if(criteria.Type == 'Landmark')
		{
			returnValue = {
				'LandmarkName'		: '',
				'id' 				: '',
				'CategoryInfo'		: '',
				'LandmarkDesc'		: '',
				'LandmarkPosition'	: {
										'Latitude'	: '',
										'Longitude' : '',
										'Altitude' 	: '',
										'HAccuracy' : '',
										'VAccuracy' : '',
										'VAccuracy' : ''
									  },
				'CoverageRadius'	: '',
				'IconFile'			: '',
				'IconIndex'			: '',
				'IconMaskIndex'		: '',
				'LandmarkFields'	: {
										'Street'		: '',
										'BuildingName'	: '',
										'District'		: '',
										'City'			: '',
										'AreaCode'		: '',
										'Telephone'		: '',
										'Country'		: ''
									  }
			};
		}
		else //Category
		{
			returnValue = {
				'CategoryName'	: '',
				'id' 			: '',
				'GlobalId'		: '',
				'IconFile'		: '',
				'IconIndex'		: '',
				'IconMaskIndex'	: ''
			};
		}

		return context.Result(returnValue);
	}
	
	/**
	 * Landmarks: GetList
	 * @param {Object} criteria
	 * @param {Function} [callback] function for async call (optional)
	 */
	function __GetList(criteria, callback){
		
		if ((result = validator.apply('GetList', arguments)) !== false)
			return result; 

		if (typeof criteria.Type == 'undefined') 
			return error(device.implementation.ERR_MISSING_ARGUMENT, msg.missingType);

		if (!/^(Landmark|Category|Database)$/i.test(criteria.Type)) 
			return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.badType);

		if (criteria.Filter)
			context.notify(_t('%s:: GetList : filter not implemented in preview').arg(provider));

 		if(criteria.Sort)
			context.notify(_t('%s:: GetList : Sort is not implemented in preview').arg(provider));

		if (typeof callback == 'function') {
			return context.callAsync(this, arguments.callee, criteria, callback);
		}
		
		var returnValue = [], 
			match = null,
			filter = criteria.Filter || null;
 
		DBase = context.getData(provider);


		if (/Database/i.test(criteria.Type)) {				// Type = Database
			
			returnValue = context.Iterator( DBase.Database || [] );
			
		} else if (/Landmark/i.test(criteria.Type)){ 		// Type = Landmark
			
			returnValue = context.Iterator( DBase[criteria.Type] || [] );
			
		} else {											// Type = Category
		
			// @todo: apply filter criteria
			returnValue = context.Iterator( DBase[criteria.Type] || [] );
		}
		return context.Result(returnValue);
	}

	/**
	 * Landmarks: Add
	 * @param {Object} criteria
	 */
	function __Add(criteria){
		
		if ((result = validator.apply('Add', arguments)) !== false)
			return result; 

		if (!/^(Landmark|Category)$/i.test(criteria.Type))
			return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.badType);


		var Data = criteria.Data || false; 
		if(!Data){
			return error(device.implementation.ERR_MISSING_ARGUMENT, msg.missingData);
		}

		DBase = context.getData(provider);
		
		// unsupported!			
		if (Data.DatabaseURI) {
			context.notify(_t('%s:: Add : Data.DatabaseURI not implemented in preview').arg(provider));
		}
		
		var item;
		
		// Type = Landmark
		if (/Landmark/i.test(criteria.Type)){

			 if (!Data.LandmarkName)
				Data.LandmarkName="";
			
			var landmarkPos = Data.LandmarkPosition;
			if (typeof landmarkPos != 'undefined') {
				if ((typeof landmarkPos.Latitude == 'undefined' || typeof landmarkPos.Latitude != 'number') &&
					(typeof landmarkPos.Longitude == 'undefined' || typeof landmarkPos.Longitude != 'number') &&
					(typeof landmarkPos.Altitude == 'undefined' || typeof landmarkPos.Altitude != 'number') &&
					(typeof landmarkPos.HAccuracy == 'undefined' || typeof landmarkPos.HAccuracy != 'number') &&
					(typeof landmarkPos.VAccuracy == 'undefined' || typeof landmarkPos.VAccuracy != 'number')) {
						
						return error(device.implementation.ERR_BAD_ARGUMENT_TYPE, msg.badType);
				}
			}
			// update
			if (typeof Data.id != 'undefined') {
				if(typeof Data.id != 'string')
						return error(device.implementation.ERR_BAD_ARGUMENT_TYPE, msg.invalidId);
				
				var retIndex = findById(DBase.Landmark, Data.id); 
				if (retIndex == -1)
					return error(device.implementation.ERR_NOT_FOUND);
				DBase.Landmark[retIndex] = Data;
				item = Data;
			}
			// new
			else {
				item = context.extend({}, Data); 
				item.id = String(context.getUniqueID());
				DBase.Landmark.push(item);
			}
		} else { // Type = Category
//			alert(typeof Data.CategoryName);

			//alert("Data.id : "+Data.id);
			// update
			if (typeof Data.id != 'undefined') {
				if(typeof Data.id != 'string')
						return error(device.implementation.ERR_BAD_ARGUMENT_TYPE, msg.invalidId);
	
				var retIndex = findById(DBase.Category, Data.id); 
				if (retIndex == -1)
					return error(device.implementation.ERR_NOT_FOUND);

				DBase.Category[retIndex] = Data;					
				item = Data;
			}
			// new
			else {
				if (typeof Data.CategoryName == 'undefined')
					return error(device.implementation.ERR_MISSING_ARGUMENT, msg.missingCategoryName);	
	
				if(typeof Data.CategoryName != 'string' || Data.CategoryName.length <= 0)
					return error(device.implementation.ERR_BAD_ARGUMENT_TYPE, msg.badType);

				var retIndex = findByName(DBase.Category, Data.CategoryName); 
				if (retIndex !=  -1)
					return error(device.implementation.ERR_ENTRY_EXISTS);
					
				item = context.extend({}, Data); 
				item.id = String(context.getUniqueID());
				DBase.Category.push(item);
			}
		} 
		// return success
		return context.Result(item.id, device.implementation.ERR_SUCCESS);
	}
			
	/**
	 * Landmarks: Delete
	 * @param {Object} criteria
	 */
	function __Delete(criteria){

		if ((result = validator.apply('Delete', arguments)) !== false)
			return result; 

		if (!/^(Landmark|Category)$/i.test(criteria.Type))
			return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.badType);

		var Data = criteria.Data || false; 
		if(!Data){
			return error(device.implementation.ERR_BAD_ARGUMENT_TYPE, msg.missingData);
		}

		if (typeof Data.id == 'undefined') {
			return error(device.implementation.ERR_MISSING_ARGUMENT, msg.missingId);
			}

		if (typeof Data.id != 'undefined' && typeof Data.id != 'string') {
			return error(device.implementation.ERR_BAD_ARGUMENT_TYPE, msg.invalidId);
		}
		if(Data.id.length <= 0 )
			return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.invalidId);
			
		DBase = context.getData(provider);
		
		var type = criteria.Type;

		// unsupported!			
		if (Data.DBUri) {
			context.notify(_t('%s:: Delete : Data.DBUri not implemented in preview').arg(provider));
		}

		// for both Landmark & Category:
		var i,item;

		for (i in DBase[type]) {
			item = DBase[type][i];
			if (Data.id == item.id) {
				DBase[type].splice(i, 1);
			}
		}

		// return success
		return error(device.implementation.ERR_SUCCESS);				
	}
		
	/**
	 * Landmarks: Import
	 * @param {Object} criteria
	 */
	function __Import(criteria){
		
		if ((result = validator.apply('Import', arguments)) !== false)
			return result; 

		if (!/^(Landmark)$/i.test(criteria.Type))
			return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.badType);

		context.notify(_t('%s:: Import : not implemented in preview.').arg(provider));

		var Data = criteria.Data || false; 
		if(!Data)
			return error(device.implementation.ERR_BAD_ARGUMENT_TYPE, msg.missingData);

		if (!Data.SourceFile)
			return error(device.implementation.ERR_MISSING_ARGUMENT, msg.missingSourceFile);

		if (!Data.MimeType)
			return error(device.implementation.ERR_MISSING_ARGUMENT, msg.missingMimeType);

		if (!/^(application\/vnd.nokia.landmarkcollection\+xml|application\/vnd.nokia.landmark\+wbxml)$/i.test(Data.MimeType))
			return error(device.implementation.ERR_SERVICE_NOT_SUPPORTED, msg.invalidMime);

		return error(device.implementation.ERR_SUCCESS);		
	}
			

	/**
	 * Landmarks: Export
	 * @param {Object} criteria
	 */
	function __Export(criteria){

		if ((result = validator.apply('Export', arguments)) !== false)
			return result; 

		context.notify(_t('%s:: Export : not implemented in preview.').arg(provider));
		if (!/^(Landmark)$/i.test(criteria.Type))
			return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.badType);

		var Data = criteria.Data || false; 
		if(!Data){
			return error(device.implementation.ERR_BAD_ARGUMENT_TYPE, msg.missingData);
		}

		if (!Data.DestinationFile)
			return error(device.implementation.ERR_MISSING_ARGUMENT, msg.missingDestFile);
			
		if (!Data.MimeType)
			return error(device.implementation.ERR_MISSING_ARGUMENT, msg.missingMimeType);

		if (!Data.IdList)
			return error(device.implementation.ERR_MISSING_ARGUMENT, msg.missingIdList);

		return error(device.implementation.ERR_SUCCESS);		
	}
			

	/**
	 * Landmarks: Organise
	 * @param {Object} criteria
	 */
	function __Organise(criteria){

		if ((result = validator.apply('Organise', arguments)) !== false)
			return result; 

		if (!/^(Landmark)$/i.test(criteria.Type))
			return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.badType);

		var Data = criteria.Data || false; 
		if(!Data){
			return error(device.implementation.ERR_BAD_ARGUMENT_TYPE, msg.missingData);
		}

		if (!Data.id || Data.id == "")
			return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.invalidId);
		
		DBase = context.getData(provider);
		var categories = DBase['Category'];
		var landmarks  = DBase['Landmark'];
		var found = false;
		
		
		for(var i=0;i<categories.length;i++)
		{
			var category = categories[i];
			if (category.id == Data.id) {
				found = true;
				break;
			}
		}
		if(!found)
			return error(device.implementation.ERR_BAD_ARGUMENT_TYPE, msg.invalidId);

		try{
			if(!Data.IdList || Data.IdList.length <=0)
			{
				return error(device.implementation.ERR_BAD_ARGUMENT_TYPE, msg.invalidId);
			}
		}catch(e){
			return error(device.implementation.ERR_BAD_ARGUMENT_TYPE, msg.invalidId);
		}
		
		if (!/^(Associate|Disassociate)$/i.test(criteria.OperationType))
			return error(device.implementation.ERR_INVALID_SERVICE_ARGUMENT, msg.invalidOpType);
		
		context.notify(_t('%s:: Organise : not implemented in preview.').arg(provider));
		if(/^Associate$/i.test(criteria.OperationType))
		{
			for(var i=0;i<landmarks.length;i++)
			{
				for(var j=0;j<Data.IdList.length;j++)
				{
					if(landmarks[i] == Data.IdList[j])
					{
						if(!landmarks[i].CategoryInfo)
						{
							landmarks[i].CategoryInfo = new Array();
							landmarks[i].CategoryInfo.push(Data.id);					
						}
						else{
							var landmark = landmarks[i];
							var found = false;
							for(var k=0;k<landmark.CategoryInfo.length;k++)
							{
								if(landmark.CategoryInfo[k] == Data.id)
									found = true;
							}
							if(!found)
								landmark.CategoryInfo.push(Data.id);
						}
						
					}
				}
			}
		}
		else
		{
			for(var i=0;i<landmarks.length;i++)
			{
				for(var j=0;j<Data.IdList.length;j++)
				{
					if(landmarks[i] == Data.IdList[j] && landmarks[i].CategoryInfo != undefined)
					{
						var landmark = landmarks[i];
						for(var k=0;k<landmark.CategoryInfo.length;k++)
						{
							if(landmark.CategoryInfo[k] == Data.id)
								landmark.CategoryInfo.splice(k,1);
						}
					}
				}
			}
		}
		
		return error(device.implementation.ERR_SUCCESS);		
	}
		

	/**
	 * Landmarks: Cancel
	 * @param {Object} criteria
	 */
	function __Cancel(criteria){
		method = 'Cancel';
		
		if ((result = validator.apply('Cancel', arguments)) !== false)
			return result;		
			
		if (!criteria.TransactionID)
			return error(device.implementation.ERR_MISSING_ARGUMENT, msg.missingTID);
		
		clearTimeout(criteria.TransactionID);
		return context.ErrorResult(device.implementation.ERR_SUCCESS);
	}


	
	/*******************************
	 * helper functions
	 *******************************/
	function error(code, msg /*, args...*/){

		var args = ['Landmarks',method].concat([].slice.call(arguments,2));
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
	
	function findById(dbase, id){
		for (var i in dbase) {
			if (id == dbase[i]['id']) {
				return i;
			}
		}
		return -1;
	}	

	function findByName(dbase, name){
		for (var i in dbase) {
			if (name == dbase[i]['CategoryName']) {
				return i;
			}
		}
		return -1;
	}	


	/** 
	 * error messages
	 * order of %s args: Service name, method name, parameter name 
	 */
	var msg = {
		missingType			: '%s%s : Type is missing',
		badType				: '%s%s : Type is invalid',		
		missingData			: '%s%s : Type or Data is missing',
		missingId			: '%s%s : Id is missing',
		invalidId			: '%s%s : id is invalid',
		missingLandmarkName	: '%s%s : Landmrak name Missing',
		missingCategoryName	: '%s%s : CategoryName is missing',
		missingSourceFile	: '%s%s : Import Source Filename is Missing',
		missingMimeType		: '%s%s : MIME type for source file is Missing',
		missingDestFile		: '%s%s : DestinationFile is missing',
		invalidOpType		: '%s%s : OperationType is invalid',
		missingIdList		: '%s%s : Id list is Missing',
		missingTID 			: '%s%s : TransactionID is missing',
		invalidMime			: '%s%s : MimeType is missing',
		msgNoMsg			: '',
		
	};
		

}) ()

