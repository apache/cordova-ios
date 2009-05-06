/*
 *  Sound.m
 *
 *  Created by Nitobi on 12/12/08.
 *  Copyright 2008 Nitobi. All rights reserved.
 *
 */

#import "Sound.h"

@implementation Sound

- (void) play:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
    NSBundle * mainBundle = [NSBundle mainBundle];
    NSString* fileName    = [arguments objectAtIndex:0];
    NSString* bundleRoot  = [mainBundle bundlePath];
    NSString *filePath    = [[NSString alloc] initWithFormat:@"%@/%@", bundleRoot, fileName];
    
    if (filePath != nil)
    {
        SystemSoundID soundID;
		NSURL *fileURL = [NSURL fileURLWithPath:filePath isDirectory:NO];
		AudioServicesCreateSystemSoundID((CFURLRef)fileURL, &soundID);
        AudioServicesPlaySystemSound(soundID);
    }
}

@end
