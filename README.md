# GAP

### open souce platform for iphone, blackberry

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

    Device.Image.getFromPhotoLibrary();
    
#### Sound 
    
    // Plays a media clip from the resourse bundle. (WAV or MP3)
  
    Device.playSound('bird.mp3');
  
    
#### Vibration

  // Vibrates the device - Returns nothing.
  
  Device.vibrate();

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