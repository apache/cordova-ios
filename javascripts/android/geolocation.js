/*
 * Since we can't guarantee that we will have the most recent, we just try our best!
 *
 * Also, the API doesn't specify which version is the best version of the API
 */

Geolocation.prototype.getCurrentPosition = function(successCallback, errorCallback, options)
{
  // Java handles this for us so we don't have to
}

/*
 * This turns on the GeoLocator class, which has two listeners.
 * The listeners have their own timeouts, and run independently of this process
 * In this case, we return the key to the watch hash
 */

Geolocation.prototype.watchPosition = function(successCallback, errorCallback, options)
{
  var frequency = (options != undefined)? options.frequency : 10000;

  // TO-DO: Get the names of the method and pass them as strings to the Java.
  return Geo.start(frequency, succStr, failString);
}

/*
 * Retrieve and stop this listener from listening to the GPS
 *
 */

Geolocation.prototype.clearWatch = function(watchId)
{
  Geo.stop(watchId);
}

