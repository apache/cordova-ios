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
	this.number = number;
	this.service = new Mojo.Service.Request('palm://com.palm.applicationManager', {
	    method:'open',
	    parameters: {
	       target: "tel://" + number
	    }
	});
}

if (typeof navigator.telephony == "undefined") navigator.telephony = new Telephony();