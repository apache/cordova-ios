//
//  Notification.m
//  PhoneGap
//
//  Created by Michael Nachbaur on 16/04/09.
//  Copyright 2009 Decaf Ninja Software. All rights reserved.
//

#import "Notification.h"
#import "Categories.h"
#import "UIColor-Expanded.h"

@implementation Notification

@synthesize loadingView;

- (void)alert:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	NSString* message = [arguments objectAtIndex:0];
	NSString* title   = [options objectForKey:@"title"];
	NSString* button  = [options objectForKey:@"buttonLabel"];
	
	if (!title)
        title = @"Alert";
	if (!button)
        button = @"OK";
	
	UIAlertView *alertView = [[UIAlertView alloc]
							  initWithTitle:title
							  message:message 
							  delegate:self 
							  cancelButtonTitle:nil 
							  otherButtonTitles:nil];
	
	NSArray* labels = [ button componentsSeparatedByString:@","];
	
	int count = [ labels count ];
	
	for(int n = 0; n < count; n++)
	{
		[ alertView addButtonWithTitle:[labels objectAtIndex:n]];
	}
	
	[alertView show];
	[alertView release];
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
								 message:message delegate:self cancelButtonTitle:button otherButtonTitles:nil];
	[openURLAlert show];
	[openURLAlert release];
}

/**
 Callback invoked when an alert dialog's buttons are clicked.   
 Passes the index + label back to JS
 */

- (void)alertView:(UIAlertView *)alertView clickedButtonAtIndex:(NSInteger)buttonIndex
{
    NSString *buttonLabel = [alertView buttonTitleAtIndex:buttonIndex];

	NSString * jsCallBack = [NSString stringWithFormat:@"navigator.notification._alertCallback(%d,\"%@\");", ++buttonIndex, buttonLabel];    
    [webView stringByEvaluatingJavaScriptFromString:jsCallBack];
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
	if (self.loadingView != nil) {
		return;
	}
	
	CGFloat strokeOpacity, backgroundOpacity;
	CGFloat boxLength = [LoadingView defaultBoxLength];
	BOOL fullScreen = YES;
	BOOL bounceAnimation = NO;
	NSString* colorCSSString;
	NSString* labelText;
	
	strokeOpacity = [[options objectForKey:@"strokeOpacity"] floatValue];
	backgroundOpacity = [[options objectForKey:@"backgroundOpacity"] floatValue];
	
	id fullScreenValue = [options objectForKey:@"fullScreen"];
	if (fullScreenValue != nil)
	{
		fullScreen = [fullScreenValue boolValue];
		if (!fullScreen) { // here we take into account rectSquareLength, if any
			boxLength = fmax(boxLength, [[options objectForKey:@"boxLength"] floatValue]);
		}
	}

	id bounceAnimationValue = [options objectForKey:@"bounceAnimation"];
	if (bounceAnimationValue != nil)
	{
		bounceAnimation = [bounceAnimationValue boolValue];
	}
	
	colorCSSString = [options objectForKey:@"strokeColor"];
	labelText = [options objectForKey:@"labelText"];
	
	if (!labelText) {
		labelText = [LoadingView defaultLabelText];
	}
	
	UIColor* strokeColor = [LoadingView defaultStrokeColor];
	
	if (strokeOpacity <= 0) {
		strokeOpacity = [LoadingView defaultStrokeOpacity];
	} 

	if (backgroundOpacity <= 0) {
		backgroundOpacity = [LoadingView defaultBackgroundOpacity];
	} 
	
	if (colorCSSString) {
		UIColor* tmp = [UIColor colorWithName:colorCSSString];
		if (tmp) {
			strokeColor = tmp;
		} else {
			tmp = [UIColor colorWithHexString:colorCSSString];
			if (tmp) {
				strokeColor = tmp;
			}
		}
	} 
	
	self.loadingView = [LoadingView loadingViewInView:[super appViewController].view strokeOpacity:strokeOpacity 
									backgroundOpacity:backgroundOpacity 
										  strokeColor:strokeColor fullScreen:fullScreen labelText:labelText 
									  bounceAnimation:bounceAnimation boxLength:boxLength];
	
	NSRange minMaxDuration = NSMakeRange(2, 3600);// 1 hour max? :)
	NSString* durationKey = @"duration";
	// the view will be shown for a minimum of this value if durationKey is not set
	self.loadingView.minDuration = [options integerValueForKey:@"minDuration" defaultValue:minMaxDuration.location withRange:minMaxDuration];
	
	// if there's a duration set, we set a timer to close the view
	if ([options valueForKey:durationKey]) {
		NSTimeInterval duration = [options integerValueForKey:durationKey defaultValue:minMaxDuration.location withRange:minMaxDuration];
		[self performSelector:@selector(loadingStop:withDict:) withObject:nil afterDelay:duration];
	}
}

- (void)loadingStop:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	if (self.loadingView != nil) 
	{
		NSLog(@"Loading stop");
		NSTimeInterval diff = [[NSDate date] timeIntervalSinceDate:self.loadingView.timestamp] - self.loadingView.minDuration;
		
		if (diff >= 0) {
			[self.loadingView removeView]; // the superview will release (see removeView doc), so no worries for below
			self.loadingView = nil;
		} else {
			[self performSelector:@selector(loadingStop:withDict:) withObject:nil afterDelay:-1*diff];
		}
	}
}

@end
