
PhoneGap
=============================================================
PhoneGap is a development tool that allows web developers to 
take advantage of the core features in the iPhone and Android 
SDK using JavaScript.


Get Started
-------------------------------------------------------------
Download the source.

    git clone git://github.com/sintaxi/phonegap.git
    
PhoneGap project is separated into a native project for each 
device, javascript files and a rakefile.

    phonegap
      |- README.md
      |- Rakefile
      |- android/
      |- blackberry/
      |- iphone/
      `- javascripts/
      
Each project has a respective README.md file. view that file 
for detailed information on how to work with that device. PhoneGap 
offers one unified API for accessing core functionality on all 
devices. Where possible, phonegap follows the **HTML5 spec**.


API
-------------------------------------------------------------

### Device

Exposes properties of the phone, such as its device ID, model, and OS version number.

### Location

Gain access to the Latitude / Longitude of the device, and depending on the type of device, the course, speed, and altitude.
    
### Accelerometer

Monitor the accelerometer on the device to detect orientation, shaking and other similar actions.
    
### Contacts

Query the phone addressbook to read the users contacts.

### Orientation

Read the device layout orientation, e.g. landscape vs portrait.

### Camera

Brings up the camera or photo browser on the phone to allow the user to upload a photo.

### Vibrate

Triggers the vibration alert on the phone, if it is supported.

### Sound

Play sound files (WAV, MP3, etc).

### Telephony

Trigger and activate phone calls.

XUI
-------------------------------------------------------------
You may work with any Javascript framework within a PhoneGap 
application. [XUI](http://xuijs.com) is the "officially preferred" 
framework of the phonegap core team. XUI is inspired by JQuery, 
optimized for web browsers and weighs in at 6.2k (2.4k minified and gziped).


Community
-------------------------------------------------------------
  * Website - [phonegap.com](http://phonegap.com)
  * Google Group - [groups.google.com/group/phonegap](http://groups.google.com/group/phonegap)
  * Wiki - [phonegap.pbwiki.com/](http://phonegap.pbwiki.com/)
  * Twitter - [twitter.com/phonegap](http://twitter.com/phonegap)
  
  
The MIT License
-------------------------------------------------------------
Copyright (c) 2008, Rob Ellis, Brock Whitten, Brian Leroux, Joe Bowser, Dave Johnson, Nitobi

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

-------------------------------------------------------------

*phonegap is a [nitobi](http://nitobi.com) sponsored project*
