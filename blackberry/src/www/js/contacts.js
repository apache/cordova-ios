/**
 * This class represents a Contact in the manager.
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
	this.contacts = [];
	this.timestap = new Date().getTime();
}

ContactManager.prototype.get = function(successCallback, errorCallback, options) {
	Device.exec("contacts", [options.operation, options.field, options.value], true);
}

if (typeof navigator.ContactManager == "undefined") navigator.ContactManager = new ContactManager();