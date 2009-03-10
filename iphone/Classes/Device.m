/*
 *  Device.m 
 *  Used to display Device centric details handset.
 *
 *  Created by Nitobi on 12/12/08.
 *  Copyright 2008 Nitobi. All rights reserved.
 */

#import "Device.h"

@implementation Device

/*
 * init
 * returns a JS String with various device settings
 *  - gap (version)
 *  - Device model
 *  - Device version
 *  - Device uuid
 */
- (NSString *)init{
	
	myCurrentDevice = [UIDevice currentDevice];
	return  [[NSString alloc] initWithFormat:@"Device={};Device.platform='%s';Device.version='%s';Device.uuid='%s';Device.gap=0.7.1",[[myCurrentDevice model] UTF8String], [[myCurrentDevice systemVersion] UTF8String], [[myCurrentDevice uniqueIdentifier] UTF8String] ];
}

- (void)dealloc {
	[myCurrentDevice release];
	[super dealloc];
}

@end