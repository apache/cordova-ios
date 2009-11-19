PhoneGap iPhone
=============================================================
PhoneGapLib is a static library that enables users to include PhoneGap in their iPhone application projects easily, and also create new PhoneGap based iPhone application projects through a Xcode project template.

Pre-requisites
-------------------------------------------------------------
Make sure you have installed the Xcode Developer tools, included
in your OS Install DVD.

Build and install the Installer Package
-------------------------------------------------------------
1. Launch "Terminal.app"
2. Navigate to the folder where Makefile is (this folder)
3. Type in "make" then press Enter

The installer should build "PhoneGapLibInstaller.pkg" into this folder.
Launch "PhoneGapLibInstaller.pkg" to install PhoneGapLib and the 
PhoneGap Xcode Template.

Create a PhoneGap project
-------------------------------------------------------------

1. Launch Xcode, then under the File menu, select "New Project...".
2. Navigate to the "User Templates" section, select PhoneGap, then in the right pane, select "PhoneGap-based Application"
3. Select the "Choose..." button, name your project and choose the location where you want the new project to be.
4. Modify the contents of the "www" directory to add your HTML, CSS and Javascript.

Uninstalling PhoneGapLib and the Xcode Template
-------------------------------------------------------------
1. Launch "Terminal.app"
2. Navigate to the folder where Makefile is (this folder)
3. Type in "make uninstall" then press Enter

NOTE: It will ask you to confirm whether you want to delete the installed PhoneGapLib directory (just in case you made changes there). It will not ask for confirmation in deleting the installed Xcode template.


Installer Notes
-------------------------------------------------------------
This installer will only install items under your home folder (signified by ~)

Items that will be installed:

1. Xcode global var in ~/Library/Preferences/com.apple.Xcode.plist (which will be listed under Xcode Preferences -> Source Trees)
2. PhoneGapLib Xcode static library project under ~/Documents/PhoneGapLib
3. Xcode project template in ~/Library/Application Support/Developer/Shared/Xcode/Project Templates/PhoneGap

To uninstall:

1. Remove the PHONEGAPLIB value in Xcode Preferences -> Source Trees
2. Delete the ~/Documents/PhoneGapLib folder
3. Delete the ~/Library/Application Support/Developer/Shared/Xcode/Project Templates/PhoneGap folder


