File.prototype.read = function(fileName, successCallback, errorCallback) {
  var data = FileUtil.read(fileName);
  if( data.substr("FAIL"))
  {
    errorCallback(data); 
  }
  else
  {
    successCallback(data);
  }
}

/**
 * Writes a file to the mobile device.
 * @param {File} file The file to write to the device.
 */
File.prototype.write = function(file, str, successCallback, failCallback) {
	var call = FileUtil.write(str);
  if(call == 0)
  {
    successCallback();
  }
  else
  {
    failCallback(call);
  }
}
