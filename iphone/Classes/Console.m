//
//  Console.m
//  PhoneGap
//
//  Created by Michael Nachbaur on 14/03/09.
//  Copyright 2009 Decaf Ninja Software. All rights reserved.
//

#import "Console.h"

@implementation Console

+ (void)log:(NSString*)options forWebView:(UIWebView*)webView
{
	NSArray* arguments = [options componentsSeparatedByString:@"/"];
    NSLog(@"[%@] %@", [arguments objectAtIndex:0], [[arguments objectAtIndex:1] stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding]);
}

+ (void)alert:(NSString*)options forWebView:(UIWebView*)webView
{
	NSArray* arguments = [options componentsSeparatedByString:@"/"];
	NSString* message  = [[arguments objectAtIndex:0] stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
	NSString* title    = @"Alert";
	NSString* button   = @"OK";

	if ([arguments count] >= 1)
		title = [[arguments objectAtIndex:1] stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
	if ([arguments count] >= 2)
		button = [[arguments objectAtIndex:2] stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding];

	UIAlertView *openURLAlert = [[UIAlertView alloc]
								 initWithTitle:title
								 message:message delegate:nil cancelButtonTitle:button otherButtonTitles:nil];
	[openURLAlert show];
	[openURLAlert release];
}

+ (void)activityStart:(NSString*)options forWebView:(UIWebView*)webView
{
    [(UIActivityIndicatorView*)[webView.window viewWithTag:2] startAnimating];
}

+ (void)activityStop:(NSString*)options forWebView:(UIWebView*)webView
{
    [(UIActivityIndicatorView*)[webView.window viewWithTag:2] stopAnimating];
}

@end
