/*
 *  Device.m 
 *  Used to display Device centric details handset.
 *
 *  Created by Nitobi on 12/12/08.
 *  Copyright 2008 Nitobi. All rights reserved.
 */

#import "Device.h"

@implementation Device

-(PhoneGapCommand*) initWithWebView:(UIWebView*)theWebView settings:(NSDictionary*)theSettings andViewController:(UIViewController*)theViewController
{
    self = (Device*)[super initWithWebView:(UIWebView*)theWebView settings:theSettings andViewController:theViewController];
    if (self) {
		myCurrentDevice = [UIDevice currentDevice];
    }
	return self;
}

- (void) info:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
{
	NSString* info = [[NSString alloc]
			initWithFormat:@"DeviceInfo={platform:'%s',version:'%s',uuid:'%s',gap:'0.8.0'};",
			[[myCurrentDevice model] UTF8String],
			[[myCurrentDevice systemVersion] UTF8String],
			[[myCurrentDevice uniqueIdentifier] UTF8String]
			];
	
	NSLog(@"%@", info);
    [webView stringByEvaluatingJavaScriptFromString:info];
	[info release];
}

- (void)dealloc {
	[myCurrentDevice release];
	[super dealloc];
}

@end
