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
if (DEBUG) {
    console = {
        log: function(message) {
            Device.exec('console.log', 'LOG', message);
        },
        error: function(message) {
            Device.exec('console.log', 'ERROR', message);
        }
    }
} else if (!window.console) {
    console = {
        log: function() {},
        error: function(message) {}
    }
}

var Device = {

    available: false,
    model: "",
    version: "",
	uuid: "",
    isIPhone: null,
    isIPod: null,
    events: new Array(),
    timer: null,
    
    init: function(model, version) {
        try {
            Device.available = __gap;
            Device.model = __gap_device_model;
            Device.version = __gap_device_version;
            Device.gapVersion = __gap_version;
			      Device.uuid = __gap_device_uniqueid;
            if(!Device.timer){
              Device.timer = setInterval(function(){
                // Wait for the device to get initialized
                if(Device.available){
                  
                  // once initialized, start the event timer loop
                  // and remove availablility timer.
                  clearInterval(Device.timer);
                  Device.timer = setInterval(function(){
                    if(Device.events.length){
                      var u = Device.events.shift();
                      Device.run_command(u);
                    }  
                  }, 1);
                }
              }, 10);
            }
        } catch(e) {
            alert("GAP is not supported!")
        } 
    },
    
    exec: function() {
        Device.events.push(arguments);
    },

    run_command: function(args){
        var uri = [];
        for (var i = 1; i < args.length; i++) {
            uri.push(encodeURIComponent(args[i]));
        }
        document.location = "gap://" + args[0] + "/" + uri.join("/");
    },

    Location: {
        // available: true,
        
        lon: null,
        lat: null,
        callback: null,
        initialized: false,
        
        init: function() {
            Device.Location.timer = setInterval(function(){
              if(Device.Location.initialized){
                clearInterval(Device.Location.timer);
                Device.exec("getloc");
              } 
            }, 500);
        },
        
        set: function(lat, lon) {
            Device.Location.lat = lat;
            Device.Location.lon = lon;
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
            return Device.exec("getphoto", Device.Image.callback)
        },
        
        getFromCamera: function() {
            return Device.exec("getphoto", Device.Image.callback)
        },
        
        getFromSavedPhotosAlbum: function() {
            return Device.exec("getphoto", Device.Image.callback)
        }

    },

    vibrate: function() {
        return Device.exec("vibrate")
    },

		playSound: function(clip) {
			return Device.exec('sound', clip);
		}

}

function initializeLocation() {
  Device.Location.initialized = true;
}

function gotLocation(lat, lon) {
    return Device.Location.set(lat, lon)
}
