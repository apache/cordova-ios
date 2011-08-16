PhoneGap iOS
=============================================================
PhoneGapLib is a static library that enables users to include PhoneGap in their iOS application projects easily, and also create new PhoneGap based iOS application projects through a Xcode project template.
<br />

Pre-requisites
-------------------------------------------------------------
Make sure you have installed the latest iOS SDK. Download at [http://developer.apple.com/ios](http://developer.apple.com/ios)
<br />

Build and install the Installer Package
-------------------------------------------------------------
1. Launch "Terminal.app"
2. Navigate to the folder where Makefile is (this folder)
3. Type in "make" then press Enter

<br />

The installer should build "PhoneGapInstaller.pkg" into this folder, then:

1. Quit Xcode
2. Launch "PhoneGapInstaller.pkg" to install PhoneGapLib, the PhoneGap framework and the PhoneGap Xcode Templates.

<br />

Create a PhoneGap project (Xcode 3)
-------------------------------------------------------------

1. Launch Xcode, then under the File menu, select "New Project...".
2. Navigate to the "User Templates" section, select PhoneGap, then in the right pane, select "PhoneGap-based Application"
3. Select the "Choose..." button, name your project and choose the location where you want the new project to be.
4. Modify the contents of the "www" directory to add your HTML, CSS and Javascript.

<br />

Create a PhoneGap project (Xcode 4)
-------------------------------------------------------------

1. Launch Xcode, then under the File menu, select "New Project...".
2. Navigate to the "iOS" section, under "Applications" - then in the right pane, select "PhoneGap-based Application"
3. Select the "Next" button, name your project and company idenfifier, then select the "Next" button again.
4. Choose the location where you want the new project to be.
5. Run the project at least once to create the "www" folder in your project folder.
6. Drag and drop this "www" folder into your project in Xcode, and add it as a folder reference.
7. Modify the contents of the "www" directory to add your HTML, CSS and Javascript.

<br />

Alternately, you can [watch this screencast](http://bit.ly/phonegap-xcode4-template).
<br />

Uninstalling PhoneGapLib, PhoneGap.framework and the Xcode Templates
--------------------------------------------------------------------

Use the "Uninstall PhoneGap" app included in the PhoneGap iOS DMG file, OR:

1. Launch "Terminal.app"
2. Navigate to the folder where Makefile is (this folder)
3. Type in "make uninstall" then press Enter

<br />

**NOTE:** It will ask you to confirm whether you want to delete the installed PhoneGapLib directory (just in case you made changes there) as well as the PhoneGap framework. It will not ask for confirmation in deleting the installed Xcode templates.
<br />

Installer Notes
-------------------------------------------------------------
This installer will only install items under your home folder (signified by ~)

Items that will be installed:

1. Xcode global var in ~/Library/Preferences/com.apple.Xcode.plist (which will be listed under Xcode Preferences -> Source Trees)
2. PhoneGapLib Xcode static library project under ~/Documents/PhoneGapLib
3. Xcode project template in ~/Library/Application Support/Developer/Shared/Xcode/Project Templates/PhoneGap
4. Xcode 4 project template in ~/Library/Application Support/Developer/Shared/Xcode/Templates/Project Templates/Application
5. PhoneGap Xcode static framework under /Users/Shared/PhoneGap/Frameworks/PhoneGap.framework (may change in future updates)
6. Symlink to the framework in (5) under ~/Library/Frameworks

<br />

To uninstall:

Delete the files listed above, or use the "Uninstall PhoneGap" app included in the PhoneGap iOS DMG file.
<br />

PhoneGapLib Tests
-------------------------------------------------------------
There is a Xcode project that will test PhoneGapLib according to the mobile spec. There is some setup needed before the project can be run. You will also need git installed and in your path.

Set up the test project:

1. Launch "Terminal.app"
2. Type in "chmod 755 update_test.sh"
3. Type in "./update_test.sh"

<br />

This will get the mobile-spec submodule and install it under the PhoneGapLibTests folder. You can then build and run the PhoneGapLibTest project to see the results.

You should run step (3) again before running any tests, to get the updated mobile-spec.
<br />

FAQ
---

**Q. When I run the Installer, the installation fails?** 

A. Follow the [instructions here](http://wiki.phonegap.com/PhoneGap-Installer-Fails)

**Q. When I add Plugins, they are not found or won't compile?** 

A. Follow the [instructions here](http://wiki.phonegap.com/PhoneGap-iOS-Plugins-Problems)

**Q. All my iframes are loading in Mobile Safari?** 

A. You'll have to add the src domain under the ExternalHosts key in PhoneGap.plist. Note - if the domain you put as the iframe src is re-directed, you will need to add that domain in the ExternalHosts key as well. For example, in Canada, www.google.com re-directs to www.google.ca, so you will have to add that domain as well.  Another example, phonegap.com re-directs to www.phonegap.com. This domain value must be exact, wild-card support is not available.

**Q. How do I override the location of the start page www/index.html?** 

A. You can override it by copy and pasting these [functions](https://github.com/phonegap/phonegap-iphone/blob/master/PhoneGapLib/Classes/PhoneGapDelegate.m#L48-56) into your project's AppDelegate.m, and make the appropriate changes.

**Q. In Xcode 3, I want to have a project-specific copy of PhoneGapLib for my project, not a global one. How do I do this?** 

A. In your project, there should be a PhoneGapBuildSettings.xcconfig file. Modify the PHONEGAPLIB variable in the file to point to your project specific PhoneGapLib folder. You can use relative paths, off $(PROJECT_DIR).

**Q. In Xcode 4, I want to have a project-specific copy of PhoneGap.framework for my project, not a global one. How do I do this?** 

A. Remove the existing PhoneGap.framework from your project, and drag and drop your own PhoneGap.framework in, that's all there is to it. To compile your own version of PhoneGap.framework, go to ~/Documents/PhoneGapLib and run the Xcode project with the UniversalFramework target.

**Q. I've created a PhoneGap project using Xcode 4, but there are errors! Help!**

A. Watch the screencast [here](http://bit.ly/phonegap-xcode4-template) or see the Xcode 4 issues below.

**Q. In Xcode 4, I get an error that "The Start Page 'www/index.html' was not found."?**

A. This is a known issue with the Xcode 4 Template - we can't specify a folder reference. You need to build the project at least once, then go to the folder where your project is in, and drag and drop in the "www" folder, then add it as a 'folder reference' (will end up as a blue folder, not yellow), then run the project again. Check your project warnings as well for clues.

**Q. In Xcode 4, I get the compile-time error "Undefined symbols for architecture armv6: _CMTimeGetSeconds"?**

A. [Add](http://stackoverflow.com/questions/3352664/how-to-add-existing-frameworks-in-xcode-4) CoreMedia.framework to your project. This error would only occur for pre-0.9.6 created projects. New projects should have this framework added automatically through the template. 

**Q. I've got 'symbol not found' errors during runtime? Usually it's because I'm deploying to an iOS 3.x device.**

A. With version 0.9.6 we implemented the W3C Media Capture API, which requires use of some iOS 4 APIs and frameworks. If you are deploying to an iOS 3.x device, you will need to "weak/optional" link three frameworks: UIKit, CoreMedia, and AVFoundation.

**Q. I've got other PhoneGap-specific issues not covered here?**

A. Older issues have been put in the [PhoneGap iOS FAQ](http://wiki.phonegap.com/w/page/41631150/PhoneGap-for-iOS-FAQ) on the [Wiki](http://wiki.phonegap.com).      


BUGS?
-----
File them at [PhoneGap-iOS GitHub Issues](https://github.com/phonegap/phonegap-iphone/issues)      
<br />

MORE INFO
----------
- [http://docs.phonegap.com](http://docs.phonegap.com)
- [http://wiki.phonegap.com](http://wiki.phonegap.com)
- [http://groups.google.com/group/phonegap](http://groups.google.com/group/phonegap)
- #phonegap channel on [Freenode IRC](http://freenode.net/)

<br />