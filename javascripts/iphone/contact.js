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

ContactManager.prototype.allContacts = function(successCallback, errorCallback, options) {
	PhoneGap.exec("Contacts.allContacts", GetFunctionName(successCallback), options);
}

// THE FUNCTIONS BELOW ARE iPHONE ONLY FOR NOW

ContactManager.prototype.newContact = function(contact, successCallback, options) {
    PhoneGap.exec("Contacts.newContact", contact.firstName, contact.lastName, 
        options);
}

ContactManager.prototype.chooseContact = function(options) {
    PhoneGap.exec("Contacts.chooseContact", options);
}

ContactManager.prototype.displayContact = function(contactID, errorCallback, options) {
    PhoneGap.exec("Contacts.displayContact", contactID, GetFunctionName(errorCallback), options);
}

ContactManager.prototype.removeContact = function(contactID, successCallback, errorCallback, options) {
    PhoneGap.exec("Contacts.displayContact", contactID, GetFunctionName(successCallback), 
        GetFunctionName(errorCallback), options);
}

ContactManager.prototype.contactsCount = function(successCallback, errorCallback) {
	PhoneGap.exec("Contacts.contactsCount", GetFunctionName(successCallback));
}
