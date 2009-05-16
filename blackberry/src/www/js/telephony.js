/**
 * This class provides access to the telephony features of the device.
 * @constructor
 */
function Telephony() {
	this.number = null;
	this.callInProgress = false;
}

/**
 * Calls the specifed number.
 * @param {Integer} number The number to be called.
 */
Telephony.prototype.call = function(number) {
	if (!this.callInProgress) {
		this.number = number;
		this.callInProgress = true;
		Device.exec("call", [this.number]);
	}
}

addOnLoad(function() {
	if (typeof navigator.telephony == "undefined")
		navigator.telephony = new Telephony();
});