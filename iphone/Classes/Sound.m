/*
 *  Sound.m
 *
 *  Created by Nitobi on 12/12/08.
 *  Copyright 2008 Nitobi. All rights reserved.
 *
 */

#import "Sound.h"


@implementation Sound

+ (void) play:(NSString*)options forWebView:(UIWebView*)webView
{
    NSString* fileName = options;
    NSBundle * mainBundle = [NSBundle mainBundle];
    NSArray *soundFile = [fileName componentsSeparatedByString:@"."];
    
    NSString *file = (NSString *)[soundFile objectAtIndex:0];
    NSString *ext = (NSString *)[soundFile objectAtIndex:1];
    NSLog(file);
    NSString* filePath = [mainBundle pathForResource:file ofType:ext];
    if (filePath != nil)
    {
        Sound* sound = [[Sound alloc] initWithContentsOfFile:filePath];
        [sound play];
        [sound release];
    }
}

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
