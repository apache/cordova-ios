/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 */


#import <Foundation/Foundation.h>
#import <AudioToolbox/AudioServices.h>
#import <AVFoundation/AVFoundation.h>

#import "PhoneGapCommand.h"

@interface AudioFile : NSObject
{
	NSString* successCallback;
	NSString* errorCallback;
	NSString* downloadCompleteCallback;
	NSString* resourcePath;
	NSURL* resourceURL;
	AVAudioPlayer* player;
#ifdef __IPHONE_3_0
	AVAudioRecorder* recorder;
#endif
}

@property (nonatomic, copy) NSString* resourcePath;
@property (nonatomic, copy) NSURL* resourceURL;
@property (nonatomic, copy) NSString* successCallback;
@property (nonatomic, copy) NSString* errorCallback;
@property (nonatomic, copy) NSString* downloadCompleteCallback;
@property (nonatomic, retain) AVAudioPlayer* player;

#ifdef __IPHONE_3_0
@property (nonatomic, retain) AVAudioRecorder* recorder;
#endif

@end

@interface Sound : PhoneGapCommand 
<AVAudioPlayerDelegate
#ifdef __IPHONE_3_0
, AVAudioRecorderDelegate
#endif
>
{
	NSMutableDictionary* soundCache;
	AudioFile* audFile;
}

- (void) play:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) pause:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) stop:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (NSURL*) urlForResource:(NSString*)resourcePath;
- (AudioFile*) audioFileForResource:(NSString*) resourcePath;

#ifdef __IPHONE_3_0
- (void) startAudioRecord:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) stopAudioRecord:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
#endif

@end
