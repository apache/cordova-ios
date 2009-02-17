/**
 * This class provides access to the device contacts.
 * @constructor
 */
function Contact() {
	this.name = "";
	this.phone = "";
	this.address = "";
}

/**
 * 
 * @param {Object} successCallback
 * @param {Object} errorCallback
 * @param {Object} options
 */
Contact.prototype.get = function(successCallback, errorCallback, options) {
	
}


function ContactManager() {
	// Dummy object to hold array of contacts
	this.contacts = [];
}

ContactManager.prototype.get = function(successCallback, errorCallback, options) {
	// Interface
}


if (typeof navigator.contacts == "undefined") navigator.contacts = new ContactManager();