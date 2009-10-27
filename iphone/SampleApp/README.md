## Steps to create a NEW PhoneGap app:
	This is subject to change as we are currently looking at ways of making this dead simple ( via 	templates )

1. In Xcode, create a new *Window Based* iPhone App
2. Select project and add a reference to *PhoneGapLib* project (or drag and drop it in)
3. Add a Reference to all headers in *PhoneGapLib* project
4. Delete the XIB interface builder file
5. In *main.h* add your app delegate class name to the *UIApplicationMain* call
	-  int retVal = UIApplicationMain(argc, argv, nil,@"MyAppDelegate");
6. Change the interface of your application delegate:
	- @interface MyAppDelegate : PhoneGapDelegate { }
7. Select your target, and add a dependency for *PhoneGapLib*
8. Add *libPhoneGapLib.a* to the Link Binary With Library build step
9. Add the *www* folder to *Copy Bundle Resources* build step ( add a folder reference )
10. Place *phonegap.js* in your *www* folder ( this will be improved upon shortly )
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
