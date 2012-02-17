/*
 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at
 
 http://www.apache.org/licenses/LICENSE-2.0
 
 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
 */

#import "CDVViewController.h"
#import "CDVPlugin.h"
#import "CDVLocation.h"
#import "CDVConnection.h"
#import "NSDictionary+Extensions.h"

#define SYMBOL_TO_NSSTRING_HELPER(x) @#x
#define SYMBOL_TO_NSSTRING(x) SYMBOL_TO_NSSTRING_HELPER(x)
#define degreesToRadian(x) (M_PI * (x) / 180.0)

@interface CDVViewController ()

@property (nonatomic, readwrite, retain) NSDictionary* settings;
@property (nonatomic, readwrite, retain) CDVWhitelist* whitelist; 
@property (nonatomic, readwrite, retain) NSMutableDictionary* pluginObjects;
@property (nonatomic, readwrite, retain) NSDictionary* pluginsMap;
@property (nonatomic, readwrite, retain) NSArray* supportedOrientations;
@property (nonatomic, readwrite, copy)   NSString* sessionKey;
@property (nonatomic, readwrite, assign) BOOL loadFromString;

@property (nonatomic, readwrite, retain) IBOutlet UIActivityIndicatorView* activityView;
@property (nonatomic, readwrite, retain) UIImageView* imageView;

@end


@implementation CDVViewController

@synthesize webView, supportedOrientations;
@synthesize pluginObjects, pluginsMap, whitelist;
@synthesize settings, sessionKey, loadFromString;
@synthesize imageView, activityView, useSplashScreen, commandDelegate;
@synthesize wwwFolderName, startPage;

- (id) init
{
    self = [super init];
    if (self != nil) {
        [[UIDevice currentDevice] beginGeneratingDeviceOrientationNotifications];
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(receivedOrientationChange) 
                                                     name:UIDeviceOrientationDidChangeNotification object:nil];
        
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onAppWillTerminate:) 
                                                     name:UIApplicationWillTerminateNotification object:nil];
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onAppWillResignActive:) 
                                                     name:UIApplicationWillResignActiveNotification object:nil];
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onAppWillEnterForeground:) 
                                                     name:UIApplicationWillEnterForegroundNotification object:nil];
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onAppDidBecomeActive:) 
                                                     name:UIApplicationDidBecomeActiveNotification object:nil];
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onAppDidEnterBackground:) 
                                                     name:UIApplicationDidEnterBackgroundNotification object:nil];

        self.wwwFolderName = @"www";
        self.startPage = @"index.html";
        [self setWantsFullScreenLayout:YES];
    }
    return self; 
}

// Implement viewDidLoad to do additional setup after loading the view, typically from a nib.
- (void) viewDidLoad 
{
    if (self.sessionKey == nil) {
        self.sessionKey = [NSString stringWithFormat:@"%d", arc4random()];
    }
    
    [super viewDidLoad];
	
    self.pluginObjects = [[[NSMutableDictionary alloc] initWithCapacity:4] autorelease];
    
	// read from UISupportedInterfaceOrientations (or UISupportedInterfaceOrientations~iPad, if its iPad) from -Info.plist
    self.supportedOrientations = [self parseInterfaceOrientations:
									  [[[NSBundle mainBundle] infoDictionary] objectForKey:@"UISupportedInterfaceOrientations"]];
    
    // read from Cordova.plist in the app bundle
    NSString* appPlistName = @"Cordova";
    NSDictionary* cordovaPlist = [[self class] getBundlePlist:appPlistName];
    if (cordovaPlist == nil) {
        NSLog(@"WARNING: %@.plist is missing.", appPlistName);
		return;
    }
    self.settings = [[[NSDictionary alloc] initWithDictionary:cordovaPlist] autorelease];
	
    // read from Plugins dict in Cordova.plist in the app bundle
    NSString* pluginsKey = @"Plugins";
    NSDictionary* pluginsDict = [self.settings objectForKey:@"Plugins"];
    if (pluginsDict == nil) {
        NSLog(@"WARNING: %@ key in %@.plist is missing! Cordova will not work, you need to have this key.", pluginsKey, appPlistName);
        return;
    }
    
    // set the whitelist
    self.whitelist = [[[CDVWhitelist alloc] initWithArray:[self.settings objectForKey:@"ExternalHosts"]] autorelease];
	
    self.pluginsMap = [pluginsDict dictionaryWithLowercaseKeys];
    
    ///////////////////
    
	NSString* startFilePath = [self pathForResource:self.startPage];
	NSURL* appURL  = nil;
    NSString* loadErr = nil;
    
    if (startFilePath == nil) {
        loadErr = [NSString stringWithFormat:@"ERROR: Start Page at '%@/%@' was not found.", self.wwwFolderName, self.startPage];
        NSLog(@"%@", loadErr);
        self.loadFromString = YES;
        appURL = nil;
    } else {
        appURL = [NSURL fileURLWithPath:startFilePath];
    }

    [ self createGapView];
    
    ///////////////////
    
    NSNumber* enableLocation       = [self.settings objectForKey:@"EnableLocation"];
    NSString* enableViewportScale  = [self.settings objectForKey:@"EnableViewportScale"];
    NSNumber* allowInlineMediaPlayback = [self.settings objectForKey:@"AllowInlineMediaPlayback"];
    BOOL mediaPlaybackRequiresUserAction = YES;  // default value
    if ([self.settings objectForKey:@"MediaPlaybackRequiresUserAction"]) {
        mediaPlaybackRequiresUserAction = [(NSNumber*)[settings objectForKey:@"MediaPlaybackRequiresUserAction"] boolValue];
    }
    
    self.webView.scalesPageToFit = [enableViewportScale boolValue];
    
    /*
     * Fire up the GPS Service right away as it takes a moment for data to come back.
     */
    
    if ([enableLocation boolValue]) {
        [[self.commandDelegate getCommandInstance:@"org.apache.cordova.geolocation"] startLocation:nil withDict:nil];
    }
    
    /*
     * This is for iOS 4.x, where you can allow inline <video> and <audio>, and also autoplay them
     */
    if ([allowInlineMediaPlayback boolValue] && [self.webView respondsToSelector:@selector(allowsInlineMediaPlayback)]) {
        self.webView.allowsInlineMediaPlayback = YES;
    }
    if (mediaPlaybackRequiresUserAction == NO && [self.webView respondsToSelector:@selector(mediaPlaybackRequiresUserAction)]) {
        self.webView.mediaPlaybackRequiresUserAction = NO;
    }
    
    // UIWebViewBounce property - defaults to true
    NSNumber* bouncePreference = [self.settings objectForKey:@"UIWebViewBounce"];
    BOOL bounceAllowed = (bouncePreference==nil || [bouncePreference boolValue]); 
    
    // prevent webView from bouncing
    // based on UIWebViewBounce key in Cordova.plist
    if (!bounceAllowed) {
        if ([ self.webView respondsToSelector:@selector(scrollView) ]) {
            ((UIScrollView *) [self.webView scrollView]).bounces = NO;
        } else {
            for (id subview in self.webView.subviews)
                if ([[subview class] isSubclassOfClass: [UIScrollView class]])
                    ((UIScrollView *)subview).bounces = NO;
        }
    }
    
    ///////////////////
    
    if (!loadErr) {
        NSURLRequest *appReq = [NSURLRequest requestWithURL:appURL cachePolicy:NSURLRequestUseProtocolCachePolicy timeoutInterval:20.0];
        [self.webView loadRequest:appReq];
    } else {
        NSString* html = [NSString stringWithFormat:@"<html><body> %@ </body></html>", loadErr];
        [self.webView loadHTMLString:html baseURL:nil];
    }
    
	self.commandDelegate = self;
}

- (NSArray*) parseInterfaceOrientations:(NSArray*)orientations
{
    NSMutableArray* result = [[[NSMutableArray alloc] init] autorelease];
	
    if (orientations != nil) 
    {
        NSEnumerator* enumerator = [orientations objectEnumerator];
        NSString* orientationString;
        
        while (orientationString = [enumerator nextObject]) 
        {
            if ([orientationString isEqualToString:@"UIInterfaceOrientationPortrait"]) {
                [result addObject:[NSNumber numberWithInt:UIInterfaceOrientationPortrait]];
            } else if ([orientationString isEqualToString:@"UIInterfaceOrientationPortraitUpsideDown"]) {
                [result addObject:[NSNumber numberWithInt:UIInterfaceOrientationPortraitUpsideDown]];
            } else if ([orientationString isEqualToString:@"UIInterfaceOrientationLandscapeLeft"]) {
                [result addObject:[NSNumber numberWithInt:UIInterfaceOrientationLandscapeLeft]];
            } else if ([orientationString isEqualToString:@"UIInterfaceOrientationLandscapeRight"]) {
                [result addObject:[NSNumber numberWithInt:UIInterfaceOrientationLandscapeRight]];
            }
        }
    }
    
    // default
    if ([result count] == 0) {
        [result addObject:[NSNumber numberWithInt:UIInterfaceOrientationPortrait]];
    }
    
    return result;
}

- (BOOL) shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation 
{
	// First ask the webview via JS if it wants to support the new orientation -jm
	int i = 0;
	
	switch (interfaceOrientation){
            
		case UIInterfaceOrientationPortraitUpsideDown:
			i = 180;
			break;
		case UIInterfaceOrientationLandscapeLeft:
			i = -90;
			break;
		case UIInterfaceOrientationLandscapeRight:
			i = 90;
			break;
		default:
		case UIInterfaceOrientationPortrait:
			// noop
			break;
	}
	
	NSString* jsCall = [ NSString stringWithFormat:@"shouldRotateToOrientation(%d);",i];
	NSString* res = [webView stringByEvaluatingJavaScriptFromString:jsCall];
	
	if([res length] > 0)
	{
		return [res boolValue];
	}
	
	// if js did not handle the new orientation ( no return value ) we will look it up in the plist -jm
	
	BOOL autoRotate = [self.supportedOrientations count] > 0; // autorotate if only more than 1 orientation supported
	if (autoRotate)
	{
		if ([self.supportedOrientations containsObject:
			 [NSNumber numberWithInt:interfaceOrientation]]) {
			return YES;
		}
    }
	
	// default return value is NO! -jm
	
	return NO;
}


/**
 Called by UIKit when the device starts to rotate to a new orientation.  This fires the \c setOrientation
 method on the Orientation object in JavaScript.  Look at the JavaScript documentation for more information.
 */
- (void)didRotateFromInterfaceOrientation: (UIInterfaceOrientation)fromInterfaceOrientation
{
	int i = 0;
	
	switch (self.interfaceOrientation){
		case UIInterfaceOrientationPortrait:
			i = 0;
			break;
		case UIInterfaceOrientationPortraitUpsideDown:
			i = 180;
			break;
		case UIInterfaceOrientationLandscapeLeft:
			i = -90;
			break;
		case UIInterfaceOrientationLandscapeRight:
			i = 90;
			break;
	}
	
	NSString* jsCallback = [NSString stringWithFormat:@"window.__defineGetter__('orientation',function(){ return %d; }); Cordova.fireEvent('orientationchange', window);",i];
	[self.webView stringByEvaluatingJavaScriptFromString:jsCallback];    
}

- (void) createGapView
{
    CGRect webViewBounds = self.view.bounds;
    webViewBounds.origin = self.view.bounds.origin;
	
    if (!self.webView) 
	{
        self.webView = [[ [ CDVCordovaView alloc ] initWithFrame:webViewBounds] autorelease];
		self.webView.autoresizingMask = (UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight);
		
		[self.view addSubview:self.webView];
		[self.view sendSubviewToBack:self.webView];
		
		self.webView.delegate = self;
    }
}

- (void) didReceiveMemoryWarning {
	// Releases the view if it doesn't have a superview.
    [super didReceiveMemoryWarning];
	
	// Release any cached data, images, etc. that aren't in use.
}


- (void) viewDidUnload {
	// Release any retained subviews of the main view.
	// e.g. self.myOutlet = nil;
}


#pragma mark UIWebViewDelegate

/**
 When web application loads Add stuff to the DOM, mainly the user-defined settings from the Settings.plist file, and
 the device's data such as device ID, platform version, etc.
 */
- (void) webViewDidStartLoad:(UIWebView*)theWebView 
{
    
}

/**
 Called when the webview finishes loading.  This stops the activity view and closes the imageview
 */
- (void) webViewDidFinishLoad:(UIWebView*)theWebView 
{
    // Share session key with the WebView by setting Cordova.sessionKey
    NSString *sessionKeyScript = [NSString stringWithFormat:@"Cordova.sessionKey = \"%@\";", self.sessionKey];
    [theWebView stringByEvaluatingJavaScriptFromString:sessionKeyScript];
	
    
    NSDictionary *deviceProperties = [ self deviceProperties];
    NSMutableString *result = [[NSMutableString alloc] initWithFormat:@"DeviceInfo = %@;", [deviceProperties JSONString]];
    
    /* Settings.plist
     * Read the optional Settings.plist file and push these user-defined settings down into the web application.
     * This can be useful for supplying build-time configuration variables down to the app to change its behaviour,
     * such as specifying Full / Lite version, or localization (English vs German, for instance).
     */
    
    NSDictionary *temp = [[self class] getBundlePlist:@"Settings"];
    if ([temp respondsToSelector:@selector(JSONString)]) {
        [result appendFormat:@"\nwindow.Settings = %@;", [temp JSONString]];
    }
    
    NSLog(@"Device initialization: %@", result);
    [theWebView stringByEvaluatingJavaScriptFromString:result];
    [result release];
    
    /*
     * Hide the Top Activity THROBBER in the Battery Bar
     */
    [[UIApplication sharedApplication] setNetworkActivityIndicatorVisible:NO];
	
    id autoHideSplashScreenValue = [self.settings objectForKey:@"AutoHideSplashScreen"];
    // if value is missing, default to yes
    if (autoHideSplashScreenValue == nil || [autoHideSplashScreenValue boolValue]) {
        self.imageView.hidden = YES;
        self.activityView.hidden = YES;    
        [self.view.superview bringSubviewToFront:self.webView];
    }
    
    [self didRotateFromInterfaceOrientation:(UIInterfaceOrientation)[[UIDevice currentDevice] orientation]];
}

- (void) webView:(UIWebView*)webView didFailLoadWithError:(NSError*)error 
{
    NSLog(@"Failed to load webpage with error: %@", [error localizedDescription]);
    /*
	 if ([error code] != NSURLErrorCancelled)
	 alert([error localizedDescription]);
     */
}

- (BOOL) webView:(UIWebView*)theWebView shouldStartLoadWithRequest:(NSURLRequest*)request navigationType:(UIWebViewNavigationType)navigationType
{
	NSURL* url = [request URL];
    
    /*
     * Execute any commands queued with Cordova.exec() on the JS side.
     * The part of the URL after gap:// is irrelevant.
     */
	if ([[url scheme] isEqualToString:@"gap"]) {
        [self flushCommandQueue];
        return NO;
	}
    /*
     * If a URL is being loaded that's a file/http/https URL, just load it internally
     */
    else if ([url isFileURL])
    {
        return YES;
    }
    else if ([self.whitelist schemeIsAllowed:[url scheme]])
    {            
        if ([self.whitelist URLIsAllowed:url] == YES)
        {
            NSNumber *openAllInWhitelistSetting = [self.settings objectForKey:@"OpenAllWhitelistURLsInWebView"];
            if ((nil != openAllInWhitelistSetting) && [openAllInWhitelistSetting boolValue]) {
                NSLog(@"OpenAllWhitelistURLsInWebView set: opening in webview");
                return YES;
            }
			
            // mainDocument will be nil for an iFrame
            NSString* mainDocument = [theWebView.request.mainDocumentURL absoluteString];
			
            // anchor target="_blank" - load in Mobile Safari
            if (navigationType == UIWebViewNavigationTypeOther && mainDocument != nil)
            {
                [[UIApplication sharedApplication] openURL:url];
                return NO;
            }
            // other anchor target - load in Cordova webView
            else
            {
                return YES;
            }
        }
        
        return NO;
    }
    /*
     *    If we loaded the HTML from a string, we let the app handle it
     */
    else if (self.loadFromString == YES)
    {
        self.loadFromString = NO;
        return YES;
    }
    /*
     * all tel: scheme urls we let the UIWebview handle it using the default behaviour
     */
    else if ([[url scheme] isEqualToString:@"tel"])
    {
        return YES;
    }
    /*
     * all about: scheme urls are not handled
     */
    else if ([[url scheme] isEqualToString:@"about"])
    {
        return NO;
    }
    /*
     * We don't have a Cordova or web/local request, load it in the main Safari browser.
     * pass this to the application to handle.  Could be a mailto:dude@duderanch.com or a tel:55555555 or sms:55555555 facetime:55555555
     */
    else
    {
        NSLog(@"PGAppDelegate::shouldStartLoadWithRequest: Received Unhandled URL %@", url);
		
        if ([[UIApplication sharedApplication] canOpenURL:url]) {
            [[UIApplication sharedApplication] openURL:url];
        } else { // handle any custom schemes to plugins
            [[NSNotificationCenter defaultCenter] postNotification:[NSNotification notificationWithName:CDVPluginHandleOpenURLNotification object:url]];
        }
		
        return NO;
    }
    
    return YES;
}

#pragma mark GapHelpers

- (void) javascriptAlert:(NSString*)text
{
    NSString* jsString = [NSString stringWithFormat:@"alert('%@');", text];
    [webView stringByEvaluatingJavaScriptFromString:jsString];
}

+ (BOOL) isIPad 
{
#ifdef UI_USER_INTERFACE_IDIOM
    return (UI_USER_INTERFACE_IDIOM() == UIUserInterfaceIdiomPad);
#else
    return NO;
#endif
}

+ (NSString*) resolveImageResource:(NSString*)resource
{
    NSString* systemVersion = [[UIDevice currentDevice] systemVersion];
    BOOL isLessThaniOS4 = ([systemVersion compare:@"4.0" options:NSNumericSearch] == NSOrderedAscending);
    
    // the iPad image (nor retina) differentiation code was not in 3.x, and we have to explicitly set the path
    if (isLessThaniOS4)
    {
        if ([[self class] isIPad]) {
            return [NSString stringWithFormat:@"%@~ipad.png", resource];
        } else {
            return [NSString stringWithFormat:@"%@.png", resource];
        }
    }
    
    return resource;
}

- (NSString*) pathForResource:(NSString*)resourcepath
{
    NSBundle * mainBundle = [NSBundle mainBundle];
    NSMutableArray *directoryParts = [NSMutableArray arrayWithArray:[resourcepath componentsSeparatedByString:@"/"]];
    NSString       *filename       = [directoryParts lastObject];
    [directoryParts removeLastObject];
    
    NSString* directoryPartsJoined =[directoryParts componentsJoinedByString:@"/"];
    NSString* directoryStr = self.wwwFolderName;
    
    if ([directoryPartsJoined length] > 0) {
        directoryStr = [NSString stringWithFormat:@"%@/%@", self.wwwFolderName, [directoryParts componentsJoinedByString:@"/"]];
    }
    
    return [mainBundle pathForResource:filename ofType:@"" inDirectory:directoryStr];
}

+ (NSString*) applicationDocumentsDirectory 
{
    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    NSString *basePath = ([paths count] > 0) ? [paths objectAtIndex:0] : nil;
    return basePath;
}

- (void) showSplashScreen
{
    NSString* launchImageFile = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"UILaunchImageFile"];
    if (launchImageFile == nil) { // fallback if no launch image was specified
        launchImageFile = @"Default"; 
    }
    
    NSString* orientedLaunchImageFile = nil;    
    CGAffineTransform startupImageTransform = CGAffineTransformIdentity;
    UIDeviceOrientation deviceOrientation = [UIDevice currentDevice].orientation;
    CGRect screenBounds = [[UIScreen mainScreen] bounds];
    UIInterfaceOrientation statusBarOrientation = [UIApplication sharedApplication].statusBarOrientation;
    BOOL isIPad = [[self class] isIPad];
    UIImage* launchImage = nil;
    
    if (isIPad)
    {
        if (!UIDeviceOrientationIsValidInterfaceOrientation(deviceOrientation)) {
            deviceOrientation = (UIDeviceOrientation)statusBarOrientation;
        }
        
        switch (deviceOrientation) 
        {
            case UIDeviceOrientationLandscapeLeft: // this is where the home button is on the right (yeah, I know, confusing)
            {
                orientedLaunchImageFile = [NSString stringWithFormat:@"%@-Landscape", launchImageFile];
                startupImageTransform = CGAffineTransformMakeRotation(degreesToRadian(90));
            }
                break;
            case UIDeviceOrientationLandscapeRight: // this is where the home button is on the left (yeah, I know, confusing)
            {
                orientedLaunchImageFile = [NSString stringWithFormat:@"%@-Landscape", launchImageFile];
                startupImageTransform = CGAffineTransformMakeRotation(degreesToRadian(-90));
            } 
                break;
            case UIDeviceOrientationPortraitUpsideDown:
            {
                orientedLaunchImageFile = [NSString stringWithFormat:@"%@-Portrait", launchImageFile];
                startupImageTransform = CGAffineTransformMakeRotation(degreesToRadian(180));
            } 
                break;
            case UIDeviceOrientationPortrait:
            default:
            {
                orientedLaunchImageFile = [NSString stringWithFormat:@"%@-Portrait", launchImageFile];
                startupImageTransform = CGAffineTransformIdentity;
            }
                break;
        }
        
        launchImage = [UIImage imageNamed:[[self class] resolveImageResource:orientedLaunchImageFile]];
    }
    else // not iPad
    {
        orientedLaunchImageFile = @"Default";
        launchImage = [UIImage imageNamed:[[self class] resolveImageResource:orientedLaunchImageFile]];
    }
    
    if (launchImage == nil) {
        NSLog(@"WARNING: Splash-screen image '%@' was not found. Orientation: %d, iPad: %d", orientedLaunchImageFile, deviceOrientation, isIPad);
    }
    
    self.imageView = [[[UIImageView alloc] initWithImage:launchImage] autorelease];    
    self.imageView.tag = 1;
    self.imageView.center = CGPointMake((screenBounds.size.width / 2), (screenBounds.size.height / 2));
    
    self.imageView.autoresizingMask = (UIViewAutoresizingFlexibleWidth & UIViewAutoresizingFlexibleHeight & UIViewAutoresizingFlexibleLeftMargin & UIViewAutoresizingFlexibleRightMargin);    
    [self.imageView setTransform:startupImageTransform];
    [self.view.superview addSubview:self.imageView];
    
    
    /*
     * The Activity View is the top spinning throbber in the status/battery bar. We init it with the default Grey Style.
     *
     *     whiteLarge = UIActivityIndicatorViewStyleWhiteLarge
     *     white      = UIActivityIndicatorViewStyleWhite
     *     gray       = UIActivityIndicatorViewStyleGray
     *
     */
    NSString* topActivityIndicator = [self.settings objectForKey:@"TopActivityIndicator"];
    UIActivityIndicatorViewStyle topActivityIndicatorStyle = UIActivityIndicatorViewStyleGray;
    
    if ([topActivityIndicator isEqualToString:@"whiteLarge"]) {
        topActivityIndicatorStyle = UIActivityIndicatorViewStyleWhiteLarge;
    } else if ([topActivityIndicator isEqualToString:@"white"]) {
        topActivityIndicatorStyle = UIActivityIndicatorViewStyleWhite;
    } else if ([topActivityIndicator isEqualToString:@"gray"]) {
        topActivityIndicatorStyle = UIActivityIndicatorViewStyleGray;
    }
    
    self.activityView = [[[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle:topActivityIndicatorStyle] autorelease];
    self.activityView.tag = 2;
    
    id showSplashScreenSpinnerValue = [self.settings objectForKey:@"ShowSplashScreenSpinner"];
    // backwards compatibility - if key is missing, default to true
    if (showSplashScreenSpinnerValue == nil || [showSplashScreenSpinnerValue boolValue]) {
        [self.view.superview addSubview:self.activityView];
    }
    
    self.activityView.center = self.view.center;
    [self.activityView startAnimating];
    
    [self.view.superview layoutSubviews];
}    

BOOL gSplashScreenShown = NO;
- (void) receivedOrientationChange
{
    if (self.imageView == nil) {
        gSplashScreenShown = YES;
        if (self.useSplashScreen) {
            [self showSplashScreen];
        }
    }
}

#pragma mark CordovaCommands

/**
 * Fetches the command queue and executes each command. It is possible that the
 * queue will not be empty after this function has completed since the executed
 * commands may have run callbacks which queued more commands.
 *
 * Returns the number of executed commands.
 */
- (int) executeQueuedCommands
{
    // Grab all the queued commands from the JS side.
    NSString* queuedCommandsJSON = [self.webView stringByEvaluatingJavaScriptFromString:
									@"Cordova.getAndClearQueuedCommands()"];
	
	
    // Parse the returned JSON array.
    //PG_SBJsonParser* jsonParser = [[[PG_SBJsonParser alloc] init] autorelease];
    NSArray* queuedCommands =
	[queuedCommandsJSON objectFromJSONString];
	
    // Iterate over and execute all of the commands.
    for (NSString* commandJson in queuedCommands) {
		
        if(![self.commandDelegate execute:
		 [CDVInvokedUrlCommand commandFromObject:
		  [commandJson mutableObjectFromJSONString]]])
		{
			NSLog(@"FAILED pluginJSON = %@",commandJson);
		}
    }
	
    return [queuedCommands count];
}

/**
 * Repeatedly fetches and executes the command queue until it is empty.
 */
- (void) flushCommandQueue
{
    [self.webView stringByEvaluatingJavaScriptFromString:
	 @"Cordova.commandQueueFlushing = true"];
	
    // Keep executing the command queue until no commands get executed.
    // This ensures that commands that are queued while executing other
    // commands are executed as well.
    int numExecutedCommands = 0;
    do {
        numExecutedCommands = [self executeQueuedCommands];
    } while (numExecutedCommands != 0);
	
    [self.webView stringByEvaluatingJavaScriptFromString:
	 @"Cordova.commandQueueFlushing = false"];
}

- (BOOL) execute:(CDVInvokedUrlCommand*)command
{
    if (command.className == nil || command.methodName == nil) {
        return NO;
    }
    
    // Fetch an instance of this class
    CDVPlugin* obj = [self.commandDelegate getCommandInstance:command.className];
    
    if (!([obj isKindOfClass:[CDVPlugin class]])) { // still allow deprecated class, until 1.0 release
        NSLog(@"ERROR: Plugin '%@' not found, or is not a CDVPlugin. Check your plugin mapping in Cordova.plist.", command.className);
        return NO;
    }
    BOOL retVal = YES;
    
    // construct the fill method name to ammend the second argument.
    NSString* fullMethodName = [[NSString alloc] initWithFormat:@"%@:withDict:", command.methodName];
    if ([obj respondsToSelector:NSSelectorFromString(fullMethodName)]) {
        [obj performSelector:NSSelectorFromString(fullMethodName) withObject:command.arguments withObject:command.options];
    } else {
        // There's no method to call, so throw an error.
        NSLog(@"ERROR: Method '%@' not defined in Plugin '%@'", fullMethodName, command.className);
        retVal = NO;
    }
    [fullMethodName release];
    
    return retVal;
}

/**
 Returns an instance of a CordovaCommand object, based on its name.  If one exists already, it is returned.
 */
- (id) getCommandInstance:(NSString*)pluginName
{
    // first, we try to find the pluginName in the pluginsMap 
    // (acts as a whitelist as well) if it does not exist, we return nil
    // NOTE: plugin names are matched as lowercase to avoid problems - however, a 
    // possible issue is there can be duplicates possible if you had:
    // "org.apache.cordova.Foo" and "org.apache.cordova.foo" - only the lower-cased entry will match
    NSString* className = [self.pluginsMap objectForKey:[pluginName lowercaseString]];
    if (className == nil) {
        return nil;
    }
    
    id obj = [self.pluginObjects objectForKey:className];
    if (!obj) 
    {
        // attempt to load the settings for this command class
        NSDictionary* classSettings = [self.settings objectForKey:className];
		
        if (classSettings) {
            obj = [[NSClassFromString(className) alloc] initWithWebView:webView settings:classSettings];
        } else {
            obj = [[NSClassFromString(className) alloc] initWithWebView:webView];
        }
        
        if ([obj isKindOfClass:[CDVPlugin class]] && [obj respondsToSelector:@selector(setViewController:)]) { 
            [obj setViewController:self];
        }
        
        if ([obj isKindOfClass:[CDVPlugin class]] && [obj respondsToSelector:@selector(setCommandDelegate:)]) { 
            [obj setCommandDelegate:self.commandDelegate];
        }

        if (obj != nil) {
            [self.pluginObjects setObject:obj forKey:className];
            [obj release];
        } else {
            NSLog(@"CDVPlugin class %@ (pluginName: %@) does not exist.", className, pluginName);
        }
    }
    return obj;
}


#pragma mark -

- (NSDictionary*) deviceProperties
{
    UIDevice *device = [UIDevice currentDevice];
    NSMutableDictionary *devProps = [NSMutableDictionary dictionaryWithCapacity:4];
    [devProps setObject:[device model] forKey:@"platform"];
    [devProps setObject:[device systemVersion] forKey:@"version"];
    [devProps setObject:[device uniqueIdentifier] forKey:@"uuid"];
    [devProps setObject:[device name] forKey:@"name"];
    [devProps setObject:[[self class] cordovaVersion ] forKey:@"gap"];
    
    id cmd = [self.commandDelegate getCommandInstance:@"org.apache.cordova.connection"];
    if (cmd && [cmd isKindOfClass:[CDVConnection class]]) 
    {
        NSMutableDictionary *connProps = [NSMutableDictionary dictionaryWithCapacity:3];
        if ([cmd respondsToSelector:@selector(connectionType)]) {
            [connProps setObject:[cmd connectionType] forKey:@"type"];
        }
        [devProps setObject:connProps forKey:@"connection"];
    }
    
    NSDictionary *devReturn = [NSDictionary dictionaryWithDictionary:devProps];
    return devReturn;
}

- (NSString*) appURLScheme
{
    NSString* URLScheme = nil;
    
    NSArray *URLTypes = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleURLTypes"];
    if(URLTypes != nil ) {
        NSDictionary* dict = [URLTypes objectAtIndex:0];
        if(dict != nil ) {
            NSArray* URLSchemes = [dict objectForKey:@"CFBundleURLSchemes"];
            if( URLSchemes != nil ) {    
                URLScheme = [URLSchemes objectAtIndex:0];
            }
        }
    }
    
    return URLScheme;
}

/**
 Returns the contents of the named plist bundle, loaded as a dictionary object
 */
+ (NSDictionary*) getBundlePlist:(NSString*)plistName
{
    NSString *errorDesc = nil;
    NSPropertyListFormat format;
    NSString *plistPath = [[NSBundle mainBundle] pathForResource:plistName ofType:@"plist"];
    NSData *plistXML = [[NSFileManager defaultManager] contentsAtPath:plistPath];
    NSDictionary *temp = (NSDictionary *)[NSPropertyListSerialization
                                          propertyListFromData:plistXML
                                          mutabilityOption:NSPropertyListMutableContainersAndLeaves              
                                          format:&format errorDescription:&errorDesc];
    return temp;
}

/**
 Returns the current version of Cordova as read from the VERSION file
 This only touches the filesystem once and stores the result in the class variable gapVersion
 */
static NSString* cdvVersion;
+ (NSString*) cordovaVersion
{
#ifdef CDV_VERSION
    cdvVersion = SYMBOL_TO_NSSTRING(CDV_VERSION);
#else
	
    if (cdvVersion == nil) {
        NSBundle *mainBundle = [NSBundle mainBundle];
        NSString *filename = [mainBundle pathForResource:@"VERSION" ofType:nil];
        // read from the filesystem and save in the variable
        // first, separate by new line
        NSString* fileContents = [NSString stringWithContentsOfFile:filename encoding:NSUTF8StringEncoding error:NULL];
        NSArray* all_lines = [fileContents componentsSeparatedByCharactersInSet:[NSCharacterSet newlineCharacterSet]];
        NSString* first_line = [all_lines objectAtIndex:0];        
        
        cdvVersion = [first_line retain];
    }
#endif
    
    return cdvVersion;
}


#pragma mark -
#pragma mark UIApplicationDelegate impl

/*
 This method lets your application know that it is about to be terminated and purged from memory entirely
 */
- (void) onAppWillTerminate:(NSNotification*)notification
{
    NSLog(@"applicationWillTerminate");
    
    // empty the tmp directory
    NSFileManager* fileMgr = [[NSFileManager alloc] init];
    NSError* err = nil;    
    
    // clear contents of NSTemporaryDirectory 
    NSString* tempDirectoryPath = NSTemporaryDirectory();
    NSDirectoryEnumerator* directoryEnumerator = [fileMgr enumeratorAtPath:tempDirectoryPath];    
    NSString* fileName = nil;
    BOOL result;
    
    while ((fileName = [directoryEnumerator nextObject])) {
        NSString* filePath = [tempDirectoryPath stringByAppendingPathComponent:fileName];
        result = [fileMgr removeItemAtPath:filePath error:&err];
        if (!result && err) {
            NSLog(@"Failed to delete: %@ (error: %@)", filePath, err);
        }
    }    
    [fileMgr release];
}

/*
 This method is called to let your application know that it is about to move from the active to inactive state.
 You should use this method to pause ongoing tasks, disable timer, ...
 */
- (void) onAppWillResignActive:(NSNotification*)notification
{
    //NSLog(@"%@",@"applicationWillResignActive");
    [self.webView stringByEvaluatingJavaScriptFromString:@"Cordova.fireDocumentEvent('resign');"];
}

/*
 In iOS 4.0 and later, this method is called as part of the transition from the background to the inactive state. 
 You can use this method to undo many of the changes you made to your application upon entering the background.
 invariably followed by applicationDidBecomeActive
 */
- (void) onAppWillEnterForeground:(NSNotification*)notification
{
    //NSLog(@"%@",@"applicationWillEnterForeground");
    [self.webView stringByEvaluatingJavaScriptFromString:@"Cordova.fireDocumentEvent('resume');"];
}

// This method is called to let your application know that it moved from the inactive to active state. 
- (void) onAppDidBecomeActive:(NSNotification*)notification
{
    //NSLog(@"%@",@"applicationDidBecomeActive");
    [self.webView stringByEvaluatingJavaScriptFromString:@"Cordova.fireDocumentEvent('active');"];
}

/*
 In iOS 4.0 and later, this method is called instead of the applicationWillTerminate: method 
 when the user quits an application that supports background execution.
 */
- (void) onAppDidEnterBackground:(NSNotification*)notification
{
    //NSLog(@"%@",@"applicationDidEnterBackground");
    [self.webView stringByEvaluatingJavaScriptFromString:@"Cordova.fireDocumentEvent('pause');"];
}

// ///////////////////////


- (void)dealloc 
{
    [[NSNotificationCenter defaultCenter] removeObserver:self name:UIApplicationWillTerminateNotification object:nil];
    [[NSNotificationCenter defaultCenter] removeObserver:self name:UIApplicationWillResignActiveNotification object:nil];
    [[NSNotificationCenter defaultCenter] removeObserver:self name:UIApplicationWillEnterForegroundNotification object:nil];
    [[NSNotificationCenter defaultCenter] removeObserver:self name:UIApplicationDidBecomeActiveNotification object:nil];
    [[NSNotificationCenter defaultCenter] removeObserver:self name:UIApplicationDidEnterBackgroundNotification object:nil];
    
    [super dealloc];
}

@end
