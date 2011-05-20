if (!PhoneGap.hasResource("connection")) {
	PhoneGap.addResource("connection");
	
// //////////////////////////////////////////////////////////////////
	
Connection = function() {
	/*
	 * One of the connection constants below.
	 */
	this.type = 0;
	/*
	 * The home network provider, only valid if cellular based.
	 */
	this.homeNW = null;
	/*
	 * The current network provider, only valid if cellular based.
     */
	this.currentNW = null;
	
	/* initialize from the extended DeviceInfo properties */
    try {      
		this.type		= DeviceInfo.connection.type;
		this.homeNW		= DeviceInfo.connection.homeNW;
		this.currentNW	= DeviceInfo.connection.currentNW;
    } 
	catch(e) {
    }
};

Connection.UNKNOWN = 0; // Unknown connection type
Connection.ETHERNET = 1;
Connection.WIFI = 2;
Connection.CELL_2G = 3;
Connection.CELL_3G = 4;
Connection.CELL_4G = 5;
Connection.NONE = 20; // NO connectivity

PhoneGap.addConstructor(function() {
    if (typeof navigator.connection == "undefined") navigator.connection = new Connection();
});

};