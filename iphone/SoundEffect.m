//
//  soundEffect.m
//  Glass
//
//  Created by Nitobi on 12/12/08.
//  Copyright 2008 Nitobi. All rights reserved.
//

#import "SoundEffect.h"


@implementation SoundEffect

- (id)initWithContentsOfFile:(NSString *)path
{
	self = [super init];
	if (self != nil) {
		NSURL *filePath = [NSURL fileURLWithPath:path isDirectory:NO];
		AudioServicesCreateSystemSoundID((CFURLRef)filePath, &soundID);
	}
	return self;
}

- (void)play {
	AudioServicesPlaySystemSound(soundID);
}

@end
