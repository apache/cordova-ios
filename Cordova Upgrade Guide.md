# Cordova Upgrade Guide #

This document is for developers who need to upgrade their Cordova-based projects to a newer Cordova version. Starting with Cordova 1.4.0, Cordova has been re-factored to use Cleaver (Cordova as a Component), and some classes that were used before have been removed - namely PhoneGapDelegate and PhoneGapViewController.

For your existing 1.4.0 based projects that use the deprecated classes above, you will have to first use the 1.3.0 -> 1.4.0 instructions at the end of this document (since the classes mentioned above have been removed in 1.5.0), then upgrade using the 1.4.x -> 1.5.0 instructions.

## Upgrading Cordova 1.4.x projects to 1.5.0 ##

1. **Install** Cordova 1.5.0
2. **Create a new project** - you will have to grab assets from this new project
3. **Copy** these files from the **new** project into your 1.4.x based project folder on disk, **replacing** any old files 

        Cordova.plist
4. **Copy** the **www/cordova-1.5.0.js** file from the new project into your **www** folder, and delete your **www/phonegap-1.4.x.js** file
5. **Update** the Cordova script reference in your **www/index.html** file (and any other files that contain the script reference) to point to the new Cordova **cordova-1.5.0.js** file
6. **TODO: PhoneGap.plist to Cordova.plist changes, especially core plugins**

## Upgrading Cordova 1.4.0 projects to 1.4.1 ##

1. **Install** Cordova 1.4.1
2. **Make a backup** of **MainViewController.m**
3. **Create a new project** - you will have to grab assets from this new project
4. **Copy** the **MainViewController.m** file from the **new** project into your 1.4.0 based project folder on disk, **replacing** the old file (**backup** your files first from step 2 above).
5. **Add** the **MainViewController.m** file into your Xcode project
6. **Integrate** any project specific code that you have in your **backed-up MainViewController.m** into the new file
7. Updating the phonegap-X.X.X.js file is optional, nothing has changed in the JavaScript between 1.4.0 and 1.4.1

## Upgrading Cordova 1.3.0 projects to 1.4.0 ##

1. **Install** Cordova 1.4.0
2. **Make a backup** of **AppDelegate.m** and **AppDelegate.h** in your project
3. **Create a new project** - you will have to grab assets from this new project
4. **Copy** these files from the **new** project into your 1.3.0 based project folder on disk, **replacing** any old files (**backup** your files first from step 2 above):

        AppDelegate.h
        AppDelegate.m
        MainViewController.h
        MainViewController.m
        MainViewController.xib
5. **Add** all the **MainViewController** files into your Xcode project
6. **Copy** the **www/phonegap-1.4.0.js** file from the new project into your **www** folder, and delete your **www/phonegap-1.3.0.js** file
7. **Update** the Cordova script reference in your **www/index.html** file (and any other files that contain the script reference) to point to the new **phonegap-1.4.0.js** file
8. **Add** a new entry under **Plugins** in your **PhoneGap.plist** file - key is **com.phonegap.battery** and the value is **PGBattery**
9. **Integrate** any project specific code that you have in your **backed-up AppDelegate.h and AppDelegate.m** into the new AppDelegate files