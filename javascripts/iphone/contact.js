ContactManager.prototype.get = function(successCallback, errorCallback, options) {
	document.location = "gap://getContacts/null";
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
