/**
 * This class provides access to the device contacts.
 * @constructor
 */

function Contacts() {
	
}

function Contact() {
    this.phones = [];
    this.emails = [];
	this.name = {
		givenName: "",
		familyName: "",
		formatted: ""
	};
	this.id = "";
}

Contact.prototype.displayName = function()
{
    // TODO: can be tuned according to prefs
	return this.givenName + " " + this.familyName;
}

function ContactsFilter(name) {
	if (name)
		this.name = name;
	else
		this.name = "";
}

/*
 * @param {ContactsFilter} filter Object with filter properties. filter.name only for now.
 * @param {function} successCallback Callback function on success
 * @param {function} errorCallback Callback function on failure
 * @param {object} options Object with properties .page and .limit for paging
 */

Contacts.prototype.find = function(filter, successCallback, errorCallback, options) {
	errorCallback({ name: "ContactsError", message: "PhoneGap Palm contacts not implemented" });
}

Contacts.prototype.success_callback = function(contacts_iterator) {
}

if (typeof navigator.contacts == "undefined") navigator.contacts = new Contacts();
