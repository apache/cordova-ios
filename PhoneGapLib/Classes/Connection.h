/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 */

#import <Foundation/Foundation.h>
#import "PGPlugin.h"
#import "Reachability.h"
#import <CoreTelephony/CTTelephonyNetworkInfo.h>
#import <CoreTelephony/CTCarrier.h>


/* W3C Network API http://dev.w3.org/2009/dap/netinfo/ */
typedef enum {
	ConnectionTypeUnknown = 0,
	ConnectionTypeEthernet = 1,
	ConnectionTypeWiFi = 2,
	ConnectionTypeCell2G = 3,
	ConnectionTypeCell3G = 4,
	ConnectionTypeCell4G = 5,
	ConnectionTypeNone = 20
} w3cConnectionType;


@interface Connection : PGPlugin {
	w3cConnectionType type;
	NSString* homeNW;
	NSString* currentNW;
	
	Reachability* internetReach;
	CTTelephonyNetworkInfo* networkInfo;
}

@property (assign) w3cConnectionType type;
@property (copy) NSString* homeNW;
@property (copy) NSString* currentNW;
@property (retain) Reachability* internetReach;
@property (retain) CTTelephonyNetworkInfo* networkInfo;

@end
