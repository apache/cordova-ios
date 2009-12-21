//
//  Network.m
//  PhoneGap
//
//  Created by Shazron Abdullah on 29/07/09.
//  Copyright 2009 Nitobi Inc. All rights reserved.
//

#import "Network.h"
#import "Reachability.h"
#import "Categories.h"

@implementation Network

- (void) isReachable:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	NSUInteger argc = [arguments count];
	NSString* hostName = nil, *callback = nil;
	
	if (argc > 0) hostName = [arguments objectAtIndex:0];
	if (argc > 1) callback = [arguments objectAtIndex:1];
	
	if (argc < 1) {
		NSLog(@"Network.startReachability: Missing 1st argument (hostName).");
		return;
	}
	
	if ([options existsValue:@"true" forKey:@"isIpAddress"]) {
		[[Reachability sharedReachability] setAddress:hostName];
	} else {
		[[Reachability sharedReachability] setHostName:hostName];
	}
	
	//[[Reachability sharedReachability] setNetworkStatusNotificationsEnabled:YES];
	[self updateReachability:callback];
    
    //[[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(reachabilityChanged:) name:@"kNetworkReachabilityChangedNotification" object:nil];
}

- (void)reachabilityChanged:(NSNotification *)note
{
    [self updateReachability:nil];
}

- (void)updateReachability:(NSString*)callback
{
	NSString* jsCallback = @"navigator.network.updateReachability";
	if (callback)
		jsCallback = callback;
	
	NSString* status = [[NSString alloc] initWithFormat:@"%@({ hostName: '%@', ipAddress: '%@', remoteHostStatus: %d, internetConnectionStatus: %d, localWiFiConnectionStatus: %d  });", 
						jsCallback,
						[[Reachability sharedReachability] hostName],
						[[Reachability sharedReachability] address],
					   [[Reachability sharedReachability] remoteHostStatus],
					   [[Reachability sharedReachability] internetConnectionStatus],
					   [[Reachability sharedReachability] localWiFiConnectionStatus]];
	
	
    [webView stringByEvaluatingJavaScriptFromString:status];
	[status release];
}

@end
