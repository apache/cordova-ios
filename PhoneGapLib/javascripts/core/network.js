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
Connection.CELL_2G = "2g";
Connection.CELL_3G = "3g";
Connection.CELL_4G = "4g";
Connection.NONE = "none"; // NO connectivity

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