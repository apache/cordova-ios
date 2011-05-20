if (!PhoneGap.hasResource("network")) {
	PhoneGap.addResource("network");

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

// //////////////////////////////////////////////////////////////////
	
/**
 * This class contains information about any NetworkStatus.
 * @constructor
 */
NetworkStatus = function() {
	this.code = null;
	this.message = "";
}

NetworkStatus.NOT_REACHABLE = 0;
NetworkStatus.REACHABLE_VIA_CARRIER_DATA_NETWORK = 1;
NetworkStatus.REACHABLE_VIA_WIFI_NETWORK = 2;

/**
 * This class provides access to device Network data (reachability).
 * @constructor
 */
Network = function() {
};

/**
 * 
 * @param {Function} successCallback
 * @param {Function} errorCallback
 * @param {Object} options
 */
Network.prototype.isReachable = function(hostName, successCallback, options) {
	PhoneGap.exec("Network.isReachable", hostName, GetFunctionName(successCallback), options);
};


PhoneGap.addConstructor(function() {
    if (typeof navigator.network == "undefined") navigator.network = new Network();
    if (typeof navigator.network.connection == "undefined") navigator.network.connection = new Connection();
});

};