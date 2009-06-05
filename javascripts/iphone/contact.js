// Gets the function name of a Function object, else uses "alert" if anonymous
function GetFunctionName(fn)
{
  if (fn) {
      var m = fn.toString().match(/^\s*function\s+([^\s\(]+)/);
      return m ? m[1] : "alert";
  } else {
    return null;
  }
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
