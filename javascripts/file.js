File = function() {}

File.prototype.read = function(successCallback, errorCallback) {}

File.prototype._readReady = function() {}

File.prototype.write = function(fileName, data) {}

if (typeof navigator.file == "undefined") navigator.file = new File();