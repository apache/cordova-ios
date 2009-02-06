/*
 *  Vibrate.m
 *
 *  Created by Nitobi on 12/12/08.
 *  Copyright 2008 Nitobi. All rights reserved.
 *
 */

#import "Vibrate.h"


@implementation Vibrate

- (id)init{
	return self;
}

- (void)vibrate{
	AudioServicesPlaySystemSound(kSystemSoundID_Vibrate);
}

- (void)dealloc {
	[super dealloc];
}

@end
