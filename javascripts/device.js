
function Device() {
	this.model = "";
	this.version = "";
	this.gap = "";
	this.uuid = "";
}

navigator.device = new Device();

if (window.DroidGap.exists() ) {
    Device.available = true;
    Device.isAndroid = true;
    Device.uuid = window.DroidGap.getUuid();
    Device.gapVersion = window.DroidGap.getVersion();
} else {          
    Device.available = __gap;
    Device.model = __gap_device_model;
    Device.version = __gap_device_version;
    Device.gapVersion = __gap_version;
 	Device.uuid = __gap_device_uniqueid;
}