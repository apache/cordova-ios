
Sms.prototype.send = function(number, message, successCallback, errorCallback, options) {
	var params = [number];
	params.push(message);
	this.success = successCallback;
	this.error = errorCallback;
	PhoneGap.exec("send", params);
};
