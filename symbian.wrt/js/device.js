PhoneGap.ExtendWrtDeviceObj = function(){
	
	if (!window.device)
		window.device = {};
	navigator.device = window.device;

	try {
	
		if (window.menu)
	    	window.menu.hideSoftkeys();
		
		device.available = PhoneGap.available;
		device.platform = null;
		device.version = null;
		device.name = null;
		device.uuid = null;
		
		var so = device.getServiceObject("Service.SysInfo", "ISysInfo");
		var pf = PhoneGap.GetWrtPlatformVersion(so);
		device.platform = pf.platform;
		device.version = pf.version;
		device.uuid = PhoneGap.GetWrtDeviceProperty(so, "IMEI");
		device.name = PhoneGap.GetWrtDeviceProperty(so, "PhoneModel");
	} 
	catch (e) {
		device.available = false;
	}
}

PhoneGap.GetWrtDeviceProperty = function(serviceObj, key) {
	var criteria = { "Entity": "Device", "Key": key };
	var result = serviceObj.ISysInfo.GetInfo(criteria);
	if (result.ErrorCode == 0) {
		return result.ReturnValue.StringData;
	}
	else {
		return null;
	}
}

PhoneGap.GetWrtPlatformVersion = function(serviceObj) {
	var criteria = { "Entity": "Device", "Key": "PlatformVersion" };
	var result = serviceObj.ISysInfo.GetInfo(criteria);
	if (result.ErrorCode == 0) {
		var version = {};
		version.platform = result.ReturnValue.MajorVersion;
		version.version = result.ReturnValue.MinorVersion;
		return version;
	}
	else {
		return null;
	}
}

PhoneGap.ExtendWrtDeviceObj();