/**
 * This class provides access to the telephony features of the device.
 * @constructor
 */
function Telephony() {
	this.number = "";
}

/**
 * Calls the specifed number.
 * @param {Integer} number The number to be called.
 */
Telephony.prototype.send = function(number) {
	var err = "Telephony API not available for symbian.wrt";
	debug.log(err);
	return { name: "TelephonyError", message: err };
}

if (typeof navigator.telephony == "undefined") navigator.telephony = new Telephony();