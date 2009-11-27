function Network() {
    /**
     * The last known Network status.
     */
	this.lastReachability = null;
};

Network.prototype.isReachable = function(hostName, successCallback, options) {
	this.request = new Mojo.Service.Request('palm://com.palm.connectionmanager', {
	    method: 'getstatus',
	    parameters: {},
	    onSuccess: function(result) { successCallback(result.isInternetConnectionAvailable); },
	    onFailure: function() {}
	});

};

if (typeof navigator.network == "undefined") navigator.network = new Network();