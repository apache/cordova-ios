#import "GlassAppDelegate.h"
#import "GlassViewController.h"
#import <UIKit/UIKit.h>

@implementation GlassAppDelegate

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
	[[Location sharedInstance].locationManager startUpdatingLocation];
	
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

		NSString * jsCallBack = nil;
		
		if([command isEqualToString:@"getloc"]){
			jsCallBack = [[Location sharedInstance] getPosition];

			[theWebView stringByEvaluatingJavaScriptFromString:jsCallBack];
			[jsCallBack release];
			
		} else if([command isEqualToString:@"vibrate"]){
			/*
			 * Make the device vibrate, this is now part of the notifier object.
			 */
			Vibrate *vibration = [[Vibrate alloc] init];
			[vibration vibrate];
			[vibration release];
			
		} else if([command isEqualToString:@"openmap"]) {
			
			NSString *mapurl = [@"maps:" stringByAppendingString:options];
			
			[[UIApplication sharedApplication] openURL:[NSURL URLWithString:mapurl]];
			
		} else if([command isEqualToString:@"getphoto"]){
		
//			// added/modified by urbian.org - g.mueller @urbian.org
//			
//			NSUInteger imageSource;
//
//			//set upload url
//			photoUploadUrl = [parts objectAtIndex:3];
//			[photoUploadUrl retain];
//			
//			NSLog([@"photo-url: " stringByAppendingString:photoUploadUrl]);
//			
//			//which image source
//			if([(NSString *)[parts objectAtIndex:2] isEqualToString:@"fromCamera"]){
//				imageSource = UIImagePickerControllerSourceTypeCamera;
//			} else if([(NSString *)[parts objectAtIndex:2] isEqualToString:@"fromLibrary"]){
//				imageSource = UIImagePickerControllerSourceTypePhotoLibrary;  
//			} else {
//				NSLog(@"photo: no Source type set");
//				return NO;
//			}
//			
//			//check if source is available
//			if([UIImagePickerController isSourceTypeAvailable:imageSource])
//			{
//				picker = [[UIImagePickerController alloc]init];
//				picker.sourceType = imageSource;
//				picker.allowsImageEditing = YES;
//				picker.delegate = self;
//				
//				[viewController presentModalViewController:picker animated:YES];
//				
//			} else {
//				NSLog(@"photo: source not available!");
//				return NO;
//			}
//			
//			webView.hidden = YES;
			
			NSLog(@"photo dialog open now!");
		} else if([command isEqualToString:@"getContacts"]) {				
			
			contacts = [[Contacts alloc] init];
			jsCallBack = [contacts getContacts];
			NSLog(@"%@",jsCallBack);
			[theWebView stringByEvaluatingJavaScriptFromString:jsCallBack];

			[contacts release];
		
		} else if ([command isEqualToString:@"playSound"]) {

			NSBundle * mainBundle = [NSBundle mainBundle];
			NSArray *soundFile = [options componentsSeparatedByString:@"."];
			
			NSString *file = (NSString *)[soundFile objectAtIndex:0];
			NSString *ext = (NSString *)[soundFile objectAtIndex:1];
			NSLog(file);
			sound = [[Sound alloc] initWithContentsOfFile:[mainBundle pathForResource:file ofType:ext]];
			[sound play];
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


// TODO Move to Image.m
/*
- (void)imagePickerController:(UIImagePickerController *)thePicker didFinishPickingImage:(UIImage *)theImage editingInfo:(NSDictionary *)editingInfo
{
	
	//modified by urbian.org - g.mueller @urbian.org
	
    NSLog(@"photo: picked image");
	
	NSData * imageData = UIImageJPEGRepresentation(theImage, 0.75);
	
	NSString *urlString = [@"http://" stringByAppendingString:photoUploadUrl]; // upload the photo to this url
	
	NSMutableURLRequest *request = [[[NSMutableURLRequest alloc] init] autorelease];
	[request setURL:[NSURL URLWithString:urlString]];
	[request setHTTPMethod:@"POST"];
	
	// ---------
	//Add the header info
	NSString *stringBoundary = [NSString stringWithString:@"0xKhTmLbOuNdArY"];
	NSString *contentType = [NSString stringWithFormat:@"multipart/form-data; boundary=%@",stringBoundary];
	[request addValue:contentType forHTTPHeaderField: @"Content-Type"];
	
	//create the body
	NSMutableData *postBody = [NSMutableData data];
	[postBody appendData:[[NSString stringWithFormat:@"--%@\r\n",stringBoundary] dataUsingEncoding:NSUTF8StringEncoding]];
	
	//add data field and file data
	[postBody appendData:[[NSString stringWithString:@"Content-Disposition: form-data; name=\"photo_0\"; filename=\"photo\"\r\n"] dataUsingEncoding:NSUTF8StringEncoding]];
	[postBody appendData:[[NSString stringWithString:@"Content-Type: application/octet-stream\r\n\r\n"] dataUsingEncoding:NSUTF8StringEncoding]];
	
	[postBody appendData:[NSData dataWithData:imageData]];
	[postBody appendData:[[NSString stringWithFormat:@"\r\n--%@--\r\n",stringBoundary] dataUsingEncoding:NSUTF8StringEncoding]];
	
	// ---------
	[request setHTTPBody:postBody];
	
	//NSURLConnection *
	conn=[[NSURLConnection alloc] initWithRequest:request delegate:self];
	
	if(conn) {    
		receivedData=[[NSMutableData data] retain];
		NSString *sourceSt = [[NSString alloc] initWithBytes:[receivedData bytes] length:[receivedData length] encoding:NSUTF8StringEncoding];
		NSLog([@"photo: connection sucess" stringByAppendingString:sourceSt]);
		
	} else {
		NSLog(@"photo: upload failed!");
	}
	
	[[thePicker parentViewController] dismissModalViewControllerAnimated:YES];
	
	webView.hidden = NO;
	[window bringSubviewToFront:webView];
	
}


// TODO Move to Image.m
- (void)imagePickerControllerDidCancel:(UIImagePickerController *)thePicker
{
	// Dismiss the image selection and close the program
	[[thePicker parentViewController] dismissModalViewControllerAnimated:YES];
	
	//added by urbian - the webapp should know when the user canceled
	NSString * jsCallBack = nil;
	
	jsCallBack = [[NSString alloc] initWithFormat:@"gotPhoto('CANCEL');", lastUploadedPhoto];
	[webView stringByEvaluatingJavaScriptFromString:jsCallBack];  
	[jsCallBack release];
	
	// Hide the imagePicker and bring the web page back into focus
	NSLog(@"Photo Cancel Request");
	webView.hidden = NO;
	[window bringSubviewToFront:webView];
}


// TODO Move to Image.m
- (void)connectionDidFinishLoading:(NSURLConnection *)connection {
	
	NSLog(@"photo: upload finished!");
	
	//added by urbian.org - g.mueller
	NSString *aStr = [[NSString alloc] initWithData:receivedData encoding:NSUTF8StringEncoding];
	
	//upload.php should return "filename=<filename>"
	NSLog(aStr);
	NSArray * parts = [aStr componentsSeparatedByString:@"="];
	//set filename
	lastUploadedPhoto = (NSString *)[parts objectAtIndex:1];
	
	//now the callback: return lastUploadedPhoto
	
	NSString * jsCallBack = nil;
	
	if(lastUploadedPhoto == nil) lastUploadedPhoto = @"ERROR";
	
	jsCallBack = [[NSString alloc] initWithFormat:@"gotPhoto('%@');", lastUploadedPhoto];
	
	[webView stringByEvaluatingJavaScriptFromString:jsCallBack];
	
	NSLog(@"Succeeded! Received %d bytes of data",[receivedData length]);
	NSLog(jsCallBack);
	
    // release the connection, and the data object
    [conn release];
    [receivedData release];
	
#if TARGET_IPHONE_SIMULATOR
    alert(@"Did finish loading image!");
#endif
}


// TODO Move to Image.m
-(void)connection:(NSURLConnection *)connection didReceiveResponse:(NSURLResponse *) response {
	
	//added by urbian.org
	NSHTTPURLResponse *httpResponse = (NSHTTPURLResponse *)response;
	NSLog(@"HTTP Status Code: %i", [httpResponse statusCode]);
	
	[receivedData setLength:0];
}

- (void)connection:(NSURLConnection *)connection didReceiveData:(NSData *)data
{
    // append the new data to the receivedData
    // receivedData is declared as a method instance elsewhere
    [receivedData appendData:data];
    NSLog(@"photo: progress");
}


// TODO Move to Image.m
- (void)connection:(NSURLConnection *)connection didFailWithError:(NSError *)error {
    NSLog([@"photo: upload failed! " stringByAppendingString:[error description]]);
    
#if TARGET_IPHONE_SIMULATOR
    alert(@"Error while uploading image!");
#endif
}
*/
- (void)dealloc {
	[appURL release];
	[activityView release];
	[imageView release];
	[viewController release];
	[window release];
	[imagePickerController release];
	[appURL release];
	[super dealloc];
}


@end
