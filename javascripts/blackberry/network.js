Network.prototype.isReachable = function(hostName, successCallback, options) {
	this.isReachable_success = successCallback;
	PhoneGap.exec("network",["reach"]);
};
// Temporary implementation of XHR. Soon-to-be modeled as the w3c implementation.
Network.prototype.XHR = function(URL, POSTdata, successCallback) {
	var req = URL;
	if (POSTdata != null) {
		req += "|" + POSTdata;
	}
	this.XHR_success = successCallback;
	PhoneGap.exec("network",["xhr",req]);
};