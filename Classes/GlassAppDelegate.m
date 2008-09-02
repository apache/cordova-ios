
#import "GlassAppDelegate.h"
#import "GlassViewController.h"
#import <AudioToolbox/AudioServices.h>
//#import <UIKit/UIDevice.h>
#import <UIKit/UINavigationController.h>
#import <UIKit/UIKit.h>

#import <CoreLocation/CoreLocation.h>


@implementation GlassAppDelegate

@synthesize window;
@synthesize viewController;
@synthesize	passPersonalInfo;
@synthesize passGeoData;

@synthesize lastKnownLocation;
@synthesize image;
@synthesize imagePickerController;

void alert(NSString *message) {
    UIAlertView *openURLAlert = [[UIAlertView alloc] initWithTitle:@"PhoneGap" message:message delegate:nil cancelButtonTitle:@"OK" otherButtonTitles:nil];
    [openURLAlert show];
    [openURLAlert release];
}

- (void)applicationDidFinishLaunching:(UIApplication *)application {
	
	locationManager = [[CLLocationManager alloc] init];
	locationManager.delegate = self;
	[locationManager startUpdatingLocation];
	
//	Location *location = [[Location alloc] init];
//	[location location];
//	[location release];
	
	// Set up the image picker controller and add it to the view
	imagePickerController = [[UIImagePickerController alloc] init];
	
	// Im not sure why the next line was giving me a warning... any ideas?
	// when this is commented out, the cancel button no longer works.
	imagePickerController.delegate = self;
	imagePickerController.sourceType = UIImagePickerControllerSourceTypePhotoLibrary;
	[window addSubview:imagePickerController.view];
	
	[[UIAccelerometer sharedAccelerometer] setUpdateInterval:1.0/40.0];
	[[UIAccelerometer sharedAccelerometer] setDelegate:self];
	
	// Override point for customization after app launch	
    [window addSubview:viewController.view];
	webView.delegate = self;	
	
	NSString * htmlFileName;
	NSString * urlFileName;
	
	htmlFileName = @"index";
	urlFileName = @"url";
	
	// NSString * htmlPathString = [[NSBundle mainBundle] resourcePath];
	NSString * urlPathString;
	
	NSBundle * thisBundle = [NSBundle bundleForClass:[self class]];
	
	/*
	 
	 // OFF-LINE related code. (Still in testing.
	if (urlPathString = [thisBundle pathForResource:htmlFileName	ofType:@"html"]){
		NSString * test = [NSString stringWithContentsOfFile:urlPathString];
		//NSString * test;
		//test = @"<h1>Hello World</h1>";

		test = [webView stringByEvaluatingJavaScriptFromString:test];
		[webView loadHTMLString:test baseURL:nil];
	 
	}
	*/
	
	
	if (urlPathString = [thisBundle pathForResource:urlFileName	ofType:@"txt"]){

		NSString * theURLString = [NSString stringWithContentsOfFile:urlPathString];
		NSURL * anURL = [NSURL URLWithString:theURLString];
		NSURLRequest * aRequest = [NSURLRequest requestWithURL:anURL];
		[webView loadRequest:aRequest];
	}
	
	
	[window makeKeyAndVisible];
}

//when web application loads pass it device information
- (void)webViewDidStartLoad:(UIWebView *)webViewLocal {
	[webViewLocal stringByEvaluatingJavaScriptFromString:[[Device alloc] init]];
}

- (BOOL)webView:(UIWebView *)webView2 shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType {
	NSString * myURL = [[request URL] absoluteString];
	NSLog(myURL);
	NSString * jsCallBack = nil;
	NSArray * parts = [myURL componentsSeparatedByString:@":"];

	NSLog([self.lastKnownLocation description]);
	double lat = lastKnownLocation.coordinate.latitude;
	double lon = lastKnownLocation.coordinate.longitude;
	
	if (2 == [parts count] || 3 == [parts count]){
		NSLog([parts objectAtIndex:0]);
		NSLog([parts objectAtIndex:1]);
		
		if ([(NSString *)[parts objectAtIndex:0] isEqualToString:@"gap"]){
			
			//LOCATION
			if([(NSString *)[parts objectAtIndex:1] isEqualToString:@"getloc"]){
				NSLog(@"location request!");

				jsCallBack = [[NSString alloc] initWithFormat:@"gotLocation('%f','%f');", lat, lon];
				NSLog(jsCallBack);
				[webView2 stringByEvaluatingJavaScriptFromString:jsCallBack];
				
				[jsCallBack release];
			}

            else if([(NSString *)[parts objectAtIndex:1] isEqualToString:@"getphoto"]){
				NSLog(@"Photo request!");
				NSLog([parts objectAtIndex:2]);
                
				webView.hidden = YES;
                [window bringSubviewToFront:imagePickerController.view];
				NSLog(@"photo dialog open now!");
            }
			
			//VIBRATION
			else if([(NSString *)[parts objectAtIndex:1] isEqualToString:@"vibrate"]){
				Vibrate *vibration = [[Vibrate alloc] init];
				[vibration vibrate];
				[vibration release];
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
	printf("\nUpdating Location to : %s",[[lastKnownLocation description] UTF8String]);  
	
	passPersonalInfo = YES;
	passGeoData = YES;
	
	double lat = lastKnownLocation.coordinate.latitude;
	double lng = lastKnownLocation.coordinate.longitude;
	
}


- (void) accelerometer:(UIAccelerometer *)accelerometer didAccelerate:(UIAcceleration *)acceleration {
	NSString * jsCallBack = nil;
	
	jsCallBack = [[NSString alloc] initWithFormat:@"gotAcceleration('%f','%f','%f');", acceleration.x, acceleration.y, acceleration.z];
	//NSLog(jsCallBack);
	
	NSString * ret = [webView stringByEvaluatingJavaScriptFromString:jsCallBack];
	//NSLog(ret);
}

//- (void)imagePickerController:(UIImagePickerController *)picker didFinishPickingImage:(UIImage *)image2 editingInfo:(NSDictionary *)editingInfo
//{
//	
//	[picker dismissModalViewControllerAnimated:YES];
//    imagePickerController.view.hidden = YES;
//	NSLog(@"Photo Picked");
//	NSData * imageData = UIImageJPEGRepresentation(image2, 75);
//	
////	NSURLRequest * systemPost = [self sendPhotoToCallback:imageData];
//    
//	// Dismiss the image selection, hide the picker and show the image view with the picked image
//	//[picker dismissModalViewControllerAnimated:YES];
//	//imagePickerController.view.hidden = YES;
//
//	webView.hidden = NO;
//	[window bringSubviewToFront:webView];
//}

- (void)imagePickerController:(UIImagePickerController *)picker didFinishPickingImage:(UIImage *)image editingInfo:(NSDictionary *)editingInfo
{
    NSLog(@"photo: picked image");
    // NSString * jsCallBack = nil; 
	
	// Dismiss the image selection, hide the picker and show the image view with the picked image
	[picker dismissModalViewControllerAnimated:YES];
    imagePickerController.view.hidden = YES;
	
  	UIDevice * dev = [UIDevice currentDevice];
	NSString *uniqueId = dev.uniqueIdentifier;
    NSData * imageData = UIImageJPEGRepresentation(image, 0.75);	
	//NSData * imageData = UIImagePNGRepresentation(image);	
	// NSString *postLength = [NSString stringWithFormat:@"%d", [imageData length]];	
	NSString *urlString = [@"http://http://phonegap.com/demo/upload.php?" stringByAppendingString:@"uid="];
	urlString = [urlString stringByAppendingString:uniqueId];
	// urlString = [urlString stringByAppendingString:@"&lang=en_US.UTF-8"];
	
	NSMutableURLRequest *request = [[[NSMutableURLRequest alloc] init] autorelease];
	[request setURL:[NSURL URLWithString:urlString]];
	[request setHTTPMethod:@"POST"];
	// [request setValue:postLength forHTTPHeaderField:@"Content-Length"];
    // [request setValue:@"application/" forHTTPHeaderField:@"Content-Length"];
	
	// ---------
	
    
    //Add the header info
	NSString *stringBoundary = [NSString stringWithString:@"0xKhTmLbOuNdArY"];
	NSString *contentType = [NSString stringWithFormat:@"multipart/form-data; boundary=%@",stringBoundary];
	[request addValue:contentType forHTTPHeaderField: @"Content-Type"];
	
	//create the body
	NSMutableData *postBody = [NSMutableData data];
	[postBody appendData:[[NSString stringWithFormat:@"--%@\r\n",stringBoundary] dataUsingEncoding:NSUTF8StringEncoding]];
	
    /*
	 //add key values from the NSDictionary object
	 NSEnumerator *keys = [postKeys keyEnumerator];
	 int i;
	 for (i = 0; i < [postKeys count]; i++) {
	 NSString *tempKey = [keys nextObject];
	 [postBody appendData:[[NSString stringWithFormat:@"Content-Disposition: form-data; name=\"%@\"\r\n\r\n",tempKey] dataUsingEncoding:NSUTF8StringEncoding]];
	 [postBody appendData:[[NSString stringWithFormat:@"%@",[postKeys objectForKey:tempKey]] dataUsingEncoding:NSUTF8StringEncoding]];
	 [postBody appendData:[[NSString stringWithFormat:@"\r\n--%@\r\n",stringBoundary] dataUsingEncoding:NSUTF8StringEncoding]];
	 }
	 */
	
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
		//receivedData = [[NSMutableData data] retain];
		//NSString *output = [NSString stringWithCString:[conn bytes] length:[conn length]];  
		//NSLog(@"Page = %@", output);
	} else {
        NSLog(@"photo: upload failed!");
    }
	
    // Remove the picker interface and release the picker object.
    /*
	 [[picker parentViewController] dismissModalViewControllerAnimated:YES];
	 [picker release];
	 */
	
	webView.hidden = NO;
	[window bringSubviewToFront:webView];
}

/*
- (BOOL)sendPhotoToCallback:(NSData *)imageData {
	NSLog(@"IN SEND");
	
	if (!imageData) return NO;
	
	
	//Create dictionary of post arguments
	NSArray *keys = [[NSArray alloc] initWithObjects:@"email"];
	NSArray *objects = [[NSArray alloc] initWithObjects:
						[NSString stringWithFormat:@"%@",CFPreferencesCopyAppValue(CFSTR("TumblrEmail"), kCFPreferencesCurrentApplication)]];
	NSDictionary *keysDict = [[NSDictionary alloc] initWithObjects:objects forKeys:keys];
	
	NSURLRequest *callBackPost = [self createCallBackRequest:keysDict withData:imageData];
	
	//send request, return YES if successful
	callBackConnection = [[NSURLConnection alloc] initWithRequest:callBackPost delegate:self];
	if (!callBackConnection) {
		NSLog(@"Failed to submit request");
		return NO;
	} else {
		NSLog(@"Request submitted");
		NSMutableData *receivedData = [[NSMutableData data] retain];
		return YES;
	}
}


-(NSURLRequest *)createCallBackRequest:(NSDictionary *)postKeys withData:(NSData *)data {
	NSLog(@"IN Create Request");
	
	//create the URL POST Request to tumblr
	NSURL *callbackURL = [NSURL URLWithString:@"http://phonegap.com/demo/upload.php"];
	NSMutableURLRequest *callbackPost = [NSMutableURLRequest requestWithURL:callbackURL];
	[callbackPost setHTTPMethod:@"POST"];
	
	//Add the header info
	NSString *stringBoundary = [NSString stringWithString:@"0xKhTmLbOuNdArY"];
	NSString *contentType = [NSString stringWithFormat:@"multipart/form-data; boundary=%@",stringBoundary];
	[callbackPost addValue:contentType forHTTPHeaderField: @"Content-Type"];
	
	//create the body
	NSMutableData *postBody = [NSMutableData data];
	[postBody appendData:[[NSString stringWithFormat:@"--%@\r\n",stringBoundary] dataUsingEncoding:NSUTF8StringEncoding]];
	
	//add key values from the NSDictionary object
	NSEnumerator *keys = [postKeys keyEnumerator];
	int i;
	for (i = 0; i < [postKeys count]; i++) {
		NSString *tempKey = [keys nextObject];
		[postBody appendData:[[NSString stringWithFormat:@"Content-Disposition: form-data; name=\"%@\"\r\n\r\n",tempKey] dataUsingEncoding:NSUTF8StringEncoding]];
		[postBody appendData:[[NSString stringWithFormat:@"%@",[postKeys objectForKey:tempKey]] dataUsingEncoding:NSUTF8StringEncoding]];
		[postBody appendData:[[NSString stringWithFormat:@"\r\n--%@\r\n",stringBoundary] dataUsingEncoding:NSUTF8StringEncoding]];
	}
	
	//add data field and file data
	[postBody appendData:[[NSString stringWithString:@"Content-Disposition: form-data; name=\"data\"\r\n"] dataUsingEncoding:NSUTF8StringEncoding]];
	[postBody appendData:[[NSString stringWithString:@"Content-Type: application/octet-stream\r\n\r\n"] dataUsingEncoding:NSUTF8StringEncoding]];
	[postBody appendData:[NSData dataWithData:data]];
	[postBody appendData:[[NSString stringWithFormat:@"\r\n--%@--\r\n",stringBoundary] dataUsingEncoding:NSUTF8StringEncoding]];
	
	//add the body to the post
	[callbackPost setHTTPBody:postBody];
	
	return callbackPost;
		
}
*/
 
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

- (void)dealloc {
    [viewController release];
	[window release];
	[lastKnownLocation release];
	[imagePickerController release];
	[super dealloc];
}


@end
