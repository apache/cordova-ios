This installer will only install items under your home folder (signified by ~)

Items that will be installed:
(1) Xcode global var in ~/Library/Preferences/com.apple.Xcode.plist (which will be listed under Xcode Preferences -> Source Trees)
(2) PhoneGap Xcode static library and static framework project under ~/Documents/PhoneGapLib
(3) Xcode 3 project template in ~/Library/Developer/Xcode/Project Templates/PhoneGap
(4) Xcode 4 project template in ~/Library/Application Support/Developer/Shared/Xcode/Templates/Project Templates/Application
(5) PhoneGap Xcode static framework under /Users/Shared/Library/Frameworks/PhoneGap.framework (may change in future updates)
(6) Symlink to the framework in (5) under ~/Library/Frameworks

To uninstall:
(1) Remove the PHONEGAPLIB value in Xcode Preferences -> Source Trees
(2) Delete the ~/Documents/PhoneGapLib folder
(3) Delete the ~/Library/Application Support/Developer/Shared/Xcode/Project Templates/PhoneGap folder
(4) Delete the "~/Library/Application Support/Developer/Shared/Xcode/Templates/Project Templates/Application/PhoneGap-based Application.xctemplate" folder
(5) Delete the /Users/Shared/Library/Frameworks/PhoneGap.framework folder
(6) Delete the ~/Library/Frameworks/PhoneGap.framework symlink