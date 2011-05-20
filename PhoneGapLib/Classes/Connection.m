/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 */


#import "Connection.h"
#import "Reachability.h"

@implementation Connection

@synthesize type, homeNW, currentNW, internetReach, networkInfo;

- (w3cConnectionType) w3cConnectionTypeFor:(Reachability*)reachability
{
	NetworkStatus networkStatus = [reachability currentReachabilityStatus];
	switch(networkStatus)
	{
        case NotReachable:
			return ConnectionTypeUnknown;
        case ReachableViaWWAN:
			return ConnectionTypeCell2G; // no generic default, so we use the lowest common denominator
        case ReachableViaWiFi:
			return ConnectionTypeWiFi;
		default:
			return ConnectionTypeNone;
    }
}

- (BOOL) isCellularConnection:(w3cConnectionType)connectionType
{
	switch(connectionType)
	{
        case ConnectionTypeCell2G:
        case ConnectionTypeCell3G:
        case ConnectionTypeCell4G:
			return YES;
		default:
			return NO;
    }
}

- (void) updateReachability:(Reachability*)reachability withCarrier:(CTCarrier*)carrier
{
	if (carrier) {
		self.currentNW = carrier.carrierName;	
	}
	if (reachability) {
		self.type = [self w3cConnectionTypeFor:reachability];
	}
	
	// if it is not a cellular connection, remove currentNW
	if (![self isCellularConnection:self.type]) {
		self.currentNW = nil;
	} 
	// if it is a cellular connection, restore currentNW
	else {
		self.currentNW = self.networkInfo.subscriberCellularProvider.carrierName;
	}

	NSString* js = nil;
	
	// write the current cellular network
	if (self.currentNW != nil) {
		js = [NSString stringWithFormat:@"navigator.connection.currentNW = '%@';", self.currentNW];
	} else {
		js = @"navigator.connection.currentNW = null;";
	}
	[super writeJavascript:js];
	
	// write the connection type
	js = [NSString stringWithFormat:@"navigator.connection.type = %d;", self.type];
	[super writeJavascript:js];
}

- (void) updateConnectionType:(NSNotification*)note
{
	Reachability* curReach = [note object];
	NSParameterAssert([curReach isKindOfClass:[Reachability class]]);
	
	[self updateReachability:curReach withCarrier:nil];
}

- (void) updateCarrier:(CTCarrier*)carrier
{
	NSParameterAssert([carrier isKindOfClass:[CTCarrier class]]);
	
	[self updateReachability:nil withCarrier:carrier];
}

- (void) prepare
{
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(updateConnectionType:) 
												 name:kReachabilityChangedNotification object:nil];
	
	self.internetReach = [[Reachability reachabilityForInternetConnection] retain];
	[self.internetReach startNotifier];
	self.type = [self w3cConnectionTypeFor:self.internetReach];
	
	Class ctClass = NSClassFromString(@"CTTelephonyNetworkInfo");
	if (ctClass) 
	{
		self.networkInfo = [[CTTelephonyNetworkInfo alloc] init];
		self.currentNW = self.networkInfo.subscriberCellularProvider.carrierName;	
		self.networkInfo.subscriberCellularProviderDidUpdateNotifier = ^(CTCarrier* carrier){
			[self performSelectorOnMainThread:@selector(updateCarrier:) withObject:carrier waitUntilDone:NO];
		};		
	}
	
	// NOTE: homeNW cannot be known with the iOS 4.x API currently.
}

- (PhoneGapCommand*) initWithWebView:(UIWebView*)theWebView
{
    self = (Connection*)[super initWithWebView:theWebView];
    if (self) {
		self.type = ConnectionTypeNone;
		self.networkInfo = nil;
		self.currentNW = nil;
		self.homeNW = nil;
		
		[self prepare];
    }
    return self;
}

- (void)dealloc
{
	self.networkInfo = nil;
	self.internetReach = nil;
	[[NSNotificationCenter defaultCenter] removeObserver:self 
													name:kReachabilityChangedNotification object:nil];

    [super dealloc];
}

@end
