//
//  UIControls.m
//  PhoneGap
//
//  Created by Michael Nachbaur on 13/04/09.
//  Copyright 2009 Decaf Ninja Software. All rights reserved.
//

#import "UIControls.h"

@implementation UIControls

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
}

- (void)activityStop:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
    //[(UIActivityIndicatorView*)[self.webView.window viewWithTag:2] stopAnimating];
}

/*
+ (void)createTabBar:(NSArray*)arguments withDict:(NSDictionary*)options
{
    id* controller = [[UITabBar alloc] initWithFrame:(
}
 */

@end
