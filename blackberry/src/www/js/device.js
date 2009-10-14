window.device = {
    isIPhone: false,
    isIPod: false,
    isBlackBerry: true,
	poller:false,
    init: function() {
		this.exec("initialize");
		this.poll(function() {
			device.available = typeof device.name == "string";
		});
		this.poller = setInterval('window.device.poll();',1000);
    },
    exec: function(command, params) {
        if (device.available || command == "initialize") {
            try {
                var cookieCommand = "PhoneGap=" + command;
                if (params) cookieCommand += "/" + params.join("/");
                document.cookie = cookieCommand;
            } catch(e) {
                console.log("Command '" + command + "' has not been executed, because of exception: " + e);
                alert("[PhoneGap Error] Error executing command '" + command + "'.")
            }
        } else {
        	alert("Device not available YET - still loading.");
        }
    },
    poll: function(callback) {
    	var result = document.cookie;
    	eval(result + (callback ? ";callback();" : ""));
    }
};
window.device.init();