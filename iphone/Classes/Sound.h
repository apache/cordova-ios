/*
 *  Sound.h
 *
 *  Created by Nitobi on 12/12/08.
 *  Copyright 2008 Nitobi. All rights reserved.
 *
 */

#import <Foundation/Foundation.h>
#import <AudioToolbox/AudioServices.h>
#import "PhoneGapCommand.h"

@interface Sound : PhoneGapCommand {
}

- (void) play:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;

@end
