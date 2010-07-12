/*
 *  Sound.m
 *
 *  Created by Nitobi on 12/12/08.
 *  Copyright 2008 Nitobi. All rights reserved.
 *
 */

#import "Sound.h"
#import "PhonegapDelegate.h"

#define DOCUMENTS_SCHEME_PREFIX		@"documents://"
#define HTTP_SCHEME_PREFIX			@"http://"

@implementation Sound

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

// Maps a url for a resource path
// "Naked" resource paths are assumed to be from the www folder as its base
- (NSURL*) urlForResource:(NSString*)resourcePath
{
	NSURL* resourceURL = nil;
	
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
			resourceURL = [NSURL fileURLWithPath:recordingPath];
		} else {
			NSLog(@"Unknown resource '%@'", resourcePath);
		}
    }
	else {
		NSLog(@"Found resource '%@' in the web folder.", resourcePath);
		// it's a file url, use it
		resourceURL = [NSURL fileURLWithPath:filePath];
	}
	
	return resourceURL;
}

// Creates or gets the cached audio file resource object
- (AudioFile*) audioFileForResource:(NSString*) resourcePath
{
	NSURL* resourceURL = [self urlForResource:resourcePath];
	if([resourcePath isEqualToString:@""]){
		NSLog(@"Cannot play empty URI");
		return nil;
	}
	
	if (resourceURL == nil) {
		NSLog(@"Cannot use audio file from resource '%@'", resourcePath);
		return nil;
	}
	
	if (soundCache == nil) {
		soundCache = [[NSMutableDictionary alloc] initWithCapacity:4];
	}
	
	AudioFile* audioFile = [soundCache objectForKey:resourcePath];
	if (audioFile == nil) {
		NSError *error;
		
		audioFile = [[[AudioFile alloc] init] autorelease];
		audioFile.resourcePath = resourcePath;
		audioFile.resourceURL = resourceURL;
		
		if ([resourceURL isFileURL]) {
			audioFile.player = [[ AVAudioPlayer alloc ] initWithContentsOfURL:resourceURL error:&error];
		} else {
			NSData* data = [NSData dataWithContentsOfURL:resourceURL];
			audioFile.player = [[ AVAudioPlayer alloc ] initWithData:data error:&error];
		}
		
		if (error != nil) {
			NSLog(@"Failed to initialize AVAudioPlayer: %@\n", error);
			audioFile.player = nil;
		}
	}
	
	return audioFile;
}

- (void) prepare:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	AudioFile* audioFile = [self audioFileForResource:[arguments objectAtIndex:0]];
	if (audioFile == nil) {
		return;
	}
	
	NSUInteger argc = [arguments count];
	if (argc > 1) audioFile.successCallback = [arguments objectAtIndex:1];
	if (argc > 2) audioFile.errorCallback = [arguments objectAtIndex:2];
	if (argc > 3) audioFile.downloadCompleteCallback = [arguments objectAtIndex:3];
	
	[soundCache setObject:audioFile forKey:audioFile.resourcePath];
	if (audioFile.player != nil) {
		NSLog(@"Prepared audio sample '%@' for playback.", audioFile.resourcePath);
		if (audioFile.downloadCompleteCallback) {
			NSLog(@"dl complete cb: %@", audioFile.downloadCompleteCallback);
			NSString* jsString = [NSString stringWithFormat:@"(%@)();", audioFile.downloadCompleteCallback];
			[super writeJavascript:jsString];
		}

		audioFile.player.delegate = self;
		[audioFile.player prepareToPlay];
	}
	audFile = audioFile;
}

- (void) play:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	AudioFile* audioFile = [self audioFileForResource:[arguments objectAtIndex:0]];
	NSNumber* loopOption = [options objectForKey:@"numberOfLoops"];
	NSInteger numberOfLoops = 0;
	if (loopOption != nil) {
		numberOfLoops = [loopOption intValue] - 1;
	}
	
	if (audioFile != nil) {
		if (audioFile.player != nil) {
			NSLog(@"Playing audio sample '%@'", audioFile.resourcePath);
			audioFile.player.numberOfLoops = numberOfLoops;
			
			if(audioFile.player.isPlaying){
				[audioFile.player stop];
				audioFile.player.currentTime = 0;
			}
			[audioFile.player play];
			
		} else {
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
			}
		}
	}
}

- (void) stop:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	AudioFile* audioFile = [self audioFileForResource:[arguments objectAtIndex:0]];
	
	if (audioFile != nil) {
		if (audioFile.player != nil) {
			NSLog(@"Stopped playing audio sample '%@'", audioFile.resourcePath);
			[audioFile.player stop];
			audioFile.player.currentTime = 0;
		}
	}
}

- (void) pause:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	AudioFile* audioFile = [self audioFileForResource:[arguments objectAtIndex:0]];
	
	if (audioFile != nil) {
		if (audioFile.player != nil) {
			NSLog(@"Paused playing audio sample '%@'", audioFile.resourcePath);
			[audioFile.player pause];
		}
	}
}

#ifdef __IPHONE_3_0

- (void) startAudioRecord:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	AudioFile* audioFile = [self audioFileForResource:[arguments objectAtIndex:0]];
	if (audioFile == nil) {
		return;
	}
	
	NSError* error = nil;

	if (audioFile.recorder != nil) {
		[audioFile.recorder stop];
		audioFile.recorder = nil;
	}
		
	audioFile.recorder = [[AVAudioRecorder alloc] initWithURL:audioFile.resourceURL settings:nil error:&error];
	
	if (error != nil) {
		NSLog(@"Failed to initialize AVAudioRecorder: %@\n", error);
		audioFile.recorder = nil;
	} else {
		audioFile.recorder.delegate = self;
		[audioFile.recorder record];
		NSLog(@"Started recording audio sample '%@'", audioFile.resourcePath);
	}
}

- (void) stopAudioRecord:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	AudioFile* audioFile = [self audioFileForResource:[arguments objectAtIndex:0]];
	if (audioFile == nil) {
		return;
	}
	
	if (audioFile.recorder != nil) {
		NSLog(@"Stopped recording audio sample '%@'", audioFile.resourcePath);
		[audioFile.recorder stop];
	}
}

- (void)audioRecorderDidFinishRecording:(AVAudioRecorder*)recorder successfully:(BOOL)flag
{
	NSString* resourcePath = [self resourceForUrl:recorder.url];
	AudioFile* audioFile = [self audioFileForResource:[recorder.url path]];
	NSLog(@"Finished recording audio sample '%@'", resourcePath);
	
	if (audioFile != nil) {
		
		if (flag){
			if (audioFile.successCallback) {
				NSString* jsString = [NSString stringWithFormat:@"(%@)(\"%@\");", audioFile.successCallback, resourcePath];
				[super writeJavascript:jsString];
			}
		} else {
			if (audioFile.errorCallback) {
				NSString* jsString = [NSString stringWithFormat:@"(%@)(\"%@\");", audioFile.errorCallback, resourcePath];
				[super writeJavascript:jsString];
			}		
		}
	}
}

#endif

- (void)audioPlayerDidFinishPlaying:(AVAudioPlayer*)player successfully:(BOOL)flag 
{
	NSString* resourcePath = [self resourceForUrl:player.url];
	AudioFile* audioFile = audFile;
	NSLog(@"Finished playing audio sample '%@'", resourcePath);
	
	if (audioFile != nil) {

		if (flag){
			if (audioFile.successCallback) {
				NSString* jsString = [NSString stringWithFormat:@"(%@)(\"%@\");", audioFile.successCallback, resourcePath];
				[super writeJavascript:jsString];
			}
		} else {
			if (audioFile.errorCallback) {
				NSString* jsString = [NSString stringWithFormat:@"(%@)(\"%@\");", audioFile.errorCallback, resourcePath];
				[super writeJavascript:jsString];
			}		
		}
	} else {
		NSLog(@"audio file nil");
	}

}

- (void) clearCaches
{
	[soundCache removeAllObjects];
	[soundCache release];
	soundCache = nil;
	
	[super clearCaches];
}

@end

@implementation AudioFile

@synthesize resourcePath;
@synthesize resourceURL;
@synthesize successCallback;
@synthesize errorCallback;
@synthesize downloadCompleteCallback;
@synthesize player;
#ifdef __IPHONE_3_0
@synthesize recorder;
#endif

- (void) dealloc
{
	self.player = nil;
	self.successCallback = nil;
	self.errorCallback = nil;
	self.downloadCompleteCallback = nil;
	
	[super dealloc];
}

@end
