# How to use PhoneGap as a Component #
Beginning with PhoneGap 1.4, you can use PhoneGap as a component in your iOS applications. This component is code-named "Cleaver".

New PhoneGap-based applications created using the Xcode template provided in PhoneGap 1.4 or greater uses Cleaver, and this template is considered the reference implementation for Cleaver.

It is recommended that you follow the PhoneGap.framework instructions below, the PhoneGapLib sub-project instructions are for PhoneGap core developers or users that have custom PhoneGapLib project code (for ease of debugging the core).

## Pre-requisites ##
1. **PhoneGap 1.4** or greater installed
2. **Xcode 4.2** or greater installed
3. **PhoneGap.plist** file

## Adding Cleaver to your Xcode project (PhoneGap.framework) ##

1. **Copy** the **"PhoneGap.plist"** file into your project folder on disk
2. **Drag and drop** the **"PhoneGap.plist"** file into the Project Navigator of Xcode
3. **Choose** the radio-button **"Create groups for any added folders"**
4. Press the key combination **Option-Command-A**, which should drop down a sheet to add files to your project (the **"Add Files…" sheet**). Make sure the **"Created groups for any added folders"** radio-button is selected
5. Press the key combination **Shift-Command-G**, which should drop down another sheet for you to go to a folder (the **"Go to the folder:" sheet**)
6. Enter **"/Users/Shared/PhoneGap/Frameworks/PhoneGap.framework"** in the **"Go to the folder:" sheet** and then press the **"Go"** button
7. Press the **"Add"** button in the **"Add Files…" sheet**
8. **Select "PhoneGap.framework"** in the Project Navigator
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

## Adding Cleaver to your Xcode project (PhoneGapLib sub-project) ##

1. **Copy** the **"PhoneGap.plist"** file into your project folder on disk
2. **Drag and drop** the **"PhoneGap.plist"** file into the Project Navigator of Xcode
3. **Choose** the radio-button **"Create groups for any added folders"**
4. Press the key combination **Option-Command-A**, which should drop down a sheet to add files to your project (the **"Add Files…" sheet**). Make sure the **"Created groups for any added folders"** radio-button is selected
5. Press the key combination **Shift-Command-G**, which should drop down another sheet for you to go to a folder (the **"Go to the folder:" sheet**)
6. Enter **"~/Documents/PhoneGapLib/PhoneGapLib.xcodeproj"** in the **"Go to the folder:" sheet** and then press the **"Go"** button
7. Press the **"Add"** button in the **"Add Files…" sheet**
8. **Select "PhoneGapLib.xcodeproj"** in the Project Navigator
9. Press the key combination **Option-Command-1** to show the **File Inspector**
10. Choose **"Relative to PHONEGAPLIB"** in the **File Inspector** for the drop-down menu for **Location** 
11. Click on the **project icon** in the Project Navigator, select your **Project**, then select the **"Build Settings"** tab
12. Enter **"Header Search Paths"** in the search field
13. Enter **"$(PHONEGAPLIB)/Classes"** and check the **Recursive** checkbox - for the **"Header Search Paths"** value
14. Click on the **project icon** in the Project Navigator, select your **Target**, then select the **"Build Phases"** tab
15. Expand **"Link Binaries with Libraries"**
16. Click on the **"+" button**, and add these **frameworks** (and optionally in the Project Navigator, **move** them under the Frameworks group):

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
17. Expand **"Target Dependencies"**
18. Click on the **"+" button**, and add the **"PhoneGapLib"** build product
19. Expand **"Link Binaries with Libraries"**
20. Click on the **"+" button**, and add **libPhoneGap.a** 

## Using PGViewController in your code ##

1. Add this **header** if you used the **PhoneGap.framework**:

        #import <PhoneGap/PGViewController.h>

2. Add this **header** if you used the **PhoneGapLib sub-project**:

        #import "PGViewController.h"

3. Instantiate a **new** PGViewController, and retain it somewhere: 

        PGViewController* viewController = [PGViewController new];

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
5. **Set the appropriate "wwwFolderName" and "startPage" properties** for the folder you created in **(1)** or use the defaults (see previous section) when you instantiate the PGViewController.

        /*
         if you created a folder called 'myfolder' and
         you want the file 'mypage.html' in it to be 
         the startPage
        */
        viewController.wwwFolderName = @"myfolder";
        viewController.startPage = @"mypage.html"
<br />

## PhoneGap.plist ##

This file controls various settings of PhoneGap. This is application wide, and not set per PGViewController instance. 

1. A list of **Plugins** allowed to be used in a PGViewController (set in the Plugins dictionary - key is the servicename used in JavaScript, and the value is the Objective-C class for the plugin that is a PGPlugin sub-class)
2. A **white-list** of hosts (with no scheme) that PhoneGap is allowed to connect to (set in the ExternalHosts array - wildcards allowed)
3. Various **other** settings (TODO:)
