/*
* Since we can't guarantee that we will have the most recent, we just try our best!
*
* Also, the API doesn't specify which version is the best version of the API
*/
 
Geolocation.prototype.getCurrentPosition = function(successCallback, errorCallback, options)
{
  var position = Geo.getCurrentLocation();
  this.global_success = successCallback;
  this.fail = errorCallback;
}
 
 
// Run the global callback
Geolocation.prototype.gotCurrentPosition = function(lat, lng, alt, altacc, head, vel, stamp)
{
  if (lat == "undefined" || lng == "undefined")
  {
    this.fail();
  }
  else
  {
    coords = new Coordinates(lat, lng, alt, altacc, head, vel);
    loc = new Position(coords, stamp);
    this.global_success(loc);
  }
}

/*
* This turns on the GeoLocator class, which has two listeners.
* The listeners have their own timeouts, and run independently of this process
* In this case, we return the key to the watch hash
*/
 
Geolocation.prototype.watchPosition = function(successCallback, errorCallback, options)
{
  var frequency = (options != undefined)? options.frequency : 10000;
 
  if (!this.listeners)
  {
      this.listeners = [];
  }
 
  var key = this.listeners.push( {"success" : successCallback, "fail" : failCallback }) - 1;
 
  // TO-DO: Get the names of the method and pass them as strings to the Java.
  return Geolocation.start(frequency, key);
}
 
/*
 * Retrieve and stop this listener from listening to the GPS
 *
 */
Geolocation.prototype.success = function(key, lat, lng, alt, altacc, head, vel, stamp)
{
  var coords = new Coordinates(lat, lng, alt, altacc, head, vel);
  var loc = new Position(coords, stamp);
  this.listeners[key].success(loc);
}

Geolocation.prototype.fail = function(key)
{
  this.listeners[key].fail();
}
 
Geolocation.prototype.clearWatch = function(watchId)
{
  Geo.stop(watchId);
}
