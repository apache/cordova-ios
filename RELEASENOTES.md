<!--
#
# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
# 
# http://www.apache.org/licenses/LICENSE-2.0
# 
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
#  KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
#
-->
## Release Notes for Cordova (iOS) ##

Update these notes using: git log --pretty=format:'* %s' --topo-order --no-merges origin/2.7.x...HEAD

Cordova is a static library that enables developers to include the Cordova API in their iOS application projects easily, and also create new Cordova-based iOS application projects through the command-line.

### 3.4.0 (201401XX) ###

* CB-5794 iOS build script: 1. don't clean 2. recognize --emulator vs --device
* Don't show environment vars in build log for copy-www script
* CB-4910 Update CLI project template to point to config.xml at the root now that it's not in www/ by default.
* Move .gitignore in template to gitignore (and add the dot in the script).
* Fix create script copying project template twice.
* CB-5740 Use UIScrollViewDecelerationRateNormal by default.
* CB-5420 Add device model to User-Agent cache key.
* Copy config.xml within copy-www-build-step.sh instead of in Copy Resoruces step
* CB-5397 Add a --cli option to bin/create that has ../../www/ ../../merges/ within the project
* CB-5697 Fix location.reload() not firing deviceready.
* CB-4330 Fix hash changes being treated as top-level navigations
* CB-3359 Parse large JSON payloads on a background thread, and yield when executing multiple commands is taking too long.
* CB-5134 Fix up bugs with new hash-based exec() bridge.
* CB-5134 Add location.hash based exec() bridge.
* CB-5658 Fix whitelist crash when URL path has a space.
* CB-5583 WebView doesn't properly initialize when instantiated from a xib
* CB-5046: Adding a defaults.xml template
* CB-5290 templates: Updated launch images sizes to include the status bar region
* CB-5276 Add ability to load start page from a place other then the bundle folder
* CB-5298 Have bin/create run bin/check_reqs.
* CB-5328 - .gitignore from cordova-ios excludes `platforms/cordova/build` file

### 3.3.0 (20131214) ###

* No significant changes.

### 3.2.0 (20131120) ###

* CB-5124 - Remove splashscreen config.xml values from iOS Configuration Docs, move to plugin docs
* CB-5229 - cordova/emulate important improvements (stderr, check ios-sim before build)
* CB-5058 - CordovaLib xcode project gets assigned problematic Build Active Architecture Only settings.
* CB-5217 - cordova emulate ios doesn't exit
* CB-4805 - Update cordova/run and cordova/lib/install-device to use latest ios-deploy for iOS 7
* CB-5103 - Fix cordova/run: --emulate should be --emulator (fix CLI usage)
* CB-4872 - added iOS sdk version scripts
* CB-5099 - Add missing icons especially iOS 7 120x120 icon to default template
* CB-5037 - Fix bridge sometimes not resetting properly during page transitions
* CB-4990 - Can't run emulator from cordova cli
* CB-4978 - iOS - Remove HideKeyboardFormAccessoryBar and KeyboardShrinksView preferences in config.xml
* CB-4935 - iOS - Remove Keyboard preferences code into its own plugin
* Make CDVWebViewDelegate able to load pages after a failed load.
* Prevented automatic logging of whitelist failures.

### 3.1.0 (20131001) ###

* [CB-3020] HideKeyboardFormAccessoryBar and KeyboardShrinksView show white bar instead of removing it
* [CB-4799] Add update script for iOS.
* [CB-4829] Xcode 5 simulated device names are different (and includes a new 64-bit device)
* [CB-4827] iOS project/cordova/check\_reqs script should be used by all the scripts
* [CB-4530] iOS bin/check\_reqs script should check for xcode 4.6 as minimum, and exit with code 2 if error occurs
* [CB-4537] iOS bin/create script should copy check\_reqs script into project/cordova folder
* [CB-4803] Set new iOS 7 preferences for the UIWebView in CDVViewController
* [CB-4801] Add new iOS 7 properties for UIWebView in the config.xml &lt;preferences&gt;
* [CB-4687] Fix Xcode 5 static analyzer issues
* [CB-4469] Move copy-build-www-step.sh into scripts template
* [CB-4539] Cannot create CDVViewController in Storyboard
* [CB-4654] Wherein it is discovered that cp is too smart for its own good
* [CB-4469] Move copy\_www.sh to cordova/lib/copy-www-build-step.sh
* [CB-4654] Exclude platform scripts from template directory; copy those separately
* [CB-4654] Allow default project template to be overridden on create
* [CB-4706] Update compiler in CordovaLib.xcodeproj to "default compiler"
* [CB-4707] Update compiler in default template xcodeproj to "default compiler"
* [CB-4689] Update default template xcodeproj to Xcode 5 project settings
* [CB-4688] CordovaLib.xcodeproj - update to Xcode 5 project settings
* [CB-4691] Fix Xcode 5 warnings
* [CB-4567] fix issue: "Benchmarks" ->"AutoBench" crashed on iOS
* [CB-4469] Flip executable bit for copy_www.sh
* [CB-4469] move copy resource script out of project file
* [CB-4486] Give iOS plugins the ability to override URL loading
* [CB-4408] Update cordova/emulate for new emulator build folder
* [Cb-4336] modify cordova/run and cordova/install-device scripts to use ios-deploy (npm)
* [CB-4408] Modify cordova/build script to build for device (armv7/armv7s)
* [CB-4409] Remove build artifact folder on cordova/clean
* [CB-4405] Increase Xcode minimum version to 4.6 in cordova/* scripts
* [CB-4334] modify cordova/emulate and cordova/run scripts help text for ios-sim (available as npm module)
* [CB-4331] require ios-sim version 1.7 in command line scripts
* [CB-4355] Localstorage plugin handles options incorrectly (the settings key is specified with upper case chars)
* [CB-4358] Trim amount of frameworks (18) in default template to minimum needed (4)
* [CB-4095] Unify whitelist implementations
* [CB-4281] Remove Echo files from Xcode project
* [CB-4281] Moving echo to a plugin in MobileSpec
* [CB-4277] Revert deleting of &lt;param name="onload" value="true" /&gt; support
* [CB-3005] Add support for query parameters in StartPage url
* CordovaTests project was missing the CordovaLib dependency: added
* Update iOS whitelist tests
* Fix ARC issue in start page tests (critical for Xcode5)

### 3.0.0 (20130718) ###

* [CB-3999] Video Capture ignores duration option [iOS]
* [CB-4202] [CB-3681] Remove Contact plugin unit tests
* [CB-4202] [CB-3653] Remove EXIF (Camera plugin) unit tests
* [CB-4202] [CB-3726] Remove File Transfer plugin unit tests
* [CB-4202] [CB-3973] Remove unit test dependency on Dialogs plugin
* [CB-4202] [CB-1107] Remove unit tests for old plugin signature
* [CB-4202] [CB-4145] Remove use of useSplashScreen property by unit tests
* [CB-4095] Add some additional whitelist unit tests
* [CB-2608] Remove deprecate EnableLocation key from the config.xml file
* [CB-4104] Made config parameters case-insensitive.
* [CB-3530] PhoneGap app crashes on iOS with error "CDVWebViewDelegate: Navigation started when state=1" (for navigation to an anchor on the same page)
* [CB-3701] Removed Capture.bundle from default project template for 3.0.0
* [CB-3530] Updated unit tests
* [CB-4025] iOS emulate command broken when run inside the cordova folder
* [CB-4037] Unable to Archive iOS projects for upload to App Store in 2.9
* [CB-4088] `cordova emulate ios` replaces spaces in project name with underscores, conflicting with `cordova build ios` behavior
* [CB-4145] Remove CDVViewController.useSplashScreen property
* [CB-3175] Change <plugin> to <feature> in config.xml and remove deprecation notice in iOS
* [CB-1107] Remove old plugin signature, update Plugin Dev Guide
* [CB-2180] Convert iOS project template to use ARC
* [CB-3448] bin/diagnose_project script fails if CORDOVALIB variable not in prefs plist
* [CB-4199] iOS Platform Script `run --device` uses Simulator
* [CB-3530] PhoneGap app crashes on iOS with error "CDVWebViewDelegate: Navigation started when state=1" (for navigation to an anchor on the same page)
* [CB-3567] Redirect initiated in JavaScript fails the app from loading
* Removed iphone/beep.wav since it is already contained in the dialogs core plugin
* Have create script include .gitignore file.
* Removed all core plugins (including console logger) to their own repos (install them using cordova-cli or plugman)

### 2.9.0 (201306XX) ###

* [CB-3469] Add a version macro for 2.8.0.
* [CB-3469] Adding missing license found by RAT
* [CB-2200] Remove device.name (deprecated)
* [CB-3031] Fix for emulate script when project name has a space
* [CB-3420] add hidden option to InAppBrowser
* [CB-2840] Nil checks to avoid crash when network disconnected
* [CB-3514] Remove partially-downloaded files when FileTransfer fails
* [CB-2406] Add ArrayBuffer support to FileWriter.write
* [CB-3757] camera.getPicture from photolib fails on iOS
* [CB-3524] cordova/emulate and cordova/run silently fails when ios-sim is not installed
* [CB-3526] typo in cordova/lib/install-emulator - does not check for ios-sim
* [CB-3490] Update CordovaLib iOS Deployment Target in Project Setting to 5.0
* [CB-3528] Update Plugin Upgrade Guide for iOS
* [CB-3530] PhoneGap app crashes on iOS with error "CDVWebViewDelegate: Navigation started when state=1"
* [CB-3768] Build to phone failing on Xcode 5 DP1 (OS X Mavericks)
* [CB-3833] Deprecation plugin tag upgrade step has malformed xml
* [CB-3743] Remove compatibility headers folder
* [CB-3619] ./cordova/run script does not always call ./cordova/build first
* [CB-3463] bin/create should copy cordova.js into the project's CordovaLib
* [CB-3530] PhoneGap app crashes on iOS with error "CDVWebViewDelegate: Navigation started when state=1" (for navigation to an anchor on the same page)
* [CB-3507] Wrong Linker Flag for project template
* [CB-3458] remove all_load dependency. Use force load instead
* Removing "build" from gitignore as one of our cli scripts is named build :)
* Added/renamed CDVExifTests to test project.

<br />

### 2.8.0 (201305XX) ###

* [CB-2840] Nil checks to avoid crash when network disconnected
* [CB-3416] adding empty <plugins> element during deprecation window.
* [CB-3006] Customize InAppBrowser location bar
* [CB-3405] InAppBrowser option to hide bottom bar with Done/History buttons
* [CB-3394] Cordova iOS crashes when multiple access elements in config.xml
* [CB-3166] Add deprecation notice for use of <plugin> in config.xml in iOS
* [CB-2905] Exif geolocation meta data tag writing
* [CB-3307] Rename cordova-ios.js -> cordova.js
* [CB-1108] Convert <plugin> -> <feature> with <param>
* [CB-3321] Fix bogus "failed whitelist" log messages
* [CB-3311] add default textbox for notification prompt
* [CB-2846] SplashScreen crashes app when image not available
* [CB-2789] Remove CaptureOptions.mode support.
* [CB-3295] Send InAppBrowser loadstart events when redirects occur
* [CB-2896] added ImageIO and OpenAL system frameworks to support new exif functionality in CDVCamera
* [CB-2896] writing data to object through CGImageDestinationRef, enables multipart exif tag writing
* [CB-2958] simple fix, moved write to photealbum code and sourced from modified data. Photo data returned by cordova will match photo on cameraroll
* [CB-3339] add version to command line scripts
* [CB-3377] Remove cordova/release script
* [CB-2974] Add a ./cordova/lib/list-devices project-level helper script to iOS
* [CB-2951] Add a ./cordova/lib/list-emulator-images project-level helper script to iOS
* [CB-2974] Add a ./cordova/lib/list-devices project-level helper script to iOS
* [CB-2966] Add a ./cordova/lib/list-started-emulators as project-level helper script to iOS
* [CB-2990] Add a ./cordova/lib/install-device project-level helper script to iOS
* [CB-2982] Add a ./cordova/lib/install-emulator project-level helper script to iOS
* [CB-2998] Add a ./cordova/lib/start-emulator project-level helper script to iOS
* [CB-2916] Add a ./cordova/clean project-level script for iOS
* [CB-2053] Update UIImagePickerController label to reflect video media type in CDVCamera
* [CB-3530] PhoneGap app crashes on iOS with error "CDVWebViewDelegate: Navigation started when state=1"

<br />

### 2.7.0 (201304XX) ###

* Fix NPE in InAppBrowser's error callback.
* [CB-2849] Fix bin/create when CordovaLib parent dir has a space
* [CB-3069] Fix InAppBrowser load events (for non-redirecting pages)
* InAppBrowser: Don't inject iframe bridge until necessary.
* Fix FileTransfer unit test. HTTP Method was being set to null.
* [CB-2305] Add InAppBrowser injectScriptCode command to support InAppBrowser.executeScript and InAppBrowser.insertCSS APIs
* [CB-2653] Simplify InAppBrowser.injectScriptCode.
* [CB-2537] Implement streaming downloads for FileTransfer
* [CB-2190] Allow FileTransfer uploads to continue in background
* [CB-1518] Request content length in parallel with download for gzipped content
* [CB-2653] Delay executeScript/insertCSS callback until resources have loaded; pass JS results to callback
* [CB-2824] Remove DebugConsole plugin
* [CB-3066] Fire onNativeReady from JS, as bridge is available immediately
* [CB-2725] Fix www deploy issues with symlinks
* [CB-2725] follow links in www copy script
* [CB-3039] iOS Exif date length mismatch
* [CB-3052] iOS Exif SubIFD offsets incorrect
* [CB-51] Added httpMethod for file transfer options (defaults to POST)
* [CB-2732] Only set camera device when allowed.
* [CB-2911] Updated resolveLocalFileSystemURI.
* [CB-3032] Add whitelist support for custom schemes.
* [CB-3048] Add --arc flag to create script, support arc in template.
* [CB-3067]: fixing ios5 whitelist of file url
* [CB-3067] Revert CDVURLProtocol to not whitelist file urls
* [CB-2788] add ./bin/check_reqs script to iOS
* [CB-2587] Added plugin timing for plugins that are loaded on startup (plugin 'onload' attribute)
* [CB-2848] ShowSplashScreenSpinner not used
* [CB-2960] Changing the volume of a sound already playing
* [CB-3021] Can no longer import CDVPlugin.h from plugin Objective-C++ code
* [CB-2790] added splice function to header writer: accepts jpeg as NSData, and splices in exif data specified by a string
* [CB-2790] removed old splice code, replaced with JpegHeaderWriter api calls
* [CB-2896] split writing of working tags off here, multipart tags not supported
* [CB-2896] fixed error in exif subifd offset calculation for tag 8769
* [CB-2902] re-added long/short tags to template dict, fixed subExifIFD offset
* [CB-2698] Fix load detection when pages have redirects.
* [CB-3295] Send InAppBrowser loadstart events when redirects occur

<br />

### 2.6.0 (20130401) ###

* [CB-2732] Only set camera device when allowed.
* [CB-2848] ShowSplashScreenSpinner not used
* [CB-2790] added splice function to header writer: accepts jpeg as NSData, 
* [CB-2790] removed old splice code, replaced with JpegHeaderWriter api call
* [CB-1547] Scope notifications to WebViews
* [CB-2461] Distinguish sub-frame from top-level loads in InAppBrowser.
* [CB-2523] Add setting to shrink webview when keyboard pops up
* [CB-2220] Fix splashscreen origin when status bar is present
* [CB-2220] Size the splash screen in the same way as the launch image
* [CB-2389] Fix page load detection for late-loaded iframes
* [CB-2220] Fix splash screen positioning when image is the size of device
* [CB-2631] Fix crash when bad url given to FT.upload
* [CB-2652] Make FileReader.readAs*() functions run on a background thread
* [CB-2633] Add FileReader.readAsBinaryString()
* [CB-2308] Correctly delegate to CDVInAppBrowser webView:didFailLoadWithError
* [CB-2308] [ios] Report errors when InAppBrowser fails to load page
* [CB-2527] Update iPad splash images to correct sizes
* [CB-1452] Media position incorrect after being set beyond duration
* [CB-2436] Wrong splashscreen is displayed when UILaunchImageFile is set
* [CB-2634] Copy www fails w spaces in filenames
* [CB-2618] xcode build from Network Drive Fails
* [CB-2638] Fix iOS project warnings on Retina imgs
* [CB-2491] Deprecate current Connection cell setting
* [CB-2674] Add prompt to Notification API for iOS
* [CB-2691] Splashscreen should block user interaction
* [CB-2502] Fixing CDVViewController.commandDelegate property declaration
* [CB-1933] Changed button labels to an array.
* [CB-1688] Added a camera direction option.
* [CB-2732] Only set camera device when allowed.
* [CB-2530] [CB-2239] Multipart plugin result
* [CB-2605] icon-72@2x.png not included in xcode project template
* [CB-2545] Deprecate "EnableLocation" Project Setting - use the "onload" attribute of the <plugin> element
* [CB-2384] Add new iOS Project Setting to suppress the form accessory bar above the keyboard
* [CB-2195] Remove deprecated - iOS - BackupWebStorage Cordova.plist property change from boolean to string
* [CB-2194] Remove deprecated - iOS - CDVCommandDelegate registerPlugin method
* [CB-2699] Bug in dynamic loading of a plugin at CDVViewController's registerPlugin method
* [CB-2384] Re-fix - Add new iOS Project Setting to suppress the form accessory bar above the keyboard
* [CB-2759] Update www/ Application for iOS
* [CB-2672] InAppBrowserBug fixed (not reporting actual URL after redirect)
* [CB-861] Header support for FileTransfer download
* Add a define that turns on logging of exec() bridge
* Sort preferences in project template.
* Add KeyboardShrinksView preference to project template
* Revert accidentally change in PluginResult that broke threading.
* Remove NSLogs accidentally checked in.
* Use noCopy versions of NSString init in Base64 code.
* Add an associatedObject field to CDVPluginResult.
* Uncrustified with v0.60 of the tool (up from 0.59).
* Make sure version of uncrustify is correct in the pre-commit hook
* Remove some unnecessary argument checks in CDVNotification
* Implement readAsArrayBuffer
* Changed UIWebViewBounce to DisallowOverscroll.
* Retain cycle fix
* Fixed static analyzer issues.
* Interim .js for [CB-52] FileTransfer Basic Auth
* Added KeyboardShrinksView preference to CordovaLibTest config.xml
* Added \__CORDOVA_IOS\__ macro

< br />

### 2.5.0 (20130301) ###

* [CB-2395] Fix CDVViewController UserAgent lock
* [CB-2207] Use a custom script for www/ copying.
* [CB-2275] Add NSURLCache to app template.
* [CB-2433] Deprecation notice for window.Settings
* [CB-2276] Add whitelist method to CommandDelegate
* [CB-2276] Remove CDVViewController from CDVLocation
* [CB-2276] Remove CDVViewController from CDVSound
* [CB-2276] Remove CDVViewController CDVCapture
* [CB-1547] Ignore iframe navigations in webview delegate methods
* [CB-1547] Take two: Ignore iframe navigations in webview delegate methods
* [CB-2443] Add pluginInitialize method to CDVPlugin.
* [CB-2443] Removed classSettings initializer from CDVPlugin
* [CB-1693] Allow plugins to be loaded on start-up.
* [CB-2276] Move Splashscreen logic out of CDVViewController
* [CB-2389] Distinguish top-level from sub-frame navigations.
* [CB-571] Media updates
* [CB-2213] Added NATIVE_URI to getFileMetadata.
* [CB-2213] Added NATIVE_URI to readAsDataURL.
* [CB-2213] Added NATIVE_URI to getMetadata.
* [CB-2213] Added NATIVE_URI to three methods.
* [CB-2213] Added the AssetsLibrary framework.
* [CB-2213] Added NATIVE_URI to copyTo and moveTo.
* [CB-2213] Updated errors for write and truncate.
* [CB-2213] Updated a NATIVE_URI error (getParent).
* [CB-2213] Added NATIVE_URI to FileTransfer.upload.
* [CB-2213] Skipped image scaling when possible.
* [CB-2213] Added native URI request handling.
* [CB-2411] Added camera popover repositioning.
* [CB-2379] Update CordovaLib Project Settings according to Xcode 4.6 recommendations
* [CB-2334] Add "body" property to FileTransferError object on iOS
* [CB-2342] Media API allows non-whitelisted audio to be played
* [CB-2324] iOS config.xml document should use <widget> instead of <cordova>
* [CB-2469] Update JavaScript for iOS (2.5.0rc1)
* CDVWebViewDelegate header was not public.
* [CB-2516] Additional Plugin Note on Upgrading from 2.3.0 to 2.4.0
* [CB-2510] [1/2] Updated Plugin Upgrade Guide for 2.4.0 -> 2.5.0
* [CB-2544] Document "onload" attribute of <plugin> element in Plugin Upgrade Guide
* [CB-2280, CB-2281] SplashScreen fade and rotation
* Run uncrustify on CDVPlugin.m
* Uncrustify CDVFile and CDVFileTransfer
* Use correct MIME-type for asset-library responses.
* Add option for ipad/iphone in cordova/emulate
* Make CDVLocalStorage use onReset
* Add a notification so plugins will know when page loads occur.
* Change default value of splash screen fade to be quicker.
* Implement useSplashScreen without using a setting
* Don't call onReset for iframe navigation
* function name was wrong (case sensitive)
* Fix /bin/create script to work with GNU sed in path

<br />

### 2.4.0 (20130205) ###

* Make cordova_plist_to_config_xml able to handle binary plist files
* Ran splashscreen images through ImageOptim.
* [ios] Remove %-escaping version of FileReader.readAsText()
* Fix trying to mutate an immutable NSArray in CDVInvokedUrlCommand.
* Fix FileTransfer.download failing for file: URLs.
* Fix setting of _nativeReady when cordova.js is lazy-loaded.
* Fix NPE when PDF is opened in InAppBrowser.
* Refactor User-Agent logic into a helper class.
* Fix for CB-2225
* Remove a debugging log statement.
* Add a code comment that points to the PDF/User-Agent JIRA issue.
* Disable broken test.
* Don't send callbacks when there are no listeners.
* Fix InAppBrowser on iOS 5.
* Fix CB-2271 - Multiple Cordova Views.
* Fix usage message of update_cordova_subproject.
* Delete obsolete instructions in bin/README.md
* Fixes CB-2209 Contact ARC issues
* including a manual relpath function
* Add slice() support to readAsText.
* Add slice() support to readAsDataURL.
* Move start page to be specified in <content> tag.
* Separate the echoArrayBuffer call from normal echo
* Adding bool plugin result message, tests
* iOS fix slow contact access due to photos temp file generation
* [CB-2235] Fixed file transfer whitelisting.
* [ios]CB-2189: support ArrayBuffer over exec bridge
* [ios] CB-2215 - Implement ArrayBuffer native->js.
* [ios] CB-2215 - Implement ArrayBuffer native->js.
* CordovaLibTests - update project file for iOS 5 support.
* cordova/run and cordova/emulate refer to old 'debug' script which has been renamed to 'build'
* [CB-1495] iOS default splash screen images take up several megabytes
* [CB-1849] Remove iOS 4/5 conditional code block, put in main block
* [CB-2193] Remove deprecated - iOS - CDVViewController invokeString property
* Fixed CB-2191 and CB-2192 (removal of deprecated methods)
* [CB-1832] iOS: CDVCordovaView should not inherit from UIWebView
* [CB-1946] iOS: Switch JSON serialization to NSJSONSerialization
* Fixes static analyzer error for using mktemp (substituted with mkstemp)
* [CB-2159] handleOpenURL not called on iOS
* [CB-2063] InAppBrowser - support iPad presentation style, iOS transition styles
* [CB-478] FileTransfer upload - handle "trustAllHosts" parameter
* Interim js patch for [CB-2094] issue
* [CB-2071] InAppBrowser: allow UIWebView settings like main CordovaWebView
* Added interim js for latest changes.
* Added whitelist unit test to check for query param matches
* [CB-2290] iOS: 'CDVJSON.h' file not found when adding a plugin
* Added a native uri option to DestinationType.
* Added a namespace prefix to a constant.

<br />

### 2.3.0 (20130107) ###

* [CB-1550] iOS build, debug, emulate scripts should check xcode version
* [CB-1669] Issue an error when media.startRecord() is failing.
* [CB-1695] CDVURLProtocol should not apply whitelist to non-Cordova view controllers/requests
* [CB-1802] ./cordova set of CLI tools need audit to work with paths with spaces
* [CB-1824] SIGABRT when view loads - reason: -[NSCFBoolean isEqualToString:]: unrecognized selector
* [CB-1836] Device core plugin - device.platform should return "iOS"
* [CB-1837] Device core plugin - device.name should return the actual device string (eg iPod Touch, iPhone)
* [CB-1850] Add device.model to the Device API
* [CB-1889] Added userAgent property to CDVViewController (systemVersion and locale dependent, cached)
* [CB-1890] InAppBrowser: location bar url text needs indentation
* [CB-1949][iOS] InAppBrowser - support events (loadstart, loadstop, exit)
* [CB-1957] InAppBrowser - video/audio does not stop playing when browser is closed
* [CB-1962] Video Capture not compressing video after capture - partial revert of CB-1499
* [CB-1970] MainViewController cannot override pathForResource
* Fix unit tests not working due to lack of a command delegate.
* Fix not being able to seek to position 0.
* Move cordova-VERSION.js from bin/templates to CordovaLib.
* Add version number to cordova.ios.js in create script.
* Add argument fetching helpers to CDVInvokedUrlCommand.
* Fix InAppBrowser handling of NSNull relative URLS.
* Use the VC's address in the User-Agent instead of a GUID.
* Have the InAppBrowser not use a GUID in its UA.
* Update cordova.ios.js with change to not require cordova.iOSVCAddr
* Fix invalidating of cached UA when Locale changes with the app closed.
* Add a helper script to convert Cordova.plist to config.xml.
* Rename plist2xml.py -> cordova_plist_to_config_xml.
* Mention cordova_plist_to_config_xml in the NSAssert for config.xml
* Allow any scheme when specifying start page as a URL.
* Rename cordova commands, added 'release' command for iOS
* Remove template Cordova.plist, add config.xml.
* Remove Cordova.plist from resources, add config.xml
* Migrate unit tests to use config.xml.
* Make whitelist rejection string configurable
* Remove setWantsFullScreenLayout from CDVViewController, simplified viewWillAppear in template app.
* Remove forced status bar rotation logic
* Fix autoresizingMask of imageView
* Support startPage as URL.
* Update __bin/diagnose_project__ to print out conditional ARCHs build settings.
* Update deprecation notice for our minimum iOS 5.0 support
* Fix deprecated [AVAsset naturalSize] usage in Capture API (getFormatData)
* Add CDVInAppBrowser implementation.
* InAppBrowser - pass on window options for \_self if url is not in the whitelist (which is kicked out to the InAppBrowser)
* CordovaLibAppTest -- Added Globalization, InAppBrowser plugins to Cordova.plist
* Default project template -- Added InAppBrowser plugin to Cordova.plist
* InAppBrowser - append GUID to the UIWebView UserAgent to differentiate the different instances (for the white-list)
* Update fix to CB-1695 - the main Cordova UIWebView has a unique User-Agent now.
* Update default project template to include config.xml, removed Cordova.plist
* Rename references of Cordova.plist to config.xml (plus uncrustify)
* Add new CDVInvokedUrlCommand argumentAtIndex method to ensure proper object type returned (if not, default is returned)
* Fix non-mp3 files not being able to be played using the Media API
* Remove usage of deprecated CDVViewController.invokeString in the default project template files.
* Change unsafe_unretained to weak since we are supporting iOS 5.0 and up only now
* Update doc references to Cordova.plist, use new config.xml
* Remove incubator website links to TLP http://cordova.apache.org/
* Add URLisAllowed method abstraction for Plugins to query (easier if we decide to make the whitelist a singleton in the future)
* Add local notification #define, and stubbed method in AppDelegate.m
* Add appdelegate method didReceiveLocalNotification and repost to NSNotification defaultCenter

<br />

### 2.2.0 (20121031) ###

* [CB-622] FileTransfer interface should provide progress monitoring
* [CB-622] Progress events for downloads
* [CB-625] bin/uncrustify.sh --all
* [CB-836] Abort functionality added to FileTransfer
* [CB-836] Storing connection delegates for aborting connections quicker
* [CB-836] Readonly property, duplicate activeTransfer, send pluginResult on abort
* [CB-902] iOS 6 - deal with new Privacy functionality in Contacts (ABAddressBook:: ABAddressBookCreateWithOptions)
* [CB-1145] Require minimum Xcode 4.5 thus iOS 4.3 (Lion and Mountain Lion only - LLVM Compiler 4.0)
* [CB-1360] Conditionally add architectures based on iOS version in CordovaLib
* [CB-1390] Add onReset() to plugins on iOS.
* [CB-1404] EXC\_BAD\_ACCESS when using XHR\_WITH\_PAYLOAD bridge mode
* [CB-1456] bin/diagnose\_project script prints Build Settings from the project settings, not the target settings
* [CB-1461] Add the two new iOS 6 UIWebView properties as Cordova.plist settings
* [CB-1465] WebView too small after closing of a ChildBrowser in landscape orientation
* [CB-1470] add iOS implementation for globalization
* [CB-1476] Failed to load resource: file:///!gap_exec (Change XHR bridge mode to succeed instead of fail)
* [CB-1479] Cordova 2.1 Capture Problem if no options provided
* [CB-1482] Add splash screen image for iPhone 5's 4" display.
* [CB-1486] Added missing apache source headers
* [CB-1499] use of Camera in Cordova video mode results in field of view different than in native video mode
* [CB-1502] Update Capture Audio images for iPhone 5
* [CB-1511] Cordova 2.1/2.2 Audio Capture iOS6 CDVAudioRecorderViewController wrong orientation
* [CB-1512] Change FileTransfer's form boundary from *** to +++
* [CB-1514] Xcode 4.5 - Static Analyzer Issues in CordovaLib and default template
* [CB-1515] Update Cordova.plist docs for new iOS 6 settings (KeyboardDisplayRequiresUserAction, SuppressesIncrementalRendering)
* [CB-1520] InvalidArgumentException when EnableLocation is Yes on Cordova.plist
* [CB-1524] No such a file or directory libCordova.a error when running app on device
* [CB-1526] Putting CordovaLib in source control requires bin/update\_cordova\_subproject (Change create script to copy CordovaLib into new projects)
* [CB-1558] LocalStorage is lost after upgrade to cordova 2.1 and ios6 up from from ios5
* [CB-1561] Using Storage API - rejected by Apple
* [CB-1569] Fatal crash after upgraded from 2.0 to 2.1
* [CB-1571] FileTransfer escapes callback arguments on iOS
* [CB-1578] App crash (while stopping) caused by an unregistered notification handler in CDVConnection
* [CB-1579] Optimize exec() calls made from plugin callbacks on iOS
* [CB-1587] Wrong splash screen shown on iPhone 5
* [CB-1595] Do not prompt user about whether to build from the emulate script.
* [CB-1597] Running ./cordova/debug / cordova/emulate causes errors
* [CB-1600] crash in MobileSpec under 4.3 during file transfer (check class before casting URLResponse)
* [CB-1604] navigator.connection not implemented correctly on iOS
* [CB-1617] update CDVGlobalization for ARC, remove iOS5 only api
* [CB-1619] Camera shutter remains closed when returning to app
* [CB-1694] View controller not properly unregistered in CDVURLProtocol
* [CB-1698] Remove WebScriptDebugDelegate.h
* [CB-1746] IOS events onAppWillResignActive and onAppDidEnterBackground do not execute JS until after app is launched again.
* [GH-PR-54]Update CDVDebug.h with better logging tools (https://github.com/apache/cordova-ios/pull/54 )
* [GH-PR-55] Removing useless NSLog (https://github.com/apache/cordova-ios/pull/55)
* [GH-PR-59] Fixed two bugs in CDVFileTransfer concerning file uploads (https://github.com/apache/cordova-ios/pull/59)
* Added CDV\_IsIPhone5 macro
* Add uncrustify config and script for auto-formatting code.
* Add git hook that runs uncrustify before commits.
* Add a comment explaining what the statements in the nativeReady eval do.
* Updating JS with default bridge now XHR\_OPTIONAL\_PAYLOAD.
* Delete unused CordovaBuildSettings.xcconfig from project template.
* Move test lib and test app out of CordovaLib.
* Tweak pre-commit message to make command more copy&paste-able.
* Convert unit tests to ARC.
* Add --shared optional parameter to bin/create script
* Update uncrustify rules for ternary operators.
* Refactor most of the command queue logic into a separate class.
* Add a method to CDVCommandDelegate for executing JS.
* Make plugins and CommandQueue use weak refs for CDVViewController.
* Adds CDVCommandDelegateImpl.
* Remove deprecated methods in CDVSound
* Delete deprecated method "closePicker" from CDVCamera.
* Remove deprecated methods in CDVFile.
* Remove CDVDeprecated.h. 7 months old.
* Add a macro for deprecating symbols and use it in a couple of places.
* Deprecate CDVCommandDelegate's execute and registerPlugin methods.
* Add a method to CDVCommandDelegate for executing on a background thread.
* Fix alert dead-lock in contacts mobile-spec test.
* Fix commandDelegate.evalJs to actually bundle exec() calls.
* Removed Cordova Settings File guide, added web shortcut to online doc.
* Changed Cordova.plist BackupWebStorage setting from boolean to string (cloud, local, none)

<br />

### 2.1.0 (20120913) ###

* [CB-45] Add support for full urls in white-list, extract hostname
* [CB-274] iOS Cordova Template Project is not compilable with default Apple's ARC compiler 3.0
* [CB-593] Click and touch events do not fire after using scroll CSS
* [CB-675] Allow multiple versions of PhoneGap to be installed in Xcode (added bin/update_cordova_subproject script)
* [CB-828] iOS contact.save() stops the UI from updating on heavy load & has memory leaks.
* [CB-903] iOS 6 - add setting to set WebKitStoreWebDataForBackup for user defaults from Cordova.plist/config.xml
* [CB-904] iOS 6 - turn off CDVLocalStorage core plugin when on iOS 6
* [CB-994] CDVLocalStorage core plugin does not fully backup when app setting "Application does not run in background" is YES
* [CB-1000] Namespace issue of JSONKit and other external libraries
* [CB-1091] Removed installer and related dependencies. Moved original post-install script into makefile under "install" target (which is default target).
* [CB-1091] Added check for if xcode is running, and throw error if it is.
* [CB-1105] Add JSONKit doc issue for iOS Plugin Upgrade Guide
* [CB-1106] Deprecate old plugin signature
* [CB-1122] Diagnostic tool for Cordova iOS Xcode projects
* [CB-1124] "create" script (and possibly others) provided in bin directory do not escape arguments
* [CB-1136] symlink to bin/create script fails
* [CB-1137] emulate and log script failure when launched from external working directory
* [CB-1138] Default logging level for file access should not log file contents.
* [CB-1149] hello-world sample web app is missing lib folder, in a newly created app
* [CB-1164] Fix warnings and analyzer issues reported with the newer LLVM in Xcode 4.4
* [CB-1166] Remove dependency on VERSION file
* [CB-1173] Clean up default project template
* [CB-1182] Fixing IOS6 screen orientation/rotation without breaking ios5.1 or xcode 4.4 build.
* [CB-1186] Update README.md, FirstRun.md for new install method
* [CB-1187] Move the Objective-C unit-tests out of CordovaLib.xcodeproj, into its own .xcodeproj
* [CB-1188] Update Plugin Upgrade Guide for new iOS plugin signature (old one still supported, but deprecated)
* [CB-1190] Crash when contacts are edited (mass edit)
* [CB-1192] Update template to set GCC_THUMB_SUPPORT=NO in Build Settings
* [CB-1204] CDVViewController-loaded view doesn't respect applicationFrame
* [CB-1209] CDVViewController.supportedOrientations not set in a timely fashion
* [CB-1223] CORDOVALIB Xcode variable - allow this to be read in from xcodebuild cli
* [CB-1237] CDVDebugWebView no longer works since the ARC changes.
* [CB-1258] Add documentation for the new logic to toggle between different exec() techniques on 
* [CB-1296] Update .js with fix for broken bridge on 4.2
* [CB-1315] Setting the view controller's view size in viewWillAppear, use rootViewController
* [CB-1385] Fix executing legacy plugins when callbackId is null.
* [CB-1380] Fix data uri from being blocked
* [CB-1384] Online .wav files cannot be played, but ones local to www can
* [CB-1385] 2.1.0rc2 - breaks certain plugins on iOS due to added "null" argument using FORMAT TWO in iOSExec
* [CB-1402] Media API - wrong JavaScript callback is called for onStatus (typo)
* [CB-1412] 2.1.0rc2 - iOS Whitelist is never used, all urls will pass the whitelist
* [CB-1453] Namespace issue of JSONKit (JSONKitSerializingBlockAdditions)
* [CB-1457] Remove unused CDVMotion core plugin - causes Apple App Store upload rejection
* [GH-PR 34] Refactor chooseContact() to retrieve contact information instead of just a contactId.
* [GH-PR 35] Enhances iOS FileTransfer's support for upload headers
* Change default wire format of exec handler (was iframe, now xhr) see [CB-593].
* Update all core plugins to new exec format (new plugin signature, old one deprecated per deprecation policy)
* Split out CordovaLibApp and CordovaTests into a separate Xcode project.
* Add a benchmark into CordovaLibApp for measuring exec() speed.
* Added Echo plugin (for benchmarking) into CordovaLib
* Support JS->Native messages via an XHR & URL Protocol see [CB-593]
* Refactor peoplePickerNavigationControllerDidCancel, always return dictionary with id kABRecordInvalidID.
* Deployment target for CordovaLib was not updated to 4.2 (we changed it in the template, but not the lib)
* Fixed null dereference in FileTransfer upload when URL is invalid.

<br />

### 2.0.0 (20120720) ###

* [CB-38] Add support for chunked uploads to FileTransfer plugin.
* [CB-93]  Only support iOS 4.2 and greater
* [CB-382] Added unit tests for CDVLocalStorage
* [CB-758] Updated bin/create template to use sub-project based Xcode project template.
* [CB-758] Removed folders "Cordova-based Application" and "Cordova-based Application.xctemplate" - the Xcode 3/4 templates
* [CB-853] Deprecate window.invokeString - use window.handleOpenURL(url) instead
* [CB-886] Change Xcode CordovaLib (sub)project format to support easy header inclusion
* [CB-907] Reverted for cross-platform consistency (and backwards compatibility). A doc issue should suffice [CB-1083]
* [CB-997] [CB-976] remove Organization
* [CB-989] dyld: Symbol not found: _NSURLIsExcludedFromBackupKey
* [CB-1000] Namespace issue of JSONKit and other external libraries
* [CB-1001] Added Base64 unit tests.
* [CB-1004] $PROJECT_NAME is never set in iOS command line cordova/debug tool
* [CB-1010] End background task for LocalStorage backup if iOS terminate app before job is completed
* [CB-1015] Fixed FileTransfer upload params
* [CB-1025] Failure to save contact results in a crash when printing the error
* [CB-1028] Add tests for CDVFileTransfer.
* [CB-1028] Properly escape URLs within FileTransfer that end with slash.
* [CB-1030] Add FAQ issue for NSURLIsExcludedFromBackupKey linker issue for archived builds in iOS 5.0.1 devices
* [CB-1030] add "-weak-framework CoreFoundation" to linker settings
* [CB-1036] factored device info into its own plugin
* [CB-1036] Updated cordova-js to latest to support new common device module.
* [CB-1036] Updating plist to include new device plugin.
* Added bin subfolder (command line scripts) to .dmg distribution package
* [CB-1075] - Cordova 2.0 installer - rename old Xcode project templates to minimize confusion
* [CB-1082] Add url shortcut in .dmg for "Create a New Project"
* [CB-1095] Added "Hello Cordova" sample app as default
* [CB-1099] Remove deprecated functions in CDVPlugin (verifyArguments, appViewController)

<br />

### 1.9.0 (20120629) ###

* Fixes CB-915 - Pause/resume events get fired twice
* Fixes CB-877 - Opening a .doc file under iOS causes the file system API to break (and any other plugins that may use NSMutableArray pop)
* Fixes CB-864 - Failure in writing a large file blocks Cordova
* Fixes CB-907 - Wrong URL encoding when downloading/uploading files from/to URLs with Unicode characters in the path
* Fixes CB-906 - Hardware mute button doesn't effect Media API playback
* Fixes CB-879 - Support to set the volume when playing short sounds
* Enhanced CB-471 - LocalFileSystem.PERSISTENT "do not back up" file attribute iOS. Supports new iOS 5.1 iCloud Backup attribute (the old way is deprecated, and only for iOS 5.0.1)
* Fixed CB-748 - refactored-UUID is broken and changes over time (changed according to Apple's guidelines for this)
* Fixes CB-647 - Prefix/Namespace common native libraries
* Fixes CB-961 - Can not remove contact property values anymore
* Fixes CB-977 - MediaFile.getFormatData failing
* [CB-943] decrease accelerometer interval from 100ms to 40ms
* [CB-982] add usage help to create script, remove unnecessary parameters from debug project-level script
* Removing component guide; going into the docs
* Fixes CB-957 - (iOS) iOS Upgrade Guide Migration
* Updated CB-957 - Include Xcode 4 requirement
* Fixes CB-914 - Deactivate CDVLocalStorage (Backup/Restore, safari web preferences update)
* [CB-914] Added BackupWebStorage setting in cli template
* Enhanced CB-471 - LocalFileSystem.PERSISTENT "do not back up" file attribute iOS. Supports new iOS 5.1 iCloud Backup attribute (the old way is deprecated, and only for iOS 5.0.1)
* Fixed CB-748 - refactored-UUID is broken and changes over time (changed according to Apple's guidelines for this)
* Fixes CB-647 - Prefix/Namespace common native libraries
* Fixes CB-942 - iOS failing FileTransfer malformed URL tests
* Updated CB-957 - Include Xcode 4 requirement
* Fixes CB-914 - Deactivate CDVLocalStorage (Backup/Restore, safari web preferences update)
* [CB-765] Header Support iOS FileTransfer upload
* Removed Upgrade Guide and Cleaver Guide from repo - they are all in http://docs.cordova.io now
* [CB-863] Splash screen on iOS not using localized UILaunchImageFile value
  
<br />

### 1.8.1 (20120612) ###

* Fixes CB-885 - Crash when sliding the notification tray and/or tel link confirm dialog
* Fixed CB-506 - images taken via Camera.getPicture do not get deleted
* Implemented CB-857 - Add deprecation notice if user is running iOS lesser than 4.2

<br />

### 1.8.0 (20120605) ###

* Fixes CB-819 fail callback not invoked
* [CB-794] Add HTTP status code to FileTransferError object for iOS
* [CB-359] Updates to adhere to W3C spec for geolocation. Changing actions based on changes incorporated into cordova-js
* [CB-683] pause/resume events now should pass in event object into handlers
* [CB-464] rewrite of accel plugin, simplified accel to start/stop actions.
* [CB-623] added Logger plugin
* Fixed CB-513 - Remove cast functionality from CDVPluginResult, obsolete
* Fixed CB-594 - Remove checks for retainCount
* Fixed CB-637 - Add a doc on how to update the template project in the bin subfolder
* Updated bin folder scripts.
* Fixed CB-669 - verify.sh file in a new Cordova-based application project should not be included in the .app bundle
* Fixes CB-471 - LocalFileSystem.PERSISTENT "do not back up" file attribute iOS
* Fixed typo in File.getMetadata - error callback had OK instead of ERROR status
* Fixes CB-610 - Capture.bundle missing microphone image resources for retina iPad results in mis-drawn recording interface
* Fixes CB-751 - Undefined function is called when orientation change
* Fixes CB-754 - Use of -weak_library in 'other library flags' of generated template XCode app causes crashes in Simulator when Obj-C Blocks are used
* Fixes CB-628 - Scrub installation process, document artifacts of Xcode 3 support, mention no ARC
* Fixed CB-628 - Scrub installation process, document artifacts of Xcode 3 support, mention no ARC
* Fixes CB-684 - Not enough time for background execution of WebSQL/LocalStorage backup (when app goes to the background)
* Fixes CB-766 - Update bin/debug shell script to point to Homebrew ios-sim 1.4 download
* Fixes CB-464 - Refactor accelerometer native code in iOS
* Fixes CB-760 - Camera returns incorrect image size
* Fixed warning in CDVLocation
* Fixed EXC_BAD_ACCESS error in CDVAccelerometer
* Fixes CB-818 - Make CDVViewController also implement initWithNibName
* Fixes CB-825 - Makefile: remove direct download of Markdown and wkhtmltopdf (uses homebrew to download)
* Fixes CB-328 - Cordova crashes on iOS 3.x devices
* Fixes CB-851 - guide for using url schemes in iOS

<br />

### 1.7.0 (20120430) ###

* Fixed CB-183, CB-54 - ios camera targetWidth/Height don't match the documentation Fixes CB-183 and CB-54
* Fixed CB-511 Changed deviceproperties version to "cordova" property
* Fixed CB-483 - FileTransfer - unknown property attribute 'atomic' when building from source (Xcode 3 only)
* Fixed CB-507 - Remove excessive debug logging in execute delegate method in CDVViewController
* Implemented CB-536 - Add new selector to CDVViewController to create a new CDVCordovaView, so subclasses can override it
* Workaround for CB-509 - geolocation.clearWatch doesn't shut the GPS down under iOS
* Fixed CB-537 - media.seekTo fails with NSRangeException
* Fixed CB-544 - iOS Geolocation fails if Cordova.plist EnableLocation = YES
* Fixed CB-543 - FileTransfer.upload WebKit discarded an uncaught exception
* Fixed CB-391 - camera.getPicture crash
* Implemented CB-535 - Add a way to log JavaScript exceptions, parse errors, and get JS stack frame events (with line numbers, etc)
* Fixed CB-494 - Move Cordova.plist section from "How to use Cordova as a Component Guide" to its own doc
* Fixed CB-571 - stubbed out create method to remove error when creating Media objects, also added another check if file does not exist.
* Fixed CB-386 - added retina iPad splash screens. made sure retina ipad icon files shows up during load.
* Re-fix CB-347 - localStorage / SQLDatabase Error after App update (timing issue for applying fix)
* Adjust splash screen position based on orientation and status bar size

<br />

### 1.6.1 (20120416) ###

* Fixed CB-496 - Camera.getPicture - will always return FILE\_URI even though DATA\_URL specified
* Fixed CB-497 - online and offline events are not being fired in 1.6.0
* Fixed CB-501 - orientationchange event is not being fired in 1.6.0
* Fixed CB-302 - orientation change event fired off twice on iOS 5.x
* Fixed CB-507 - Remove excessive debug logging in execute delegate method in CDVViewController

<br/>

### 1.6.0 (20120409) ###
* Updates for Media API
* Contacts updates for Unified JavaScript
* Fixed Contacts.save return value and Notification.confirm
* Changed Device initialization to use a require-based pattern
* Added require syntax for firing events in ios
* Added a getConnectionInfo method for compatibility
* Added require in pluginresult helper funcs
* Updated plist of plugin names -> classes to adhere to common labels in other platforms
* Rewrite of accelerometer code and removed DeviceInfo old init approach
* Added warning about changing compiler settings in xcode
* Changed Accel values to doubles
* Tweaked battery plugin for cordova-js use
* Updated interface to get Camera working. 
* Rewrote Location class to use cordova-js unified approach.
* Updated refs from require("cordova") to just "cordova", and other require calls to cordova.require
* Updated sub-project cordovalib steps
* Fixed Compass, Location for cordova-js integration
* Added unification of accelerometer values on ios (based on android values)
* Removed old JS, added cordova-js version
* Changes to CordovaLib makefile for generating JS
* Fixed CB-260: Can't install PhoneGap with new Xcode 4.3
* Fixed Xcode app detection (using Spotlight) in Makefile
* Fixed CB-306 - Remove extra template App delegate methods
* Fixes CB-255 - iOS: a parameter with value 'null' is not passed to 'arguments' array
* Fixed CB-236 - Add ContentLength Header in Upload request
* Fixed CB-300 - CDVFileTransfer crashes with 303 and empty response
* Fixed CB-148, CB-316: Playing HTTP / HTTPS urls using the Media API is not working
* Improved Makefile for mixed Xcode 4.2 and Xcode 4.3.1 environment.
* Fixed CB-329 - Add warning if multi-tasking is not supported on an iOS device (to console log)
* Fixed CB-317 : Xcode: Shell Script Invocation Error when directory has spaces in name
* Fixed CB-330 - localStorage / SQLDatabase no longer persistent after iOS 5.01 update
* Fixed CB-347 - iOS 5.1 localStorage / SQLDatabase error after upgrading an app
* Fixed shell script error - picks up new location of cordova.js (unified) now
* Fixed NOTICE file with correct project name
* Fixed CB-49 - UUID replacement
* Fixed CB-361 & use timeout to turn off compass sensor
* Fixed CB-427 - add back iOS only getPicture options
* Fixed CB-349 - Remove sessionKey usage (unused) in CDVViewController
* Fixed CB-237 - Updated splash screen assets
* Fixed CB-387 - try/catch wrapper in native iOS code for cordova-js initialization firing alerts when page without cordova.js is loaded in
* Fixed CB-425 - Notification buttons and title are not working for confirm and alert
* Fixed CB-440 - (LLVM-GCC only) Wrong number of arguments specified for 'deprecated' attribute
* Fixed CB-441 - make fails if PackageMaker.app installed at a path with spaces in a folder name.
* Fixed CB-444 - Xcode template new project - AppDelegate's self.invokeString usage was removed
* Fixed CB-380 - Update Cordova Upgrade Guide for 1.6.0
* Fixed CB-445 - Update "How to use Cordova as Component" Guide for 1.6.0
* Fixed CB-381 - Update Cordova Plugin Upgrade Guide for 1.6.0
* Fixed CB-406 - Update README.md
* Fixed CB-433 - CDVFileTransfer.m methods - convert use of "options" object into "arguments" array
* Fixed CB-377 - add a check for PM_APP,  XC_APP, and DEVELOPER in the Makefile
* REMOVED: navigator.splashscreen JavaScript interface (was unofficial) - use **cordova.exec(null, null, "SplashScreen", "hide", [])** OR **cordova.exec(null, null, "SplashScreen", "show", [])**

<br/>

### 1.5.0 (20120302) ###

* Fix NSLog crash in CDVWhitelist.m - parameter order reversed
* Updated the Upgrade Guide for 1.4.1
* Added UIWebViewBounce key to PhoneGap.plist (default is YES) (originally from an @alunny pull request)
* Updated README.md FAQ item #5 (upgrades)
* Added the German and Swedish resources to the Xcode templates
* Fixes CB-149 - Black Bar visible after landscape video
* Fixes CB-221 - On an orientation change, the orientationchange event not fired on iOS 3 and 4 
* Rename PhoneGap to Cordova.
* Completed Cordova Guides for 1.5.0
* Fixed CB-253 - Xcode 4 Cordova-based Application - DEBUG macro not defined
* Default GCC_VERSION is com.apple.compilers.llvm.clang.1_0 now
* Removed Xcode and iOS SDK checks in the installer (for the Xcode 4.3 install which goes under the /Applications folder)

<br/>

### 1.4.1 (20120201) ###
* Fixed CB-212 - iOS orientation switch broken in 1.4.0

<br/>

### 1.4.0 (20120130) ###
* Fixed CB-143 - Removing address from iOS contact causes crash
* Fixed CB-153 - Camera default destination should be FILE_URI
* Fixed CB-7 - Update source headers to apache license
* Fixed CB-42 - MediaPlaybackRequiresUserAction can now be set to NO
* Added stand-alone PGViewController (Cleaver - PhoneGap as a Component)
* Fixed iOS 5 quirks with presenting/dismissing modal viewcontrollers.
* Added 'How to Use PhoneGap as a Component' doc to the .dmg  (as a PDF)
* Added 'PhoneGap Upgrade Guide' doc to the .dmg  (as a PDF)
* Added for legacy support of deprecated PhoneGapDelegate - in core plugins.
* Removed PhoneGapLibTest project and folder
* Updated the app icons, splash-screens, and template icons for the Xcode template to Cordova ones.
* Added Battery core plugin to PhoneGap.plist

<br />

### 1.3.0 (20111219) ###
* added battery into PhoneGap framework compilation
* Fixes CB-101 can't access media in documents://subDir
* Added download method to filetransfer, interface is the same like on Android
* When playing audio from remote URL, stop as soon as download fails and make loading cacheable.
* Fixed #197 errors on repeated getCurrentPosition calls. If the location services were off when getCurrentPosition was called, turn them off again after the position is received.
* Don't force an orientation change unless the current orientation is unsupported
* Fixed callback/callback-ios#15 - Xcode 3.2.6 Linker error when Build for Active Architecture Only = YES
* Fixed callback/callback-ios#23 - on app resume, it always throws either an offline/online event even though the online state never changed
* Fixed warning - implicit conversion of UIInterfaceOrientation to UIDeviceOrientation (which are equivalent, for the two Portraits and two Landscape orientations)
* Fixed callback/callback-ios#22 - Removed unused DetectPhoneNumber and EnableAcceleration values in PhoneGap.plist
* Fixed CB-96 PGWhitelist does not handle IPv4 host addresses with wild-cards
* Added 'resign' and 'active' lifecycle events.

<br />

### 1.2.0 (20111103) ###

* Update for iOS 5 - Switched to using LLVM Compiler and fixed associated warnings. Added armv6 to architectures so can use devices running < iOS5
* Fixed phonegap/phonegap-iphone#313 - return MediaError in error callback
* Added documentation for correctOrientation and saveToAlbum options of camera.getPicture
* Fixed phonegap/phonegap-iphone#302 Compiler warnings in PGMotion
* Fixed phonegap/phonegap-iphone#296 iFrames open in Mobile Safari
* Fixed callback/callback-ios#5 - Optimization: If white-list contains "*" (wildcard), do not do URL processing
* Fixed callback/callback-ios#3 - UniversalFramework target of PhoneGapLib does not compile under Xcode 4.2
* Fixed callback/callback-ios#2 - Convert SBJson library use to JSONKit use
* Fixed problem where deploying to device using PhoneGap.framework, the armv7 slice is missing from the fat binary 
* Connection plugin (Reachability) - stop/start notifier on pause/resume of app (attempt at Reachability crash fix)
* Added OpenAllWhitelistURLsInWebView setting in PhoneGap.plist (to open all white-listed URLs in the PhoneGap webview)

<br />

### 1.1.0 (20110930) ###
  
* fixes issue #212 media play not always calling success callback
* added support for W3C battery status events
* fix audio view sizing on iPad when built for iPhone
* refs #277 regression in camera due to PluginResult changes
* fix broken file tests in mobile-spec
* fix #265 display contact not restoring after pause
* issue #230 Update compass implementation
* fixes #271 Implemented selecting picture type when getting images from library.
* fix #289 update contact to deal with an address with no type specified
* fix #293  Now clearing callback function when battery events stopped
* fix #232 Allow media playback to work when device locked or       add correctOrientation option to rotate images before returning them  
* add option for saving photo to the album
* add success,error method sugar to PGPlugin
* moved `device.js` before `capture.js` because `Capture`'s install function depends on `Device`'s constructor.
* fix, simplify, and extend PluginResult's toJSONString function.
* add unit-test target/product to PhoneGapLib.
* update Capture, Contacts, and File to not rely on PluginResult's previous bug.
* allow for using a custom UIWebView object. Just set self.webView in application:didFinishLaunchingWithOptions: before calling super.
* rework PhoneGap.exec() to execute commands much faster.
* fix a race condition in PhoneGap.exec().
* put the PhoneGap.exec() before deviceready warning in the right place.
* fixed issue #219: geolocation.watchposition() delayed
* fixes #207 iOS 3.x crash: NSConcreteGlobalBlock symbol not found
* fixed #228 getPicture crashes when getting picture from photobook on iPad
* added failing unit-tests for PGContacts.
* updated sample index.html with notes about the white-list.
* fixed #290 regression - modalViewController does not retain the UINavigationController as expected. This will still cause a static analyzer issue though
* restructuring for cli scripts, first pass at test automation, mobile-spec automation
* fixed #215 Add sha1 checksum for the .dmg file
* PhoneGapLib: Re-applied IPHONEOS_DEPLOYMENT_TARGET = 3.0 setting that was clobbered in a pull-request
* fixes #202 PhoneGapViewController code cleanup
* updated PhoneGapLibTest for 1.0.0 release, updated test submodule to latest
* fixed #221 Add linker flags for weak-linking frameworks, to templates
* fixed #225 Xcode 4 www folder warning - add additional help text
* fixed #224 make the default projects universal
* fixed #201 README.pdf - links from converted README.md not clickable, plus re-structure
* converted installer docs to markdown
* updated Makefile for new markdown docs.
* fixed #241 navigator.notification.alert - cannot set empty title
* fixed #199 Unnecessary warnings in console (about:blank)
* fixed #194 Enable white listing of domains that an application can access. All http and https urls MUST be in PhoneGap.plist/ExternalHosts or they will not be handled.
* fixed #233 wildcard support for ACL
* set properties to readonly in the AppDelegate, and removed some of the properties from the public interface.
* fixed #243 Splash screen spinner not visible
Removed GetFunctionName.js (unused)
* fixed #246 Add whitelist capability that includes XMLHttpRequest calls
* usage of VERIFY_ARGUMENTS macro in File plugin - related to #244
* fixed #259: PluginResult toJSONString does not quote strings in arrays
* added ability so that unhanded URLs (i.e. custom schemes in a web-page) will notify PhoneGap plugins of this custom url so that the plugins can handle it themselves. This would give the ability to handle callbacks for OAuth logins (Twitter/Facebook) in the main PhoneGap UIWebview, and not require the ChildBrowser plugin.
* fixes #263 Phone call - tel: scheme handling hides default behavior
* fixes #269 - Add Obj-C unit-tests for whitelist implementation
* fixed #256 PhoneGapDelegate (UIApplicationDelegate) property hides new property in iOS 5
* fixed #254 Prefix the SBJSON classes included in PhoneGap with 'PG'
* updated README FAQ to be up to date, and numbered the questions for easy reference.
* removed user cruft in .xcodeproj - project.workspace and xcuserdata folders.
* fixed geolocation authorizationStatus on first use. Changes to help debug issue #197
* fixed #197 navigator.geolocation.getCurrentPosition timeouts when native app works
* fixed #255 ability to play inline videos

<br />

### 1.0.0 (20110728) ###
  
* **CHANGED:** Update media implementation to match documentation. Significant modifications to match documentation. Using media.js from Android so significant changes to the code to match that architecture.  Created wrapper for AVAudioPlayer and Recorder to store the mediaId. Kept iOS only prepare() method but removed downloadCompleteCallback. Added seekTo method. 
* **CHANGED:** Default-Landscape.png width increased to 1024px for #185 fix below 
* **FIX:** #188 Xcode 3 Template does not weak-link UIKit, AVFoundation and CoreMedia by default 
* **FIX:** #183 make fails when a user's Developer (Xcode) folder has spaces in it 
* **FIX:** #180 Add README.md to the installer package 
* **FIX:** #186 return null when no organization information. iOS was incorrectly returning an organization object with all null values when there was no organization information. It now correctly returns null. 
* **FIX:** #182 updated getCurrentPosition to update _position variable. Fixed bug where seekTo was setting the _position value in milliseconds rather than seconds. getCurrentPosition was not setting _position to -1 when media was not playing. 
* **FIX:** #191 (CRASH) PhoneGap app re-suspends when resumed after Airplane Mode toggled 
* **FIX:** #196 PhoneGapInstaller.pkg should be signed 
* **FIX:** #185 splash screen ignores supported device orientations (fixed for Universal only - iPhone only on iPad has an iOS bug) 
* **REMOVED:** Installer readme.html is now generated from README.md markdown in the root 
* **REMOVED:** Default~ipad.png is removed from the project templates 
* **ADDED:** Prevents iframes from executing PhoneGap calls via gap urls 
* **ADDED:** Added warning log if splash-screen image is missing. 
* **NOTE:** 1.0.0rc3 tagged in the repo is essentially this release 

<br />

### 1.0.0rc2 (20110719) ###
  
* **FIX:** #167 Generated (by script) Xcode 3 template file fails in Xcode 4 
* **FIX:** #162 better accessibility for timed audio  
* **FIX:** #168 Warning in Xcode 3 project that you haven't added phonegap.*.js, warning never goes away 
* **FIX:** iPhone splash screen not showing (no issue #, fixed in splash screen new feature below) 
* **ADDED:** New PhoneGap.plist options: AutoHideSplashScreen (bool=true), ShowSplashScreenSpinner (bool=true). If AutoHideSplashScreen is false, you can control hiding the splash screen in JavaScript by calling navigator.splashscreen.hide(). 
* **ADDED:** #164 Add phonegap version inside the JavaScript file itself 
* **ADDED:** #166 Create uninstaller for PhoneGapInstaller  
* **ADDED:** #6 implemented Camera.EncodingType to return images as jpg or png from getPicture. 
* **CHANGED:** Sample splash screen images are annotated 
* **REMOVED:** #165 Remove minification of phonegap.*.js file 

<br />

### 1.0.0rc1 (20110712) ###
  
* **FIX:** Splash screen fixes for iPad 
* **REMOVED:** Deprecated items **REMOVED:** Notification activityStart/activityStop, Notification loadingStart/loadingStop, Network.isReachable, debug.log, File.writeAsText, PhoneGapCommand base class for Plugins, unused Image and Movie plugins removed 
* **RESTORED:** Camera core plugin has been un-deprecated until a suitable replacement can be found to grab photos from the Camera Roll/Photo Library. 
* **NEW:** phonegap.js naming convention: now phonegap-1.0.0rc.js, was phonegap.1.0.0rc1.js 
* **NEW:** Camera core plugin supports image scaling 
* **NEW:** Contacts core plugin updated to W3C June 2011 Spec 
* **NEW:** Contacts core plugin supports display and edit contact 
* **NEW:** Capture core plugin supports localized files for a11y prompt in Audio capture. 
* **NEW:** EnableViewportScale key in PhoneGap.plist (to enable viewport initial-scale metadata tag) 
* **NEW:** Plugins: PhoneGap.exec supports service names in Reverse Domain Name (RDN) notation i.e "com.phonegap.MyPlugin" 
* **NEW:** Plugins: PhoneGap.exec should support new signature: PhoneGap.exec(successCallback, failCallback, serviceName, action, [arg0, arg1]) 
* **NEW:** Plugins: Ability to override onMemoryWarning() to handle app memory warnings 
* **NEW:** Plugins: Ability to override onAppTerminate() to handle app termination 
* **NEW:** Plugins: Ability to override handleOpenURL:(NSNotification*) to handle launch of the app from a custom URL 
* **UPGRADERS:** Create a new project, and copy in the new phonegap-1.0.0rc1.*.js and PhoneGap.plist into your existing project 

<br />

### 0.9.6 (20110628) ###
  
* Xcode 3 Template includes the CoreMedia framework (as a weak reference for iOS 3.x) for the W3C Media Capture API 
* Xcode 4 Template includes the CoreMedia framework (as a required reference, template spec limitation) for the W3C Network API. You must change this to an 'optional' reference to target iOS 3.x devices, if not they will crash. 
* **UPGRADERS:** add the existing framework "CoreMedia" to your project, set it to weak/optional in your Target, copy the new phonegap.*.js files in manually to your www folder, and update your script references. Copy the .js files from /Users/Shared/PhoneGap/Frameworks/PhoneGap.framework/www. Copy the "Capture.bundle" from /Users/Shared/PhoneGap/Frameworks/PhoneGap.framework and add it to your project as well (or copy from a new project) 
* **UPGRADERS:** set the existing frameworks "UIKit" and "AVFoundation" to weak/optional (for iOS 3.x support) 
* CoreTelephony.framework can be removed in all projects, it is not needed anymore for the W3C Network Information API 
* Plugins **MUST** add their plugin mapping to *PhoneGap.plist* Plugins key, if not they will not work. 
* **DEPRECATED:** Camera.getPicture will be removed in 1.0 and put in the plugins repo, use the Media Capture API instead 
* **DEPRECATED:** Network.isReachable will be removed in 1.0, use the Network Information API instead 
* **DEPRECATED:** Notification activityStart, activityStop, loadingStart, loadingStop core plugin functions will be removed in 1.0 and put in the plugins repo 
* **DEPRECATED:** Plugin base class 'PhoneGapCommand' will be removed in 1.0, use the base class 'PGPlugin' instead

<br />

### 0.9.5.1 (20110524) ###
  
* Xcode 3 Template includes the CoreTelephony framework (as a weak reference for iOS 3.x) for the W3C Network Information API 
* Xcode 4 Template includes the CoreTelephony framework (as a required reference, template spec limitation) for the W3C Network Information API. You must change this to an 'optional' reference to target iOS 3.x devices, if not they will crash. 
* **UPGRADERS:** add the existing framework "CoreTelephony" to your project, set it to weak/optional in your Target, copy the new phonegap.*.js files in manually to your www folder, and update your script references. Copy the .js files from */Users/Shared/PhoneGap/Frameworks/PhoneGap.framework/www* 
* Xcode 3 Template does not copy the PhoneGap javascript files anymore into your www folder, the javascript files are now part of the template (**Xcode 3 UPGRADERS:** you will need to grab the .js files manually from *~/Documents/PhoneGapLib/javascripts* after building your project at least once) 
* PhoneGapLib use is considered deprecated, for a future installer the Xcode 3 Template will use the PhoneGap.framework exclusively 
* Xcode 4 Template has an improved build script - it will detect whether the 'www' folder reference was added and will warn you if it has not been added (**Xcode 4 UPGRADERS:** you will need to grab the .js files manually from */Users/Shared/PhoneGap/Frameworks/PhoneGap.framework/www*) 
* Added Xcode 4 Template (need to add in www folder reference manually - sample 'www' folder created after first run) 
* Added PhoneGap static framework generation (as the UniversalFramework target in PhoneGapLib xcodeproj) 
* Modified Xcode 3 Template (for compatibility with the Xcode 4 template) 
* Installed PhoneGap static framework in */Users/Shared/PhoneGap/Frameworks/PhoneGap.framework* (for non-admin privilege users, this may change in further updates) 

<br />

### 0.9.5 (20110427) ### 
  
* Updated PhoneGap application template to handle project and PhoneGapLib locations with spaces in it 
* Removed iPad template 
* Updated compiler of application template and PhoneGapLib to LLVM GCC 4.2 
* Cleaned up static analyzer warnings. 
* Updated PhoneGap application template to handle project and PhoneGapLib locations with spaces in it 
* Removed iPad template 
* Updated compiler of application template and PhoneGapLib to LLVM GCC 4.2 
* Cleaned up static analyzer warnings. 

<br />

### 0.9.4 (20110203) ###
  
* phonegap.js is minified using the YUI compressor, and also renamed to phonegap.{ver}.min.js where {ver} is the version number of PhoneGapLib from the VERSION file 
* the PhoneGap template is changed as well, at build time it will replace any references to 'src="phonegap.js"' to the new versioned js file (and copy the new phonegap.{ver}.min.js file). This replacement will look in all files in the 'www' folder. 
* note that with the new PhoneGapLib phonegap.{ver}.min.js renaming, existing PhoneGap templates must copy the new "Copy PhoneGap JavaScript" post-build script from the new template (in Xcode, under Targets/[ProjectName]) 

<br />

### 20101102 ###
  
* Updated the Base SDK to "Latest iOS" (iOS 4.2 is the minimum to submit to the App Store) for the project files. This setting requires the latest Xcode 3.2.5 (included with the iOS 4.2 SDK) 

<br />

### 20101019 ### 
  
* Updated the Base SDK to iOS 4.1 (the minimum to submit to the App Store) for the project files 

<br />

### 20100902 ###  
  
* Updated the Base SDK to iOS 4.0 (the minimum to submit to the App Store) for the project files 
* Added PhoneGapBuildSettings.xcconfig to the template. To override your PHONEGAPLIB folder on a project by project basis, modify the PHONEGAPLIB value in this file. 

<br />

### 20100416 ###
  
* Removed keys from PhoneGap.plist (AutoRotate, StartOrientation, RotateOrientation). 
* To support orientation in your app: edit/add the UISupportedInterfaceOrientations (iPhone) or UISupportedInterfaceOrientations~ipad (iPad) key into your app's [appname]-Info.plist, with an array of strings that show what orientation your app supports. The supported values are: UIInterfaceOrientationPortrait, UIInterfaceOrientationLandscapeLeft, UIInterfaceOrientationPortraitUpsideDown, UIInterfaceOrientationLandscapeRight.  
* The first value in the array is the orientation that your app starts in. If you have more than one value in the array, it will autorotate (to the other supported orientations). 

<br />

### 20100406 ###
  
* added iPad universal xcodeproj file (3.2 OS required) 

<br />

### 20091103  
  
* fixed permissions and initial run problems 

<br />

### 20091030 ### 
  
* initial release 
  
<br />
