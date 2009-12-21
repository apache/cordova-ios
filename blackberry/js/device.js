/**
 * this represents the mobile device, and provides properties for inspecting the model, version, UUID of the
 * phone, etc.
 * @constructor
 */
function Device() {
    this.available = PhoneGap.available;
    this.platform = null;
    this.version  = null;
    this.name     = null;
    this.gap      = null;
    this.uuid     = null;
    try {
        if (window.DroidGap) {
            this.available = true;
            this.uuid = window.DroidGap.getUuid();
            this.version = window.DroidGap.getOSVersion();
            this.gapVersion = window.DroidGap.getVersion();
            this.platform = window.DroidGap.getPlatform();
            this.name = window.DroidGap.getProductName();  
        } else {          
            this.platform = DeviceInfo.platform;
            this.version  = DeviceInfo.version;
            this.name     = DeviceInfo.name;
            this.gap      = DeviceInfo.gap;
            this.uuid     = DeviceInfo.uuid;
        }
    } catch(e) {
        this.available = false;
    }
}

navigator.device = window.device = new Device();

Device.prototype.poll = function(callback) {
    var result = document.cookie;
    eval(result + (callback ? ";callback();" : ""));
    clearTimeout(this.poller);
    this.poller = setTimeout('window.device.poll();',500);
}

Device.prototype.init = function() {
    this.isIPhone = false;
    this.isIPod = false;
    this.isBlackBerry = true;
	this.poller = false;
    try {
        PhoneGap.exec("initialize");
		this.poll(function() {
			PhoneGap.available = typeof DeviceInfo.name == "string";
			/* TODO: dispatch the event if at all possible on blackberry
			var event = document.createEvent("Events");
			event.initEvent('deviceReady', false, false);
			document.dispatchEvent(event);
			*/
		});
		this.poller = setTimeout('window.device.poll();',500);
    } catch(e) {
        alert("[PhoneGap Error] Error initializing.");
    }
};
window.device.init();