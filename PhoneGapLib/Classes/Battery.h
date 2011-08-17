/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2011, IBM Corporation
 */

#import <Foundation/Foundation.h>
#import "PGPlugin.h"


@interface PGBattery : PGPlugin {
	UIDeviceBatteryState state;
    float level; 
	NSString* callbackId;
}

@property (nonatomic) UIDeviceBatteryState state;
@property (nonatomic) float level;
@property (retain) NSString* callbackId;

- (void) updateBatteryStatus:(NSNotification*)notification;
- (NSDictionary*) getBatteryStatus;
- (void) start:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) stop:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void)dealloc;
@end
