PhoneGap Symbian (WRT)
=====================================================
PhoneGap Symbian.WRT is a skeleton application for Nokia's Web RunTime, along with javascript wrapper libraries, which allow a developer to build a native application for a WRT Supported Symbian phone using web technologies. The same set of web application files can be ported to PhoneGap BlackBerry, iPhone, Palm, and more to come...


Pre-requisites
-----------------------------------------------------
There are no real pre-requisites for PhoneGap Symbian.WRT development, as a WRT application consists simply of web files (html, css, js, etc) packaged and compressed into a .wgz file. No build process is necessary. However, for the purposes of development efficiency and testing, the following tools will make life MUCH easier:
 - Aptana Studio and Nokia's WRT Plugin for Aptana Studio. Includes a limited but very handy browser-based device simulator.
 - Optionally S60 5th Edition SDK, which includes the Symbian device emulator.


Set up your dev environment
---------------------------
1. Place your web application in the phonegap_root/symbian.wrt/framework/www folder
2. Ensure phonegap.js is included in your main html page
3. Place your application icon in the www folder. It should be named Icon.png
4. Modify info.plist (use the existing sample as a guide)
5. Develop your application around this html file ... only this page will have access to the device api
6. Compress the www folder into a zip file, and change the .zip extension to .wgz *
7. Transfer this file to your S60 5th Edition device, and open it. The device should recognize and install the application

Make targets:
  - make js (compile the javascript source into lib/phonegap.js)
  - make package (package the contents of framework/www/ into a .wgz package file, installable to the device)
 
As you can see, you don't need to have any particular tools installed in your development environment to build WRT applications, as there is no building or compiling involved. However there are tools you can use to make development easier. The combination of Aptana Studio and Nokia's WRT Plug-in for Aptana worked nicely for developing and testing WRT applications. It includes an emulator (only for PC) and a browser-based javascript emulator, and can deploy applications directly to your device if bluetooth is enabled.
 
A sample application resides in available at http://github.com/wildabeast/phonegap-demo which demonstrates the use of various device features through the phonegap API. It is essentially just a local website with a couple of rules: you must have an info.plist file and a main html page. To deploy this to your S60 5th Ed. device:
 
1. Add the info.plist file to the application folder.
2. Compress the application folder into a zip file.
2. Change the .zip extension to .wgz.
3. Transfer the file to your phone, via bluetooth, downloading from the web, or from email, etc.
4. When you receive the message, your device should recognize the file type and install the application. 
 
Note: a limitation of WRT is that you must define one main html page (defined in info.plist), and this page is the only one which will have access to the device functionality (geolocation, vibration, etc.). You can still use multiple pages, and pages not accessing device functionality will be accessible, but we recommend instead swapping views in and out of the main html page using a local xmlhttprequest, or building a javascript application (swapping views by showing and hiding divs).


Debugging your Symbian.WRT PhoneGap application
-----------------------------------------------
Creating your PhoneGap Nokia project in Aptana Studio's WRT Plugin allows you to simulate the on device behaviour of your application in a browser.
 
Get the Aptana WRT Plugin here.
The simulator requires Firefox and Firebug.
 
1. Install Aptana Studio and the Nokia WRT plug-in.
2. Go to File -> New -> Project. Select Nokia Web Runtime -> New Nokia Web Runtime Widget.
3. Select your desired project name and file locations. Click Finish. You should now see some additional internal application files/folders.
4. Copy your web application pages into the project folder (unless starting from scratch).
5. Ensure that the MainHTML property in info.plist refers to your application starting page.
6. Right click on the file "wrt_preview_frame.html", and select Debug As -> Javascript Web Application.
 
Your application should run inside Firefox, with the phonegap API functioning and returning test data for geolocation, contacts, acceleration, etc.

Notes
------------------------------------------------------
 - The memory available to WRT apps is very limited. Loading large javascript files into memory, playing sound files, and excessive monitoring of sensors can fairly easily crash your application. Minify js files, and use sensor monitoring (accel, gps, etc) conservatively.
 - If your symbian phone has contacts synced via PC Suite or Ovi Sync, and you attempt to query the contacts api, your app will crash. This is discussed here: http://discussion.forum.nokia.com/forum/showthread.php?t=170839&highlight=contacts+api+crashing. Hopefully nokia will fix it soon.
 - Javascript animation in WRT is not great. I've tried dojo, scriptaculous, & emile, to no avail. You can leave it in ... your app will reach the animation end state ... but the animation itself won't be pretty.

Helpful Links
-----------------------------------------------------
  - PhoneGap API Docs: 			docs.phonegap.com
  - PhoneGap Wiki: 				phonegap.pbworks.com
  - Nokia Web Runtime: 			http://www.forum.nokia.com/Technology_Topics/Web_Technologies/Web_Runtime/
