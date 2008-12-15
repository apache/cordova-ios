File.prototype.read = function(fileName, successCallback, errorCallback) {
	document.cookie = 'bb_command={command:8,args:{name:"'+fileName+'"}}';
	navigator.file.successCallback = successCallback;
	navigator.file.errorCallback = errorCallback;
	navigator.file.readTimeout = window.setInterval('navigator.file._readReady()', 1000);
}

File.prototype._readReady = function() {
	var cookies = document.cookie.split(';');
	for (var i=0; i<cookies.length; i++) {
		var cookie = cookies[i].split('=');
		if (cookie[0] == 'bb_response') {
			var obj = eval('('+cookie[1]+')');

			// TODO: This needs to be in ONE cookie reading loop I think so that it can find 
			// various different data coming back from the phone at any time (poll piggy-backing)
			var file = obj.readfile;
			if (file != null)
			{
				window.clearTimeout(navigator.file.readTimeout);
				if (file.length > 0)
				{
					successCallback(file);
				}
			}
		}
	}
}

File.prototype.write = function(fileName, data) {
	document.cookie = 'bb_command={command:9,args:{name:"'+fileName+'",data:"'+data+'"}}';
}
