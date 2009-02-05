/*
 *  Sound.h
 *
 *  Created by Nitobi on 12/12/08.
 *  Copyright 2008 Nitobi. All rights reserved.
 *
 */

#import <Foundation/Foundation.h>
#import <AudioToolbox/AudioServices.h>

@interface Sound : NSObject {
	SystemSoundID soundID;
}

- (id) initWithContentsOfFile:(NSString * )path;
- (void) play;

@end
