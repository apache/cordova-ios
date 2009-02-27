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
 *  - gap enabled
 *  - version
 *  - Device model
 *  - Device Version
 *  - Device UUID
 */
- (NSString *)init{
	
	myCurrentDevice = [UIDevice currentDevice];
//	
//	return jsCallBack = [[NSString alloc] initWithFormat:@"\
//				  __gap = true; \
//				  __gap_version='0.2'; \
//				  __gap_device_model='%s'; \
//				  __gap_device_version='%s';\
//				  __gap_device_uniqueid='%s';",
//				  [[myCurrentDevice model] UTF8String],
//				  [[myCurrentDevice systemVersion] UTF8String],
//				  [[myCurrentDevice uniqueIdentifier] UTF8String]
//				  ];
	

	return  [[NSString alloc] initWithFormat:@"Device={};Device.platform='%s';Device.version='%s';Device.uuid='%s';",[[myCurrentDevice model] UTF8String], [[myCurrentDevice systemVersion] UTF8String], [[myCurrentDevice uniqueIdentifier] UTF8String] ];
}

- (void)dealloc {
	[myCurrentDevice release];
	[super dealloc];

}

@end