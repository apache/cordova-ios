/*
 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at
 
 http://www.apache.org/licenses/LICENSE-2.0
 
 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
 */


#import "CDVSound.h"
#import "CDVViewController.h"

#define DOCUMENTS_SCHEME_PREFIX		@"documents://"
#define HTTP_SCHEME_PREFIX			@"http://"

@implementation CDVSound

@synthesize soundCache, avSession;

// Maps a url for a resource path
// "Naked" resource paths are assumed to be from the www folder as its base
- (NSURL*) urlForResource:(NSString*)resourcePath
{
	NSURL* resourceURL = nil;
    NSString* filePath = nil;
	
    // first try to find HTTP:// or Documents:// resources
    
    if ([resourcePath hasPrefix:HTTP_SCHEME_PREFIX]){
        // if it is a http url, use it
        NSLog(@"Will use resource '%@' from the Internet.", resourcePath);
        resourceURL = [NSURL URLWithString:resourcePath];
    } else if ([resourcePath hasPrefix:DOCUMENTS_SCHEME_PREFIX]) {
        filePath = [resourcePath stringByReplacingOccurrencesOfString:DOCUMENTS_SCHEME_PREFIX withString:[NSString stringWithFormat:@"%@/",[CDVViewController applicationDocumentsDirectory]]];
       NSLog(@"Will use resource '%@' from the documents folder with path = %@", resourcePath, filePath);
    } else {
        // attempt to find file path in www directory
        filePath = [self.commandDelegate pathForResource:resourcePath];
        if (filePath != nil) {
            NSLog(@"Found resource '%@' in the web folder.", filePath);
        }else {
            filePath = resourcePath;
            NSLog(@"Will attempt to use file resource '%@'", filePath);
            
        }

    }
    // check that file exists for all but HTTP_SHEME_PREFIX
    if(filePath != nil) {
        // try to access file
        NSFileManager* fMgr = [[NSFileManager alloc] init];
        if (![fMgr fileExistsAtPath:filePath]) {
            resourceURL = nil;
            NSLog(@"Unknown resource '%@'", resourcePath);
        } else {
            // it's a valid file url, use it
            resourceURL = [NSURL fileURLWithPath:filePath];
        }
        [fMgr release];
    }     
	return resourceURL;
}

// Creates or gets the cached audio file resource object
- (CDVAudioFile*) audioFileForResource:(NSString*) resourcePath withId: (NSString*)mediaId
{
	BOOL bError = NO;
	CDVMediaError errcode = MEDIA_ERR_NONE_SUPPORTED;
    NSString* errMsg = @"";
	NSString* jsString = nil;
	CDVAudioFile* audioFile = nil;
	NSURL* resourceURL = nil;
	
	if ([self soundCache] == nil) {
		[self setSoundCache: [NSMutableDictionary dictionaryWithCapacity:1]];
	}else {
		audioFile = [[self soundCache] objectForKey: mediaId];
	}
	if (audioFile == nil){
		// validate resourcePath and create
	
		if (resourcePath == nil || ![resourcePath isKindOfClass:[NSString class]] || [resourcePath isEqualToString:@""]){
			bError = YES;
			errcode = MEDIA_ERR_ABORTED;
			errMsg = @"invalid media src argument";
		} else {
			resourceURL = [self urlForResource:resourcePath];
		}

		if (resourceURL == nil) {
			bError = YES;
			errcode = MEDIA_ERR_ABORTED;
			errMsg = [NSString stringWithFormat: @"Cannot use audio file from resource '%@'", resourcePath];
		}
		if (bError) {
			jsString = [NSString stringWithFormat: @"%@(\"%@\",%d,%@);", @"Cordova.Media.onStatus", mediaId, MEDIA_ERROR, [self createMediaErrorWithCode: errcode message: errMsg]];
			[super writeJavascript:jsString];
		} else {
			audioFile = [[[CDVAudioFile alloc] init] autorelease];
			audioFile.resourcePath = resourcePath;
			audioFile.resourceURL = resourceURL;
			[[self soundCache] setObject:audioFile forKey: mediaId];
		}
	}
	return audioFile;
}
// returns whether or not audioSession is available - creates it if necessary 
- (BOOL) hasAudioSession
{
    BOOL bSession = YES;
    if (!self.avSession) {
        NSError* error = nil;
        
        self.avSession = [AVAudioSession sharedInstance];
        if (error) {
            // is not fatal if can't get AVAudioSession , just log the error
            NSLog(@"error creating audio session: %@", [[error userInfo] description]);
            self.avSession = nil;
            bSession = NO;
        }
    }
    return bSession;
}
// helper function to create a error object string
- (NSString*) createMediaErrorWithCode: (CDVMediaError) code message: (NSString*) message
{
    NSMutableDictionary* errorDict = [NSMutableDictionary dictionaryWithCapacity:2];
    [errorDict setObject: [NSNumber numberWithUnsignedInt: code] forKey:@"code"];
    [errorDict setObject: message ? message : @"" forKey: @"message"];
    return [errorDict JSONString];
    
}

- (void) play:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{

	NSString* callbackId = [arguments objectAtIndex:0];
#pragma unused(callbackId)
	
	NSString* mediaId = [arguments objectAtIndex:1];
	BOOL bError = NO;
	NSString* jsString = nil;
	
	CDVAudioFile* audioFile = [self audioFileForResource:[arguments objectAtIndex:2] withId: mediaId];
	
	if (audioFile != nil) {
		if (audioFile.player == nil){
            bError = [self prepareToPlay:audioFile withId:mediaId];
		}	
		if (!bError){
			// audioFile.player != nil  or player was sucessfully created
            // get the audioSession and set the category to allow Playing when device is locked or ring/silent switch engaged
            if ([self hasAudioSession]) {
                NSError* err = nil;
                [self.avSession setCategory:AVAudioSessionCategoryPlayback error:nil];
                if (![self.avSession  setActive: YES error: &err]){
                    // other audio with higher priority that does not allow mixing could cause this to fail
                    NSLog(@"Unable to play audio: %@", [err localizedFailureReason]);
                    bError = YES;
                }
            }
            if (!bError) {
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
                double position = round(audioFile.player.duration * 1000)/1000;
                jsString = [NSString stringWithFormat: @"%@(\"%@\",%d,%.3f);\n%@(\"%@\",%d,%d);", @"Cordova.Media.onStatus", mediaId, MEDIA_DURATION, position, @"Cordova.Media.onStatus", mediaId, MEDIA_STATE, MEDIA_RUNNING];
                [super writeJavascript:jsString];
                
            }
        }
        if (bError) {
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
			// error creating the session or player
			jsString = [NSString stringWithFormat: @"%@(\"%@\",%d,%@);", @"Cordova.Media.onStatus", mediaId, MEDIA_ERROR, [self createMediaErrorWithCode: MEDIA_ERR_NONE_SUPPORTED message: nil]];
			[super writeJavascript:jsString];
		}
	}
	// else audioFile was nil - error already returned from audioFile for resource
	return;
}
- (BOOL) prepareToPlay: (CDVAudioFile*) audioFile withId: (NSString*) mediaId
{
    BOOL bError = NO;
    NSError* playerError = nil;
    
    // create the player
    NSURL* resourceURL = audioFile.resourceURL;
    if ([resourceURL isFileURL]) {
        audioFile.player = [[[ CDVAudioPlayer alloc ] initWithContentsOfURL:resourceURL error:&playerError] autorelease];
    } else {
        NSURLRequest *request = [NSURLRequest requestWithURL:resourceURL];
        NSURLResponse *response = nil;
        NSData *data = [NSURLConnection sendSynchronousRequest:request returningResponse:&response error:&playerError];
        if (playerError) {
            NSLog(@"Unable to download audio from: %@", [resourceURL absoluteString]);
        } else {
            audioFile.player = [[[ CDVAudioPlayer alloc ] initWithData:data error:&playerError] autorelease];
        }
    }
    
    if (playerError != nil) {
        NSLog(@"Failed to initialize AVAudioPlayer: %@\n", [playerError localizedFailureReason]);
        audioFile.player = nil;
        if (self.avSession) {
            [self.avSession setActive:NO error:nil];
        }
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
    CDVMediaStates state = MEDIA_STARTING;
    NSString* jsString = nil;
    
	CDVAudioFile* audioFile = [[self soundCache] objectForKey: mediaId];
    if (audioFile == nil) {
        // did not already exist, try to create
        audioFile = [self audioFileForResource:[arguments objectAtIndex:2] withId: mediaId];
        if (audioFile == nil) {
            // create failed
            bError = YES;
        } else {
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
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        jsString = [NSString stringWithFormat: @"%@(\"%@\",%d,%d);\n%@", @"Cordova.Media.onStatus", mediaId, MEDIA_STATE, state, [result toSuccessCallbackString:callbackId]];
        
	} else {
        jsString = [NSString stringWithFormat: @"%@(\"%@\",%d,%@);", @"Cordova.Media.onStatus", mediaId, MEDIA_ERROR, [self createMediaErrorWithCode: MEDIA_ERR_NONE_SUPPORTED message: nil]];   
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
    CDVAudioFile* audioFile = [[self soundCache] objectForKey: mediaId];
	NSString* jsString = nil;

	if (audioFile != nil && audioFile.player!= nil) {
        NSLog(@"Stopped playing audio sample '%@'", audioFile.resourcePath);
        [audioFile.player stop];
        audioFile.player.currentTime = 0;
        jsString = [NSString stringWithFormat: @"%@(\"%@\",%d,%d);", @"Cordova.Media.onStatus", mediaId, MEDIA_STATE, MEDIA_STOPPED];
	}  // ignore if no media playing 
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
	CDVAudioFile* audioFile = [[self soundCache] objectForKey: mediaId];
	
	if (audioFile != nil && audioFile.player != nil) {
            NSLog(@"Paused playing audio sample '%@'", audioFile.resourcePath);
			[audioFile.player pause];
            jsString = [NSString stringWithFormat: @"%@(\"%@\",%d,%d);", @"Cordova.Media.onStatus", mediaId, MEDIA_STATE, MEDIA_PAUSED];
	} 
    // ignore if no media playing
      
    
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

	CDVAudioFile* audioFile = [[self soundCache] objectForKey: mediaId];
    double position = [[arguments objectAtIndex:3 ] doubleValue];
	
    if (audioFile != nil && audioFile.player != nil && position){
        double posInSeconds = position/1000;
        audioFile.player.currentTime = posInSeconds;
        NSString* jsString = [NSString stringWithFormat: @"%@(\"%@\",%d,%f);", @"Cordova.Media.onStatus", mediaId, MEDIA_POSITION, posInSeconds];

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
		CDVAudioFile* audioFile = [[self soundCache] objectForKey: mediaId];
		if (audioFile != nil){
			if (audioFile.player && [audioFile.player isPlaying]){
				[audioFile.player stop];
			}
			if(audioFile.recorder && [audioFile.recorder isRecording]){
				[audioFile.recorder stop];
			}
            if (self.avSession) {
                [self.avSession setActive:NO error: nil];
                self.avSession = nil;
            }
			[[self soundCache] removeObjectForKey: mediaId];
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
	CDVAudioFile* audioFile = [[self soundCache] objectForKey: mediaId];
    double position = -1;
	
    if (audioFile != nil && audioFile.player != nil && [audioFile.player isPlaying]){ 
            position = round(audioFile.player.currentTime *1000)/1000;
    }
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDouble: position];
	NSString* jsString = [NSString stringWithFormat: @"%@(\"%@\",%d,%.3f);\n%@", @"Cordova.Media.onStatus", mediaId, MEDIA_POSITION, position, [result toSuccessCallbackString:callbackId]];
    [super writeJavascript:jsString];
    
	return;
		
}

- (void) startAudioRecord:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	NSString* callbackId = [arguments objectAtIndex:0];
#pragma unused(callbackId)
	
	NSString* mediaId = [arguments objectAtIndex:1];
	CDVAudioFile* audioFile = [self audioFileForResource:[arguments objectAtIndex:2] withId: mediaId];
    NSString* jsString = nil;
    NSString* errorMsg = @"";
    
	if (audioFile != nil) {
		
		NSError* error = nil;

		if (audioFile.recorder != nil) {
			[audioFile.recorder stop];
			audioFile.recorder = nil;
		}
        // get the audioSession and set the category to allow recording when device is locked or ring/silent switch engaged
        if ([self hasAudioSession]) {
            [self.avSession setCategory:AVAudioSessionCategoryRecord error:nil];
            if (![self.avSession  setActive: YES error: &error]){
                // other audio with higher priority that does not allow mixing could cause this to fail
                errorMsg = [NSString stringWithFormat: @"Unable to record audio: %@", [error localizedFailureReason]];
                jsString = [NSString stringWithFormat: @"%@(\"%@\",%d,%@);", @"Cordova.Media.onStatus", mediaId, MEDIA_ERROR, [self createMediaErrorWithCode: MEDIA_ERR_ABORTED message: errorMsg] ];
                [super writeJavascript:jsString];
                return;
            }
        }
        
        // create a new recorder for each start record 
        audioFile.recorder = [[[CDVAudioRecorder alloc] initWithURL:audioFile.resourceURL settings:nil error:&error] autorelease];
        
		if (error != nil) {
			errorMsg = [NSString stringWithFormat: @"Failed to initialize AVAudioRecorder: %@\n", [error  localizedFailureReason]];
			audioFile.recorder = nil;
            if (self.avSession) {
                [self.avSession setActive:NO error:nil];
            }
			jsString = [NSString stringWithFormat: @"%@(\"%@\",%d,%@);", @"Cordova.Media.onStatus", mediaId, MEDIA_ERROR, [self createMediaErrorWithCode: MEDIA_ERR_ABORTED message: errorMsg]];
			
		} else {
			audioFile.recorder.delegate = self;
			audioFile.recorder.mediaId = mediaId;
			[audioFile.recorder record];
			NSLog(@"Started recording audio sample '%@'", audioFile.resourcePath);
            jsString = [NSString stringWithFormat: @"%@(\"%@\",%d,%d);", @"Cordova.Media.onStatus", mediaId, MEDIA_STATE, MEDIA_RUNNING];
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

	CDVAudioFile* audioFile = [[self soundCache] objectForKey: mediaId];
    NSString* jsString = nil;
	
	if (audioFile != nil && audioFile.recorder != nil) {
		NSLog(@"Stopped recording audio sample '%@'", audioFile.resourcePath);
		[audioFile.recorder stop];
        // no callback - that will happen in audioRecorderDidFinishRecording
	} 
    // ignore if no media recording
    if (jsString) {
        [super writeJavascript:jsString]; 
    }}

- (void)audioRecorderDidFinishRecording:(AVAudioRecorder*)recorder successfully:(BOOL)flag
{

	CDVAudioRecorder* aRecorder = (CDVAudioRecorder*)recorder;
	NSString* mediaId = aRecorder.mediaId;
	CDVAudioFile* audioFile = [[self soundCache] objectForKey: mediaId];
	NSString* jsString = nil;

	
	if (audioFile != nil) {
		NSLog(@"Finished recording audio sample '%@'", audioFile.resourcePath);
    }
    if (flag){
        jsString = [NSString stringWithFormat: @"%@(\"%@\",%d,%d);", @"Cordova.Media.onStatus", mediaId, MEDIA_STATE, MEDIA_STOPPED];
    } else {
        jsString = [NSString stringWithFormat: @"%@(\"%@\",%d,%@);", @"Cordova.Media.onStatus", mediaId, MEDIA_ERROR, [self createMediaErrorWithCode: MEDIA_ERR_DECODE message:nil]];
    }
    if (self.avSession) {
        [self.avSession setActive:NO error:nil];
    }
    [super writeJavascript:jsString];
	
}

- (void)audioPlayerDidFinishPlaying:(AVAudioPlayer*)player successfully:(BOOL)flag 
{
	CDVAudioPlayer* aPlayer = (CDVAudioPlayer*)player;
	NSString* mediaId = aPlayer.mediaId;
	CDVAudioFile* audioFile = [[self soundCache] objectForKey: mediaId];
    NSString* jsString = nil;
		
	if (audioFile != nil) {
		NSLog(@"Finished playing audio sample '%@'", audioFile.resourcePath);
    }
    if (flag){
        jsString = [NSString stringWithFormat: @"%@(\"%@\",%d,%d);", @"Cordova.Media.onStatus", mediaId, MEDIA_STATE, MEDIA_STOPPED];
        
    } else {
        jsString = [NSString stringWithFormat: @"%@(\"%@\",%d,%@);", @"Cordova.Media.onStatus", mediaId, MEDIA_ERROR, [self createMediaErrorWithCode: MEDIA_ERR_DECODE message:nil]];
        
    }
    if (self.avSession) {
        [self.avSession setActive:NO error:nil];
    }
    [super writeJavascript: jsString];
	
}

- (void) onMemoryWarning
{
	[[self soundCache] removeAllObjects];
	[self setSoundCache: nil];
    [self setAvSession: nil];
	
	[super onMemoryWarning];
}
- (void) dealloc
{
    [[self soundCache] removeAllObjects];
	[self setSoundCache: nil];
    [self setAvSession: nil];
    
    [super dealloc];
}
@end

@implementation CDVAudioFile

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
    self.player = nil;
    self.recorder = nil;
    
	[super dealloc];
}

@end
@implementation CDVAudioPlayer
@synthesize mediaId;
- (void) dealloc
{
    self.mediaId = nil;
	
	[super dealloc];
}

@end

@implementation CDVAudioRecorder
@synthesize mediaId;
- (void) dealloc
{
    self.mediaId = nil;
	
	[super dealloc];
}

@end

