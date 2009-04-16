//
//  DebugConsole.m
//  PhoneGap
//
//  Created by Michael Nachbaur on 14/03/09.
//  Copyright 2009 Decaf Ninja Software. All rights reserved.
//

#import "DebugConsole.h"

@implementation DebugConsole

- (void)log:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
    NSString* message = [arguments objectAtIndex:0];
    NSString* log_level = @"INFO";
    if ([options objectForKey:@"logLevel"])
        log_level = [options objectForKey:@"logLevel"];

    NSLog(@"[%@] %@", log_level, message);
}

@end
