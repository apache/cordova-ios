if (!PhoneGap.hasResource("position")) {
	PhoneGap.addResource("position");

/**
 * This class contains position information.
 * @param {Object} lat
 * @param {Object} lng
 * @param {Object} acc
 * @param {Object} alt
 * @param {Object} altAcc
 * @param {Object} head
 * @param {Object} vel
 * @constructor
 */
Position = function(coords, timestamp) {
	this.coords = Coordinates.cloneFrom(coords);
    this.timestamp = timestamp || new Date().getTime();
};

Position.prototype.equals = function(other) {
    return (this.coords && other && other.coords &&
            this.coords.latitude == other.coords.latitude &&
            this.coords.longitude == other.coords.longitude);
};

Position.prototype.clone = function()
{
    return new Position(
        this.coords? this.coords.clone() : null,
        this.timestamp? this.timestamp : new Date().getTime()
    );
}

Coordinates = function(lat, lng, alt, acc, head, vel, altAcc) {
	/**
	 * The latitude of the position.
	 */
	this.latitude = lat;
	/**
	 * The longitude of the position,
	 */
	this.longitude = lng;
	/**
	 * The altitude of the position.
	 */
	this.altitude = alt;
	/**
	 * The accuracy of the position.
	 */
	this.accuracy = acc;
	/**
	 * The direction the device is moving at the position.
	 */
	this.heading = head;
	/**
	 * The velocity with which the device is moving at the position.
	 */
	this.speed = vel;
	/**
	 * The altitude accuracy of the position.
	 */
	this.altitudeAccuracy = (altAcc != 'undefined') ? altAcc : null; 
};

Coordinates.prototype.clone = function()
{
    return new Coordinates(
        this.latitude,
        this.longitude,
        this.altitude,
        this.accuracy,
        this.heading,
        this.speed,
        this.altitudeAccuracy
    );
};

Coordinates.cloneFrom = function(obj)
{
    return new Coordinates(
        obj.latitude,
        obj.longitude,
        obj.altitude,
        obj.accuracy,
        obj.heading,
        obj.speed,
        obj.altitudeAccuracy
    );
};

/**
 * This class specifies the options for requesting position data.
 * @constructor
 */
PositionOptions = function(enableHighAccuracy, timeout, maximumAge) {
	/**
	 * Specifies the desired position accuracy.
	 */
	this.enableHighAccuracy = enableHighAccuracy || false;
	/**
	 * The timeout after which if position data cannot be obtained the errorCallback
	 * is called.
	 */
	this.timeout = timeout || 10000;
	/**
     * The age of a cached position whose age is no greater than the specified time 
     * in milliseconds. 
     */
	this.maximumAge = maximumAge || 0;
	
	if (this.maximumAge < 0) {
		this.maximumAge = 0;
	}
};

/**
 * This class contains information about any GPS errors.
 * @constructor
 */
PositionError = function(code, message) {
	this.code = code || 0;
	this.message = message || "";
};

PositionError.UNKNOWN_ERROR = 0;
PositionError.PERMISSION_DENIED = 1;
PositionError.POSITION_UNAVAILABLE = 2;
PositionError.TIMEOUT = 3;

};