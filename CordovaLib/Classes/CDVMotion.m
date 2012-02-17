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


#import "CDVMotion.h"

@implementation CDVMotion

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

- (CDVPlugin*) initWithWebView:(UIWebView*)theWebView
{
    self = (CDVMotion*)[super initWithWebView:theWebView];
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
