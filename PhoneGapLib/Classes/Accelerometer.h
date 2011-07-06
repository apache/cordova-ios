/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
*/

#import <UIKit/UIKit.h>
#import "PGPlugin.h"



@interface PGAccelerometer : PGPlugin<UIAccelerometerDelegate> 
{
	bool _bIsRunning;
	
}



- (void)start:(NSMutableArray*)arguments
			 withDict:(NSMutableDictionary*)options;


- (void)stop:(NSMutableArray*)arguments
	 withDict:(NSMutableDictionary*)options;

@end


