// Utils

try {
    $ // Test if it is alread used
} catch(e) {
    $ = function(id){
        return document.getElementById(id)
    };
}

// Acceleration Handling

var accelX = 0;
var accelY = 0;
var accelZ = 0;

function gotAcceleration(x,y,z){
	x = eval(x);
	y = eval(y);
	z = eval(z);
	if ((!isNaN(x)) && (!isNaN(y)) && (!isNaN(z))) {
		accelX = x;
		accelY = y;
		accelZ = z;
	}
	return x + " " + y + " " + z;
}

// A little more abstract

var DEBUG = true;
if (!window.console || !DEBUG) {
    console = {
        log: function(){
        },
        error: function(){
        }
    }
}

var Device = {

    available: false,
    model: "",
    version: "",
	uuid: "",
    isIPhone: null,
    isIPod: null,
    
    init: function(model, version) {
        try {
            Device.available = __gap;
            Device.model = __gap_device_model;
            Device.version = __gap_device_version;
            Device.gapVersion = __gap_version;
			Device.uuid = __gap_device_uniqueid;
        } catch(e) {
            alert("GAP is not supported!")
        } 
    },
    
    exec: function(command) {
        if (Device.available) {
            try {
                document.location = "gap:" + command;
            } catch(e) {
                console.log("Command '" + command + "' has not been executed, because of exception: " + e);
                alert("Error executing command '" + command + "'.")
            }
        }
    },

    Location: {
        // available: true,
        
        lon: null,
        lat: null,
        callback: null,
        
        init: function() {
            Device.exec("getloc");
        },
        
        set: function(lat, lon) {
            Device.Location.lat = lat;
            Device.Location.lon = lon;
            if(Device.Location.callback != null) {
                Device.Location.callback(lat, lon)
                Device.Location.callback = null;
            }
        },

        wait: function(func) {
            Device.Location.callback = func
            Device.exec("getloc");
        }
        
    },

    Image: {

        //available: true,

		callback: null,
		
        getFromPhotoLibrary: function() {
            return Device.exec("getphoto" + ":" + Device.Image.callback)
        },
        
        getFromCamera: function() {
            return Device.exec("getphoto" + ":" + Device.Image.callback)
        },
        
        getFromSavedPhotosAlbum: function() {
            return Device.exec("getphoto" + ":" + Device.Image.callback)
        }

    },

    vibrate: function() {
        return Device.exec("vibrate")
    },

		playSound: function(clip) {
			return Device.exec('sound:' + clip);
		}

}

function gotLocation(lat, lon) {
    return Device.Location.set(lat, lon)
}