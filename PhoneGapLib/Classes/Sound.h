/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 */


#import <Foundation/Foundation.h>
#import <AudioToolbox/AudioServices.h>
#import <AVFoundation/AVFoundation.h>

#import "PGPlugin.h"




enum MediaError {
	MEDIA_ERR_ABORTED = 1,
	MEDIA_ERR_NETWORK = 2,
	MEDIA_ERR_DECODE = 3,
	MEDIA_ERR_NONE_SUPPORTED = 4
};
typedef NSUInteger MediaError;

enum MediaStates {
	MEDIA_NONE = 0,
	MEDIA_STARTING = 1,
	MEDIA_RUNNING = 2,
	MEDIA_PAUSED = 3,
	MEDIA_STOPPED = 4
};
typedef NSUInteger MediaStates;

enum MediaMsg {
	MEDIA_STATE = 1,
	MEDIA_DURATION = 2,
    MEDIA_POSITION = 3,
	MEDIA_ERROR = 9
};
typedef NSUInteger MediaMsg;

@interface AudioPlayer : AVAudioPlayer
{
	NSString* mediaId;
}
@property (nonatomic,copy) NSString* mediaId;
@end

#ifdef __IPHONE_3_0
@interface AudioRecorder : AVAudioRecorder
{
	NSString* mediaId;
}
@property (nonatomic,copy) NSString* mediaId;
@end
#endif
	
@interface PGAudioFile : NSObject
{
	NSString* resourcePath;
	NSURL* resourceURL;
	AudioPlayer* player;
#ifdef __IPHONE_3_0
	AudioRecorder* recorder;
#endif
}

@property (nonatomic, retain) NSString* resourcePath;
@property (nonatomic, retain) NSURL* resourceURL;
@property (nonatomic, retain) AudioPlayer* player;

#ifdef __IPHONE_3_0
@property (nonatomic, retain) AudioRecorder* recorder;
#endif

@end

@interface PGSound : PGPlugin <AVAudioPlayerDelegate, AVAudioRecorderDelegate>
{
	NSMutableDictionary* soundCache;
    AVAudioSession* avSession;
}
@property (nonatomic, retain) NSMutableDictionary* soundCache;
@property (nonatomic, retain) AVAudioSession* avSession;

- (void) play:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) pause:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) stop:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) release:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) getCurrentPosition:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) prepare:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (BOOL) hasAudioSession;

// helper methods
- (PGAudioFile*) audioFileForResource:(NSString*) resourcePath withId: (NSString*)mediaId;
- (BOOL) prepareToPlay: (PGAudioFile*) audioFile withId: (NSString*)mediaId;
- (NSString*) createMediaErrorWithCode: (MediaError) code message: (NSString*) message;

- (void) startAudioRecord:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) stopAudioRecord:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;

@end
