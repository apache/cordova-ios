#import "PhoneGapDelegate.h"
#import "PhoneGapViewController.h"
#import <UIKit/UIKit.h>
#import "Movie.h"
#import "InvokedUrlCommand.h"

@implementation PhoneGapDelegate

@synthesize window;
@synthesize viewController;
@synthesize activityView;
@synthesize commandObjects;
@synthesize settings;
@synthesize invokedURL;

- (id) init
{
    self = [super init];
    if (self != nil) {
        commandObjects = [[NSMutableDictionary alloc] initWithCapacity:4];
    }
    return self; 
}

+ (NSString*) applicationDocumentsDirectory {
	
    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    NSString *basePath = ([paths count] > 0) ? [paths objectAtIndex:0] : nil;
    return basePath;
}


+ (NSString*) wwwFolderName
{
	return @"www";
}

+ (NSString*) startPage
{
	return @"index.html";
}

+ (NSString*) pathForResource:(NSString*)resourcepath
{
    NSBundle * mainBundle = [NSBundle mainBundle];
    NSMutableArray *directoryParts = [NSMutableArray arrayWithArray:[resourcepath componentsSeparatedByString:@"/"]];
    NSString       *filename       = [directoryParts lastObject];
    [directoryParts removeLastObject];
	
    NSString *directoryStr = [NSString stringWithFormat:@"%@/%@", [self wwwFolderName], [directoryParts componentsJoinedByString:@"/"]];
    return [mainBundle pathForResource:filename
					   ofType:@""
                       inDirectory:directoryStr];
}

/**
Returns the current version of phoneGap as read from the VERSION file
This only touches the filesystem once and stores the result in the class variable gapVersion
*/
static NSString *gapVersion;
+ (NSString*) phoneGapVersion
{
	if (gapVersion == nil) {
		NSBundle *mainBundle = [NSBundle mainBundle];
		NSString *filename = [mainBundle pathForResource:@"VERSION" ofType:nil];
		// read from the filesystem and save in the variable
		gapVersion = [ [ NSString stringWithContentsOfFile:filename encoding:NSUTF8StringEncoding error:NULL ] retain ];
	}
	return gapVersion;
}


/**
 Returns an instance of a PhoneGapCommand object, based on its name.  If one exists already, it is returned.
 */
-(id) getCommandInstance:(NSString*)className
{
    id obj = [commandObjects objectForKey:className];
    if (!obj) {
        // attempt to load the settings for this command class
        NSDictionary* classSettings;
        classSettings = [settings objectForKey:className];

        if (classSettings)
            obj = [[NSClassFromString(className) alloc] initWithWebView:webView settings:classSettings];
        else
            obj = [[NSClassFromString(className) alloc] initWithWebView:webView];
        
        [commandObjects setObject:obj forKey:className];
		[obj release];
    }
    return obj;
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

/**
 * This is main kick off after the app inits, the views and Settings are setup here.
 */
// - (void)applicationDidFinishLaunching:(UIApplication *)application
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{	
	// read from UISupportedInterfaceOrientations (or UISupportedInterfaceOrientations~iPad, if its iPad) from -Info.plist
	NSArray* supportedOrientations = [self parseInterfaceOrientations:
											   [[[NSBundle mainBundle] infoDictionary] objectForKey:@"UISupportedInterfaceOrientations"]];
    // read from PhoneGap.plist in the app bundle
	NSDictionary *temp = [[self class] getBundlePlist:@"PhoneGap"];
    settings = [[NSDictionary alloc] initWithDictionary:temp];
	
	viewController = [ [ PhoneGapViewController alloc ] init ];
	
#if __IPHONE_OS_VERSION_MIN_REQUIRED < 30000
    NSNumber *detectNumber         = [settings objectForKey:@"DetectPhoneNumber"];
#endif
    NSNumber *useLocation          = [settings objectForKey:@"UseLocation"];
    NSString *topActivityIndicator = [settings objectForKey:@"TopActivityIndicator"];
	
	
	// The first item in the supportedOrientations array is the start orientation (guaranteed to be at least Portrait)
	[[UIApplication sharedApplication] setStatusBarOrientation:[[supportedOrientations objectAtIndex:0] intValue]];
	
	// Set the supported orientations for rotation. If number of items in the array is > 1, autorotate is supported
    viewController.supportedOrientations = supportedOrientations;
	
	CGRect screenBounds = [ [ UIScreen mainScreen ] bounds ];
	self.window = [ [ [ UIWindow alloc ] initWithFrame:screenBounds ] autorelease ];
	
	webView = [ [ UIWebView alloc ] initWithFrame:screenBounds ];
    [webView setAutoresizingMask: (UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight) ];
	
	viewController.webView = webView;
	[viewController.view addSubview:webView];
	
	// This has been moved from the webViewDidStartLoad because invokedURL never had been set
	// from handleOpenURL - so I've changed this method from using didFinishLaunching to
	// didFinishLaunchingWithOptions to capture the original url that launched the app
	NSArray *keyArray = [launchOptions allKeys];
	if ([launchOptions objectForKey:[keyArray objectAtIndex:0]]!=nil) {
		NSURL *url = [launchOptions objectForKey:[keyArray objectAtIndex:0]];
		invokedURL = url;
		NSLog(@"URL = %@", [invokedURL absoluteURL]);
		// Determine the URL used to invoke this application.
		// Described in http://iphonedevelopertips.com/cocoa/launching-your-own-application-via-a-custom-url-scheme.html
		if ([[invokedURL scheme] isEqualToString:[self appURLScheme]]) {
			InvokedUrlCommand* iuc = [[InvokedUrlCommand newFromUrl:invokedURL] autorelease];

			NSLog(@"Arguments: %@", iuc.arguments);

			NSString *optionsString = [[NSString alloc] initWithFormat:@"var Invoke_params=%@;", [iuc.options JSONFragment]];

			[webView stringByEvaluatingJavaScriptFromString:optionsString];

			[optionsString release];
		}
	}
	
		
	/*
	 * Fire up the GPS Service right away as it takes a moment for data to come back.
	 */
    if ([useLocation boolValue]) {
        [[self getCommandInstance:@"Location"] startLocation:nil withDict:nil];
    }

	webView.delegate = self;

	[window addSubview:viewController.view];

	/*
	 * webView
	 * This is where we define the inital instance of the browser (WebKit) and give it a starting url/file.
	 */
    NSURL *appURL        = [NSURL fileURLWithPath:[[self class] pathForResource:[[self class] startPage]]];
    NSURLRequest *appReq = [NSURLRequest requestWithURL:appURL cachePolicy:NSURLRequestUseProtocolCachePolicy timeoutInterval:20.0];
	[webView loadRequest:appReq];

#if __IPHONE_OS_VERSION_MIN_REQUIRED < 30000
	webView.detectsPhoneNumbers = [detectNumber boolValue];
#endif

	/*
	 * imageView - is the Default loading screen, it stay up until the app and UIWebView (WebKit) has completly loaded.
	 * You can change this image by swapping out the Default.png file within the resource folder.
	 */
	UIImage* image = [[UIImage alloc] initWithContentsOfFile:[[NSBundle mainBundle] pathForResource:@"Default" ofType:@"png"]];
	imageView = [[UIImageView alloc] initWithImage:image];
	[image release];
	
    imageView.tag = 1;
	[window addSubview:imageView];
	[imageView release];

	/*
	 * The Activity View is the top spinning throbber in the status/battery bar. We init it with the default Grey Style.
	 *
	 *	 whiteLarge = UIActivityIndicatorViewStyleWhiteLarge
	 *	 white      = UIActivityIndicatorViewStyleWhite
	 *	 gray       = UIActivityIndicatorViewStyleGray
	 *
	 */
    UIActivityIndicatorViewStyle topActivityIndicatorStyle = UIActivityIndicatorViewStyleGray;
    if ([topActivityIndicator isEqualToString:@"whiteLarge"]) {
        topActivityIndicatorStyle = UIActivityIndicatorViewStyleWhiteLarge;
    } else if ([topActivityIndicator isEqualToString:@"white"]) {
        topActivityIndicatorStyle = UIActivityIndicatorViewStyleWhite;
    } else if ([topActivityIndicator isEqualToString:@"gray"]) {
        topActivityIndicatorStyle = UIActivityIndicatorViewStyleGray;
    }
    activityView = [[[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle:topActivityIndicatorStyle] retain];
    activityView.tag = 2;
    [window addSubview:activityView];
    [activityView startAnimating];

	[window makeKeyAndVisible];
	
	return YES;
}

/**
 When web application loads Add stuff to the DOM, mainly the user-defined settings from the Settings.plist file, and
 the device's data such as device ID, platform version, etc.
 */
- (void)webViewDidStartLoad:(UIWebView *)theWebView 
{
	// Play any default movie
	NSLog(@"Going to play default movie");
	Movie* mov = (Movie*)[self getCommandInstance:@"Movie"];
	NSMutableArray *args = [[[NSMutableArray alloc] init] autorelease];
	[args addObject:@"default.mov"];
	NSMutableDictionary* opts = [[[NSMutableDictionary alloc] init] autorelease];
	[opts setObject:@"1" forKey:@"repeat"];
	[mov play:args withDict:opts];

    // Determine the URL used to invoke this application.
    // Described in http://iphonedevelopertips.com/cocoa/launching-your-own-application-via-a-custom-url-scheme.html

	// This fires before the handleOpenURL fires, so the invokedURL is empty
  // if ([[invokedURL scheme] isEqualToString:[self appURLScheme]]) {
  //    InvokedUrlCommand* iuc = [[InvokedUrlCommand newFromUrl:invokedURL] autorelease];
  //     
  //    NSLog(@"Arguments: %@", iuc.arguments);
  //    NSString *optionsString = [[NSString alloc] initWithFormat:@"var Invoke_params=%@;", [iuc.options JSONFragment]];
  //   
  //    [webView stringByEvaluatingJavaScriptFromString:optionsString];
  //    
  //    [optionsString release];
  //     }
}

- (NSDictionary*) deviceProperties
{
	UIDevice *device = [UIDevice currentDevice];
    NSMutableDictionary *devProps = [NSMutableDictionary dictionaryWithCapacity:4];
    [devProps setObject:[device model] forKey:@"platform"];
    [devProps setObject:[device systemVersion] forKey:@"version"];
    [devProps setObject:[device uniqueIdentifier] forKey:@"uuid"];
    [devProps setObject:[device name] forKey:@"name"];
    [devProps setObject:[[self class] phoneGapVersion ] forKey:@"gap"];
	
    NSDictionary *devReturn = [NSDictionary dictionaryWithDictionary:devProps];
    return devReturn;
}

- (NSString*) appURLScheme
{
	// The info.plist contains this structure:
	//<key>CFBundleURLTypes</key>
	// <array>
	//		<dict>
	//			<key>CFBundleURLSchemes</key>
	//			<array>
	//				<string>yourscheme</string>
	//			</array>
	//			<key>CFBundleURLName</key>
	//			<string>YourbundleURLName</string>
	//		</dict>
	// </array>

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

- (void) javascriptAlert:(NSString*)text
{
	NSString* jsString = nil;
	jsString = [[NSString alloc] initWithFormat:@"alert('%@');", text];
	[webView stringByEvaluatingJavaScriptFromString:jsString];

	NSLog(@"%@", jsString);
	[jsString release];
}

/**
 Returns the contents of the named plist bundle, loaded as a dictionary object
 */
+ (NSDictionary*)getBundlePlist:(NSString *)plistName
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
 Called when the webview finishes loading.  This stops the activity view and closes the imageview
 */
- (void)webViewDidFinishLoad:(UIWebView *)theWebView {
	/*
	 * Hide the Top Activity THROBER in the Battery Bar
	 */
	
    NSDictionary *deviceProperties = [ self deviceProperties];
    NSMutableString *result = [[NSMutableString alloc] initWithFormat:@"DeviceInfo = %@;", [deviceProperties JSONFragment]];
    
    /* Settings.plist
	 * Read the optional Settings.plist file and push these user-defined settings down into the web application.
	 * This can be useful for supplying build-time configuration variables down to the app to change its behaviour,
     * such as specifying Full / Lite version, or localization (English vs German, for instance).
	 */
	
    NSDictionary *temp = [[self class] getBundlePlist:@"Settings"];
    if ([temp respondsToSelector:@selector(JSONFragment)]) {
        [result appendFormat:@"\nwindow.Settings = %@;", [temp JSONFragment]];
    }
	
    NSLog(@"Device initialization: %@", result);
    [theWebView stringByEvaluatingJavaScriptFromString:result];
	[result release];
	
	[[UIApplication sharedApplication] setNetworkActivityIndicatorVisible:NO];
	activityView.hidden = YES;	

	imageView.hidden = YES;
	
	[window bringSubviewToFront:viewController.view];
	webView = theWebView; 	
}


/**
 * Fail Loading With Error
 * Error - If the webpage failed to load display an error with the reson.
 *
 */
- (void)webView:(UIWebView *)webView didFailLoadWithError:(NSError *)error {
    NSLog(@"Failed to load webpage with error: %@", [error localizedDescription]);
	/*
    if ([error code] != NSURLErrorCancelled)
		alert([error localizedDescription]);
     */
}


/**
 * Start Loading Request
 * This is where most of the magic happens... We take the request(s) and process the response.
 * From here we can re direct links and other protocalls to different internal methods.
 *
 */
- (BOOL)webView:(UIWebView *)theWebView shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType
{
	NSURL *url = [request URL];

    /*
     * Get Command and Options From URL
     * We are looking for URLS that match gap://<Class>.<command>/[<arguments>][?<dictionary>]
     * We have to strip off the leading slash for the options.
     */
     if ([[url scheme] isEqualToString:@"gap"]) {
		 
		InvokedUrlCommand* iuc = [[InvokedUrlCommand newFromUrl:url] autorelease];
        
		// Tell the JS code that we've gotten this command, and we're ready for another
        [theWebView stringByEvaluatingJavaScriptFromString:@"PhoneGap.queue.ready = true;"];
		
		// Check to see if we are provided a class:method style command.
		[self execute:iuc];

		 return NO;
	}
    
    /*
     * If a URL is being loaded that's a local file URL, just load it internally
     */
    else if ([url isFileURL])
    {
        //NSLog(@"File URL %@", [url description]);
        return YES;
    }
    
    /*
     * We don't have a PhoneGap or local file request, load it in the main Safari browser.
     */
    else
    {
        //NSLog(@"Unknown URL %@", [url description]);
        [[UIApplication sharedApplication] openURL:url];
        return NO;
	}
	
	return YES;
}

- (BOOL) execute:(InvokedUrlCommand*)command
{
	if (command.className == nil || command.methodName == nil) {
		return NO;
	}
	
	// Fetch an instance of this class
	PhoneGapCommand* obj = [self getCommandInstance:command.className];
	
	// construct the fill method name to ammend the second argument.
	NSString* fullMethodName = [[NSString alloc] initWithFormat:@"%@:withDict:", command.methodName];
	if ([obj respondsToSelector:NSSelectorFromString(fullMethodName)]) {
		[obj performSelector:NSSelectorFromString(fullMethodName) withObject:command.arguments withObject:command.options];
	}
	else {
		// There's no method to call, so throw an error.
		NSLog(@"Class method '%@' not defined in class '%@'", fullMethodName, command.className);
		[NSException raise:NSInternalInconsistencyException format:@"Class method '%@' not defined against class '%@'.", fullMethodName, command.className];
	}
	[fullMethodName release];
	
	return YES;
}


- (BOOL)application:(UIApplication *)application handleOpenURL:(NSURL *)url
{
	NSLog(@"In handleOpenURL");
	if (!url) { return NO; }
	
	NSLog(@"URL = %@", [url absoluteURL]);
	invokedURL = url;
	
	return YES;
}

- (void)dealloc
{
    [commandObjects release];
	[imageView release];
	[viewController release];
    [activityView release];
	[window release];
	[invokedURL release];
	
	[super dealloc];
}


@end
