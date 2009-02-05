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

	[[Location sharedInstance].locationManager startUpdatingLocation];
	
	webView.delegate = self;
  
	// Set up the image picker controller and add it to the view
	imagePickerController = [[UIImagePickerController alloc] init];
	
	// Im not sure why the next line was giving me a warning... any ideas?
	// when this is commented out, the cancel button no longer works.
	imagePickerController.delegate = self;
	imagePickerController.sourceType = UIImagePickerControllerSourceTypePhotoLibrary;
	imagePickerController.view.hidden = YES;
	//[window addSubview:imagePickerController.view];
	
	[[UIAccelerometer sharedAccelerometer] setUpdateInterval:1.0/40.0];
	[[UIAccelerometer sharedAccelerometer] setDelegate:self];

	[window addSubview:viewController.view]; 
	
	NSString *errorDesc = nil;
	
	NSPropertyListFormat format;
	NSString *plistPath = [[NSBundle mainBundle] pathForResource:@"Settings" ofType:@"plist"];
	NSData *plistXML = [[NSFileManager defaultManager] contentsAtPath:plistPath];
	NSDictionary *temp = (NSDictionary *)[NSPropertyListSerialization
										  propertyListFromData:plistXML
										  mutabilityOption:NSPropertyListMutableContainersAndLeaves			  
										  format:&format errorDescription:&errorDesc];
		
	NSString *mode;
	NSString *url;
	int *detectNumber;

	mode			= [temp objectForKey:@"Offline"];
	url				= [temp objectForKey:@"Callback"];
	detectNumber	= [temp objectForKey:@"DetectPhoneNumber"]; 
		
	if ([mode isEqualToString:@"0"]) {
		// Online Mode
		appURL = [[NSURL URLWithString:url] retain];
		NSURLRequest * aRequest = [NSURLRequest requestWithURL:appURL];
		[webView loadRequest:aRequest];
	} else {		
		// Offline Mode
		NSString * urlPathString;
		NSBundle * thisBundle = [NSBundle bundleForClass:[self class]];
		if (urlPathString = [thisBundle pathForResource:@"index" ofType:@"html" inDirectory:@"www"]){
			[webView  loadRequest:[NSURLRequest
								   requestWithURL:[NSURL fileURLWithPath:urlPathString]
								   cachePolicy:NSURLRequestUseProtocolCachePolicy
								   timeoutInterval:20.0
								   ]];
			
		}   
	}
	
	webView.detectsPhoneNumbers=detectNumber;
	
	//This keeps the Default.png up
	imageView = [[UIImageView alloc] initWithImage:[[UIImage alloc] initWithContentsOfFile:[[NSBundle mainBundle] pathForResource:@"Default" ofType:@"png"]]];
	[window addSubview:imageView];
  
	activityView = [[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle:UIActivityIndicatorViewStyleGray];
	[window addSubview:activityView];
	[activityView startAnimating];
	[window makeKeyAndVisible];

}


/*
 * When web application loads pass it device information
 *
 */
- (void)webViewDidStartLoad:(UIWebView *)theWebView {
  [theWebView stringByEvaluatingJavaScriptFromString:[[Device alloc] init]];
}

- (void)webViewDidFinishLoad:(UIWebView *)theWebView {
	imageView.hidden = YES;
	
	[window bringSubviewToFront:viewController.view];
	webView = theWebView; 	
}

- (void)webView:(UIWebView *)webView didFailLoadWithError:(NSError *)error {
	if ([error code] != NSURLErrorCancelled)
		alert(error.localizedDescription);
}

- (BOOL)webView:(UIWebView *)theWebView shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType {
	
	NSURL* url = [request URL];
	NSString * urlString = [url absoluteString];
	NSBundle * mainBundle = [NSBundle mainBundle];
	
	// Check to see if the URL request is for the App URL.
	// If it is not, then launch using Safari
	NSString* urlHost = [url host];
	NSString* appHost = [appURL host];
	NSRange range = [urlHost rangeOfString:appHost options:NSCaseInsensitiveSearch];
	if (range.location == NSNotFound)
		[[UIApplication sharedApplication] openURL:url];
    
	NSString * jsCallBack = nil;

	
	NSArray * parts = [urlString componentsSeparatedByString:@":"];

	
	if ([parts count] > 1 && [(NSString *)[parts objectAtIndex:0] isEqualToString:@"gap"]) {
		
		if ([(NSString *)[parts objectAtIndex:0] isEqualToString:@"gap"]){
			
			if([(NSString *)[parts objectAtIndex:1] isEqualToString:@"getloc"]){

				jsCallBack = [[Location sharedInstance] getPosition];

				[theWebView stringByEvaluatingJavaScriptFromString:jsCallBack];
				[jsCallBack release];
				
			} else if([(NSString *)[parts objectAtIndex:1] isEqualToString:@"getphoto"]){
			
				// added/modified by urbian.org - g.mueller @urbian.org
				
				NSUInteger imageSource;

				//set upload url
				photoUploadUrl = [parts objectAtIndex:3];
				[photoUploadUrl retain];
				
				NSLog([@"photo-url: " stringByAppendingString:photoUploadUrl]);
				
				//which image source
				if([(NSString *)[parts objectAtIndex:2] isEqualToString:@"fromCamera"]){
					imageSource = UIImagePickerControllerSourceTypeCamera;
				} else if([(NSString *)[parts objectAtIndex:2] isEqualToString:@"fromLibrary"]){
					imageSource = UIImagePickerControllerSourceTypePhotoLibrary;  
				} else {
					NSLog(@"photo: no Source type set");
					return NO;
				}
				
				//check if source is available
				if([UIImagePickerController isSourceTypeAvailable:imageSource])
				{
					picker = [[UIImagePickerController alloc]init];
					picker.sourceType = imageSource;
					picker.allowsImageEditing = YES;
					picker.delegate = self;
					
					[viewController presentModalViewController:picker animated:YES];
					
				} else {
					NSLog(@"photo: source not available!");
					return NO;
				}
				
				webView.hidden = YES;
				
				NSLog(@"photo: dialog open now!");
				
				NSLog(@"photo dialog open now!");
			} else if([(NSString *)[parts objectAtIndex:1] isEqualToString:@"vibrate"]){
				Vibrate *vibration = [[Vibrate alloc] init];
				[vibration vibrate];
				[vibration release];

				//contacts = [[Contacts alloc] init];
				//[contacts getContacts];
			
			} else if([(NSString *)[parts objectAtIndex:1] isEqualToString:@"openmap"]) {
				
				NSString *mapurl = [@"maps:" stringByAppendingString:[parts objectAtIndex:2]];
				
				[[UIApplication sharedApplication] openURL:[NSURL URLWithString:mapurl]];
			} else if ([(NSString *)[parts objectAtIndex:1] isEqualToString:@"sound"]) {

				NSString *ef = (NSString *)[parts objectAtIndex:2];
				NSArray *soundFile = [ef componentsSeparatedByString:@"."];
				
				NSString *file = (NSString *)[soundFile objectAtIndex:0];
				NSString *ext = (NSString *)[soundFile objectAtIndex:1];

				sound = [[Sound alloc] initWithContentsOfFile:[mainBundle pathForResource:file ofType:ext]];
				[sound play];
			}
			
			return NO;
		}
	}

	return YES;
}



- (void) accelerometer:(UIAccelerometer *)accelerometer didAccelerate:(UIAcceleration *)acceleration {
	NSString * jsCallBack = nil;
	
	jsCallBack = [[NSString alloc] initWithFormat:@"gotAcceleration('%f','%f','%f');", acceleration.x, acceleration.y, acceleration.z];
	[webView stringByEvaluatingJavaScriptFromString:jsCallBack];
}


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

- (void)connection:(NSURLConnection *)connection didFailWithError:(NSError *)error {
    NSLog([@"photo: upload failed! " stringByAppendingString:[error description]]);
    
#if TARGET_IPHONE_SIMULATOR
    alert(@"Error while uploading image!");
#endif
}

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
