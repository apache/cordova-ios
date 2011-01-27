/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010, IBM Corporation
 */

/**
* Contains information about a single contact.
* @param {DOMString} id unique identifier
* @param {DOMString} displayName
* @param {ContactName} name
* @param {DOMString} nickname
* @param {ContactField[]} phoneNumbers array of phone numbers
* @param {ContactField[]} emails array of email addresses
* @param {ContactAddress[]} addresses array of addresses
* @param {ContactField[]} ims instant messaging user ids
* @param {ContactOrganization[]} organizations
* @param {DOMString} revision date contact was last updated
* @param {DOMString} birthday contact's birthday
* @param {DOMString} gender contact's gender
* @param {DOMString} note user notes about contact
* @param {ContactField[]} photos
* @param {ContactField[]} urls contact's web sites
* @param {DOMString} timezone UTC time zone offset
*/
var Contact = function(id, displayName, name, nickname, phoneNumbers, emails, addresses,
    ims, organizations, revision, birthday, gender, note, photos, categories, urls, timezone) {
    this.id = id || null;
    this.displayName = displayName || null;
    this.name = name || null; // ContactName
    this.nickname = nickname || null;
    this.phoneNumbers = phoneNumbers || null; // ContactField[]
    this.emails = emails || null; // ContactField[]
    this.addresses = addresses || null; // ContactAddress[]
    this.ims = ims || null; // ContactField[]
    this.organizations = organizations || null; // ContactOrganization[]
    this.revision = revision || null; // JS Date
    this.birthday = birthday || null; // JS Date
    this.gender = gender || null;
    this.note = note || null;
    this.photos = photos || null; // ContactField[]
    this.categories = categories || null; 
    this.urls = urls || null; // ContactField[]
    this.timezone = timezone || null;
};

/**
* Converts Dates to milliseconds before sending to iOS
*/
Contact.prototype.convertDatesOut = function()
{
	var dates = new Array("revision", "birthday");
	for (var i=0; i<dates.length; i++){
		var value = this[dates[i]];
		if (value){
			if (!value instanceof Date){
				try {
					value = new Date(value);
				} catch(exception){
					value = null;
				}
			}
			if (value instanceof Date){
				value = value.valueOf();
			}
			this[dates[i]] = value;
		}
	}
	
};
/**
* Converts milliseconds to JS Date when returning from iOS
*/
Contact.prototype.convertDatesIn = function()
{
	var dates = new Array("revision", "birthday");
	for (var i=0; i<dates.length; i++){
		var value = this[dates[i]];
		if (value){
			try {
				this[dates[i]] = new Date(parseFloat(value));
			} catch (exception){
				console.log("exception creating date");
			}
		}
	}
};
/**
* Removes contact from device storage.
* @param successCB success callback
* @param errorCB error callback (optional)
*/
Contact.prototype.remove = function(successCB, errorCB) {
	var bErrCallback = (errorCB == undefined || errorCB == null) ? false : true;
	navigator.service.contacts.errorCallback = null;
	if (bErrCallback == true){
		navigator.service.contacts.errorCallback = errorCB;
	}
    if (this.id == null) {
    	if(bErrCallback == true) {
       		var errorObj = new ContactError();
        	errorObj.code = ContactError.NOT_FOUND_ERROR;
        	errorCB(errorObj);
    	}
    } else {
		navigator.service.contacts.resultsCallback = successCB;
    	PhoneGap.exec("Contacts.remove", GetFunctionName(successCB), { "contact": this});
    }
};
/**
* iOS ONLY
* displays contact via iOS UI
*
* @param errorCB error callback
*/
Contact.prototype.display = function(successCB, errorCB, options) { 
	var errCallback = (errorCB == undefined || errorCB == null) ? null : GetFunctionName(errorCB);
	navigator.service.contacts.errorCallback = null;
	if (errCallback != null){
		navigator.service.contacts.errorCallback = errorCB;
	}
    if (this.id == null){
    	if(errCallback != null) {
        	var errorObj = new ContactError();
        	errorObj.code = ContactError.NOT_FOUND_ERROR;
        	errorCB(errorObj);
    	}
    } else {
    	PhoneGap.exec("Contacts.displayContact", this.id, GetFunctionName(successCB), errCallback, options);
    }
};

/**
* Creates a deep copy of this Contact.
* With the contact ID set to null.
* @return copy of this Contact
*/
Contact.prototype.clone = function() {
    var clonedContact = PhoneGap.clone(this);
    clonedContact.id = null;
    // Loop through and clear out any id's in phones, emails, etc.
    if (clonedContact.phoneNumbers) {
    	for (i=0; i<clonedContact.phoneNumbers.length; i++) {
    		clonedContact.phoneNumbers[i].id = null;
    	}
    }
    if (clonedContact.emails) {
    	for (i=0; i<clonedContact.emails.length; i++) {
    		clonedContact.emails[i].id = null;
    	}
    }
    if (clonedContact.addresses) {
    	for (i=0; i<clonedContact.addresses.length; i++) {
    		clonedContact.addresses[i].id = null;
    	}
    }
    if (clonedContact.ims) {
    	for (i=0; i<clonedContact.ims.length; i++) {
    		clonedContact.ims[i].id = null;
    	}
    }
    if (clonedContact.organizations) {
    	for (i=0; i<clonedContact.organizations.length; i++) {
    		clonedContact.organizations[i].id = null;
    	}
    }
    if (clonedContact.photos) {
    	for (i=0; i<clonedContact.photos.length; i++) {
    		clonedContact.photos[i].id = null;
    	}
    }
    if (clonedContact.urls) {
    	for (i=0; i<clonedContact.urls.length; i++) {
    		clonedContact.urls[i].id = null;
    	}
    }
    return clonedContact;
};

/**
* Persists contact to device storage.
* @param successCB success callback
* @param errorCB error callback - optional
*/
Contact.prototype.save = function(successCB, errorCB) {
	var bErrCallback = (errorCB == undefined || errorCB == null) ? false : true;
	navigator.service.contacts.errorCallback = null;
	if (bErrCallback == true){
		navigator.service.contacts.errorCallback = errorCB;
	}

	navigator.service.contacts.resultsCallback = successCB;
	// don't modify the original contact
	var cloned = PhoneGap.clone(this);
	cloned.convertDatesOut(); 
	PhoneGap.exec("Contacts.save", GetFunctionName(successCB),  {"contact": cloned});
};

/**
* Contact name.
* @param formatted
* @param familyName
* @param givenName
* @param middle
* @param prefix
* @param suffix
*/
var ContactName = function(formatted, familyName, givenName, middle, prefix, suffix) {
    this.formatted = formatted != "undefined" ? formatted : null;
    this.familyName = familyName != "undefined" ? familyName : null;
    this.givenName = givenName != "undefined" ? givenName : null;
    this.middleName = middle != "undefined" ? middle : null;
    this.honorificPrefix = prefix != "undefined" ? prefix : null;
    this.honorificSuffix = suffix != "undefined" ? suffix : null;
};

/**
* Generic contact field.
* @param type
* @param value
* @param primary
* @param id
*/
var ContactField = function(type, value, pref, id) {
    this.type = type != "undefined" ? type : null;
    this.value = value != "undefined" ? value : null;
    this.pref = pref != "undefined" ? pref : null;
    this.id = id != "undefined" ? id : null;
};

/**
* Contact address.
* @param formatted
* @param streetAddress
* @param locality
* @param region
* @param postalCode
* @param country
*/
var ContactAddress = function(formatted, streetAddress, locality, region, postalCode, country, id) {
    this.formatted = formatted != "undefined" ? formatted : null;
    this.streetAddress = streetAddress != "undefined" ? streetAddress : null;
    this.locality = locality != "undefined" ? locality : null;
    this.region = region != "undefined" ? region : null;
    this.postalCode = postalCode != "undefined" ? postalCode : null;
    this.country = country != "undefined" ? country : null;
    this.id = id != "undefined" ? id : null;
};

/**
* Contact organization.
* @param name
* @param dept
* @param title
* @param startDate
* @param endDate
* @param location
* @param desc
*/
var ContactOrganization = function(name, dept, title, startDate, endDate, location, desc) {
    this.name = name != "undefined" ? name : null;
    this.department = dept != "undefined" ? dept : null;
    this.title = title != "undefined" ? title : null;
    this.startDate = startDate != "undefined" ? startDate : null;
    this.endDate = endDate != "undefined" ? endDate : null;
    this.location = location != "undefined" ? location : null;
    this.description = desc != "undefined" ? desc : null;
};

/**
* Contact account.
* @param domain
* @param username
* @param userid
*/
var ContactAccount = function(domain, username, userid) {
    this.domain = domain != "undefined" ? domain : null;
    this.username = username != "undefined" ? username : null;
    this.userid = userid != "undefined" ? userid : null;
}

/**
* Represents a group of Contacts.
*/
var Contacts = function() {
    this.inProgress = false;
    this.records = new Array();
    this.resultsCallback = null;
    this.errorCallback = null;
};
/**
* Returns an array of Contacts matching the search criteria.
* @param fields that should be searched
* @param successCB success callback
* @param errorCB error callback (optional)
* @param {ContactFindOptions} options that can be applied to contact searching
* @return array of Contacts matching search criteria
*/
Contacts.prototype.find = function(fields, successCB, errorCB, options) {
	this.resultsCallback = successCB;
	this.errorCallback = null;
	var bErrCallback = (errorCB == undefined || errorCB == null) ? false : true;
	if (bErrCallback){
		this.errorCallback = errorCB;
	}
	var theOptions = options || null;
	if (theOptions != null){
		// convert updatedSince to ms
		var value = theOptions.updatedSince
		if (value != ''){
			if (!value instanceof Date){
				try {
					value = new Date(value);
				} catch(exception){
					value = null;
				}
			}
			if (value instanceof Date){
				theOptions.updatedSince = value.valueOf();
			}
		}
	}

	PhoneGap.exec("Contacts.search", GetFunctionName(successCB), {"fields":fields, "findOptions":theOptions});
	
};
/**
* need to turn the array of JSON strings representing contact objects into actual objects
* @param array of JSON strings with contact data
* @return call results callback with array of Contact objects
*  This function is called from objective C Contacts.search() method.
*/

Contacts.prototype._findCallback = function(contactStrArray)
{
	var c = null;
	if (contactStrArray){
		c = new Array();
		try {
			for (var i=0; i<contactStrArray.length; i++)
			{
				var contactStr = contactStrArray[i];
				var newContact = navigator.service.contacts.create(contactStr); 
				newContact.convertDatesIn();
				c.push(newContact);
				
			}
		} catch(e){
			console.log("Error parsing contacts: " +e);
		}
	}
	try { 
        this.resultsCallback(c);
    }
    catch (e) {
        console.log("Error in user's result callback: " + e);
    }
};
/**
* need to turn the JSON string representing contact object into actual object
* @param JSON string with contact data
* Call stored results function with  Contact object
*  This function is called from objective C Contacts remove and save methods
*/
Contacts.prototype._contactCallback = function(contactStr)
{
	var newContact = null;
	if (contactStr){
		try {
			newContact = navigator.service.contacts.create(contactStr);
			newContact.convertDatesIn();
		} catch(e){
			console.log("Error parsing contact");
		}
	}
	try { 
        this.resultsCallback(newContact);
    }
    catch (e) {
        console.log("Error in user's result callback: " + e);
    }
};
/** 
* Need to return an error object rather than just a single error code
* @param error code
* Call optional error callback if found.
* Called from objective c find, remove, and save methods on error.
*/
Contacts.prototype._errCallback = function(errorCode)
{
	if (this.errorCallback){
		try {
			var errorObj = new ContactError();
        	errorObj.code = errorCode;
        	this.errorCallback(errorObj);
		}
		catch(e) {
			console.log("Error in user's error callback: " + e);
		}
	}
};
// iPhone only api to create a new contact via the GUI
Contacts.prototype.newContactUI = function(successCallback) { 
    PhoneGap.exec("Contacts.newContact", GetFunctionName(successCallback));
};
// iPhone only api to select a contact via the GUI
Contacts.prototype.chooseContact = function(successCallback, options) {
    PhoneGap.exec("Contacts.chooseContact", GetFunctionName(successCallback), options);
};


/**
* This function creates a new contact, but it does not persist the contact
* to device storage. To persist the contact to device storage, invoke
* contact.save().
* @param properties an object who's properties will be examined to create a new Contact
* @returns new Contact object
*/
Contacts.prototype.create = function(properties) {
    var contact = new Contact();
    for (i in properties) {
        if (contact[i]!='undefined') {
            contact[i]=properties[i];
        }
    }
    return contact;
};

/**
 * ContactFindOptions.
 * @param filter used to match contacts against
 * @param multiple boolean used to determine if more than one contact should be returned
 * @param updatedSince return only contact records that have been updated on or after the given time
 */
var ContactFindOptions = function(filter, multiple, updatedSince) {
    this.filter = filter || '';
    this.multiple = multiple || true;
    this.updatedSince = updatedSince || '';
};

/**
 *  ContactError.
 *  An error code assigned by an implementation when an error has occurred
 */
var ContactError = function() {
    this.code=null;
};

/**
 * Error codes
 */
ContactError.UNKNOWN_ERROR = 0;
ContactError.INVALID_ARGUMENT_ERROR = 1;
ContactError.NOT_FOUND_ERROR = 2;
ContactError.TIMEOUT_ERROR = 3;
ContactError.PENDING_OPERATION_ERROR = 4;
ContactError.IO_ERROR = 5;
ContactError.NOT_SUPPORTED_ERROR = 6;
ContactError.PERMISSION_DENIED_ERROR = 20;

/**
 * Add the contact interface into the browser.
 */
PhoneGap.addConstructor(function() { 
    if(typeof navigator.service == "undefined") navigator.service = new Object();
    if(typeof navigator.service.contacts == "undefined") navigator.service.contacts = new Contacts();
});

