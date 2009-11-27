function Device() {
    this.platform = null;
    this.version  = null;
    this.name     = null;
    this.uuid     = null;

	this.setUUID();
}

Device.prototype.setUUID = function() {
	//this is the only system property webos provides (may change?)
	try {
	var that = this;
	this.service = new Mojo.Service.Request('palm://com.palm.preferences/systemProperties', {
	    method:"Get",
	    parameters:{"key": "com.palm.properties.nduid" },
	    onSuccess: function(result) {
			that.uuid = result["com.palm.properties.nduid"];
		}
    });
	} catch (ex) {
		Mojo.Log.error(ex.name + ": " + ex.message);
	}	
}

if (typeof navigator.device == 'undefined') navigator.device = new Device();