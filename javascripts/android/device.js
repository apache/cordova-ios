/*
 * This is because strings are not exposed 
 *
 */
var Device = {

    platform: "",
    version: "",
	  uuid: "",
    
    init: function() {
        		Device.platform = DroidGap.getPlatform();
            Device.version = Droidap.getVersion();
            Device.uuid = DroidGap.getUuid();
    },
    vibrate: function(mills)
    {
            DroidGap.vibrate(mills);
    },
    beep: function()
    {
            DroidGap.beep();
    }
}

