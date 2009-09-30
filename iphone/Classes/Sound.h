/*
 *  Sound.h
 *
 *  Created by Nitobi on 12/12/08.
 *  Copyright 2008 Nitobi. All rights reserved.
 *
 */

#import <Foundation/Foundation.h>
#import <AudioToolbox/AudioServices.h>

#ifdef __IPHONE_3_0
#import <AVFoundation/AVFoundation.h>
#endif

#import "PhoneGapCommand.h"

@interface Sound : PhoneGapCommand
#ifdef __IPHONE_3_0
    <AVAudioPlayerDelegate>
#endif
{
	NSString *successCallback;
	NSString *errorCallback;

#ifdef __IPHONE_3_0
	AVAudioPlayer *player;
#endif
}

@property (retain) NSString* successCallback;
@property (retain) NSString* errorCallback;

- (void) play:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;

@end
