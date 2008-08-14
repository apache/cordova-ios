//
//  GlassAppDelegate.m
//  Glass
//
//  Created by Eric Oesterle on 8/2/08.
//  Copyright InPlace 2008. All rights reserved.
//

#import "GlassAppDelegate.h"
#import "GlassViewController.h"
#import <AudioToolbox/AudioServices.h>
#import <UIKit/UIDevice.h>

@implementation GlassAppDelegate

@synthesize window;
@synthesize viewController;
@synthesize	passPersonalInfo;
@synthesize passGeoData;

@synthesize lastKnownLocation;
@synthesize image;


- (void)applicationDidFinishLaunching:(UIApplication *)application {
	
	locationManager = [[CLLocationManager alloc] init];
	locationManager.delegate = self;
	[locationManager startUpdatingLocation];
	
    // Set up the image picker controller and add it to the view
	imagePickerController = [[UIImagePickerController alloc] init];
	imagePickerController.sourceType = UIImagePickerControllerSourceTypePhotoLibrary;
    [window addSubview:imagePickerController.view];
	
	
	[[UIAccelerometer sharedAccelerometer] setUpdateInterval:1.0/40.0];
	[[UIAccelerometer sharedAccelerometer] setDelegate:self];
	
	// Override point for customization after app launch	
    [window addSubview:viewController.view];
	webView.delegate = self;
	// [webView loadRequest:[NSURLRequest requestWithURL:[NSURL URLWithString:@"http://google.com"]]];
	
	
	NSString * htmlFileName;
	NSString * urlFileName;
	
	htmlFileName = @"index";
	urlFileName = @"url";
	
	// NSString * htmlPathString = [[NSBundle mainBundle] resourcePath];
	NSString * urlPathString;
	
	NSBundle * thisBundle = [NSBundle bundleForClass:[self class]];
	
	if (urlPathString = [thisBundle pathForResource:htmlFileName	ofType:@"html"]){
		NSString * test = [NSString stringWithContentsOfFile:urlPathString];
		//NSString * test;
		//test = @"<h1>Hello World</h1>";

		[webView loadHTMLString:test baseURL:nil];
	 
	}
	
	/*
	else if (urlPathString = [thisBundle pathForResource:urlFileName	ofType:@"txt"]){
		NSString * theURLString = [NSString stringWithContentsOfFile:urlPathString];
		NSURL * anURL = [NSURL URLWithString:theURLString];
		NSURLRequest * aRequest = [NSURLRequest requestWithURL:anURL];
		
		[webView loadRequest:aRequest];
	}
	
	*/
	[window makeKeyAndVisible];
}

- (void)webViewDidStartLoad:(UIWebView *)webViewLocal {
	NSLog(@"Page loaded");
	NSString *jsCallBack = nil;
	jsCallBack = [[NSString alloc] initWithFormat:@"\
				  __gap = true; \
				  __gap_version='0.1'; \
				  __gap_device_model='%s'; \
				  __gap_device_version='%s';",
				  [[[UIDevice currentDevice] model] UTF8String],
				  [[[UIDevice currentDevice] systemVersion] UTF8String]
				  ];
	NSLog(jsCallBack);
	[webViewLocal stringByEvaluatingJavaScriptFromString:jsCallBack];
	[jsCallBack release];
	
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
			if([(NSString *)[parts objectAtIndex:1] isEqualToString:@"getloc"]){
				NSLog(@"location request!");

				jsCallBack = [[NSString alloc] initWithFormat:@"gotLocation('%f','%f');", lat, lon];
				[webView2 stringByEvaluatingJavaScriptFromString:jsCallBack];
				
				[jsCallBack release];
			}
			else if([(NSString *)[parts objectAtIndex:1] isEqualToString:@"vibrate"]){
				NSLog(@"Vibrate request!");
				AudioServicesPlaySystemSound(kSystemSoundID_Vibrate);
				
				[jsCallBack release];
			}
            else if([(NSString *)[parts objectAtIndex:1] isEqualToString:@"getphoto"]){
				NSLog(@"photo request!");
				NSLog([parts objectAtIndex:2]);
                
                // webView.hidden = YES;
                [window bringSubviewToFront:imagePickerController.view];
				NSLog(@"photo dialog open now!");
            }
			
			
			return NO;
		}
			
	}
	
	return YES;
}

- (void) accelerometer:(UIAccelerometer *)accelerometer didAccelerate:(UIAcceleration *)acceleration {
	NSString * jsCallBack = nil;
	
	jsCallBack = [[NSString alloc] initWithFormat:@"gotAcceleration('%f','%f','%f');", acceleration.x, acceleration.y, acceleration.z];
	NSLog(jsCallBack);
	
	NSString * ret = [webView stringByEvaluatingJavaScriptFromString:jsCallBack];
	NSLog(ret);
}



- (void)imagePickerController:(UIImagePickerController *)picker didFinishPickingImage:(UIImage *)image editingInfo:(NSDictionary *)editingInfo
{
    
	// Dismiss the image selection, hide the picker and show the image view with the picked image
	[picker dismissModalViewControllerAnimated:YES];
	imagePickerController.view.hidden = YES;
	
  	UIDevice * dev = [UIDevice currentDevice];
	NSString *uniqueId = dev.uniqueIdentifier;
	
	//UIImage *testImage = [UIImage imageNamed:@"image1.png"];
	

	
    NSData * imageData = UIImageJPEGRepresentation(image, 75);
	
	//NSData * imageData = UIImagePNGRepresentation(image);
	
	NSString *postLength = [NSString stringWithFormat:@"%d", [imageData length]];
	
	NSString *urlString = [@"http://phonegap.com/demo/upload.php?" stringByAppendingString:@"ve=iPhoneV0&mcid"];
	urlString = [urlString stringByAppendingString:uniqueId];
	urlString = [urlString stringByAppendingString:@"&lang=en_US.UTF-8"];
	
	NSMutableURLRequest *request = [[[NSMutableURLRequest alloc] init] autorelease];
	[request setURL:[NSURL URLWithString:urlString]];
	[request setHTTPMethod:@"POST"];
	[request setValue:postLength forHTTPHeaderField:@"Content-Length"];
	[request setHTTPBody:imageData];
	
	NSURLConnection *conn=[[NSURLConnection alloc] initWithRequest:request delegate:self];
	if (conn)
	{
		NSLog(@"Sucess");	
		//receivedData = [[NSMutableData data] retain];
	}   

	webView.hidden = NO;
	[window bringSubviewToFront:webView];
}

 
- (void)imagePickerControllerDidCancel:(UIImagePickerController *)picker
{
	// Dismiss the image selection and close the program
	[picker dismissModalViewControllerAnimated:YES];
	image = nil;
}

- (void)dealloc {
    [viewController release];
	[window release];
	[lastKnownLocation release];
	[imagePickerController release];
	[super dealloc];
}


@end
