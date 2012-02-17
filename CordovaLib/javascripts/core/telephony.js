if (!Cordova.hasResource("telephony")) {
	Cordova.addResource("telephony");

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

Cordova.addConstructor(function() {
    if (typeof navigator.telephony == "undefined") navigator.telephony = new Telephony();
});
};