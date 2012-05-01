# Cordova JavaScript Exception Logging #

In Cordova 1.7.0, adding a few files to your project will enable you to effectively log JavaScript errors to your console at a lower level, without using JavaScript code (window.onerror, console.log).

NOTE: when you include these files, it will **always pop up a warning dialog at startup**, to remind you that you have these classes included. This is to prevent you from inadvertently shipping this code for the App Store, where this code is not allowed (it uses a private interface).

1. Install **Cordova 1.7.0**
2. In your app, add the whole **debugview** folder from  **~/Documents/CordovaLib/Classes/debugview** (where ~ signifies your Home folder). Make sure you select the radiobutton - **"Create groups for any added folders"**
3. In your app's **MainViewController.m**, uncomment/add this code:

        - (CDVCordovaView*) newCordovaViewWithFrame:(CGRect)bounds
        {
            return [[CDVDebugWebView alloc] initWithFrame:bounds];
        }
        
4. Don't forget to add the import at the top of your **MainViewController.m** file as well:

        #import "CDVDebugWebView.h"


 



