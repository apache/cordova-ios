/*
 *  Sound.m
 *
 *  Created by Nitobi on 12/12/08.
 *  Copyright 2008 Nitobi. All rights reserved.
 *
 */

#import "Sound.h"

@implementation Sound

@synthesize successCallback, errorCallback;

- (void) play:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	if([[arguments objectAtIndex:0] isEqualToString:@""]){
		NSLog(@"Cannot play empty URI");
		return;
	}
	NSUInteger argc = [arguments count];
	
	if (argc > 1) self.successCallback = [arguments objectAtIndex:1];
	if (argc > 2) self.errorCallback = [arguments objectAtIndex:2];

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
#ifdef __IPHONE_3_0
		if ([[arguments objectAtIndex:0] hasPrefix:@"http"]){
	
			if (player != nil)
				[player stop];
					
			NSURL *sampleUrl = [NSURL URLWithString:[arguments objectAtIndex:0]];
			NSData *sampleAudio = [NSData dataWithContentsOfURL:sampleUrl];
			NSError *err;
			player = [[ AVAudioPlayer alloc ] initWithData:sampleAudio error:&err];
			if (err)
				NSLog(@"Failed to initialize AVAudioPlayer: %@\n", err);
			player.delegate = self;
			[ player prepareToPlay ];
			[ player play ];
		}
#endif
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

#ifdef __IPHONE_3_0
/*
 * event listener when file has stopped playing 
 */
- (void)audioPlayerDidFinishPlaying:(AVAudioPlayer *)player successfully:(BOOL)flag {
	NSLog(@"finished playing audio sample");
	
	if (flag){
		if (self.successCallback) {
			NSString* jsString = [[NSString alloc] initWithFormat:@"%@(\"%@\");", self.successCallback, @""];
			[webView stringByEvaluatingJavaScriptFromString:jsString];
			[jsString release];
		}
	} else {
		if (self.errorCallback) {
			NSString* jsString = [[NSString alloc] initWithFormat:@"%@(\"%@\");", self.errorCallback, @""];
			[webView stringByEvaluatingJavaScriptFromString:jsString];
			[jsString release];
		}		
	}
}
#endif

@end
