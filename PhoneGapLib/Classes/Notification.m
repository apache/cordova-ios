//
//  Notification.m
//  PhoneGap
//
//  Created by Michael Nachbaur on 16/04/09.
//  Copyright 2009 Decaf Ninja Software. All rights reserved.
//

#import "Notification.h"
#import "Categories.h"


@implementation PGNotification


- (void)alert:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	NSString* callbackId = [arguments objectAtIndex:0];
	NSString* message = [arguments objectAtIndex:1];
	NSString* title   = [options objectForKey:@"title"];
	NSString* button  = [options objectForKey:@"buttonLabel"];
	
	if (!title)
        title = @"Alert";
	if (!button)
        button = @"OK";
	
	PGAlertView *alertView = [[PGAlertView alloc]
							  initWithTitle:title
							  message:message 
							  delegate:self 
							  cancelButtonTitle:nil 
							  otherButtonTitles:nil];
	
	[alertView setCallbackId:callbackId];
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
	NSString* callbackId = [arguments objectAtIndex:0];
	NSString* message = [arguments objectAtIndex:1];
	NSString* title   = [options objectForKey:@"title"];
	NSString* button  = [options objectForKey:@"buttonLabel"];
    
    if (!title)
        title = @"Alert";
    if (!button)
        button = @"OK";
    
	PGAlertView *openURLAlert = [[PGAlertView alloc]
								 initWithTitle:title
								 message:message delegate:self cancelButtonTitle:button otherButtonTitles:nil];
	[openURLAlert setCallbackId: callbackId];
	[openURLAlert show];
	[openURLAlert release];
}

/**
 Callback invoked when an alert dialog's buttons are clicked.   
 Passes the index + label back to JS
 */

- (void)alertView:(UIAlertView *)alertView clickedButtonAtIndex:(NSInteger)buttonIndex
{
    //NSString *buttonLabel = [alertView buttonTitleAtIndex:buttonIndex];
	
	PGAlertView* pgAlertView = (PGAlertView*) alertView;
	PluginResult* result = [PluginResult resultWithStatus: PGCommandStatus_OK messageAsInt: ++buttonIndex]; 
	[self writeJavascript:[result toSuccessCallbackString: [pgAlertView callbackId]]];
	//NSString * jsCallBack = [NSString stringWithFormat:@"navigator.notification._alertCallback(%d,\"%@\");", ++buttonIndex, buttonLabel];    
    //[webView stringByEvaluatingJavaScriptFromString:jsCallBack];
}
 
- (void)vibrate:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	AudioServicesPlaySystemSound(kSystemSoundID_Vibrate);
}

@end

@implementation PGAlertView
@synthesize callbackId;

- (void) dealloc
{
	if (callbackId) {
		[callbackId release];
	}
	
	
	[super dealloc];
}
@end