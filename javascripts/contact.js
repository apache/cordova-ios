/**
 * This class provides access to the device contacts.
 * @constructor
 */
function Contact() {
	this.name = "";
	this.phone = [];
	this.address = [];
}

/**
 * 
 * @param {Object} successCallback
 * @param {Object} errorCallback
 * @param {Object} options
 */
Contact.prototype.get = function(successCallback, errorCallback, options) {
	
}

if (typeof navigator.contact == "undefined") navigator.contact = new Contact();