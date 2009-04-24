#import "PhoneGapDelegate.h"
#import "PhoneGapViewController.h"
#import <UIKit/UIKit.h>

@implementation PhoneGapDelegate

@synthesize window;
@synthesize viewController;
@synthesize activityView;
@synthesize commandObjects;
@synthesize settings;

//@synthesize imagePickerController;

- (id) init
{
    self = [super init];
    if (self != nil) {
        commandObjects = [[NSMutableDictionary alloc] initWithCapacity:4];
    }
    return self;
}

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
    }
    return obj;
}

/*
 * applicationDidFinishLaunching 
 * This is main kick off after the app inits, the views and Settings are setup here.
 */
- (void)applicationDidFinishLaunching:(UIApplication *)application
{	
	/*
	 * PhoneGap.plist
	 *
	 * This block of code navigates to the PhoneGap.plist in the Config Group and reads the XML into an Hash (Dictionary)
	 *
	 */
	NSString *errorDesc = nil;
    NSPropertyListFormat format;
	NSString *plistPath = [[NSBundle mainBundle] pathForResource:@"PhoneGap" ofType:@"plist"];
	NSData *plistXML = [[NSFileManager defaultManager] contentsAtPath:plistPath];
	NSDictionary *temp = (NSDictionary *)[NSPropertyListSerialization
                                  propertyListFromData:plistXML
                                  mutabilityOption:NSPropertyListMutableContainersAndLeaves			  
                                  format:&format errorDescription:&errorDesc];
    settings = [[NSDictionary alloc] initWithDictionary:temp];
    
    NSNumber *offline              = [settings objectForKey:@"Offline"];
    NSString *url                  = [settings objectForKey:@"Callback"];
    NSNumber *detectNumber         = [settings objectForKey:@"DetectPhoneNumber"];
    NSNumber *useLocation          = [settings objectForKey:@"UseLocation"];
    NSNumber *useAccelerometer     = [settings objectForKey:@"UseAccelerometer"];
    NSNumber *autoRotate           = [settings objectForKey:@"AutoRotate"];
    NSString *startOrientation     = [settings objectForKey:@"StartOrientation"];
    NSString *rotateOrientation    = [settings objectForKey:@"RotateOrientation"];
    NSString *topStatusBar         = [settings objectForKey:@"TopStatusBar"];
    NSString *topActivityIndicator = [settings objectForKey:@"TopActivityIndicator"];
    
	/*
	 * Fire up the GPS Service right away as it takes a moment for data to come back.
	 */
    if ([useLocation boolValue]) {
        [[self getCommandInstance:@"Location"] start:nil withDict:nil];
    }

	webView.delegate = self;

    /*
	// Set up the image picker controller and add it to the view
	imagePickerController = [[UIImagePickerController alloc] init];
	imagePickerController.delegate = self;
	imagePickerController.sourceType = UIImagePickerControllerSourceTypePhotoLibrary;
	imagePickerController.view.hidden = YES;
     */

	if ([useAccelerometer boolValue]) {
        [[UIAccelerometer sharedAccelerometer] setUpdateInterval:1.0/40.0];
        [[UIAccelerometer sharedAccelerometer] setDelegate:self];
    }

	[window addSubview:viewController.view];

	/*
	 * We want to test the offline to see if this app should start in offline mode or online mode.
	 *
	 *   YES - Offline
	 *   NO  - Online
	 *
	 *		In Offline mode the index.html file is loaded from the www directly and serves as the entry point into the application
	 *		In Online mode the starting point is a external FQDN, usually your server.
	 */
	if ([offline boolValue]) {
		NSBundle * thisBundle = [NSBundle bundleForClass:[self class]];
		appURL = [[NSURL fileURLWithPath:[thisBundle pathForResource:@"index" ofType:@"html" inDirectory:@"www"]] retain];		
	} else {		
		appURL = [[NSURL URLWithString:url] retain];
	}

	/*
	 * webView
	 * This is where we define the inital instance of the browser (WebKit) and give it a starting url/file.
	 */
	[webView loadRequest:[NSURLRequest 
						  requestWithURL:appURL 
						  cachePolicy:NSURLRequestUseProtocolCachePolicy
						  timeoutInterval:20.0
						  ]];

	/*
	 * detectNumber - If we want to Automagically convery phone numbers to links - Set in PhoneGap.plist
	 * Value should be BOOL (YES|NO)
	 */
	webView.detectsPhoneNumbers = [detectNumber boolValue];

	/*
	 * imageView - is the Default loading screen, it stay up until the app and UIWebView (WebKit) has completly loaded.
	 * You can change this image by swapping out the Default.png file within the resource folder.
	 */
	imageView = [[UIImageView alloc] initWithImage:[[UIImage alloc] initWithContentsOfFile:[[NSBundle mainBundle] pathForResource:@"Default" ofType:@"png"]]];
    imageView.tag = 1;
	[window addSubview:imageView];
  
    /*
     * autoRotate - If you want your phone to automatically rotate its display when the phone is rotated
     * Value should be BOOL (YES|NO)
     */
    [viewController setAutoRotate:[autoRotate boolValue]];

    /*
     * startOrientation - This option dictates what the starting orientation will be of the application 
     * Value should be one of: portrait, portraitUpsideDown, landscapeLeft, landscapeRight
     */
    orientationType = UIInterfaceOrientationPortrait;
    if ([startOrientation isEqualToString:@"portrait"]) {
        orientationType = UIInterfaceOrientationPortrait;
    } else if ([startOrientation isEqualToString:@"portraitUpsideDown"]) {
        orientationType = UIInterfaceOrientationPortraitUpsideDown;
    } else if ([startOrientation isEqualToString:@"landscapeLeft"]) {
        orientationType = UIInterfaceOrientationLandscapeLeft;
    } else if ([startOrientation isEqualToString:@"landscapeRight"]) {
        orientationType = UIInterfaceOrientationLandscapeRight;
    }
    [[UIApplication sharedApplication] setStatusBarOrientation:orientationType animated:NO];

     /*
     * rotateOrientation - This option is only enabled when AutoRotate is enabled.  If the phone is still rotated
     * when AutoRotate is disabled, this will control what orientations will be rotated to.  If you wish your app to
     * only use landscape or portrait orientations, change the value in PhoneGap.plist to indicate that.
     * Value should be one of: any, portrait, landscape
     */
    [viewController setRotateOrientation:rotateOrientation];

     /*
	 * These are the setting for the top Status/Battery Bar.
	 *
	 *	 opaque      = UIStatusBarStyleBlackOpaque
	 *	 translucent = UIStatusBarStyleBlackTranslucent
	 *	 default     = UIStatusBarStyleDefault
	 *
	 */
    UIStatusBarStyle topStatusBarStyle = UIStatusBarStyleDefault;
    if ([topStatusBar isEqualToString:@"blackOpaque"]) {
        topStatusBarStyle = UIStatusBarStyleBlackOpaque;
    } else if ([topStatusBar isEqualToString:@"blackTranslucent"]) {
        topStatusBarStyle = UIStatusBarStyleBlackTranslucent;
    } else if ([topStatusBar isEqualToString:@"default"]) {
        topStatusBarStyle = UIStatusBarStyleDefault;
    }
    if ([topStatusBar isEqualToString:@"none"]) {
        int toolbarHeight = [[UIApplication sharedApplication] statusBarFrame].size.height;
        [[UIApplication sharedApplication] setStatusBarHidden:YES animated:NO];
        CGRect webViewBounds = webView.bounds;
        [webView setFrame:CGRectMake(webViewBounds.origin.x,
                                     webViewBounds.origin.y - toolbarHeight,
                                     webViewBounds.size.width,
                                     webViewBounds.size.height + toolbarHeight
                                     )];
    } else {
        [[UIApplication sharedApplication] setStatusBarStyle:topStatusBarStyle animated:NO];
    }
    
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
}


/*
 *	When web application loads Add stuff to the DOM (HTML 5)
 */
- (void)webViewDidStartLoad:(UIWebView *)theWebView {
	/*
	 * This is the Device.platform information
	 */	
    NSString *deviceStr = [[Device alloc] init];
    
    /* Settings.plist
	 * Read the optional Settings.plist file and push these user-defined settings down into the web application.
	 * This can be useful for supplying build-time configuration variables down to the app to change its behaviour,
     * such as specifying Full / Lite version, or localization (English vs German, for instance).
	 */
    NSString *errorDesc = nil;
    NSPropertyListFormat format;
    NSString *plistPath = [[NSBundle mainBundle] pathForResource:@"Settings" ofType:@"plist"];
    NSData *plistXML = [[NSFileManager defaultManager] contentsAtPath:plistPath];
    NSDictionary *temp = (NSDictionary *)[NSPropertyListSerialization
                                          propertyListFromData:plistXML
                                          mutabilityOption:NSPropertyListMutableContainersAndLeaves			  
                                          format:&format errorDescription:&errorDesc];
    if ([temp respondsToSelector:@selector(JSONFragment)]) {
        NSString *initString = [[NSString alloc] initWithFormat:@"%@\nwindow.Settings = %@;", deviceStr, [temp JSONFragment]];
        NSLog(@"%@", initString);
        [theWebView stringByEvaluatingJavaScriptFromString:initString];
        [initString release];
    } else {
        [theWebView stringByEvaluatingJavaScriptFromString:deviceStr];
    }
}

- (void)webViewDidFinishLoad:(UIWebView *)theWebView {
	/*
	 * Hide the Top Activity THROBER in the Battery Bar
	 */
	[[UIApplication sharedApplication] setNetworkActivityIndicatorVisible:NO];
	activityView.hidden = YES;	

	imageView.hidden = YES;
	
	[window bringSubviewToFront:viewController.view];
	webView = theWebView; 	
}


/*
 * - Fail Loading With Error
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


/*
 * Start Loading Request
 * This is where most of the magic happens... We take the request(s) and process the response.
 * From here we can re direct links and other protocalls to different internal methods.
 *
 */
- (BOOL)webView:(UIWebView *)theWebView shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType {
	
	NSURL * url = [request URL];

	// Check to see if the URL request is for the App URL.
	// If it is not, then launch using Safari
	// TODO: There was a suggestion to check this against a whitelist of urls, this would be a good place to do that.
	NSString * urlHost = [url host];
	NSString * appHost = [appURL host];
	NSRange range = [urlHost rangeOfString:appHost options:NSCaseInsensitiveSearch];

	if ([[url scheme] isEqualToString:@"gap"]) {

		NSString * path  =  [url path];
		/*
		 * Get Command and Options From URL
		 * We are looking for URLS that match gap://<Class>.<command>/[<arguments>][?<dictionary>]
		 * We have to strip off the leading slash for the options.
		 */
		NSString * command = [url host];

		// Array of arguments
        NSMutableArray * arguments = [NSMutableArray arrayWithArray:[[path substringWithRange:NSMakeRange(1, [path length] - 1)]
                                                                   componentsSeparatedByString:@"/"]];
        int i, arguments_count = [arguments count];
        for (i = 0; i < arguments_count; i++) {
            [arguments replaceObjectAtIndex:i withObject:[(NSString *)[arguments objectAtIndex:i]
                                                          stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding]];
        }
        //NSLog(@"Arguments: %@", arguments);

        NSMutableDictionary * options = [NSMutableDictionary dictionaryWithCapacity:1];
        NSArray * options_parts = [NSArray arrayWithArray:[[url query] componentsSeparatedByString:@"&"]];
        int options_count = [options_parts count];
        for (i = 0; i < options_count; i++) {
            NSArray  *option_part = [[options_parts objectAtIndex:i] componentsSeparatedByString:@"="];
            NSString *name  = [(NSString *)[option_part objectAtIndex:0] stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
            NSString *value = [(NSString *)[option_part objectAtIndex:1] stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
            [options setObject:value forKey:name];
        }
        //NSLog(@"Options: %@", options);
        
		// Tell the JS code that we've gotten this command, and we're ready for another
        [theWebView stringByEvaluatingJavaScriptFromString:@"PhoneGap.exec.ready = true;"];
		
		// Check to see if we are provided a class:method style command.
        NSArray* components = [command componentsSeparatedByString:@"."];
        if (components.count == 2)
        {
            NSString* className = [components objectAtIndex:0];
            NSString* methodName = [components objectAtIndex:1];
            
            // Fetch an instance of this class
            PhoneGapCommand* obj = [self getCommandInstance:className];
            
            // construct the fill method name to ammend the second argument.
            NSString* fullMethodName = [[NSString alloc] initWithFormat:@"%@:withDict:", methodName];
            if ([obj respondsToSelector:NSSelectorFromString(fullMethodName)])
            {
                [obj performSelector:NSSelectorFromString(fullMethodName) withObject:arguments withObject:options];
            }
            else
            {
                // There's no method to call, so throw an error.
                NSLog(@"Class method '%@' not defined in class '%@'", fullMethodName, className);
                [NSException raise:NSInternalInconsistencyException format:@"Class method '%@' not defined against class '%@'.", fullMethodName, className];
            }
            [fullMethodName release];
        }
		return NO;
	} else {
		/*
		 * We don't have a PhoneGap request, it could be file or something else
		 */
		if (range.location == NSNotFound) {
			[[UIApplication sharedApplication] openURL:url];
		}
	}
	
	return YES;
}


/*
 * accelerometer - Sends Accel Data back to the Device.
 */
- (void) accelerometer:(UIAccelerometer *)accelerometer didAccelerate:(UIAcceleration *)acceleration {
	NSString * jsCallBack = nil;
	jsCallBack = [[NSString alloc] initWithFormat:@"var _accel={x:%f,y:%f,z:%f};", acceleration.x, acceleration.y, acceleration.z];
	[webView stringByEvaluatingJavaScriptFromString:jsCallBack];
}

- (void)dealloc
{
    NSArray *objects = [commandObjects allValues];
    int i, count = [objects count];
    for (i = 0; i < count; i++) {
        [[objects objectAtIndex:i] release];
    }
    [commandObjects release];
	[appURL release];
	[imageView release];
	[viewController release];
    [activityView release];
	[window release];
	[super dealloc];
}


@end
