/**
 * This class provides access to the device contacts.
 * @constructor
 */

function Contact(jsonObject) {
	this.firstName = "";
	this.lastName = "";
    this.name = "";
    this.phones = {};
    this.emails = {};
	this.address = "";
}

Contact.prototype.displayName = function()
{
    // TODO: can be tuned according to prefs
	return this.name;
}

function ContactManager() {
	// Dummy object to hold array of contacts
	this.contacts = [];
	this.timestamp = new Date().getTime();
}

ContactManager.prototype.getAllContacts = function(successCallback, errorCallback, options) {
	// Interface
}

PhoneGap.addConstructor(function() {
    if (typeof navigator.ContactManager == "undefined") navigator.ContactManager = new ContactManager();
});
