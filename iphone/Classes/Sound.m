/*
 *  Sound.m
 *
 *  Created by Nitobi on 12/12/08.
 *  Copyright 2008 Nitobi. All rights reserved.
 *
 */

#import "Sound.h"
#import "PhonegapDelegate.h"

@implementation Sound

- (NSURL*) urlForResource:(NSString*)resourcePath
{
	NSURL* resourceURL = nil;
	
	// attempt to find file path
    NSString* filePath = [PhoneGapDelegate pathForResource:resourcePath];
	
	if (filePath == nil) {
		NSLog(@"Can't find filename %@ in the app bundle", resourcePath);
		// if it is a http url, use it
		if ([resourcePath hasPrefix:@"http"]){
			resourceURL = [NSURL URLWithString:resourcePath];
		}
    }
	else {
		// it's a file url, use it
		resourceURL = [NSURL fileURLWithPath:filePath];
	}
	
	return resourceURL;
}

- (AudioFile*) audioFileForResource:(NSString*) resourcePath
{
	NSURL* resourceURL = [self urlForResource:resourcePath];
	if([resourcePath isEqualToString:@""]){
		NSLog(@"Cannot play empty URI");
		return nil;
	}
	
	if (resourceURL == nil) {
		NSLog(@"Cannot play audio file from resource '%@'", resourcePath);
		return nil;
	}
	
	if (soundCache == nil) {
		soundCache = [[NSMutableDictionary alloc] initWithCapacity:4];
	}
	
	AudioFile* audioFile = [soundCache objectForKey:resourcePath];
	if (audioFile == nil) {
		NSError *err;
		
		audioFile = [[AudioFile alloc] init];
		audioFile.resourcePath = resourcePath;
		
		if ([resourceURL isFileURL]) {
			audioFile.player = [[ AVAudioPlayer alloc ] initWithContentsOfURL:resourceURL error:&err];
		} else {
			NSData* data = [NSData dataWithContentsOfURL:resourceURL];
			audioFile.player = [[ AVAudioPlayer alloc ] initWithData:data error:&err];
		}
		
		if ([err code] > 0) {
			NSLog(@"Failed to initialize AVAudioPlayer: %@\n", err);
			[audioFile release];
				
			return nil;
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
	
	audioFile.player.delegate = self;
	
	NSLog(@"Prepared audio sample '%@'", audioFile.resourcePath);
	[soundCache setObject:audioFile forKey:audioFile.resourcePath];
	[audioFile.player prepareToPlay];
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
		NSLog(@"Playing audio sample '%@'", audioFile.resourcePath);

		audioFile.player.numberOfLoops = numberOfLoops;
		[audioFile.player play];
	}
}

- (void) stop:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	AudioFile* audioFile = [self audioFileForResource:[arguments objectAtIndex:0]];
	
	if (audioFile != nil) {
		NSLog(@"Stopped audio sample '%@'", audioFile.resourcePath);

		[audioFile.player stop];
		audioFile.player.currentTime = 0;
	}
}

- (void) pause:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	AudioFile* audioFile = [self audioFileForResource:[arguments objectAtIndex:0]];
	
	if (audioFile != nil) {
		NSLog(@"Paused audio sample '%@'", audioFile.resourcePath);
		[audioFile.player pause];
	}
}

- (void)audioPlayerDidFinishPlaying:(AVAudioPlayer*)player successfully:(BOOL)flag 
{
	AudioFile* audioFile = [self audioFileForResource:[player.url path]];
	NSLog(@"Finished playing audio sample '%@'", [player.url path]);

	if (audioFile != nil) {

		if (flag){
			if (audioFile.successCallback) {
				NSString* jsString = [NSString stringWithFormat:@"%@(\"%@\");", audioFile.successCallback, @""];
				[super writeJavascript:jsString];
			}
		} else {
			if (audioFile.errorCallback) {
				NSString* jsString = [NSString stringWithFormat:@"%@(\"%@\");", audioFile.errorCallback, @""];
				[super writeJavascript:jsString];
			}		
		}
	}
}

- (void) clearCaches
{
	[super clearCaches];
}

@end

@implementation AudioFile

@synthesize resourcePath;
@synthesize successCallback;
@synthesize errorCallback;
@synthesize player;


- (void) dealloc
{
	self.player = nil;
	self.successCallback = nil;
	self.errorCallback = nil;
	
	[super dealloc];
}

@end
