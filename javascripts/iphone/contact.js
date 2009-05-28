// Gets the function name of a Function object, else uses "alert"
function GetFunctionName(fn)
{
  var m = fn.toString().match(/^\s*function\s+([^\s\(]+)/);
  return m ? m[1] : "alert";
}

ContactManager.prototype.allContacts = function(successCallback, errorCallback, options) {
	PhoneGap.exec("Contacts.allContacts", GetFunctionName(successCallback), options);
}

// THE FUNCTIONS BELOW ARE iPHONE ONLY FOR NOW

ContactManager.prototype.newContact = function(contact, successCallback, options) {
    PhoneGap.exec("Contacts.newContact", contact.firstName, contact.lastName, 
        options);
}

ContactManager.prototype.displayContact = function(contactID, options) {
    PhoneGap.exec("Contacts.displayContact", contactID, options);
}

ContactManager.prototype.contactsCount = function(successCallback, errorCallback) {
	PhoneGap.exec("Contacts.contactsCount", GetFunctionName(successCallback));
}
