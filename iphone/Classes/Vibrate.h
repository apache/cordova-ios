/*
 *  Vibrate.h
 *
 *  Created by Nitobi on 12/12/08.
 *  Copyright 2008 Nitobi. All rights reserved.
 *
 */

#import <UIKit/UIKit.h>
#import <AudioToolbox/AudioServices.h>
#import "PhoneGapCommand.h"

@interface Vibrate : PhoneGapCommand {	
}

- (void)vibrate:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;

@end
