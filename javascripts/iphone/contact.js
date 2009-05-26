ContactManager.prototype.getAllContacts = function(successCallback, errorCallback, options) {
	PhoneGap.exec("Contacts.getAllContacts");
	if (typeof successCallback == "function") {
		for (var i = 0;i<_contacts.length;i++) {
			var con = new Contact();
			con.firstName = _contacts[i].firstName;
			con.lastName = _contacts[i].lastName;
			con.phoneNumber = _contacts[i].phoneNumber;
			con.address = _contacts[i].address;		
			this.contacts.push(con);
		}
		successCallback(this);
	}
}
