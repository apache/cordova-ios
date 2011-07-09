if (!PhoneGap.hasResource("network")) {
	PhoneGap.addResource("network");

// //////////////////////////////////////////////////////////////////

Connection = function() {
	/*
	 * One of the connection constants below.
	 */
	this.type = Connection.UNKNOWN;

	/* initialize from the extended DeviceInfo properties */
    try {      
		this.type	= DeviceInfo.connection.type;
    } 
	catch(e) {
    }
};

Connection.UNKNOWN = "unknown"; // Unknown connection type
Connection.ETHERNET = "ethernet";
Connection.WIFI = "wifi";
Connection.CELL_2G = "2g"; // the default for iOS, for any cellular connection
Connection.CELL_3G = "3g";
Connection.CELL_4G = "4g";
Connection.NONE = "none"; // NO connectivity


PhoneGap.addConstructor(function() {
    if (typeof navigator.network == "undefined") navigator.network = {};
    if (typeof navigator.network.connection == "undefined") navigator.network.connection = new Connection();
});

};