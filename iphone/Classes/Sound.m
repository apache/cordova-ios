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
    NSString* fileName = [arguments objectAtIndex:0];
    NSBundle * mainBundle = [NSBundle mainBundle];
    NSArray *soundFile = [fileName componentsSeparatedByString:@"."];
    
    NSString *file = (NSString *)[soundFile objectAtIndex:0];
    NSString *ext = (NSString *)[soundFile objectAtIndex:1];
    NSLog(file);
    NSString* filePath = [mainBundle pathForResource:file ofType:ext];
    
    if (filePath != nil)
    {
        SystemSoundID soundID;
		NSURL *fileURL = [NSURL fileURLWithPath:filePath isDirectory:NO];
		AudioServicesCreateSystemSoundID((CFURLRef)fileURL, &soundID);
        AudioServicesPlaySystemSound(soundID);
    }
}

@end
