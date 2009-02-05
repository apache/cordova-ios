/*
 *  Sound.m
 *
 *  Created by Nitobi on 12/12/08.
 *  Copyright 2008 Nitobi. All rights reserved.
 *
 */

#import "Sound.h"


@implementation Sound

- (id) initWithContentsOfFile:(NSString *)path
{
	self = [super init];
	if (self != nil) {
		NSURL *filePath = [NSURL fileURLWithPath:path isDirectory:NO];
		AudioServicesCreateSystemSoundID((CFURLRef)filePath, &soundID);
	}
	return self;
}

/*
 * play - Plays the sound
 */ 
- (void) play {
	AudioServicesPlaySystemSound(soundID);
}

- (void) dealloc {
	[super dealloc];
}
@end
