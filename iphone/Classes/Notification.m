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
		loadingView = [LoadingView loadingViewInView:[super appViewController].view];

		NSString* durationKey = @"durationInSeconds";
		if ([options valueForKey:durationKey])
		{
			// 1 hour max? :)
			NSTimeInterval durationValue = [options integerValueForKey:durationKey defaultValue:1 withRange:NSMakeRange(1,3600)];
			[self performSelector:@selector(loadingStop:withDict:) withObject:nil afterDelay:durationValue];
		}
	}
}

- (void)loadingStop:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	if (loadingView != nil) 
	{
		NSLog(@"Loading stop");

		[loadingView removeView]; // the superview will release (see removeView doc), so no worries for below
		loadingView = nil;
	}
}

@end
