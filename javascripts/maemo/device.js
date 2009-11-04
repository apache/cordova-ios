// DeviceInfo is a Qt object on Maemo

function Device() {
    this.available = true;
	this.platform  = DeviceInfo.platform;
	this.version   = DeviceInfo.version;
	this.name      = DeviceInfo.name;
	this.gap       = DeviceInfo.gap;
	this.uuid      = DeviceInfo.uuid;
    
}

navigator.Device = window.Device = window.device = new Device();
