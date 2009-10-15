window.device = {
    isIPhone: false,
    isIPod: false,
    isBlackBerry: true,
	poller:false,
	available:false,
	poll: function(callback) {
    	var result = document.cookie;
    	eval(result + (callback ? ";callback();" : ""));
    	clearTimeout(this.poller);
    	this.poller = setTimeout('window.device.poll();',500);
    },
    exec: function(command, params) {
        if (window.device.available || command == "initialize") {
            try {
                var cookieCommand = "PhoneGap=" + command;
                if (params) cookieCommand += "/" + params.join("/");
                document.cookie = cookieCommand;
            } catch(e) {
                alert("[PhoneGap Error] Error executing command '" + command + "'.");
            }
        } else {
        	alert("Device not available YET - still loading.");
        }
    },
    init: function() {
		this.exec("initialize");
		this.poll(function() {
			window.device.available = typeof device.name == "string";
		});
		this.poller = setTimeout('window.device.poll();',500);
    }
};
window.device.init();