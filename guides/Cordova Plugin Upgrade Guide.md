# Cordova Plugin Upgrade Guide #

This document is for developers who need to upgrade their Cordova  plugins to a newer Cordova version. Starting with Cordova 1.5.0, some classes have been renamed, which will require the plugin to be upgraded. Make sure your project itself has been upgraded using the "Cordova Upgrade Guide" document.

## Upgrading older Cordova plugins to 1.5.0 ##

1. **Install** Cordova 1.5.0
2. Replace macro occurrences of **"PHONEGAP\_FRAMEWORK"** with **"CORDOVA\_FRAMEWORK"**
3. Replace import occurrences of **"&lt;PhoneGap/"** with **"&lt;Cordova/"**
4. Replace class prefixes of **PG** with **CDV** (for example **PG**Plugin becomes **CDV**Plugin)
5. Replace occurrences of **[self appViewController]** with **self.viewController**. 

## 1.5.0 Plugin Notes ##

1. The UIViewController returned from the **viewController property** will be a CDVViewController subclass.
2. The **appDelegate method** basically returns an (id) now, and is the same as calling **[[UIApplication sharedApplication] delegate]**. In the past it returned a PhoneGapDelegate class.
3. There is a new **commandDelegate property** now, which gives access to the [CDVCommandDelegate protocol](https://github.com/apache/incubator-cordova-ios/blob/master/CordovaLib/Classes/CDVCommandDelegate.h) used by the app
4. There is a new header file **CDVAvailability.h** that defines Cordova versions during compile time - to check for the current version during run-time, call **[CDVViewController cordovaVersion]**


