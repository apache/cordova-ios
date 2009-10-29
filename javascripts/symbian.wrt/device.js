function Device(){
	try { //TODO: try to get this info
	
		if (window.menu)
	    	window.menu.hideSoftkeys();
		
		this.available = PhoneGap.available;
		this.platform = null;
		this.version = null;
		this.name = null;
		this.gap = null;
		
		//TODO: device is the WRT device object. Device is the phonegap device object (case-sensitive). prolly not good.
		var so = device.getServiceObject("Service.SysInfo", "ISysInfo");
		var criteria = { "Entity": "Device", "Key": "IMEI" };
		var result = so.ISysInfo.GetInfo(criteria);
		if (result.ErrorCode == 0) {
			this.uuid = result.ReturnValue.StringData;
		}
		else {
			this.uuid = null;
		}
	} 
	catch (e) {
		this.available = false;
	}
}

navigator.Device = window.Device = new Device();