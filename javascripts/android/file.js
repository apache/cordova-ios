
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
}

/**
 * Writes a file to the mobile device.
 * @param {File} file The file to write to the device.
 */
File.prototype.write = function(file, str, mode, successCallback, failCallback) {
  this.winCallback = successCallback;
  this.failCallback = failCallback;
  var call = FileUtil.write(file, str, mode);
}

File.prototype.testFileExists = function(file, successCallback, failCallback)
{
  var exists = FileUtil.testFileExists(file);
  if(exists)
    successCallback();
  else
    failCallback();
  return exists;
}

File.prototype.testDirectoryExists = function(file, successCallback, failCallback)
{
  var exists = FileUtil.testDirectoryExists(file);
  if(exists)
    successCallback();
  else
    failCallback();
  return exists;
}

File.prototype.createDirectory = function(dir, successCallback, failCallback)
{
  var good = FileUtils.createDirectory(dir);
  good ? successCallback() : failCallback();
}

File.prototype.deleteDirectory = function(dir, successCallback, failCallback)
{
  var good = FileUtils.deleteDirectory(dir);
  good ? successCallback() : failCallback();
}

File.prototype.deleteFile = function(dir, successCallback, failCallback)
{
  var good = FileUtils.deleteFile(dir);
  good ? successCallback() : failCallback();
}

File.prototype.getFreeDiskSpace(successCallback, failCallback)
{
  var diskSpace =  FileUtils.getFreeDiskSpace();
  if(diskSpace > 0)
    successCallback();
  else
    failCallback();
  return diskSpace;
}
