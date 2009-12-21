/*
 *  Sound.h
 *
 *  Created by Nitobi on 12/12/08.
 *  Copyright 2008 Nitobi. All rights reserved.
 *
 */

#import "PhoneGapCommand.h"
#import <AudioToolbox/AudioServices.h>
#import <MediaPlayer/MediaPlayer.h>


@interface Movie : PhoneGapCommand {
    BOOL stopReceived;
    BOOL repeat;
    MPMoviePlayerController	*theMovie;
}

- (void) play:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) stop:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;

void propListener (
   void                      *inClientData,
   AudioSessionPropertyID    inID,
   UInt32                    inDataSize,
   const void                *inData
);

void interruptionListener (
   void     *inClientData,
   UInt32   inInterruptionState
);

@property (nonatomic, retain ) MPMoviePlayerController	*theMovie;
@property (nonatomic ) BOOL stopReceived;
@property (nonatomic ) BOOL repeat;

@end
