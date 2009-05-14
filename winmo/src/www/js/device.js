var Device = {
    init: function() {
		this.exec("initialize");
		Device.available = typeof Device.model == "string";
    },
    exec: function(command, params) {
        if (Device.available || command == "initialize") {
            try {
                var url = "http://gap.exec/" + command;
                if (params) url += "/" + params.join("/");
                window.location.href = url;
            } catch(e) {
                console.log("Command '" + command + "' has not been executed, because of exception: " + e);
                alert("Error executing command '" + command + "'.")
            }
        }
    }
}