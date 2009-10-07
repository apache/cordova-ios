/**
 * This overrides existing contact code, and builds proper contacts
 * @constructor
 */

var contactWin = function() {}
var contactFail = function() {}

function Contact() {
  this.firstName = "";
  this.lastName = "";
  this.name = "";
  this.phoneRecords = [];
  this.email = [];
  this.address = ""
}

var contactCursor;

function PhoneInfo() {
  this.npa = "";
  this.primary = false;
  this.rel = ""; 
}

function Email() {
  this.addr = "";
  this.primary = false;
  this.rel = "";
}

ContactManager.prototype.getAllContacts = function(successCallback, errorCallback, options)
{
  contactWin = successCallback;
  contactFail = errorCallback;
  contactMgr.startSendingContacts();
}

ContactManager.prototype.contactAdd = function(contact)
{
  
}

ContactManager.prototype.globalFail = function(error)
{
  contactFail(error);
}

ContactManager.prototype.globalWin = function()
{
  contactWin();
}
