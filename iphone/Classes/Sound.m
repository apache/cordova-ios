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
    NSMutableArray *directoryParts = [NSMutableArray arrayWithArray:[(NSString*)[arguments objectAtIndex:0] componentsSeparatedByString:@"/"]];
    NSString       *filename       = [directoryParts lastObject];
    [directoryParts removeLastObject];
    
    NSMutableArray *filenameParts  = [NSMutableArray arrayWithArray:[filename componentsSeparatedByString:@"."]];
    NSString *directoryStr = [directoryParts componentsJoinedByString:@"/"];
    
    NSString *filePath = [mainBundle pathForResource:(NSString*)[filenameParts objectAtIndex:0]
                                              ofType:(NSString*)[filenameParts objectAtIndex:1]
                                         inDirectory:directoryStr];
    if (filePath == nil) {
        NSLog(@"Can't find filename %@ in the app bundle", [arguments objectAtIndex:0]);
        return;
    }
    SystemSoundID soundID;
    NSURL *fileURL = [NSURL fileURLWithPath:filePath];
    
    // TODO Create a system facilitating handling callback responses in JavaScript easily, and no
    // longer in an ad-hoc fashion.  Getting error results of whether or not the sound played, or
    // other errors occurring in the system is important.
    OSStatus error;
    error = AudioServicesCreateSystemSoundID((CFURLRef)fileURL, &soundID);
    if (error != 0)
        NSLog(@"Sound error %d", error);
    
    AudioServicesPlaySystemSound(soundID);
}

@end
