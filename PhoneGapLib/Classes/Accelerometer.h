/*
 *  Accelerometer.h
 *
 *  Created by Nitobi on 28/10/09.
 *  Copyright 2009 Nitobi. All rights reserved.
 *
 */

#import <UIKit/UIKit.h>
#import "PhoneGapCommand.h"



@interface Accelerometer : PhoneGapCommand<UIAccelerometerDelegate> 
{
	bool _bIsRunning;
	
}



- (void)start:(NSMutableArray*)arguments
			 withDict:(NSMutableDictionary*)options;


- (void)stop:(NSMutableArray*)arguments
	 withDict:(NSMutableDictionary*)options;

@end


