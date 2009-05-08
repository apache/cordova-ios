/**
 * this represents the mobile device, and provides properties for inspecting the model, version, UUID of the
 * phone, etc.
 * @constructor
 */
function Device() {
    this.available = PhoneGap.available;
    this.model     = null;
    this.version   = null;
    this.gap       = null;
    this.uuid      = null;
    try {
        if (window['DroidGap'] != undefined && window.DroidGap.exists()) {
            this.available = true;
            this.isAndroid = true;
            this.uuid = window.DroidGap.getUuid();
            this.gapVersion = window.DroidGap.getVersion();
        } else {          
            this.model     = DeviceInfo.platform;
            this.version   = DeviceInfo.version;
            this.gap       = DeviceInfo.gap;
            this.uuid      = DeviceInfo.uuid;
        }
    } catch(e) {
        this.available = false;
    }
}

PhoneGap.addConstructor(function() {
    navigator.device = window.device = new Device();
});
