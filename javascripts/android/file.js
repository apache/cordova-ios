
File.prototype.read = function(fileName, successCallback, errorCallback) {
  this.failCallback = errorCallback; 
  this.winCallback = successCallback;

  FileUtil.read(fileName);
}

File.prototype.hasRead = function(data)
{
  if(data.substr("FAIL"))
    this.failCallback(data);
  else
    this.winCallback(data);
  end
}

/**
 * Writes a file to the mobile device.
 * @param {File} file The file to write to the device.
 */
File.prototype.write = function(file, str, successCallback, failCallback) {
  this.winCallback = successCallback;
  this.failCallback = failCallback;
  var call = FileUtil.write(file, str, false);
}

File.prototype.append = function(file, str, successCallback, failCallback){
  this.winCallback = successCallback;
  this.failCallback = failCallback;
  var call = FileUtil.write(file, str, true);
}
