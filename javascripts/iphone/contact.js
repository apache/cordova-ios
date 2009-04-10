ContactManager.prototype.get = function(successCallback, errorCallback, options) {
	PhoneGap.exec("Contacts.get");
	if (typeof successCallback == "function") {
		for (var i = 0;i<_contacts.length;i++) {
			var con = new Contact();
			con.name = _contacts[i].name;
			con.phone = _contacts[i].phone;		
			this.contacts.push(con);
		}
		successCallback(this);
		
	}
}
