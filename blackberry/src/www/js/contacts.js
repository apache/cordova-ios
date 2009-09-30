/**
 * This class represents a Contact in the manager.
 * @constructor
 */
function Contact() {
	this.firstName = "";
	this.lastName = "";
	this.phoneNumber = {};
	this.address = "";
	this.email = {};
}
function ContactManager() {
	this.contacts = [];
	this.timestamp = new Date().getTime();
	// Options used when calling ContactManager functions.
	this.options = {
		'pageSize':0,
		'pageNumber':0,
		'nameFilter':'',
		'contactID':0
	};
}
ContactManager.prototype.formParams = function(options, startArray) {
	var params = [];
	if (startArray) params = startArray;
	if (options.pageSize && options.pageSize > 0) params.push("pageSize:" + options.pageSize);
	if (options.pageNumber) params.push("pageNumber:" + options.pageNumber);
	if (options.nameFilter) params.push("nameFilter:" + options.nameFilter);
	if (options.contactID) params.push("contactID:" + options.contactID);
	return params;	
};
ContactManager.prototype.chooseContact = function(successCallback, options) {
	this.choose_onSuccess = successCallback;
	var params = ["choose"];
	params = this.formParams(options,params);
	device.exec("contacts", params, true);
};
ContactManager.prototype.displayContact = function(successCallback, errorCallback, options) {
	if (options.nameFilter && options.nameFilter.length > 0) {
		var params = ["search"];
		params = this.formParams(options,params);
		this.search_onSuccess = successCallback;
		this.search_onError = errorCallback;
		device.exec("contacts", params);
	} else {
		ContactManager.getAllContacts(successCallback,errorCallback,options);
		return;
	}
};
ContactManager.prototype.getAllContacts = function(successCallback, errorCallback, options) {
	this.global_onSuccess = successCallback;
	this.global_onError = errorCallback;
	var params = ["getall"];
	params = this.formParams(options,params);
	device.exec("contacts", params);
};
ContactManager.prototype.newContact = function(contact, successCallback, errorCallback, options) {
	if (!contact) {
		alert("[PhoneGap Error] newContact function not provided with a contact parameter.");
		return;
	} else {
		if (!contact.firstName || !contact.lastName || !contact.phoneNumber || !contact.address || !contact.email) {
			alert("[PhoneGap Error] newContact function parameter 'contact' does not have proper contact members (firstName, lastName, phoneNumber, address and email).");
			return;
		}
		options.push("firstName:" + contact.firstName);
		options.push("lastName:" + contact.lastName);
		options.push("address:" + contact.address);
		// Create a phone number parameter that we can parse on the BlackBerry end.
		var phones = '';
		for (var i = 0; i < contact.phoneNumber.length; i++) {
			phones += contact.phoneNumber[i].label + '=';
			phones += contact.phoneNumber[i].value + '|';
		}
		options.push("phoneNumber:" + phones.substring(0,phones.length-1));
		var emails = '';
		for (var j = 0; j < contact.email.length; j++) {
			emails += contact.email[j].label + '=';
			emails += contact.email[j].value + '|';
		}
		options.push("email:" + emails.substring(0,emails.length-1));
		this.new_onSuccess = successCallback;
		this.new_onError = errorCallback;
		device.exec("new", options);
	}
};

if (typeof navigator.ContactManager == "undefined")	navigator.ContactManager = new ContactManager();
