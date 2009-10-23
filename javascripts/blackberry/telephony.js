Telephony.prototype.call = function(number) {
	this.number = number;
	PhoneGap.exec("call", [this.number]);
}