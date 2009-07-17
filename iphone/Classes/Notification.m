//
//  Notification.m
//  PhoneGap
//
//  Created by Michael Nachbaur on 16/04/09.
//  Copyright 2009 Decaf Ninja Software. All rights reserved.
//

#import "Notification.h"
#import "Categories.h"

@implementation Notification

- (void)alert:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	NSString* message = [arguments objectAtIndex:0];
	NSString* title   = [options objectForKey:@"title"];
	NSString* button  = [options objectForKey:@"buttonLabel"];
    
    if (!title)
        title = @"Alert";
    if (!button)
        button = @"OK";
    
	UIAlertView *openURLAlert = [[UIAlertView alloc]
								 initWithTitle:title
								 message:message delegate:nil cancelButtonTitle:button otherButtonTitles:nil];
	[openURLAlert show];
	[openURLAlert release];
}

- (void)prompt:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	NSString* message = [arguments objectAtIndex:0];
	NSString* title   = [options objectForKey:@"title"];
	NSString* button  = [options objectForKey:@"buttonLabel"];
    
    if (!title)
        title = @"Alert";
    if (!button)
        button = @"OK";
    
	UIAlertView *openURLAlert = [[UIAlertView alloc]
								 initWithTitle:title
								 message:message delegate:nil cancelButtonTitle:button otherButtonTitles:nil];
	[openURLAlert show];
	[openURLAlert release];
}

- (void)activityStart:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
    //[(UIActivityIndicatorView*)[self.webView.window viewWithTag:2] startAnimating];
    NSLog(@"Activity starting");
    UIApplication* app = [UIApplication sharedApplication];
    app.networkActivityIndicatorVisible = YES;
}

- (void)activityStop:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
    //[(UIActivityIndicatorView*)[self.webView.window viewWithTag:2] stopAnimating];

    NSLog(@"Activitiy stopping ");
    UIApplication* app = [UIApplication sharedApplication];
    app.networkActivityIndicatorVisible = NO;
}

- (void)vibrate:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	AudioServicesPlaySystemSound(kSystemSoundID_Vibrate);
}

- (void)loadingStart:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	if (loadingView == nil) 
	{
		NSLog(@"Loading start");
		UIViewController* c = [super appViewController];
		loadingView = [LoadingView loadingViewInView:c.view];

		NSRange minMaxDuration = NSMakeRange(2, 3600);// 1 hour max? :)
		NSString* durationKey = @"duration";
		// the view will be shown for a minimum of this value if durationKey is not set
		loadingView.minDuration = [options integerValueForKey:@"minDuration" defaultValue:minMaxDuration.location withRange:minMaxDuration];
		
		// if there's a duration set, we set a timer to close the view
		if ([options valueForKey:durationKey]) {
			NSTimeInterval duration = [options integerValueForKey:durationKey defaultValue:minMaxDuration.location withRange:minMaxDuration];
			[self performSelector:@selector(loadingStop:withDict:) withObject:nil afterDelay:duration];
		}
	}
}

- (void)loadingStop:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	if (loadingView != nil) 
	{
		NSLog(@"Loading stop");
		NSTimeInterval diff = [[NSDate date] timeIntervalSinceDate:loadingView.timestamp] - loadingView.minDuration;
		
		if (diff >= 0) {
			[loadingView removeView]; // the superview will release (see removeView doc), so no worries for below
			loadingView = nil;
		} else {
			[self performSelector:@selector(loadingStop:withDict:) withObject:nil afterDelay:-1*diff];
		}
	}
}

@end
