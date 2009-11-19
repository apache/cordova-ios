//
//  Network.h
//  PhoneGap
//
//  Created by Shazron Abdullah on 29/07/09.
//  Copyright 2009 Nitobi Inc. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "PhoneGapCommand.h"

@class Reachability;

@interface Network : PhoneGapCommand {
		
}

- (void) isReachable:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;

- (void) reachabilityChanged:(NSNotification *)note;
- (void) updateReachability:(NSString*)callback;

@end
