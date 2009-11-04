/**
 * This overrides existing contact code, and builds proper contacts
 * @constructor
 */

var Contact = function() {
  this.givenNames = [];
  this.familyName = "";
  this.phones = [];
  this.category = "";
  this.companyName = "";
  this.isCompany = false;
  this.email = [];
  this.addresses = [];
  this.uri = [];
  this.prefix = "";
  this.jobTitle = "";
  this.birthday = "";
  this.phoneticName = "";
}

var Address = function() {
  this.street = "";
  this.postalCode = "";
  this.city = "";
  this.region = "";
  this.countryCode = "";
  this.country = "";
  this.building = "";
  this.floor = "";
  this.accessCode = "";
}

var PhoneNumber = function() {
  this.number = "";
  this.type = ""; 
}

var Email = function() {
  this.address = "";
  this.type = "";
}

var ImHandle = function()
{
  this.address = "";
  this.type = "";
  this.network = "";
}

var Uri = function() {
  this.addr = "";
  this.rel = "";
}


var AddressBook = function() {
  this.name = "";
}

AddressBook.prototype.addContact = function(newContact, win, fail)
{
    
}

AddressBook.prototype.removeContact = function(target, win, fail)
{
  
}

AddressBook.prototype.findContacts = function(filter,win, fail)
{
}

PhoneGap.addConstructor(function() {
  if (typeof navigator.AddressBook == "undefined")
    navigator.AddressBook = new AddressBook(); });
