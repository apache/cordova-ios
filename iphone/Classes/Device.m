/*
 *  Device.m 
 *  Used to display Device centric details handset.
 *
 *  Created by Nitobi on 12/12/08.
 *  Copyright 2008 Nitobi. All rights reserved.
 */

#import "Device.h"

@implementation Device

/**
 * returns a dictionary with various device settings
 *  - gap (version)
 *  - Device model
 *  - Device version
 *  - Device uuid
 */
- (NSDictionary*) getDeviceProperties
{
	UIDevice *device = [UIDevice currentDevice];
    NSMutableDictionary *devProps = [[NSMutableDictionary dictionaryWithCapacity:4] autorelease];
    [devProps setObject:[device model] forKey:@"platform"];
    [devProps setObject:[device systemVersion] forKey:@"systemVersion"];
    [devProps setObject:[device uniqueIdentifier] forKey:@"uuid"];
    [devProps setObject:[device systemName] forKey:@"systemName"];
    [devProps setObject:[device name] forKey:@"deviceName"];
    return [[NSDictionary dictionaryWithDictionary:devProps] autorelease];
}

@end
