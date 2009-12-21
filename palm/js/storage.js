/**
 * TODO for Palm. Could just use below functionality, and implement simple serialization, or could map to Palm's data store APIs.
 * @author ryan
 */

function Storage() {
	this.length = null;
	this.available = true;
	this.serialized = null;
	this.items = null;
	
	if (!window.widget) {
		this.available = false;
		return;
	}
	var pref = window.widget.preferenceForKey(Storage.PREFERENCE_KEY);
	
	//storage not yet created
	if (pref == "undefined" || pref == undefined) {
		this.length = 0;
		this.serialized = "({})";
		this.items = {};
		window.widget.setPreferenceForKey(this.serialized, Storage.PREFERENCE_KEY);
	} else {
		this.serialized = pref;'({"store_test": { "key": "store_test", "data": "asdfasdfs" },})';

		this.items = eval(this.serialized);

	}
}

Storage.PREFERENCE_KEY = "phonegap_storage_pref_key";

Storage.prototype.index = function (key) {
	
}

Storage.prototype.getItem = function (key) {
	
	var err = "Storage unimplemented on Palm PhoneGap";
	debug.log(err);
	throw { name: "StorageError", message: err };
	
	try {
		return this.items[key].data;
	} catch (ex) {
		return null;
	}
}

Storage.prototype.setItem = function (key, data) {
	
	var err = "Storage unimplemented on Palm PhoneGap";
	debug.log(err);
	throw { name: "StorageError", message: err };
	
	if (!this.items[key])
		this.length++;
	this.items[key] = {
		"key": key,
		"data": data
	};
	
	this.serialize();
}

Storage.prototype.removeItem = function (key) {
	if (this.items[key]) {
		this.items[key] = undefined;
		this.length--;
	}
	this.serialize();
}

Storage.prototype.clear = function () {
	this.length = 0;
	this.serialized = "({})"
	this.items = {};
}

Storage.prototype.serialize = function() {
	var err = "Storage unimplemented on Palm PhoneGap";
	debug.log(err);
	throw { name: "StorageError", message: err };

}

if (typeof navigator.storage == "undefined" ) navigator.storage = new Storage();
