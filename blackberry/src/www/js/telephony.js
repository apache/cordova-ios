/**
 * This class provides access to the telephony features of the device.
 * @constructor
 */
function Telephony() {
	this.number = null;
}

/**
 * Calls the specifed number.
 * @param {Integer} number The number to be called.
 */
Telephony.prototype.call = function(number) {
	this.number = number;
	device.exec("call", [this.number]);
}

if (typeof navigator.telephony == "undefined") navigator.telephony = new Telephony();