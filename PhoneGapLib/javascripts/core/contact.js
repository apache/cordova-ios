

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
	PhoneGap.exec("Contacts.allContacts", GetFunctionName(successCallback), options);
}

// THE FUNCTIONS BELOW ARE iPHONE ONLY FOR NOW

ContactManager.prototype.newContact = function(contact, successCallback, options) {
    if (!options) options = {};
    options.successCallback = GetFunctionName(successCallback);
    
    PhoneGap.exec("Contacts.newContact", contact.firstName, contact.lastName, contact.phoneNumber,
        options);
}

ContactManager.prototype.chooseContact = function(successCallback, options) {
    PhoneGap.exec("Contacts.chooseContact", GetFunctionName(successCallback), options);
}

ContactManager.prototype.displayContact = function(contactID, errorCallback, options) {
    PhoneGap.exec("Contacts.displayContact", contactID, GetFunctionName(errorCallback), options);
}

ContactManager.prototype.removeContact = function(contactID, successCallback, options) {
    PhoneGap.exec("Contacts.removeContact", contactID, GetFunctionName(successCallback), options);
}

ContactManager.prototype.contactsCount = function(successCallback, errorCallback) {
	PhoneGap.exec("Contacts.contactsCount", GetFunctionName(successCallback));
}

PhoneGap.addConstructor(function() {
    if (typeof navigator.contacts == "undefined") navigator.contacts = new ContactManager();
});
