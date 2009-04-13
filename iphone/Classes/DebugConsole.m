//
//  DebugConsole.m
//  PhoneGap
//
//  Created by Michael Nachbaur on 14/03/09.
//  Copyright 2009 Decaf Ninja Software. All rights reserved.
//

#import "DebugConsole.h"

@implementation DebugConsole

+ (void)log:(NSString*)options forWebView:(UIWebView*)webView
{
	NSArray* arguments = [options componentsSeparatedByString:@"/"];
    NSLog(@"[%@] %@", [arguments objectAtIndex:0], [[arguments objectAtIndex:1] stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding]);
}

@end
