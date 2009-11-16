
function Utility() {
	
};

/**
 * Closes the application.
 */
Utility.prototype.exit = function() {
	var params = [];
	PhoneGap.exec("exit", params);
}

if (typeof navigator.utility == "undefined") navigator.utility = new Utility();
