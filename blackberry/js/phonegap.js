
if (typeof(DeviceInfo) != 'object')
    DeviceInfo = {};

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
 * Execute a PhoneGap command in a queued fashion, to ensure commands do not
 * execute with any race conditions, and only run when PhoneGap is ready to
 * recieve them.
 * @param {String} command Command to be run in PhoneGap, e.g. "ClassName.method"
 * @param {String[]} [args] Zero or more arguments to pass to the method
 */
PhoneGap.exec = function() {
    var args = '';
	if (arguments.length == 1) {
		args = arguments[0];
	} else {
		for (var i = 0; i < arguments.length; i++) {
			if (typeof(arguments[i]) == "string") {
				args += arguments[i] + '/';
			} else {
				if (typeof(arguments[i])=="object" && arguments[i].length > 1) {
					args += arguments[i].join('/') + '/';
				} else {
					args += arguments[i] + '/';
				}
			}
		}
		args = args.substr(0,args.length-1);
	}
	var command = "PhoneGap=" + args;
	//alert(command);
	document.cookie = command;
};
