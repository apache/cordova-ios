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


-(PhoneGapCommand*) initWithWebView:(UIWebView*)theWebView
{
    self = (Network*)[super initWithWebView:(UIWebView*)theWebView];
    if (self) 
	{
		[[NSNotificationCenter defaultCenter] addObserver: self selector: @selector(reachabilityChanged:) name: kReachabilityChangedNotification object: nil];
    }
    return self;
}


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
    
	Reachability* hostReach = [[Reachability reachabilityWithHostName:hostName] retain];
	[self updateReachability:hostReach withCallback:callback];
    
    //[[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(reachabilityChanged:) name:@"kNetworkReachabilityChangedNotification" object:nil];
}

- (void)reachabilityChanged:(NSNotification *)note
{
	NSLog(@"Reachability changed.");
	Reachability* curReach = [note object];
	NSParameterAssert([curReach isKindOfClass: [Reachability class]]);
	[self updateReachability:curReach withCallback:nil];
}

- (void)updateReachability:(Reachability*) reachability withCallback:(NSString*)callback
{
	NSString* jsCallback = @"navigator.network.updateReachability";
	if (callback) {
		jsCallback = callback;
	}
	
	/* Note that in Reachability.h (v2.2) lines 52-56, I swapped the values
	 for ReachableViaWiFi (was 1, now 2) and ReachableViaWWAN (was 2, now 1) 
	 to conform to existing PhoneGap API values for backward compatibility reasons. 
	 If a new version is substituted in, those values have to be changed again.
	 */
	NSString* status = [[NSString alloc] initWithFormat:@"%@(%d);", 
						jsCallback,
					   [reachability currentReachabilityStatus]];
	
	
    [webView stringByEvaluatingJavaScriptFromString:status];
	[status release];
	[reachability release];
}

@end
