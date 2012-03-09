# How to use Cordova as a Component #
Beginning with Cordova 1.4, you can use Cordova as a component in your iOS applications. This component is code-named "Cleaver".

New Cordova-based applications created using the Xcode template provided in Cordova 1.4 or greater uses Cleaver, and this template is considered the reference implementation for Cleaver.

It is recommended that you follow the Cordova.framework instructions below, the CordovaLib sub-project instructions are for Cordova core developers or users that have custom CordovaLib project code (for ease of debugging the core).

## Pre-requisites ##
1. **Cordova 1.4** or greater installed
2. **Xcode 4.2** or greater installed
3. **Cordova.plist** file

## Adding Cleaver to your Xcode project (Cordova.framework) ##

1. **Copy** the **"Cordova.plist"** file into your project folder on disk
2. **Drag and drop** the **"Cordova.plist"** file into the Project Navigator of Xcode
3. **Choose** the radio-button **"Create groups for any added folders"**
4. Press the key combination **Option-Command-A**, which should drop down a sheet to add files to your project (the **"Add Files..." sheet**). Make sure the **"Created groups for any added folders"** radio-button is selected
5. Press the key combination **Shift-Command-G**, which should drop down another sheet for you to go to a folder (the **"Go to the folder:" sheet**)
6. Enter **"/Users/Shared/Cordova/Frameworks/Cordova.framework"** in the **"Go to the folder:" sheet** and then press the **"Go"** button
7. Press the **"Add"** button in the **"Add Files..." sheet**
8. **Select "Cordova.framework"** in the Project Navigator
9. Press the key combination **Option-Command-1** to show the **File Inspector**
10. Choose **"Absolute Path"** in the **File Inspector** for the drop-down menu for **Location** 
11. Click on the **project icon** in the Project Navigator, select your **Target**, then select the **"Build Phase"** tab
12. Expand **"Link Binaries with Libraries"**
13. Click on the **"+" button**, and add these **frameworks** (and optionally in the Project Navigator, **move** them under the Frameworks group):

        AddressBook.framework
        AddressBookUI.framework
        AudioToolbox.framework
        AVFoundation.framework
        CoreLocation.framework
        MediaPlayer.framework
        QuartzCore.framework
        SystemConfiguration.framework
        MobileCoreServices.framework
        CoreMedia.framework

## Adding Cleaver to your Xcode project (CordovaLib sub-project) ##

1. **Copy** the **"Cordova.plist"** file into your project folder on disk
2. **Drag and drop** the **"Cordova.plist"** file into the Project Navigator of Xcode
3. **Choose** the radio-button **"Create groups for any added folders"**
4. Press the key combination **Option-Command-A**, which should drop down a sheet to add files to your project (the **"Add Files..." sheet**). Make sure the **"Created groups for any added folders"** radio-button is selected
5. Press the key combination **Shift-Command-G**, which should drop down another sheet for you to go to a folder (the **"Go to the folder:" sheet**)
6. Enter **"~/Documents/CordovaLib/CordovaLib.xcodeproj"** in the **"Go to the folder:" sheet** and then press the **"Go"** button
7. Press the **"Add"** button in the **"Add Files..." sheet**
8. **Select "CordovaLib.xcodeproj"** in the Project Navigator
9. Press the key combination **Option-Command-1** to show the **File Inspector**
10. Choose **"Relative to CORDOVALIB"** in the **File Inspector** for the drop-down menu for **Location** 
11. Click on the **project icon** in the Project Navigator, select your **Project**, then select the **"Build Settings"** tab
12. Enter **"Header Search Paths"** in the search field
13. Add **"$(CORDOVALIB)/Classes"** and check the **Recursive** checkbox - for the **"Header Search Paths"** value
14. Add **"-all_load"** and **"-Obj-C"** - for the **"Other Linker Flags"** value
15. Click on the **project icon** in the Project Navigator, select your **Target**, then select the **"Build Phases"** tab
16. Expand **"Link Binaries with Libraries"** 
17. Click on the **"+" button**, and add these **frameworks** (and optionally in the Project Navigator, **move** them under the Frameworks group):

        AddressBook.framework
        AddressBookUI.framework
        AudioToolbox.framework
        AVFoundation.framework
        CoreLocation.framework
        MediaPlayer.framework
        QuartzCore.framework
        SystemConfiguration.framework
        MobileCoreServices.framework
        CoreMedia.framework
18. Expand **"Target Dependencies"** - the top box labeled like this if
    you have multiple boxes!
19. Click on the **"+" button**, and add the **"CordovaLib"** build product
20. Expand **"Link Binaries with Libraries"** - the top box labeled like
    this if you have multiple boxes!
21. Click on the **"+" button**, and add **libCordova.a** 

### Adding new classes to CordovaLib sub-project ###

In general if you are only modifying or debugging existing CordovaLib
classes you should be OK with just the above steps. However if you are
adding new classes you need to follow a few additional steps:

1. In your project's Frameworks directory in Xcode, remove
   "Cordova.framework".
2. Just to reiterate step 18 and 20 above: make sure your dependencies
   and libraries are in the top-most boxes under Build Phases for your
   project's Target.
3. In your project's Target's Build Settings, search for "Other Linker
   Flags". Add "-Obj-C" and "-all_load" to this.

## Using CDVViewController in your code ##

1. Add this **header** if you used the **Cordova.framework**:

        #import <Cordova/CDVViewController.h>

2. Add this **header** if you used the **CordovaLib sub-project**:

        #import "CDVViewController.h"

3. Instantiate a **new** CDVViewController, and retain it somewhere: 

        CDVViewController* viewController = [CDVViewController new];

4. (_OPTIONAL_) Set the **wwwFolderName** property (defaults to **"www"**):

        viewController.wwwFolderName = @"myfolder";

5. (_OPTIONAL_) Set the **startPage** property (defaults to **"index.html"**):

        viewController.startPage = @"mystartpage.html";

6. (_OPTIONAL_) Set the **useSplashScreen** property (defaults to **NO**):

        viewController.useSplashScreen = YES;

5. Set the **view frame** (always set this as the last property):

        viewController.view.frame = CGRectMake(0, 0, 320, 480);

6. **Add** Cleaver to your view:

        [myView addSubview:viewController.view];

## Adding your HTML, CSS and JavaScript assets ##

1. Create a **new folder** in your project **on disk**, for example, name it "www"
2. Put your **HTML, CSS and JavaScript assets** into this folder
3. **Drag and drop** the folder into the Project Navigator of Xcode
4. **Choose** the radio-button **"Create folder references for any added folders"**
5. **Set the appropriate "wwwFolderName" and "startPage" properties** for the folder you created in **(1)** or use the defaults (see previous section) when you instantiate the CDVViewController.

        /*
         if you created a folder called 'myfolder' and
         you want the file 'mypage.html' in it to be 
         the startPage
        */
        viewController.wwwFolderName = @"myfolder";
        viewController.startPage = @"mypage.html"
<br />

## Cordova.plist ##

This file controls various settings of Cordova. This is application wide, and not set per CDVViewController instance. 

1. A list of **Plugins** allowed to be used in a CDVViewController (set in the Plugins dictionary - key is the servicename used in JavaScript, and the value is the Objective-C class for the plugin that is a CDVPlugin sub-class)
2. A **white-list** of hosts (with no scheme) that Cordova is allowed to connect to (set in the ExternalHosts array - wildcards allowed)
3. Various **other** settings (TODO:)
