# GAP

### bridging the gap between the web and the iphone SDK

Written in Objective-C, GAP is an open source developer tool 
for the iphone that allows calls to the native iPhone SKD 
with javascript. values are returned as a json object.

[get the GAP source](http://github.com/sintaxi/gap "source code via github") or [generate your GAP app](http://phonegap.com/ "generates iphone app")

## API
  
#### Geo Location
      
    function getLocData(){
      var location = gap:getloc();
      return location;
    }
      
#### Camera (pending)

    function takePhoto(){
      var photo = gap:takePhoto();
      return photo;
    }
    
#### Vibration (pending)

    function vibrate(){
      gap:vibrate();
      return false;
    }
    
#### Accelerometer (pending)

    function getAccelData(){
      gap:accelerometer();
      return false;
    }

## Contributors

Eric Oesterle   
Colin Toomey - Guru Design  
Andre Charland - Nitobi  
Rob Ellis - Nitobi  
Brock Whitten - Nitobi  

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