# GAP

### bridging the gap between the web and the iphone SDK

PhoneGap is a free open source development tool and framework that
allows web developers to take advantage of the powerful features in
the iPhone SDK from HTML and JavaScript.  We're trying to make iPhone
app development easy and open.  For many applications a web
application is the way to but in Safari you don't get access to the
native iPhone APIs, and the that's the problem we're trying to solve.

It is written in Objective-C and allows developers to embed their web
app (HTML, JavaScript, CSS) in Webkit within a native iPhone app.
We're big advocates of the Open Web and want JavaScript developers to
be able to get access iPhone features such as a spring board icon,
background processing, push, geo location, camera, local sqlLite and
accelerometers without the burden of learning Objective-C and Cocoa.

PhoneGap also has a web app that allows web developers to quickly
package their web app into a native iPhone app by providing a URL, a
name and icon graphic the web service with automagically create a
native iPhone application.  We haven't open sourced that code but
we're going to soon.

PhoneGap was conceived at iPhoneDevCamp II by Nitobi developer Brock
Whitten, Rob Ellis, freelance designer Colin Toomley and Eric
Oesterle.

[get the GAP source](http://github.com/sintaxi/gap "source code via github") or [generate your GAP app](http://phonegap.com/ "generates iphone app")

## Javascript API
  
#### Geo Location
    
    //request location
    getLocation();
    
    //GAP will invoke this function once it has the location
    function gotLocation(lat,lon){
    	$('lat').innerHTML = "latitude: " + lat;
    	$('lon').innerHTML = "longitude: " + lon;
    }
    
#### Accelerometer

    //You have instant access to the accellerometer data
    function updateAccel(){
    	$('accel').innerHTML = "accel: " + accelX + " " + accelY + " " + accelZ;	
    	setTimeout(updateAccel,100);
    }
      
#### Camera (pending)

    function takePhoto(){
      var photo = gap:takePhoto();
      return photo;
    }
    
#### Sound (pending)

    function takePhoto(){
      var photo = gap:takePhoto();
      return photo;
    }
    
#### Vibration (pending)

    function vibrate(){
      gap:vibrate();
      return false;
    }

### License (MIT)

#### Copyright (c) 2008 Nitobi

Permission is hereby granted, free of charge, to any person obtaining  
a copy of this software and associated documentation files (the  
"Software"), to deal in the Software without restriction, including  
without limitation the rights to use, copy, modify, merge, publish,  
distribute, sublicense, and/or sell copies of the Software, and to  
permit persons to whom the Software is furnished to do so, subject to  
the following conditions:  

The above copyright notice and this permission notice shall be  
included in all copies or substantial portions of the Software.  

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,  
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF  
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND  
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE  
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION  
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION  
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.