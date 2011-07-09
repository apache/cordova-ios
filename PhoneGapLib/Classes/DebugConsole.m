//
//  DebugConsole.m
//  PhoneGap
//
//  Created by Michael Nachbaur on 14/03/09.
//  Copyright 2009 Decaf Ninja Software. All rights reserved.
//

#import "DebugConsole.h"

@implementation PGDebugConsole

- (void)log:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	NSString* callbackId = [arguments objectAtIndex:0];
#pragma unused(callbackId)
    NSString* message = [arguments objectAtIndex:1];
    NSString* log_level = @"INFO";
    if ([options objectForKey:@"logLevel"])
        log_level = [options objectForKey:@"logLevel"];

    NSLog(@"[%@] %@", log_level, message);
}

@end
