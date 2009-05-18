window.Device = {
    isIPhone: false,
    isIPod: false,
    isBlackBerry: true,

    init: function() {
		this.exec("initialize");
		this.poll(function() {
			Device.available = typeof Device.model == "string";
		});
    },
    exec: function(command, params, sync) {
        if (Device.available || command == "initialize") {
            try {
                var url = "gap://" + command;
                if (params) url += "/" + params.join("/");
                document.location = url;
                if (sync) this.poll();
            } catch(e) {
                console.log("Command '" + command + "' has not been executed, because of exception: " + e);
                alert("Error executing command '" + command + "'.")
            }
        }
    },
    poll: function(callback) {
    	eval(document.cookie + (callback ? ";callback();" : ""));
    },
    vibrate: function(secs) {
        return Device.exec("vibrate", [secs]);
    }
};

window.Device.init();