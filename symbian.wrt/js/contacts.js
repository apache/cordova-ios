/**
 * This class provides access to the device contacts.
 * @constructor
 */

function Contacts() {
	
}

function Contact() {
	this.givenName = "";
	this.familyName = "";
    this.phones = [];
    this.emails = [];
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
	try {
		
		this.contactsService = device.getServiceObject("Service.Contact", "IDataSource");
		this.options = options;
		
		var criteria = new Object();
		criteria.Type = "Contact";
		if (filter && filter.name)
			criteria.Filter = { SearchVal: filter.name };
		
		if (typeof(successCallback) != 'function') 
			successCallback = function(){};
		if (typeof(errorCallback) != 'function') 
			errorCallback = function(){};
		if (typeof options == 'object'){
			if (isNaN(this.options.limit))
				this.options.limit = 200;
			if (isNaN(this.options.page))
				this.options.page = 1;
		}
		
		//need a closure here to bind this method to this instance of the Contacts object
		this.global_success = successCallback;
		var obj = this;
		
		//WRT: result.ReturnValue is an iterator of contacts
		this.contactsService.IDataSource.GetList(criteria, function(transId, eventCode, result){
			obj.success_callback(result.ReturnValue);
		});
	} 
	catch (ex) {
		errorCallback(ex);
	}
}

Contacts.prototype.success_callback = function(contacts_iterator) {
	var gapContacts = new Array();
	contacts_iterator.reset();
    var contact;
	var i = 0;
	var end = this.options.page * this.options.limit;
	var start = end - this.options.limit;
	while ((contact = contacts_iterator.getNext()) != undefined && i < end) {
		try {
			if (i >= start) {
				var gapContact = new Contact();
				gapContact.givenName = Contacts.GetValue(contact, "FirstName");
				gapContact.familyName = Contacts.GetValue(contact, "LastName");
				gapContact.name = gapContact.firstName + " " + gapContact.lastName;
				gapContact.emails = Contacts.getEmailsList(contact);
				gapContact.phones = Contacts.getPhonesList(contact);
				gapContact.address = Contacts.getAddress(contact);
				gapContacts.push(gapContact);
			}
			i++;
		} catch (e) {
			alert("ContactsError (" + e.name + ": " + e.message + ")");
		}
	}
	this.contacts = gapContacts;
	this.global_success(gapContacts);
}

Contacts.getEmailsList = function(contact) {
	var emails = new Array();
	try {
			emails[0] = { type:"General", address: Contacts.GetValue(contact, "EmailGen") };
			emails[1] = { type:"Work", address: Contacts.GetValue(contact, "EmailWork") };		
			emails[2] = { type:"Home", address: Contacts.GetValue(contact, "EmailHome") };
	} catch (e) {
		emails = [];
	}
	return emails;
}

Contacts.getPhonesList = function(contact) {
	var phones = new Array();
	try {
			phones[0] = { type:"Mobile", number: Contacts.GetValue(contact, "MobilePhoneGen") };
			phones[1] = { type:"Home", number: Contacts.GetValue(contact, "LandPhoneGen") };
			phones[2] = { type:"Fax", number: Contacts.GetValue(contact, "FaxNumberGen") };
			phones[3] = { type:"Work", number: Contacts.GetValue(contact, "LandPhoneWork") };
			phones[4] = { type:"WorkMobile", number: Contacts.GetValue(contact, "MobilePhoneWork") };
	} catch (e) {
		phones = [];
	}
	return phones;
}

Contacts.getAddress = function(contact) {
	var address = "";
	try {
		address = Contacts.GetValue(contact, "AddrLabelHome") + ", " + Contacts.GetValue(contact, "AddrStreetHome") + ", " +
				Contacts.GetValue(contact, "AddrLocalHome") + ", " + Contacts.GetValue(contact, "AddrRegionHome") + ", " + 
				Contacts.GetValue(contact, "AddrPostCodeHome") + ", " + Contacts.GetValue(contact, "AddrCountryHome");
	} catch (e) {
		address = "";
	}
	return address;
}

Contacts.GetValue = function(contactObj, key) {
	try {
		return contactObj[key]["Value"];
	} catch (e) {
		return "";
	}
}

if (typeof navigator.contacts == "undefined") navigator.contacts = new Contacts();
