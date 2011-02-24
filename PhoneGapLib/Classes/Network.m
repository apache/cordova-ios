/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 */


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
	
    id isIpAddressObj = [options valueForKey:@"isIpAddress"];
    BOOL isIpAddress = NO;
    if (isIpAddressObj) {
        isIpAddress = [isIpAddressObj boolValue];
    }
    
	if (isIpAddress) {
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
	
	NSString* status = [[NSString alloc] initWithFormat:@"%@(%d);", 
						jsCallback,
					   [[Reachability sharedReachability] internetConnectionStatus]];
	
	
    [webView stringByEvaluatingJavaScriptFromString:status];
	[status release];
}

@end
