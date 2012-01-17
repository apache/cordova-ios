## Description ##
Beginning with PhoneGap 1.4, you can use PhoneGap as a component in your iOS applications. This component is code-named "Cleaver".

New PhoneGap-based applications created using the Xcode template provided in PhoneGap 1.4 uses Cleaver, and is considered the reference implementation for Cleaver.

## Pre-requisites ##
1. PhoneGap 1.4 installed
2. Xcode 4.2 or greater installed
3. PhoneGap.plist file

## Adding Cleaver to your Xcode project ##

1. **Copy** the "PhoneGap.plist" file into your project folder
2. **Drag and drop** the "PhoneGap.plist" file into your Xcode project
3. **Choose** the radio-button **"Create groups for any added folders"**
4. Press the key combination **Option-Command-A**, which should drop down a sheet to add files to your project (the "Add Files…" sheet). Make sure the "Created groups for any added folders" radio-button is selected
5. Press the key combination **Shift-Command-G**, which should drop down another sheet for you to go to a folder (the "Go to the folder:" sheet)
6. In the "Go to the folder:" sheet, enter **"/Users/Shared/PhoneGap/Frameworks/PhoneGap.framework"** and press the **"Go"** button
7. In the "Add Files…" sheet, press the **"Add"** button
8. **Select "PhoneGap.framework"** in the Project Navigator
9. Press the key combination **Option-Command-1** to show the **File Inspector**
10. In the **File Inspector** for the drop-down menu for **Location**, choose **"Absolute Path**
11. Click on the project icon, then select your Target, then select the **"Build Phase"** tab
12. Expand **"Link Binaries with Libraries"**
13. Click on the **"+"** button, and add these **frameworks** and move them under the Frameworks group:

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

## Using PGViewController ##

1. In your code, add the header:

        #import <PhoneGap/PGViewController.h>

2. Instantiate a new PGViewController: 

        PGViewController* viewController = [PGViewController new];
3. Set the splashscreen property (defaults to NO):

       viewController.useSplashScreen = YES;

4. Set the view bounds:

       viewController.view.bounds = CGRectMake(0, 0, 320, 480);

5. Add Cleaver to your view:

       [myView addSubview:viewController.view];








