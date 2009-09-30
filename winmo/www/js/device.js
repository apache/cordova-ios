var device = {
    init: function() {
		this.exec("initialize");
		// For some reason, in WinMo v6.0, we need to delay setting device.available because device.name does not exist yet.
		// A 10ms delay is sufficient for the variable to be visible.
		setTimeout('device.available = typeof(device.name) == "string";',10);
    },
    exec: function(command, params) {
        if (device.available || command == "initialize") {
            try {
                var url = "http://gap.exec/" + command;
                if (params) url += "/" + params.join("/");
                window.location.href = url;
            } catch(e) {
                console.log("Command '" + command + "' has not been executed, because of exception: " + e);
                alert("Error executing command '" + command + "'.");
            }
        }
    }
};