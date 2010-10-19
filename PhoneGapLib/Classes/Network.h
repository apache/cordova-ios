/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 */

#import <Foundation/Foundation.h>
#import "PhoneGapCommand.h"

@class Reachability;

@interface Network : PhoneGapCommand {
		
}

- (void) isReachable:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;

- (void) reachabilityChanged:(NSNotification *)note;
- (void) updateReachability:(NSString*)callback;

@end
