## Thanks for installing PhoneGap {VERSION}!

## Plugins

* Plugins **MUST** add their plugin mapping to their app's PhoneGap.plist Plugins key, if not they will not work (see your plugin's README)
* A lot of plugins have changed their mapping names in PhoneGap.plist, you might have to copy and use the new PhoneGap.plist in your app.
* [Modify](http://wiki.phonegap.com/PhoneGap-iOS-Plugins-Problems) your Plugin headers as well.
* **UN-DEPRECATED:** Camera.getPicture core Plugin granted a reprieve.
* **REMOVED:** Network.isReachable core Plugin removed in 1.0, use the Network Information API instead
* **REMOVED:** Notification activityStart, activityStop, loadingStart, loadingStop core plugin functions removed in 1.0 and put in the plugins repo
* **REMOVED:** Image, Movie removed (unused)
* **REMOVED:** File.writeAsText removed
* **REMOVED:** Plugin base class 'PhoneGapCommand' is removed in 1.0, use the base class 'PGPlugin' instead in your third-party Plugins
* **ADDED:** Splash screen control plugin, to hide/show (use in conjunction with PhoneGap.plist setting AutoHideSplashScreen)

<br />

## Upgraders
	
1. Add the existing framework *"CoreMedia"* to your project
2. Set it to weak/optional in your Target
3. Copy the new *phonegap.*.js* files in manually to your *"www"* folder (COPY from */Users/Shared/PhoneGap/Frameworks/PhoneGap.framework/www*)
4. Update your script references in your HTML files to point to the .js files above
5. Copy *"Capture.bundle"* from */Users/Shared/PhoneGap/Frameworks/PhoneGap.framework* and add it to your project as well (or copy from a new project)
6. Set the existing framework *"UIKit"* to "Weak/Optional" in your project (to support iOS 3.x devices)
7. Set the existing framework *"AVFoundation"* to "Weak/Optional" in your project (to support iOS 3.x devices)
8. You can remove *"CoreTelephony.framework"* if it exists (and none of your plugins use it), it is not used by PhoneGap anymore
9. Recommended steps: [Upgrading your iOS PhoneGap Project](http://wiki.phonegap.com/Upgrading%20your%20iOS%20PhoneGap%20Project)

<br />

## Xcode 4

1. Launch Xcode 4
2. Select "New Project..." then under the File menu
3. Select "Application", under the "iOS" section
4. Select "PhoneGap-based Application" then in the right pane
5. Select the "Next" button
6. Name your project and bundle identifier
7. Select the "Next" button
8. Choose the location where you want the new project to be

<br />

**IMPORTANT:** On first run, it will create a sample "www" folder for you inside your project. After that, you MUST drag and drop the "www" folder into your project in Xcode, to create a **folder reference** for it.
<br />

**IMPORTANT:** For the "CoreMedia", "UIKit" and "AVFoundation" frameworks, you MUST set the linkage as "Optional", if not iOS 3.x devices will crash. The linkage type could not be set in the template itself (undocumented).
<br />

**NOTE:** In post-1.0.0 releases, new project templates have these 3 frameworks specified above weak linked through linker flags during compile time, and you will not have to do this manually anymore.
<br />

That's it! Modify the contents of the "www" directory to add your HTML, CSS and Javascript.
<br />

## Xcode 3

1. Launch Xcode 3
2. Select "New Project..." then under the File menu
3. Select PhoneGap, under the "User Templates" section
4. Select "PhoneGap-based Application" then in the right pane
5. Select the "Choose..." button
6. Name your project
7. Choose the location where you want the new project to be.

<br />

That's it! Modify the contents of the "www" directory to add your HTML, CSS and Javascript.

<br />

## Links

* [www.phonegap.com](http://www.phonegap.com)
* [docs.phonegap.com](http://docs.phonegap.com)
* [github.com/phonegap/phonegap-iphone](http://github.com/phonegap/phonegap-iphone)
* [File issues and feature requests](http://github.com/phonegap/phonegap-iphone/issues)

<br />
