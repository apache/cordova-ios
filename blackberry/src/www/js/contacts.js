/**
 * This class represents a Contact in the manager.
 * @constructor
 */
function Contact() {
	this.name = "";
	this.phone = "";
	this.address = "";
	this.email = "";
}

function ContactManager() {
	this.contacts = [];
	this.timestamp = new Date().getTime();
	// Options used when calling ContactManager functions.
	this.options = {
		'pageSize':0,
		'pageNumber':0,
		'nameFilter':''
	};
}
ContactManager.prototype.formParams = function(options, startArray) {
	var params = [];
	if (startArray) params = startArray;
	if (options.pageSize && options.pageSize > 0) params.push("pageSize:" + options.pageSize);
	if (options.pageNumber) params.push("pageNumber:" + options.pageNumber);
	if (options.nameFilter) params.push("nameFilter:" + options.nameFilter);
	return params;	
}
ContactManager.prototype.displayContact = function(successCallback, errorCallback, options) {
	if (options.nameFilter && options.nameFilter.length > 0) {
		var params = ["search"];
		params = this.formParams(options,params);
		this.search_onSuccess = successCallback;
		this.search_onError = errorCallback;
		device.exec("contacts", params, true);
	} else {
		ContactManager.getAllContacts(successCallback,errorCallback,options);
		return;
	}
}
ContactManager.prototype.getAllContacts = function(successCallback, errorCallback, options) {
	this.global_onSuccess = successCallback;
	this.global_onError = errorCallback;
	var params = ["getall"];
	params = this.formParams(options,params);
	device.exec("contacts", params, true);
}
ContactManager.prototype.chooseContact = function(successCallback, options) {
	this.choose_onSuccess = successCallback;
	var params = ["choose"];
	params = this.formParams(options,params);
	device.exec("contacts", params, true);
}

if (typeof navigator.ContactManager == "undefined") navigator.ContactManager = new ContactManager();