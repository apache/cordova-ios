/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 */

#import <Foundation/Foundation.h>
#import "PGPlugin.h"


@interface PGMotion : PGPlugin {
}

@property (readonly, getter=isDeviceMotionAvailable) BOOL deviceMotionAvailable;
@property (readonly, getter=isDeviceOrientationAvailable) BOOL deviceOrientationAvailable;


/* Checks whether the DeviceMotionEvent is available in the UIWebView */
- (BOOL) deviceMotionAvailable; 
/* Checks whether the DeviceOrientationEvent is available in the UIWebView */
- (BOOL) deviceOrientationAvailable; 

@end
