/*
 *  Vibrate.m
 *
 *  Created by Nitobi on 12/12/08.
 *  Copyright 2008 Nitobi. All rights reserved.
 *
 */

#import "Vibrate.h"


@implementation Vibrate

+ (void)vibrate:(NSString*)options forWebView:(UIWebView*)webView
{
	AudioServicesPlaySystemSound(kSystemSoundID_Vibrate);
}

/*
- (id)init{
	return self;
}

- (void)vibrate{
	AudioServicesPlaySystemSound(kSystemSoundID_Vibrate);
}

- (void)dealloc {
	[super dealloc];
}
*/

@end
