/*
 *  Sound.h
 *
 *  Created by Nitobi on 12/12/08.
 *  Copyright 2008 Nitobi. All rights reserved.
 *
 */

#import <Foundation/Foundation.h>
#import <AudioToolbox/AudioServices.h>
#import <AVFoundation/AVFoundation.h>

#import "PhoneGapCommand.h"

@interface AudioFile : NSObject
{
	NSString* successCallback;
	NSString* errorCallback;
	NSString* resourcePath;
	AVAudioPlayer *player;
}

@property (nonatomic, copy) NSString* resourcePath;
@property (nonatomic, copy) NSString* successCallback;
@property (nonatomic, copy) NSString* errorCallback;
@property (nonatomic, retain) AVAudioPlayer* player;

@end

@interface Sound : PhoneGapCommand <AVAudioPlayerDelegate>
{
	NSMutableDictionary* soundCache;
}

- (void) play:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) stop:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (NSURL*) urlForResource:(NSString*)resourcePath;
- (AudioFile*) audioFileForResource:(NSString*) resourcePath;

@end
