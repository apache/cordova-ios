/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 */


#import "Network.h"
#import "Reachability.h"
#import "Categories.h"

@implementation PGNetwork


-(PGPlugin*) initWithWebView:(UIWebView*)theWebView
{
    self = (PGNetwork*)[super initWithWebView:(UIWebView*)theWebView];
    if (self) {
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
		NSLog(@"Network.isReachable: Missing 1st argument (hostName).");
		return;
	}
	
	Reachability* hostReach = [[Reachability reachabilityWithHostName:hostName] retain];
	NetworkStatus code = [hostReach currentReachabilityStatus];
    BOOL connectionRequired = [hostReach connectionRequired];
	
	NSString* message = @"";
	switch(code)
	{
        case NotReachable:
        {
            message = NSLocalizedString(@"Access Not Available", @"Access Not Available");
            //Minor interface detail- connectionRequired may return yes, even when the host is unreachable.  We cover that up here...
            connectionRequired= NO;  
            break;
        }
        case ReachableViaWWAN:
        {
            message = NSLocalizedString(@"Reachable WWAN", @"Reachable WWAN");
            break;
        }
        case ReachableViaWiFi:
        {
			message = NSLocalizedString(@"Reachable WiFi", @"Reachable WiFi");
            break;
		}
    }
	
    if(connectionRequired) {
        message = [NSString stringWithFormat: @"%@, Connection Required", message];
    }
	
	/* Note that in Reachability.h (v2.2) lines 52-56, I swapped the values
	 for ReachableViaWiFi (was 1, now 2) and ReachableViaWWAN (was 2, now 1) 
	 to conform to existing PhoneGap API values for backward compatibility reasons. 
	 If a new version is substituted in, those values have to be changed again.
	 */
	NSString* status = [[NSString alloc] initWithFormat:@"%@({ code: %d, message: '%@'});", 
						callback,
						code,
						message];
	
	
    [webView stringByEvaluatingJavaScriptFromString:status];
	[status release];
	[hostReach release];
}

@end
