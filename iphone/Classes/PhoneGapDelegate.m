#import "PhoneGapDelegate.h"
#import "PhoneGapViewController.h"
#import <UIKit/UIKit.h>

@implementation PhoneGapDelegate

@synthesize window;
@synthesize viewController;

@synthesize imagePickerController;

void alert(NSString *message) {
    UIAlertView *openURLAlert = [[UIAlertView alloc] initWithTitle:@"Alert" message:message delegate:nil cancelButtonTitle:@"OK" otherButtonTitles:nil];
    [openURLAlert show];
    [openURLAlert release];
}

/*
 * applicationDidFinishLaunching 
 * This is main kick off after the app inits, the views and Settings are setup here.
 */


- (void)applicationDidFinishLaunching:(UIApplication *)application {

	/*
	 * Fire up the GPS Service right away as it takes a moment for data to come back.
	 */
    
    NSDictionary* infoDictionry = [[NSBundle mainBundle] infoDictionary];
    NSString* coreLocationStart = [infoDictionry objectForKey:@"CoreLocationStart"];

    // Only launch at startup, if the info plist requests it.
    if (coreLocationStart && [coreLocationStart compare:@"launch"] == NSOrderedSame)
    {
        [[Location sharedInstance] start];
    }
	
	webView.delegate = self;
  
	// Set up the image picker controller and add it to the view
	imagePickerController = [[UIImagePickerController alloc] init];
	imagePickerController.delegate = self;
	imagePickerController.sourceType = UIImagePickerControllerSourceTypePhotoLibrary;
	imagePickerController.view.hidden = YES;
	
	[[UIAccelerometer sharedAccelerometer] setUpdateInterval:1.0/40.0];
	[[UIAccelerometer sharedAccelerometer] setDelegate:self];

	[window addSubview:viewController.view]; 
	
	NSString *errorDesc = nil;
	
	
	/*
	 * Settings.plist
	 *
	 * This block of code navigates to the Settings.plist in the Config Group and reads the XML into an Hash (Dictionary)
	 *
	 */
	NSPropertyListFormat format;
	NSString *plistPath = [[NSBundle mainBundle] pathForResource:@"Settings" ofType:@"plist"];
	NSData *plistXML = [[NSFileManager defaultManager] contentsAtPath:plistPath];
	NSDictionary *temp = (NSDictionary *)[NSPropertyListSerialization
										  propertyListFromData:plistXML
										  mutabilityOption:NSPropertyListMutableContainersAndLeaves			  
										  format:&format errorDescription:&errorDesc];
		
	NSString *offline = [temp objectForKey:@"Offline"];
	NSString *url = [temp objectForKey:@"Callback"];
	int *detectNumber = [temp objectForKey:@"DetectPhoneNumber"];



	
	/*
	 * We want to test the offline to see if this app should start in offline mode or online mode.
	 *
	 *   0 - Offline
	 *   1 - Online
	 *
	 *		In Offline mode the index.html file is loaded from the www directly and serves as the entry point into the application
	 *		In Online mode the starting point is a external FQDN, usually your server.
	 */
	if ([offline isEqualToString:@"0"]) {
		appURL = [[NSURL URLWithString:url] retain];
	} else {		
		NSBundle * thisBundle = [NSBundle bundleForClass:[self class]];
		appURL = [[NSURL fileURLWithPath:[thisBundle pathForResource:@"index" ofType:@"html" inDirectory:@"www"]] retain];		
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
	 * detectNumber - If we want to Automagicly convery phone numbers to links - Set in Settings.plist
	 * Value should be BOOL (YES|NO)
	 *
	 * For whatever reason this quit working
	 */
	webView.detectsPhoneNumbers=detectNumber;
	
	
	/*
	 * imageView - is the Default loading screen, it stay up until the app and UIWebView (WebKit) has completly loaded.
	 * You can change this image by swapping out the Default.png file within the resource folder.
	 */
	imageView = [[UIImageView alloc] initWithImage:[[UIImage alloc] initWithContentsOfFile:[[NSBundle mainBundle] pathForResource:@"Default" ofType:@"png"]]];
	[window addSubview:imageView];
  
	
	/*
	 * These are the setting for the top Status/Battery Bar.
	 *
	 *	 UIStatusBarStyleBlackOpaque
	 *	 UIStatusBarStyleBlackTranslucent
	 *	 UIStatusBarStyleDefault - Default
	 *
	 */
	[application setStatusBarStyle:UIStatusBarStyleBlackOpaque animated:NO];
	
	
	/*
	 * The Activity View is the top spinning throbber in the status/battery bar. We init it with the default Grey Style.
	 *
	 *	 UIActivityIndicatorViewStyleWhiteLarge
	 *	 UIActivityIndicatorViewStyleWhite
	 *	 UIActivityIndicatorViewStyleGray
	 *
	 */
	activityView = [[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle:UIActivityIndicatorViewStyleGray];
	[window addSubview:activityView];
	[activityView startAnimating];
	
	
	/*
	 * If you don't want your app to have a status bar, just uncomment this.
	 */
	//[[UIApplication sharedApplication] setStatusBarHidden:YES animated:NO];		
	
	
	[window makeKeyAndVisible];

}


/*
 *	When web application loads Add stuff to the DOM (HTML 5)
 */
- (void)webViewDidStartLoad:(UIWebView *)theWebView {

	/*
	 * This is the Device.plaftorm information
	 */	
	[theWebView stringByEvaluatingJavaScriptFromString:[[Device alloc] init]];

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
	if ([error code] != NSURLErrorCancelled)
		alert(error.localizedDescription);
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
		 * We are looking for URLS that match gap://<command>[/<options>]
		 * We have to strip off the leading slah for the options.
		 */
		NSString * command = [url host];
		
		NSString * options =  [path substringWithRange:NSMakeRange(1, [path length] - 1)];
		
		// Check to see if we are provided a class:method style command.
        NSArray* components = [command componentsSeparatedByString:@"."];
        if (components.count == 2)
        {
            NSString* className = [components objectAtIndex:0];
            NSString* methodName = [components objectAtIndex:1];
            
            // construct the fill method name to ammend the second argument.
            NSString* fullMethodName = [[NSString alloc] initWithFormat:@"%@:forWebView:", methodName];

            if ([NSClassFromString(className) respondsToSelector:NSSelectorFromString(fullMethodName)])
            {
                // Call the class method.
                [NSClassFromString(className) performSelector:NSSelectorFromString(fullMethodName) withObject:options withObject:theWebView];
            }
            else
            {
                // There's no method to call, so throw an error.
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

- (void)dealloc {
	[appURL release];
	[imageView release];
	[viewController release];
	[window release];
	[imagePickerController release];
	[super dealloc];
}


@end
