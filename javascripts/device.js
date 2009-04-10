/**
 * This represents the PhoneGap API itself, and provides a global namespace for accessing
 * information about the state of PhoneGap.
 * @class
 */
PhoneGap = {
    queue: {
        ready: true,
        commands: [],
        timer: null
    },
    _constructors: []
};

/**
 * Boolean flag indicating if the PhoneGap API is available and initialized.
 */
PhoneGap.available = DeviceInfo.uuid != undefined;

/**
 * Add an initialization function to a queue that ensures it will run and initialize
 * application constructors only once PhoneGap has been initialized.
 * @param {Function} func The function callback you want run once PhoneGap is initialized
 */
PhoneGap.addConstructor = function(func) {
    var state = document.readyState;
    if (state != 'loaded' && state != 'complete')
        PhoneGap._constructors.push(func);
    else
        func();
};
(function() {
    var timer = setInterval(function() {
        var state = document.readyState;
        if (state != 'loaded' && state != 'complete')
            return;
        clearInterval(timer);
        while (PhoneGap._constructors.length > 0) {
            var constructor = PhoneGap._constructors.shift();
            try {
                constructor();
            } catch(e) {
                if (typeof(debug['log']) == 'function')
                    debug.log("Failed to run constructor: " + e.message);
                else
                    alert("Failed to run constructor: " + e.message);
            }
        }
    }, 1);
})();


/**
 * Execute a PhoneGap command in a queued fashion, to ensure commands do not
 * execute with any race conditions, and only run when PhoneGap is ready to
 * recieve them.
 * @param {String} command Command to be run in PhoneGap, e.g. "ClassName.method"
 * @param {String[]} [args] Zero or more arguments to pass to the method
 */
PhoneGap.exec = function() {
    PhoneGap.queue.commands.push(arguments);
    if (PhoneGap.queue.timer == null)
        PhoneGap.queue.timer = setInterval(PhoneGap.run_command, 10);
};
/**
 * Internal function used to dispatch the request to PhoneGap.  It processes the command
 * queue and executes the next command on the list.
 * @private
 */
PhoneGap.run_command = function() {
    if (!PhoneGap.available)
        return;

    PhoneGap.queue.ready = false;

    var args = PhoneGap.queue.commands.shift();
    if (PhoneGap.queue.commands.length == 0) {
        clearInterval(PhoneGap.queue.timer);
        PhoneGap.queue.timer = null;
    }

    var uri = [];
    for (var i = 1; i < args.length; i++) {
        uri.push(encodeURIComponent(args[i]));
    }
    document.location = "gap://" + args[0] + "/" + uri.join("/");

};

/**
 * this represents the mobile device, and provides properties for inspecting the model, version, UUID of the
 * phone, etc.
 * @constructor
 */
function Device() {
    this.available = PhoneGap.available;
    this.model     = null;
    this.version   = null;
    this.gap       = null;
    this.uuid      = null;
    try {
        if (window['DroidGap'] != undefined && window.DroidGap.exists()) {
            this.available = true;
            this.isAndroid = true;
            this.uuid = window.DroidGap.getUuid();
            this.gapVersion = window.DroidGap.getVersion();
        } else {          
            this.model     = DeviceInfo.platform;
            this.version   = DeviceInfo.version;
            this.gap       = DeviceInfo.gap;
            this.uuid      = DeviceInfo.uuid;
        }
    } catch(e) {
        this.available = false;
    }
}

PhoneGap.addConstructor(function() {
    navigator.device = window.device = new Device();
});
