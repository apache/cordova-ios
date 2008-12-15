#import "GlassAppDelegate.h"

#import <UIKit/UIKit.h>
#import <CoreLocation/CoreLocation.h>

#import "GlassViewController.h"
#import "SoundEffect.h"
#import "Contacts.h"

@implementation GlassAppDelegate

@synthesize window;
@synthesize viewController;

@synthesize lastKnownLocation;
@synthesize imagePickerController;

void alert(NSString *message) {
    UIAlertView *openURLAlert = [[UIAlertView alloc] initWithTitle:@"Alert" 
														   message:message 
														  delegate:nil 
												 cancelButtonTitle:@"OK" 
                                                 otherButtonTitles:nil];
    [openURLAlert show];
    [openURLAlert release];
}

- (void)applicationDidFinishLaunching:(UIApplication *)application {


	locationManager = [[CLLocationManager alloc] init];
	locationManager.delegate = self;
	[locationManager startUpdatingLocation];
	
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
	
	// Override point for customization after app launch	
	[window addSubview:viewController.view];

	NSString * htmlFileName;
	NSString * urlFileName;
	
	htmlFileName = @"index";
	urlFileName = @"url";
	
	NSString * urlPathString;	
	NSBundle * thisBundle = [NSBundle bundleForClass:[self class]];
	
	if (urlPathString = [thisBundle pathForResource:urlFileName	ofType:@"txt"]) {
		NSString * theURLString = [NSString stringWithContentsOfFile:urlPathString];
		appURL = [NSURL URLWithString:theURLString];
		[appURL retain];
		NSURLRequest * aRequest = [NSURLRequest requestWithURL:appURL];
		[webView loadRequest:aRequest];
	}	

	imageView = [[UIImageView alloc] 
               initWithImage:[[UIImage alloc] 
                              initWithContentsOfFile:[[NSBundle mainBundle] 
                                                      pathForResource:@"Default" 
                                                      ofType:@"png"]]];
	[window addSubview:imageView];
  
	activityView = [[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle:UIActivityIndicatorViewStyleGray];
	[window addSubview:activityView];
	[activityView startAnimating];
	[window makeKeyAndVisible];

	
	//NSBundle * mainBundle = [NSBundle mainBundle];


}

//when web application loads pass it device information
- (void)webViewDidStartLoad:(UIWebView *)theWebView {
  [theWebView stringByEvaluatingJavaScriptFromString:[[Device alloc] init]];
}

- (void)webViewDidFinishLoad:(UIWebView *)theWebView 
{
	[window bringSubviewToFront:viewController.view];
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

	double lat = lastKnownLocation.coordinate.latitude;
	double lon = lastKnownLocation.coordinate.longitude;

	if ([parts count] > 1 && [(NSString *)[parts objectAtIndex:0] isEqualToString:@"gap"]) {
		
		NSLog([parts objectAtIndex:0]);
		NSLog([parts objectAtIndex:1]);
		
		if ([(NSString *)[parts objectAtIndex:0] isEqualToString:@"gap"]){
			
			//LOCATION
			if([(NSString *)[parts objectAtIndex:1] isEqualToString:@"getloc"]){
				NSLog(@"location request!");

				jsCallBack = [[NSString alloc] initWithFormat:@"gotLocation('%f','%f');", lat, lon];
				NSLog(jsCallBack);
				[theWebView stringByEvaluatingJavaScriptFromString:jsCallBack];
				
				[jsCallBack release];
			} else if([(NSString *)[parts objectAtIndex:1] isEqualToString:@"getphoto"]){
				NSLog(@"Photo request!");
				NSLog([parts objectAtIndex:2]);
			
				imagePickerController.view.hidden = NO;
				webView.hidden = YES;
				[window bringSubviewToFront:imagePickerController.view];
				NSLog(@"photo dialog open now!");
			} else if([(NSString *)[parts objectAtIndex:1] isEqualToString:@"vibrate"]){
				Vibrate *vibration = [[Vibrate alloc] init];
				[vibration vibrate];
				[vibration release];

				
				contacts = [[Contacts alloc] init];
				[contacts getContacts];
			
			} else if([(NSString *)[parts objectAtIndex:1] isEqualToString:@"openmap"]) {
				NSString *mapurl = [@"maps:" stringByAppendingString:[parts objectAtIndex:2]];
				[[UIApplication sharedApplication] openURL:[NSURL URLWithString:mapurl]];
			} else if ([(NSString *)[parts objectAtIndex:1] isEqualToString:@"sound"]) {

				// Split the Sound file 
				NSString *ef = (NSString *)[parts objectAtIndex:2];
				NSArray *soundFile = [ef componentsSeparatedByString:@"."];
				
				NSString *file = (NSString *)[soundFile objectAtIndex:0];
				NSString *ext = (NSString *)[soundFile objectAtIndex:1];
				// Some TODO's here
				// Test to see if the file/ext is IN the bundle
				// Cleanup any memory that may not be caught
				soundEffect = [[SoundEffect alloc] initWithContentsOfFile:[mainBundle pathForResource:file ofType:ext]];
				[soundEffect play];
				

			}
			
			return NO;
		}
	}

	return YES;
}

- (void)locationManager:(CLLocationManager *)manager didUpdateToLocation:(CLLocation *)newLocation fromLocation:(CLLocation *)oldLocation
{
	[lastKnownLocation release];
	lastKnownLocation = newLocation;
	[lastKnownLocation retain];	
}


- (void) accelerometer:(UIAccelerometer *)accelerometer didAccelerate:(UIAcceleration *)acceleration {
	NSString * jsCallBack = nil;
	
	jsCallBack = [[NSString alloc] initWithFormat:@"gotAcceleration('%f','%f','%f');", acceleration.x, acceleration.y, acceleration.z];
	[webView stringByEvaluatingJavaScriptFromString:jsCallBack];
}

- (void)imagePickerController:(UIImagePickerController *)picker didFinishPickingImage:(UIImage *)theImage editingInfo:(NSDictionary *)editingInfo
{
    NSLog(@"photo: picked image");
	
	// Dismiss the image selection, hide the picker and show the image view with the picked image
	[picker dismissModalViewControllerAnimated:YES];
	imagePickerController.view.hidden = YES;
	
	UIDevice * dev = [UIDevice currentDevice];
	NSString *uniqueId = dev.uniqueIdentifier;
	NSData * imageData = UIImageJPEGRepresentation(theImage, 0.75);	
	NSString *urlString = [@"http://phonegap.com/demo/upload.php?" stringByAppendingString:@"uid="];
	urlString = [urlString stringByAppendingString:uniqueId];
	
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
	[postBody appendData:[[NSString stringWithString:@"Content-Disposition: form-data; name=\"data\"\r\n"] dataUsingEncoding:NSUTF8StringEncoding]];
	[postBody appendData:[[NSString stringWithString:@"Content-Type: application/octet-stream\r\n\r\n"] dataUsingEncoding:NSUTF8StringEncoding]];
	[postBody appendData:[NSData dataWithData:imageData]];
	[postBody appendData:[[NSString stringWithFormat:@"\r\n--%@--\r\n",stringBoundary] dataUsingEncoding:NSUTF8StringEncoding]];

	// ---------
	[request setHTTPBody:postBody];
	
	NSURLConnection *conn=[[NSURLConnection alloc] initWithRequest:request delegate:self];
	if(conn) {
		NSLog(@"photo: connection sucess");
  } 
  else {
	  NSLog(@"photo: upload failed!");
  }

	webView.hidden = NO;
	[window bringSubviewToFront:webView];
}


- (void)imagePickerControllerDidCancel:(UIImagePickerController *)picker
{
	// Dismiss the image selection and close the program
	[picker dismissModalViewControllerAnimated:YES];
	// Hide the imagePicker and bring the web page back into focus
	imagePickerController.view.hidden = YES;
	NSLog(@"Photo Cancel Request");
	webView.hidden = NO;
	[window bringSubviewToFront:webView];
}

- (void)connectionDidFinishLoading:(NSURLConnection *)connection {
  NSLog(@"photo: upload finished!");
	
	#if TARGET_IPHONE_SIMULATOR
		alert(@"Did finish loading image!");
	#endif
}

-(void)connection:(NSURLConnection *)connection didReceiveResponse:(NSURLResponse *) response {
	NSLog(@"HERE RESPONSE");
}

- (void)connection:(NSURLConnection *)connection didReceiveData:(NSData *)data
{
    // append the new data to the receivedData
    // receivedData is declared as a method instance elsewhere
    // [receivedData appendData:data];
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
	[lastKnownLocation release];
	[imagePickerController release];
	[appURL release];
	[super dealloc];
}


@end
