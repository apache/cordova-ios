// Gets the function name of a Function object, else uses "alert" if anonymous
function GetFunctionName(fn)
{
  if (fn) {
      var m = fn.toString().match(/^\s*function\s+([^\s\(]+)/);
      return m ? m[1] : "alert";
  } else {
    return null;
  }
}

/**
 * 
 * @param {Function} successCallback
 * @param {Function} errorCallback
 * @param {Object} options (isIpAddress:boolean)
 */
Network.prototype.isReachable = function(hostName, successCallback, options) {
	PhoneGap.exec("Network.isReachable", hostName, GetFunctionName(successCallback), options);
}