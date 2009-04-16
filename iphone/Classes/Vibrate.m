/*
 *  Vibrate.m
 *
 *  Created by Nitobi on 12/12/08.
 *  Copyright 2008 Nitobi. All rights reserved.
 *
 */

#import "Vibrate.h"


@implementation Vibrate

- (void)vibrate:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	AudioServicesPlaySystemSound(kSystemSoundID_Vibrate);
}

@end
