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
		});
		this.poller = setTimeout('window.device.poll();',500);
    } catch(e) {
        alert("[PhoneGap Error] Error initializing.");
    }
};
Device.init();