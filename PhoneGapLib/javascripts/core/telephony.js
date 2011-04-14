if (!PhoneGap.hasResource("telephony")) {
	PhoneGap.addResource("telephony");

/**
 * This class provides access to the telephony features of the device.
 * @constructor
 */
Telephony = function() {
	
}

/**
 * Calls the specifed number.
 * @param {Integer} number The number to be called.
 */
Telephony.prototype.call = function(number) {
	// not sure why this is here when it does nothing????
};

PhoneGap.addConstructor(function() {
    if (typeof navigator.telephony == "undefined") navigator.telephony = new Telephony();
});
};