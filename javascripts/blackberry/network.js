/**
 * This class contains information about any NetworkStatus.
 * @constructor
 */
function NetworkStatus() {
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
function Network() {
    /**
     * The last known Network status.
	 * { hostName: string, ipAddress: string, 
		remoteHostStatus: int(0/1/2), internetConnectionStatus: int(0/1/2), localWiFiConnectionStatus: int (0/2) }
     */
	this.lastReachability = null;
};

/**
 * Called by the geolocation framework when the reachability status has changed.
 * @param {Reachibility} reachability The current reachability status.
 */
Network.prototype.updateReachability = function(reachability) {
    this.lastReachability = reachability;
};

if (typeof navigator.network == "undefined") navigator.network = new Network();

Network.prototype.isReachable = function(hostName, successCallback, options) {
	this.isReachable_success = successCallback;
	PhoneGap.exec("network",["reach"]);
};
// Temporary implementation of XHR. Soon-to-be modeled as the w3c implementation.
Network.prototype.XHR = function(URL, POSTdata, successCallback) {
	var req = URL;
	if (POSTdata != null) {
		req += "|" + POSTdata;
	}
	this.XHR_success = successCallback;
	PhoneGap.exec("network",["xhr",req]);
};
