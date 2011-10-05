/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 */


#import "PGMotion.h"

@implementation PGMotion

@synthesize deviceMotionAvailable, deviceOrientationAvailable;

- (void) startDeviceMotionEvents
{
	// TODO: all iOS devices have accelerometers. Barring a way to detect if any listeners are bound,
	// we will have to flood the UIWebView with these events
	// If !isDeviceMotionAvailable, we pump out the events
}

- (void) startDeviceOrientationEvents
{
	// TODO: currently only iPhone 4 has support for gyro. We would only need to fill in support for iOS 4.0 and 4.1 
	// (since the DeviceOrientationEvent is supported in in 4.2 for UIWebView)
	// If gyro is available (see CMMotionManagerin CoreMotion.framework) AND !isDeviceOrientationAvailable, we pump out the events
}

- (PGPlugin*) initWithWebView:(UIWebView*)theWebView
{
    self = (PGMotion*)[super initWithWebView:theWebView];
    if (self) {
		// this class has to be created somewhere for it to pump out events,
		// perhaps in the AppDelegate
		if (self.isDeviceMotionAvailable) {
			[self startDeviceMotionEvents];
		}
		if (self.isDeviceOrientationAvailable) {
			[self startDeviceOrientationEvents];
		}
    }
    return self;
}

- (BOOL) deviceMotionAvailable
{
	NSString* js = @"window.DeviceMotionEvent != undefined";
	NSString* result = [self.webView stringByEvaluatingJavaScriptFromString:js];
	
	return [result isEqualToString:@"true"];
}

- (BOOL) deviceOrientationAvailable
{
	NSString* js = @"window.DeviceOrientationEvent != undefined";
	NSString* result = [self.webView stringByEvaluatingJavaScriptFromString:js];
	
	return [result isEqualToString:@"true"];
}

- (void)dealloc
{
    [super dealloc];
}

@end
