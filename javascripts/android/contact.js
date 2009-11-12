ContactManager.prototype.getAllContacts = function(successCallback, errorCallback, options) {
  this.win = successCallback;
  this.fail = errorCallback;
	ContactHook.getContactsAndSendBack();
}

ContactManager.prototype.droidAddContact = function(name, phone, email)
{
  var contact = new Contact();
  contact.name = name;
  contact.phones.primary = phone;
  contact.emails.primary = email;
  this.contacts.push(contact);
}

ContactManager.prototype.droidDone = function()
{
  win(this.contacts);
}
