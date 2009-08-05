navigator.notification = {
    vibrate: function(secs) {
    	window.device.exec("notification/vibrate",[secs]);
    },
    beep: function(times) {
    	window.device.exec("notification/beep",[times]);
    }
};