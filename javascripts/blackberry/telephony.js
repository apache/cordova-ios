/**
 * This class provides access to the telephony features of the device.
 * @constructor
 */
function Telephony() {
	
}

/**
 * Calls the specifed number.
 * @param {Integer} number The number to be called.
 */
Telephony.prototype.call = function(number) {
	this.number = number;
	PhoneGap.exec("call", [this.number]);
}

if (typeof navigator.telephony == "undefined") navigator.telephony = new Telephony();
