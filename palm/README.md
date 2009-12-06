PhoneGap Palm
=====================================================
PhoneGap Palm is a skeleton Palm webOS application, along with javascript wrapper libraries, which allow a developer to build an application for a Palm webOS phone using web technologies.


Pre-requisites
-----------------------------------------------------
You should have VirtualBox (virtual machine software which runs the Palm emulator) and the webOS SDK installed. Both of these can be found at http://developer.palm.com/index.php?option=com_content&view=article&id=1545.


Set up your environment and install the skeleton app
-----------------------------------------------------
Open a terminal, and navigate to the root PhoneGap Palm folder (where this readme.md file is located). A Makefile resides here; running make here will package your application, and install it to either the emulator, or the device. Or you can run make on individual target tasks:

make js - builds phonegap.js from source javascript files to libs/phonegap.js
make copy_js - copies libs/phonegap.js to framework/www/phonegap.js - modify this path if you want phonegap.js in another location
make package - builds the webOS app (located in framework/www/) into an webOS .ipk installer package in the phonegap_root/palm/ folder_
make deploy - installs the .ipk package to a device if detected, otherwise the emulator if its running 

If a connected Palm device is detected, the application will be installed to the device. If not, and the emulator is running, the application will be installed to the emulator. To run the emulator, search for Palm Emulator.app in the finder, and run it. 


Build your PhoneGap app
-----------------------------------------------------
Navigate to phonegap_root/palm/framework/www/; this is where your application will reside. If you have already built a phonegap application on another platform, drop your html,js, css and assets into this folder (starting with the required index.html). Don't forget phonegap.js!

Just open framework/www/ in your favourite editor, build your web app, and run the appropriate make command indicated above. Edit appinfo.json to set your app id, version, etc.

Also, your index.html must include palm's mojo library, upon which phonegap.js depends. So, above your inclusion of phonegap.js, you should also have:

<script language="javascript" type="text/javascript" src="/usr/palm/frameworks/mojo/mojo.js" x-mojo-version="1"></script>

The path is where mojo.js is located on the device.

To enable a javascript debug console, open a new terminal window and type: phonegap-log app_id
Where the app id is your app id as set in appinfo.json.
This will tail your log file; it will default to the device if detected, otherwise it will read logs from the emulator.
In your javascript, use debug.log in your javascript.


Helpful Links
-----------------------------------------------------
PhoneGap API Docs: 			docs.phonegap.com
PhoneGap Wiki: 				phonegap.pbworks.com
Palm webOS developer site: 	developer.palm.com
