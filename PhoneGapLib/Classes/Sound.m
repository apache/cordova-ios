/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 */


#import "Sound.h"
#import "PhonegapDelegate.h"

#define DOCUMENTS_SCHEME_PREFIX		@"documents://"
#define HTTP_SCHEME_PREFIX			@"http://"

@implementation PGSound

@synthesize soundCache;
/*
// Maps a url to the original resource path
- (NSString*) resourceForUrl:(NSURL*)url
{
    NSBundle* mainBundle = [NSBundle mainBundle];
	NSString* urlString = [url description];
	NSString* retVal = @"";
	
	NSString* wwwPath = [mainBundle pathForResource:[PhoneGapDelegate wwwFolderName] ofType:@"" inDirectory:@""];
	NSString* wwwUrl = [[NSURL fileURLWithPath:wwwPath] description];
	NSString* documentsUrl = [[NSURL fileURLWithPath:[PhoneGapDelegate applicationDocumentsDirectory]] description];
	
	if ([urlString hasPrefix:wwwUrl]) {
		retVal = [urlString substringFromIndex:[wwwUrl length]];
	} else if ([urlString hasPrefix:HTTP_SCHEME_PREFIX]) {
		retVal = urlString;
	} else if ([urlString hasPrefix:documentsUrl]) {
		retVal = [NSString stringWithFormat:@"%@%@", DOCUMENTS_SCHEME_PREFIX, [urlString substringFromIndex:[documentsUrl length]]];
	} else {
		NSLog(@"Cannot map url '%@' to a resource path.", urlString);
	}

	return retVal;
}
*/ 

// Maps a url for a resource path
// "Naked" resource paths are assumed to be from the www folder as its base
- (NSURL*) urlForResource:(NSString*)resourcePath
{
	NSURL* resourceURL = [NSURL fileURLWithPath:resourcePath];
	
	// attempt to find file path
    NSString* filePath = [PhoneGapDelegate pathForResource:resourcePath];
	
	if (filePath == nil) {
		// if it is a http url, use it
		if ([resourcePath hasPrefix:HTTP_SCHEME_PREFIX]){
			NSLog(@"Will use resource '%@' from the Internet.", resourcePath);
			resourceURL = [NSURL URLWithString:resourcePath];
		} else if ([resourcePath hasPrefix:DOCUMENTS_SCHEME_PREFIX]) {
			NSLog(@"Will use resource '%@' from the documents folder.", resourcePath);
			resourceURL = [NSURL URLWithString:resourcePath];
			
			NSString* recordingPath = [NSString stringWithFormat:@"%@/%@", [PhoneGapDelegate applicationDocumentsDirectory], [resourceURL host]];
			NSLog(@"recordingPath = %@", recordingPath);
			resourceURL = [NSURL fileURLWithPath:recordingPath];
		} else if (![resourceURL isFileURL]){
			NSLog(@"Unknown resource '%@'", resourcePath);
		}
    }
	else {
		NSLog(@"Found resource '%@' in the web folder.", filePath);
		// it's a file url, use it
		resourceURL = [NSURL fileURLWithPath:filePath];
	}
	
	return resourceURL;
}

// Creates or gets the cached audio file resource object
- (PGAudioFile*) audioFileForResource:(NSString*) resourcePath withId: (NSString*)mediaId
{
	BOOL bError = NO;
	MediaError errcode = MEDIA_ERR_NONE_SUPPORTED;
	NSString* jsString = nil;
	PGAudioFile* audioFile = nil;
	NSURL* resourceURL = nil;
	
	if ([self soundCache] == nil) {
		[self setSoundCache: [NSMutableDictionary dictionaryWithCapacity:1]];
	}else {
		audioFile = [[self soundCache] objectForKey: resourcePath];
	}
	if (audioFile == nil){
		// validate resourcePath and create
	
		if (resourcePath == nil || ![resourcePath isKindOfClass:[NSString class]] || [resourcePath isEqualToString:@""]){
			bError = YES;
			errcode = MEDIA_ERR_ABORTED;
			NSLog(@"invalid media src argument");
		} else {
			resourceURL = [self urlForResource:resourcePath];
		}

		if (resourceURL == nil) {
			bError = YES;
			errcode = MEDIA_ERR_ABORTED;
			NSLog(@"Cannot use audio file from resource '%@'", resourcePath);
		}
		if (bError) {
			jsString = [NSString stringWithFormat: @"%@(\"%@\",%d,%d);", @"PhoneGap.Media.onStatus", mediaId, MEDIA_ERROR, errcode];
			[super writeJavascript:jsString];
		} else {
			audioFile = [[[PGAudioFile alloc] init] autorelease];
			audioFile.resourcePath = resourcePath;
			audioFile.resourceURL = resourceURL;
			[[self soundCache] setObject:audioFile forKey: resourcePath];
		}
	}
	return audioFile;
}

- (void) play:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{

	NSString* callbackId = [arguments objectAtIndex:0];
#pragma unused(callbackId)
	
	NSString* mediaId = [arguments objectAtIndex:1];
	BOOL bError = NO;
	NSString* jsString = nil;
	
	PGAudioFile* audioFile = [self audioFileForResource:[arguments objectAtIndex:2] withId: mediaId];
	
	if (audioFile != nil) {
		if (audioFile.player == nil){
            bError = [self prepareToPlay:audioFile withId:mediaId];
		}	
		if (!bError){
			// audioFile.player != nil  or player was sucessfully created
			NSLog(@"Playing audio sample '%@'", audioFile.resourcePath);
            NSNumber* loopOption = [options objectForKey:@"numberOfLoops"];
            NSInteger numberOfLoops = 0;
            if (loopOption != nil) { 
                numberOfLoops = [loopOption intValue] - 1;
            }
			audioFile.player.numberOfLoops = numberOfLoops;
			
			if(audioFile.player.isPlaying){
				[audioFile.player stop];
				audioFile.player.currentTime = 0;
			}
			[audioFile.player play];
			jsString = [NSString stringWithFormat: @"%@(\"%@\",%d,%f);\n%@(\"%@\",%d,%d);", @"PhoneGap.Media.onStatus", mediaId, MEDIA_DURATION, audioFile.player.duration, @"PhoneGap.Media.onStatus", mediaId, MEDIA_STATE, MEDIA_RUNNING];
			[super writeJavascript:jsString];
			
		} else {
			/*  I don't see a problem playing previously recorded audio so removing this section - BG
			NSError* error;
			// try loading it one more time, in case the file was recorded previously
			audioFile.player = [[ AVAudioPlayer alloc ] initWithContentsOfURL:audioFile.resourceURL error:&error];
			if (error != nil) {
				NSLog(@"Failed to initialize AVAudioPlayer: %@\n", error);
				audioFile.player = nil;
			} else {
				NSLog(@"Playing audio sample '%@'", audioFile.resourcePath);
				audioFile.player.numberOfLoops = numberOfLoops;
				[audioFile.player play];
			} */
			// error creating the player
			jsString = [NSString stringWithFormat: @"%@(\"%@\",%d,%d);", @"PhoneGap.Media.onStatus", mediaId, MEDIA_ERROR, MEDIA_ERR_NONE_SUPPORTED];
			[super writeJavascript:jsString];
		}
	}
	// else audioFile was nil - error already returned from audioFile for resource
	return;
}
- (BOOL) prepareToPlay: (PGAudioFile*) audioFile withId: (NSString*) mediaId
{
    BOOL bError = NO;
    NSError* error = nil;
    // create the player
    NSURL* resourceURL = audioFile.resourceURL;
    if ([resourceURL isFileURL]) {
        audioFile.player = [[ AudioPlayer alloc ] initWithContentsOfURL:resourceURL error:&error];
    } else {
        NSData* data = [NSData dataWithContentsOfURL:resourceURL];
        audioFile.player = [[ AudioPlayer alloc ] initWithData:data error:&error];
    }
    
    if (error != nil) {
        NSLog(@"Failed to initialize AVAudioPlayer: %@\n", error);
        audioFile.player = nil;
        bError = YES;
    } else {
        audioFile.player.mediaId = mediaId;
        audioFile.player.delegate = self;
        bError = ![audioFile.player prepareToPlay];
    }
    return bError;
}

// if no errors sets status to starting and calls successCallback with no parameters
// Calls the success call back immediately as there is no mechanism to determine that the file is loaded
// other than the return from prepareToPlay.  Thus, IMHO not really worth calling
- (void) prepare:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	NSString* callbackId = [arguments objectAtIndex:0]; 
    
    NSString* mediaId = [arguments objectAtIndex:1];
    BOOL bError = NO;
    MediaStates state = MEDIA_STARTING;
    NSString* jsString = nil;
    
	PGAudioFile* audioFile = [[self soundCache] objectForKey: [arguments objectAtIndex:2]];
    if (audioFile == nil) {
        // did not already exist, try to create
        audioFile = [self audioFileForResource:[arguments objectAtIndex:2] withId: mediaId];
	
        if (audioFile != nil) {
            bError = [self prepareToPlay:audioFile withId:mediaId];
        }
    } else {
        // audioFile already existed in the cache no need to prepare it again, indicate state
        if (audioFile.player && [audioFile.player isPlaying]) {
            state = MEDIA_RUNNING;
        }
    }
    
    if (!bError) {
        
        // NSLog(@"Prepared audio sample '%@' for playback.", audioFile.resourcePath);
        PluginResult* result = [PluginResult resultWithStatus:PGCommandStatus_OK];
        jsString = [NSString stringWithFormat: @"%@(\"%@\",%d,%d);\n%@", @"PhoneGap.Media.onStatus", mediaId, MEDIA_STATE, state, [result toSuccessCallbackString:callbackId]];
        
	} else {
        jsString = [NSString stringWithFormat: @"%@(\"%@\",%d,%d);", @"PhoneGap.Media.onStatus", mediaId, MEDIA_ERROR, MEDIA_ERR_NONE_SUPPORTED];   
    }
    if (jsString) {
        [super writeJavascript:jsString];
    }
	
}



- (void) stop:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	NSString* callbackId = [arguments objectAtIndex:0];
#pragma unused(callbackId)
	NSString* mediaId = [arguments objectAtIndex:1];
    PGAudioFile* audioFile = [[self soundCache] objectForKey: [arguments objectAtIndex:2]];
	NSString* jsString = nil;

	if (audioFile != nil && audioFile.player!= nil) {
        NSLog(@"Stopped playing audio sample '%@'", audioFile.resourcePath);
        [audioFile.player stop];
        audioFile.player.currentTime = 0;
        jsString = [NSString stringWithFormat: @"%@(\"%@\",%d,%d);", @"PhoneGap.Media.onStatus", mediaId, MEDIA_STATE, MEDIA_STOPPED];
	} else {
        // no media playing - return error
        jsString = [NSString stringWithFormat: @"%@(\"%@\",%d,%d);", @"PhoneGap.Media.onStatus", mediaId, MEDIA_ERROR, MEDIA_NONE];
    }
    if (jsString){
        [super writeJavascript: jsString];
    }
}

- (void) pause:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	NSString* callbackId = [arguments objectAtIndex:0];
#pragma unused(callbackId)
	NSString* mediaId = [arguments objectAtIndex:1];
    NSString* jsString = nil;
	PGAudioFile* audioFile = [[self soundCache] objectForKey: [arguments objectAtIndex:2]];
	
	if (audioFile != nil && audioFile.player != nil) {
            NSLog(@"Paused playing audio sample '%@'", audioFile.resourcePath);
			[audioFile.player pause];
            jsString = [NSString stringWithFormat: @"%@(\"%@\",%d,%d);", @"PhoneGap.Media.onStatus", mediaId, MEDIA_STATE, MEDIA_PAUSED];
	} else {
        // no media playing - return error
        jsString = [NSString stringWithFormat: @"%@(\"%@\",%d,%d);", @"PhoneGap.Media.onStatus", mediaId, MEDIA_ERROR, MEDIA_NONE];
    }
    if (jsString){
        [super writeJavascript: jsString];
    }


}
- (void) seekTo:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	//args:
	// 0 = callbackId
    // 1 = Media id
    // 2 = path to resource
    // 3 = seek to location in milliseconds
	
	NSString* callbackId = [arguments objectAtIndex:0];
#pragma unused(callbackId)
	NSString* mediaId = [arguments objectAtIndex:1];

	PGAudioFile* audioFile = [[self soundCache] objectForKey: [arguments objectAtIndex:2]];
    double position = [[arguments objectAtIndex:3 ] doubleValue];
    double posInSeconds = position/1000;

	
    if (audioFile != nil && audioFile.player != nil && position){
        audioFile.player.currentTime = posInSeconds;
        NSString* jsString = [NSString stringWithFormat: @"%@(\"%@\",%d,%f);", @"PhoneGap.Media.onStatus", mediaId, MEDIA_POSITION, posInSeconds];

        [super writeJavascript: jsString];
        
    }
    
	return;
    
}

- (void) release:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	NSString* callbackId = [arguments objectAtIndex:0];
#pragma unused(callbackId)
    NSString* mediaId = [arguments objectAtIndex:1];

	if (mediaId != nil){
		PGAudioFile* audioFile = [[self soundCache] objectForKey: [arguments objectAtIndex:2]];
		if (audioFile != nil){
			if (audioFile.player && [audioFile.player isPlaying]){
				[audioFile.player stop];
			}
			if(audioFile.recorder && [audioFile.recorder isRecording]){
				[audioFile.recorder stop];
			}
			[[self soundCache] removeObjectForKey: [arguments objectAtIndex:2]];
			NSLog(@"Media with id %@ released", mediaId);
		}
	}
}

- (void) getCurrentPosition:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	//args:
	// 0 = callbackId
    // 1 = Media id
	
	NSString* callbackId = [arguments objectAtIndex:0];
	NSString* mediaId = [arguments objectAtIndex:1];
#pragma unused(mediaId)
	PGAudioFile* audioFile = [[self soundCache] objectForKey: [arguments objectAtIndex:2]];
    double position = -1;
	
    if (audioFile != nil && audioFile.player != nil && [audioFile.player isPlaying]){ 
            position = audioFile.player.currentTime;
    }
    PluginResult* result = [PluginResult resultWithStatus:PGCommandStatus_OK messageAsDouble: position];
	NSString* jsString = [NSString stringWithFormat: @"%@(\"%@\",%d,%f);\n%@", @"PhoneGap.Media.onStatus", mediaId, MEDIA_POSITION, position, [result toSuccessCallbackString:callbackId]];

    [super writeJavascript:jsString];
    
	return;
		
}

- (void) startAudioRecord:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	NSString* callbackId = [arguments objectAtIndex:0];
#pragma unused(callbackId)
	
	NSString* mediaId = [arguments objectAtIndex:1];
	PGAudioFile* audioFile = [self audioFileForResource:[arguments objectAtIndex:2] withId: mediaId];
    NSString* jsString = nil;
    
	if (audioFile != nil) {
		
		NSError* error = nil;

		if (audioFile.recorder != nil) {
			[audioFile.recorder stop];
			audioFile.recorder = nil;
		}
		// create a new recorder for each start record 
		audioFile.recorder = [[AudioRecorder alloc] initWithURL:audioFile.resourceURL settings:nil error:&error];
	
		if (error != nil) {
			NSLog(@"Failed to initialize AVAudioRecorder: %@\n", error);
			audioFile.recorder = nil;
			jsString = [NSString stringWithFormat: @"%@(\"%@\",%d,%d);", @"PhoneGap.Media.onStatus", mediaId, MEDIA_ERROR, MEDIA_ERR_ABORTED];
			
		} else {
			audioFile.recorder.delegate = self;
			audioFile.recorder.mediaId = mediaId;
			[audioFile.recorder record];
			NSLog(@"Started recording audio sample '%@'", audioFile.resourcePath);
            jsString = [NSString stringWithFormat: @"%@(\"%@\",%d,%d);", @"PhoneGap.Media.onStatus", mediaId, MEDIA_STATE, MEDIA_RUNNING];
		}
	}
    if (jsString) {
       [super writeJavascript:jsString]; 
    }
	return;
}

- (void) stopAudioRecord:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	NSString* callbackId = [arguments objectAtIndex:0];
#pragma unused(callbackId)
	NSString* mediaId = [arguments objectAtIndex:1];

	PGAudioFile* audioFile = [[self soundCache] objectForKey: [arguments objectAtIndex:2]];
    NSString* jsString = nil;
	
	if (audioFile != nil && audioFile.recorder != nil) {
		NSLog(@"Stopped recording audio sample '%@'", audioFile.resourcePath);
		[audioFile.recorder stop];
        jsString = [NSString stringWithFormat: @"%@(\"%@\",%d,%d);", @"PhoneGap.Media.onStatus", mediaId, MEDIA_STATE, MEDIA_STOPPED];
	} else {
        jsString = [NSString stringWithFormat: @"%@(\"%@\",%d,%d);", @"PhoneGap.Media.onStatus", mediaId, MEDIA_ERROR, MEDIA_NONE];
    }
    if (jsString) {
        [super writeJavascript:jsString]; 
    }}

- (void)audioRecorderDidFinishRecording:(AVAudioRecorder*)recorder successfully:(BOOL)flag
{

	AudioRecorder* aRecorder = (AudioRecorder*)recorder;
	NSString* mediaId = aRecorder.mediaId;
    //NSString* resourcePath = [self resourceForUrl:recorder.url];
	//PGAudioFile* audioFile = [self audioFileForResource:[aRecorder.url path] withId:mediaId];
	PGAudioFile* audioFile = [[self soundCache] objectForKey: [aRecorder.url path]]; //mediaId];
	NSString* jsString = nil;

	
	if (audioFile != nil) {
		NSLog(@"Finished recording audio sample '%@'", audioFile.resourcePath);
		if (flag){
			jsString = [NSString stringWithFormat: @"%@(\"%@\",%d,%d);", @"PhoneGap.Media.onStatus", mediaId, MEDIA_STATE, MEDIA_STOPPED];
		} else {
			jsString = [NSString stringWithFormat: @"%@(\"%@\",%d,%d);", @"PhoneGap.Media.onStatus", mediaId, MEDIA_ERROR, MEDIA_ERR_DECODE];
		}
		[super writeJavascript:jsString];
	}
}

- (void)audioPlayerDidFinishPlaying:(AVAudioPlayer*)player successfully:(BOOL)flag 
{
	AudioPlayer* aPlayer = (AudioPlayer*)player;
	NSString* mediaId = aPlayer.mediaId;
    //PGAudioFile* audioFile = [self audioFileForResource:[player.url path] withId: mediaId];
	PGAudioFile* audioFile = [[self soundCache] objectForKey: [player.url path]];
		
	if (audioFile != nil) {
		NSLog(@"Finished playing audio sample '%@'", audioFile.resourcePath);

		if (flag){
			NSString* jsString = [NSString stringWithFormat: @"%@(\"%@\",%d,%d);", @"PhoneGap.Media.onStatus", mediaId, MEDIA_STATE, MEDIA_STOPPED];
			[super writeJavascript: jsString];

		} else {
			NSString* jsString = [NSString stringWithFormat: @"%@(\"%@\",%d,%d);", @"PhoneGap.Media.onStatus", mediaId, MEDIA_ERROR, MEDIA_ERR_DECODE];
			[super writeJavascript: jsString];

		}
	} else {
		NSLog(@"audio file nil");
	}

}

- (void) onMemoryWarning
{
	[[self soundCache] removeAllObjects];
	[self setSoundCache: nil];
	
	[super onMemoryWarning];
}

@end

@implementation PGAudioFile

@synthesize resourcePath;
@synthesize resourceURL;
@synthesize player;
#ifdef __IPHONE_3_0
@synthesize recorder;
#endif

- (void) dealloc
{
	self.resourcePath = nil;
    self.resourceURL = nil;
    if (self.player) { 
		[self.player release];
		self.player = nil;
	}
#ifdef __IPHONE_3_0
	if(self.recorder) {
		[self.recorder release];
		self.recorder = nil;
	}
#endif
	[super dealloc];
}

@end
@implementation AudioPlayer
@synthesize mediaId;
- (void) dealloc
{
	if(self.mediaId)
		self.mediaId = nil;
	
	[super dealloc];
}

@end

@implementation AudioRecorder
@synthesize mediaId;
- (void) dealloc
{
	if(self.mediaId)
		self.mediaId = nil;
	
	[super dealloc];
}

@end

