## Steps to create a NEW PhoneGap app:
	This is subject to change as we are currently looking at ways of making this dead simple ( via 	templates )

1. In Xcode, create a new __Window Based__ iPhone App
2. Select project and add a reference to __PhoneGapLib__ project (or drag and drop it in)
3. Add a Reference to all headers in __PhoneGapLib__ project
4. Delete the XIB interface builder file
5. In __main.h__ add your app delegate class name to the __UIApplicationMain__ call
	-  int retVal = UIApplicationMain(argc, argv, nil,@"MyAppDelegate");
6. Change the interface of your application delegate:
	- @interface MyAppDelegate : PhoneGapDelegate { }
7. Select your target, and add a dependency for __PhoneGapLib__
8. Add __libPhoneGapLib.a__ to the Link Binary With Library build step
9. Add the __www__ folder to *Copy Bundle Resources* build step ( add a folder reference )
10. Place __phonegap.js__ in your __www__ folder ( this will be improved upon shortly )
11. Add references to the following frameworks to your project :
	* AddressBook.framework
	* AddressBookUI.framework
	* AudioToolbox.framework
	* AVFoundation.framework
	* CFNetwork.framework
	* CoreGraphics.framework
	* CoreLocation.framework
	* Foundation.framework
	* MediaPlayer.framework
	* QuartzCode.framework
	* SystemConfiguration.framework
	* UIKit.framework
12. Build and Go
