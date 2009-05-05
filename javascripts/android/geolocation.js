/*
 * Since we can't guarantee that we will have the most recent, we just try our best!
 *
 * Also, the API doesn't specify which version is the best version of the API
 */

Geolocation.prototype.getCurrentPosition = function(successCallback, errorCallback, options)
{
  var position = Geo.getCurrentPosition();
  this.global_success = successCallback;
  this.fail = errorCallback;
}


// Run the global callback
Geolocation.prototype.gotCurrentPosition = function(lat, lng)
{
  if (lat == 0 || lng == 0)
  {
    this.fail();
  }
  else
  {
    var p = { "lat" : lat, "lng": lng };
    this.global_success(p);
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
Geolocation.prototype.success(key, lat, lng)
{
  this.listeners[key].success(lat,lng);
}

Geolocation.prototype.fail(key)
{
  this.listeners[key].fail();
}

Geolocation.prototype.clearWatch = function(watchId)
{
  Geo.stop(watchId);
}


