/**
 * Location.js
 * 
 * Nokia Web Runtime Service API emulation 
 * WRT v1.1
 * 
 * Copyright 2009 Nokia Corporation. All rights reserved.
*/

 
(function(){
	
	var provider = 'Service.Location',
		Interface = 'ILocation';

	/**
	 * Landmark service
	 */
	var LocationService = function(){
		this.GetLocation 			= __GetLocation;
		this.Trace 					= __Trace;
		this.Calculate				= __Calculate;
		this.CancelNotification		= __CancelNotification;		
	}

	device.implementation.extend(provider, Interface, new LocationService() );


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
	var criteriaTrace;
	var callbackTrace;

	/**
	 * Landmarks: GetLocation
	 * @param {Object} criteria
	 */
	function __GetLocation(criteria, callback, flag){	
		method = "GetLocation";
		//	Async call
		flag = flag || false;

		if (!criteria) {
			criteria = new Object();
		}	
		
		if(typeof criteria.LocationInformationClass == "undefined")
			criteria.LocationInformationClass = "BasicLocationInformation"; // Default value of LocationInformationClass is "BasicLocationInformation" if not provided

		var result = validateArgument('GetLocation',criteria);
		if(result.ErrorCode != 0)
			return result;
		
		if (typeof callback == 'function') {
			
			var retVal = context.callAsync(this, arguments.callee, criteria, callback,true);
			transactionIds.push(retVal.TransactionID);  // all transaction ids are pushed on this variable, because CancelNotification function of SAPI doesn't take TransactioID as input
			return retVal;
		}
		
		if(flag)
		{
			transactionIds.shift();  // Remove oldest TransactionID(FIFO) (Async call)
		}
		
		DBase = context.getData(provider);
		var returnValue = DBase[criteria.LocationInformationClass];
		locationNotify(criteria.Updateoptions);
		return context.Result(returnValue);
	}
	
	/**
	 * Location: Trace
	 * @param {Object} criteria
	 * @param {Function} callback function for async call
	 */
	function __Trace(criteria, callback){
		method = "Trace";

		if (!criteria) {
			criteria = new Object();
		}	
		
		if(typeof criteria.LocationInformationClass == "undefined")
			criteria.LocationInformationClass = "BasicLocationInformation"; // Default value of LocationInformationClass is "BasicLocationInformation" if not provided

		if (typeof callback != 'function') { // callback should be valid function
			return error(device.implementation.ERR_SERVICE_NOT_SUPPORTED,msg.msgCommandNotFound); 
		}
		
		var result = validateArgument('Trace',criteria);
		if(result.ErrorCode != 0)
			return result;
		
		criteriaTrace = criteria;
		callbackTrace = callback;
		isTraceInProgress = true;
		locationNotify(criteria.Updateoptions);

		return traceCall(criteria,callback);
	}

	/**
	 * Location: Calculate
	 * @param {Object} criteria
	 */
	function __Calculate(criteria){
		method = "Calculate";
		if(!criteria || !criteria.MathRequest)
			return error(device.implementation.ERR_BAD_ARGUMENT_TYPE,msg.msgCalcMissingMathReq);
			
		if(typeof criteria.MathRequest != "string" || (criteria.MathRequest != "FindDistance" && criteria.MathRequest != "FindBearingTo" && criteria.MathRequest != "MoveCoordinates")) // Error check for wrong MathRequest criteria
			return error(device.implementation.ERR_BAD_ARGUMENT_TYPE,msg.msgCalcWrongTypeMathReq);
			
		if(typeof criteria.DistanceParamSource != "object" || (typeof criteria.DistanceParamSource.Latitude != "number" || typeof criteria.DistanceParamSource.Longitude != "number" || typeof criteria.DistanceParamSource.Altitude != "number"))
			return error(device.implementation.ERR_BAD_ARGUMENT_TYPE,msg.msgCalcMissingArgLocCord);

		if(criteria.MathRequest == "FindDistance" || criteria.MathRequest == "FindBearingTo")
		{
			if(typeof criteria.DistanceParamSource != "object" || (typeof criteria.DistanceParamDestination.Latitude != "number" || typeof criteria.DistanceParamDestination.Longitude != "number" || typeof criteria.DistanceParamDestination.Altitude != "number"))
				return error(device.implementation.ERR_BAD_ARGUMENT_TYPE,msg.msgCalcMissingArgLocCord);
			if (criteria.MathRequest == "FindDistance") {
				var dist = LatLon.distHaversine(criteria.DistanceParamDestination.Latitude, criteria.DistanceParamDestination.Longitude, criteria.DistanceParamSource.Latitude, criteria.DistanceParamSource.Longitude)*1000;
				if (typeof criteria.DistanceParamDestination.Altitude == "number" && typeof criteria.DistanceParamSource.Altitude == "number") {
					var delta = criteria.DistanceParamDestination.Altitude - criteria.DistanceParamSource.Altitude
					dist = Math.sqrt(dist * dist + delta * delta);
				}
				return context.Result(dist);
			}
			else if (criteria.MathRequest == "FindBearingTo"){
				var bearing = LatLon.bearing( criteria.DistanceParamSource.Latitude, criteria.DistanceParamSource.Longitude,criteria.DistanceParamDestination.Latitude, criteria.DistanceParamDestination.Longitude);
				return context.Result(bearing);				
			}
		}
		else if(criteria.MathRequest == "MoveCoordinates"){

			if(typeof criteria.MoveByThisDistance == "undefined")
				return error(device.implementation.ERR_BAD_ARGUMENT_TYPE,msg.msgCalcMissingArgMoveDist);
			
			if(typeof criteria.MoveByThisBearing == "undefined")
				return error(device.implementation.ERR_BAD_ARGUMENT_TYPE,msg.msgCalcMissingArgMoveBear);
			

			if(typeof criteria.MoveByThisDistance != "number")
				return error(device.implementation.ERR_BAD_ARGUMENT_TYPE,msg.msgCalcWrongTypeMoveDist);
			
			if(typeof criteria.MoveByThisBearing != "number")
				return error(device.implementation.ERR_BAD_ARGUMENT_TYPE,msg.msgCalcWrongTypeMoveBear);
			
			var latLon = new LatLon(criteria.DistanceParamSource.Latitude, criteria.DistanceParamSource.Longitude);
			var dlatLon = latLon.destPoint(criteria.MoveByThisBearing, criteria.MoveByThisDistance/1000);
			var retVal = new Object();
			retVal.Longitude = dlatLon.lon;
			retVal.Latitude = dlatLon.lat;
			retVal.Altitude = criteria.DistanceParamSource.Altitude;
			return context.Result(retVal);
		}
	}
			
	/**
	 * Location: CancelNotification
	 * @param {Object} criteria
	 */
	function __CancelNotification(criteria){
		method = "Cancel";
		if(!criteria)
				return error(device.implementation.ERR_MISSING_ARGUMENT,msg.msgCancelMissingType);
		
		var arr = new Array();
		var i = 0;
		var key
		for(key in criteria);
			arr[i++] = key;

		if(!criteria.CancelRequestType && arr.length)
				return error(device.implementation.ERR_NOT_FOUND,msg.msgCancelMissingType);
		
		if(criteria.CancelRequestType != "GetLocCancel" && criteria.CancelRequestType != "TraceCancel")
				return error(device.implementation.ERR_BAD_ARGUMENT_TYPE,msg.msgCancelWrongType);
		
		if (criteria.CancelRequestType == "GetLocCancel") {
			for (var i = 0; i < transactionIds.length; i++) {
				clearTimeout(transactionIds[i])
			}
		}
		
		if (criteria.CancelRequestType == "TraceCancel")
		{
			isTraceInProgress = false;
			tTransactionId = -1;
		}
		return context.ErrorResult(device.implementation.ERR_SUCCESS);
	}
		


	
	/*******************************
	 * helper functions
	 *******************************/

	/**
	 * Location: traceCall
	 * @param {} 
	 * This function emulates repetitive trace calls,It calls specified callback function after every UpdateInterval untill 
	 * CancelNotification is called
	 */
	function traceCall(){
		var tid = setTimeout(function(){
		if(!isTraceInProgress)
			return;
			
		DBase = context.getData(provider);
		var returnValue = DBase[criteriaTrace.LocationInformationClass];
		var result,
			eventCode = {completed:2, error:4, progress:9},
		code = eventCode.completed;

		callbackTrace(tTransactionId,code,context.Result(returnValue,0));
		traceCall();
		}, criteriaTrace.Updateoptions.UpdateInterval/1000);
		if(tTransactionId == -1)
			tTransactionId = tid;
		return context.AsyncResult(tTransactionId);
	}

	/**
	 * Location: validateArgument
	 * @param {string,object} callingMethod and criteria
	 * Validates arguments
	 */
	function validateArgument(fun,criteria)
	{
		method = fun;
		if(typeof criteria.Updateoptions != "undefined")
		{
			if(typeof criteria.Updateoptions != "object") // Checking for error in UpdateOptions criteria
				return error(device.implementation.ERR_BAD_ARGUMENT_TYPE,msg.msgGetLocationBadArg);
			
			if(typeof criteria.Updateoptions.UpdateInterval != "undefined" && typeof criteria.Updateoptions.UpdateInterval != "number")
				return error(device.implementation.ERR_BAD_ARGUMENT_TYPE,msg.msgGetLocationWrongType);
			
			if(typeof criteria.Updateoptions.UpdateTimeOut != "undefined" && typeof criteria.Updateoptions.UpdateTimeOut != "number")	
				return error(device.implementation.ERR_BAD_ARGUMENT_TYPE,msg.msgGetLocationWrongType);

			if(typeof criteria.Updateoptions.UpdateMaxAge != "undefined" && typeof criteria.Updateoptions.UpdateMaxAge != "number")	
				return error(device.implementation.ERR_BAD_ARGUMENT_TYPE,msg.msgGetLocationWrongType);

			if(typeof criteria.Updateoptions.PartialUpdates != "undefined" && typeof criteria.Updateoptions.PartialUpdates != "boolean")	
				return error(device.implementation.ERR_BAD_ARGUMENT_TYPE,msg.msgGetLocationWrongType);

			if((typeof criteria.Updateoptions.UpdateInterval != "undefined" && criteria.Updateoptions.UpdateInterval  < 0) || 
					(typeof criteria.Updateoptions.UpdateTimeOut != "undefined" && criteria.Updateoptions.UpdateTimeOut  < 0) ||
					(typeof criteria.Updateoptions.UpdateMaxAge != "undefined" && criteria.Updateoptions.UpdateMaxAge  < 0))
				return error(device.implementation.ERR_BAD_ARGUMENT_TYPE,msg.msgGetLocationNegInt);

			if(typeof criteria.Updateoptions.UpdateTimeOut != "undefined" && typeof criteria.Updateoptions.UpdateInterval != "undefined" && criteria.Updateoptions.UpdateInterval > criteria.Updateoptions.UpdateTimeOut)
			{
				return error(device.implementation.ERR_BAD_ARGUMENT_TYPE,msg.msgNone);
			}

			/*if((typeof criteria.Updateoptions.UpdateTimeOut != "undefined" && criteria.Updateoptions.UpdateTimeOut <= 1000000))// || (typeof criteria.Updateoptions.UpdateInterval != "undefined" && criteria.Updateoptions.UpdateInterval <= 1000000))
			{
				return error(device.implementation.ERR_BAD_ARGUMENT_TYPE,msg.msgNone);
			}*/				
		}

		if(typeof criteria.LocationInformationClass != "undefined" && criteria.LocationInformationClass != "BasicLocationInformation" && criteria.LocationInformationClass != "GenericLocationInfo") // checking for errors in LocationInformationClass criteria
			return error(device.implementation.ERR_BAD_ARGUMENT_TYPE,msg.msgGetLocationWrongCat);
		
		if (/^Trace$/i.test(fun)&&(!criteria.Updateoptions || typeof criteria.Updateoptions.UpdateInterval == "undefined")) {
			if(!criteria.Updateoptions)
			{
				criteria.Updateoptions = new Object();
			}
			criteria.Updateoptions.UpdateInterval = 1000000;  // Emulation only!! for convenience UpdateInterval is set to 1 second is not specified or if it less than 1 second
			context.notify("Using default UpdateInterval(1000000 micro seconds)"); 
		}
		
		return context.ErrorResult(device.implementation.ERR_SUCCESS, "");
		
	}

	/**
	 * Location: error
	 * @param {number,string} ErrorCode and ErrorString
	 * Replaces Error String with method name
	 */
	function error(code, msg /*, args...*/){

		var args = ['location',method].concat([].slice.call(arguments,2));
		msg = msg ? _t().arg.apply(msg,args) : undefined;
		return context.ErrorResult(code, msg);
	}
	
	function locationNotify(updateoptions) {
		if(!updateoptions)
			return;
		if(typeof updateoptions.UpdateTimeOut != "undefined")
			context.notify(_t("%s:: %s : Updateoptions.UpdateTimeOut not implemented in preview").arg(provider, method));

		if(typeof updateoptions.UpdateMaxAge != "undefined")
			context.notify(_t("%s:: %s : Updateoptions.UpdateMaxAge not implemented in preview").arg(provider, method));

		if(typeof updateoptions.PartialUpdates != "undefined")
			context.notify(_t("%s:: %s : Updateoptions.PartialUpdates not implemented in preview").arg(provider, method));
	}

	/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
	/*  Latitude/longitude spherical geodesy formulae & scripts (c) Chris Veness 2002-2009            */
	/*	http://www.movable-type.co.uk/scripts/latlong.html											  */  
	/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
	
	/*
	 * Use Haversine formula to Calculate distance (in km) between two points specified by 
	 * latitude/longitude (in numeric degrees)
	 *
	 * example usage from form:
	 *   result.value = LatLon.distHaversine(lat1.value.parseDeg(), long1.value.parseDeg(), 
	 *                                       lat2.value.parseDeg(), long2.value.parseDeg());
	 * where lat1, long1, lat2, long2, and result are form fields
	 */
	
	
	LatLon.distHaversine = function(lat1, lon1, lat2, lon2) {
	  var R = 6371; // earth's mean radius in km
	  var dLat = toRad(lat2-lat1);
	  var dLon = toRad(lon2-lon1);
	  lat1 = toRad(lat1), lat2 = toRad(lat2);
	
	  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
	          Math.cos(lat1) * Math.cos(lat2) * 
	          Math.sin(dLon/2) * Math.sin(dLon/2);
	  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
	  var d = R * c;
	  return d;
	}
	
	
	/*
	 * ditto using Law of Cosines
	 */
	LatLon.distCosineLaw = function(lat1, lon1, lat2, lon2) {
	  var R = 6371; // earth's mean radius in km
	  var d = Math.acos(Math.sin(toRad(lat1))*Math.sin(toRad(lat2)) +
	                    Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.cos(toRad(lon2-lon1))) * R;
	  return d;
	}
	
	
	/*
	 * calculate (initial) bearing between two points
	 *   see http://williams.best.vwh.net/avform.htm#Crs
	 */
	LatLon.bearing = function(lat1, lon1, lat2, lon2) {
	  lat1 = toRad(lat1); lat2 = toRad(lat2);
	  var dLon = toRad(lon2-lon1);

	  var y = Math.sin(dLon) * Math.cos(lat2);
	  var x = Math.cos(lat1)*Math.sin(lat2) -
	          Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);
	  return toBrng(Math.atan2(y, x));
	}
	
	
	/*
	 * calculate destination point given start point, initial bearing (deg) and distance (km)
	 *   see http://williams.best.vwh.net/avform.htm#LL
	 */
	LatLon.prototype.destPoint = function(brng, d) {
	  var R = 6371; // earth's mean radius in km
	  var lat1 = toRad(this.lat), lon1 = toRad(this.lon);
	  brng = toRad(brng);
	
	  var lat2 = Math.asin( Math.sin(lat1)*Math.cos(d/R) + 
	                        Math.cos(lat1)*Math.sin(d/R)*Math.cos(brng) );
	  var lon2 = lon1 + Math.atan2(Math.sin(brng)*Math.sin(d/R)*Math.cos(lat1), 
	                               Math.cos(d/R)-Math.sin(lat1)*Math.sin(lat2));
	  lon2 = (lon2+Math.PI)%(2*Math.PI) - Math.PI;  // normalise to -180...+180
	
	  if (isNaN(lat2) || isNaN(lon2)) return null;
	  return new LatLon(toDeg(lat2), toDeg(lon2));
	}
	
	
	/*
	 * construct a LatLon object: arguments in numeric degrees
	 *
	 * note all LatLong methods expect & return numeric degrees (for lat/long & for bearings)
	 */
	function LatLon(lat, lon) {
	  this.lat = lat;
	  this.lon = lon;
	}
	
	
	/*
	 * represent point {lat, lon} in standard representation
	 */
	LatLon.prototype.toString = function() {
	  return this.lat.toLat() + ', ' + this.lon.toLon();
	}
	
	/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
	
	// extend String object with method for parsing degrees or lat/long values to numeric degrees
	//
	// this is very flexible on formats, allowing signed decimal degrees, or deg-min-sec suffixed by 
	// compass direction (NSEW). A variety of separators are accepted (eg 3º 37' 09"W) or fixed-width 
	// format without separators (eg 0033709W). Seconds and minutes may be omitted. (Minimal validation 
	// is done).
	
	function parseDeg (str) {
	  if (!isNaN(str)) return Number(str);                 // signed decimal degrees without NSEW
	
	  var degLL = str.replace(/^-/,'').replace(/[NSEW]/i,'');  // strip off any sign or compass dir'n
	  var dms = degLL.split(/[^0-9.]+/);                     // split out separate d/m/s
	  for (var i in dms) if (dms[i]=='') dms.splice(i,1);    // remove empty elements (see note below)
	  switch (dms.length) {                                  // convert to decimal degrees...
	    case 3:                                              // interpret 3-part result as d/m/s
	      var deg = dms[0]/1 + dms[1]/60 + dms[2]/3600; break;
	    case 2:                                              // interpret 2-part result as d/m
	      var deg = dms[0]/1 + dms[1]/60; break;
	    case 1:                                              // decimal or non-separated dddmmss
	      if (/[NS]/i.test(str)) degLL = '0' + degLL;       // - normalise N/S to 3-digit degrees
	      var deg = dms[0].slice(0,3)/1 + dms[0].slice(3,5)/60 + dms[0].slice(5)/3600; break;
	    default: return NaN;
	  }
	  if (/^-/.test(str) || /[WS]/i.test(str)) deg = -deg; // take '-', west and south as -ve
	  return deg;
	}
	// note: whitespace at start/end will split() into empty elements (except in IE)
	
	
	/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
	
	// extend Number object with methods for converting degrees/radians
	
	function toRad (deg) {  // convert degrees to radians
	  return deg * Math.PI / 180;
	}
	
	function toDeg (rad) {  // convert radians to degrees (signed)
	  return rad * 180 / Math.PI;
	}
	
	function toBrng (rad) {  // convert radians to degrees (as bearing: 0...360)
	  return (toDeg(rad)+360) % 360;
	}
	
	
	/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
	
	// extend Number object with methods for presenting bearings & lat/longs
	
	function toDMS (num) {  // convert numeric degrees to deg/min/sec
	  var d = Math.abs(num);  // (unsigned result ready for appending compass dir'n)
	  d += 1/7200;  // add ½ second for rounding
	  var deg = Math.floor(d);
	  var min = Math.floor((d-deg)*60);
	  var sec = Math.floor((d-deg-min/60)*3600);
	  // add leading zeros if required
	  if (deg<100) deg = '0' + deg; if (deg<10) deg = '0' + deg;
	  if (min<10) min = '0' + min;
	  if (sec<10) sec = '0' + sec;
	  return deg + '\u00B0' + min + '\u2032' + sec + '\u2033';
	}
	
	function toLat (deg) {  // convert numeric degrees to deg/min/sec latitude
	  return toDMS(deg).slice(1) + (deg<0 ? 'S' : 'N');  // knock off initial '0' for lat!
	}
	
	function toLon (deg) {  // convert numeric degrees to deg/min/sec longitude
	  return toDMS(deg) + (deg>0 ? 'E' : 'W');
	}
	
	function toPrecision (num,fig) {  // override toPrecision method with one which displays 
	  if (num == 0) return 0;                      // trailing zeros in place of exponential notation
	  var scale = Math.ceil(Math.log(num)*Math.LOG10E);
	  var mult = Math.pow(10, fig-scale);
	  return Math.round(num*mult)/mult;
	}


	/** 
	 * error messages
	 * order of %s args: Service name, method name, parameter name 
	 */
	var msg = {
		msgCommandNotFound			: '%s : Command Not found',
		msgGetLocationWrongCat		: '%s : %s : wrong category info should be BasicLocationInformation/GenericLocationInfo ',
		msgGetLocationBadArg		: '%s : %s : BadArgument - Updateoptions',
		msgGetLocationNegInt		: '%s : %s : Negative Time Interval',
		msgGetLocationWrongType 	: '%s : %s : UpdateOptions Type mismatch',
		msgTraceWrongCat			: '%s : %s : Invalid LocationInformationClass',
		msgCalcMissingMathReq 		: '%s : %s : Missing argument - MathRequest',
		msgCalcWrongTypeMathReq 	: '%s : %s : Wrong argument - MathRequest',
		msgCalcMissingArgLocCord 	: '%s : %s : Missing argument - locationcoordinate',
		msgCalcMissingArgMoveDist 	: '%s : %s : Missing argument - MoveByThisDistance',
		msgCalcMissingArgMoveBear 	: '%s : %s : Missing argument - MoveByThisBearing',
		msgCalcWrongTypeMoveDist  	: '%s : %s : TypeMismatch - MoveByThisDistance',
		msgCalcWrongTypeMoveBear 	: '%s : %s : TypeMismatch - MoveByThisBearing',
		msgCancelBadArg 			: '%s : %s : BadArgument – cancel type',
		msgCancelMissingType 		: '%s : %s : Missing cancel type',
		msgCancelWrongType 			: '%s : %s : Wrong cancel type'	,
		msgNone						: ''	
	};
		

}) ()

