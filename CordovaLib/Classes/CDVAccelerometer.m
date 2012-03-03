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


#import "CDVAccelerometer.h"

@implementation CDVAccelerometer

// defaults to 100 msec
#define kAccelerometerInterval      100 
// max rate of 40 msec
#define kMinAccelerometerInterval    40  
// min rate of 1/sec
#define kMaxAccelerometerInterval   1000

- (CDVAccelerometer*) init
{
    self = [super init];
    if (self)
    {
        timeout = 30000;
        x = 0;
        y = 0;
        z = 0;
        timestamp = 0;
        lastAccessTime = 0;
    }
    return self;
}

- (void) dealloc {
    [self stop];
    [super dealloc]; // pretty important.
}

- (void)start
{
	NSTimeInterval desiredFrequency_num = kAccelerometerInterval;
	UIAccelerometer* pAccel = [UIAccelerometer sharedAccelerometer];
	// accelerometer expects fractional seconds, but we have msecs
	pAccel.updateInterval = desiredFrequency_num / 1000;
	if(!_bIsRunning)
	{
		pAccel.delegate = self;
		_bIsRunning = YES;
	}
}


- (void)stop
{
	UIAccelerometer*  theAccelerometer = [UIAccelerometer sharedAccelerometer];
	theAccelerometer.delegate = nil;
	_bIsRunning = NO;
}

/**
 * Sends Accel Data back to the Device.
 */
- (void)getAcceleration:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
    CDVPluginResult* result = nil;
    NSString* jsString = nil;
	NSString* callbackId = [arguments objectAtIndex:0];
    
    if(!_bIsRunning)
    {
        [self start];
    }
    // set last access time to right now
    lastAccessTime = ([[NSDate date] timeIntervalSince1970] * 1000);
    
    // Create an acceleration object
    NSMutableDictionary *accelProps = [NSMutableDictionary dictionaryWithCapacity:4];
    [accelProps setValue:[NSNumber numberWithDouble:x] forKey:@"x"];
    [accelProps setValue:[NSNumber numberWithDouble:y] forKey:@"y"];
    [accelProps setValue:[NSNumber numberWithDouble:z] forKey:@"z"];
    [accelProps setValue:[NSNumber numberWithDouble:timestamp] forKey:@"timestamp"];
    
    result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:accelProps];
    jsString = [result toSuccessCallbackString:callbackId];
    [self writeJavascript:jsString];
}

- (void)getTimeout:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
    CDVPluginResult* result = nil;
    NSString* jsString = nil;
	NSString* callbackId = [arguments objectAtIndex:0];
    
    result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDouble:timeout];
    jsString = [result toSuccessCallbackString:callbackId];
    [self writeJavascript:jsString];
}

- (void)setTimeout:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
    CDVPluginResult* result = nil;
    NSString* jsString = nil;
	NSString* callbackId = [arguments objectAtIndex:0];
    float newTimeout = [[arguments objectAtIndex:1] floatValue];
    timeout = newTimeout;
    
    result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    jsString = [result toSuccessCallbackString:callbackId];
    [self writeJavascript:jsString];
}
/**
 * Picks up accel updates from device and stores them in this class
 */
- (void) accelerometer:(UIAccelerometer *)accelerometer didAccelerate:(UIAcceleration *)acceleration 
{
	if(_bIsRunning)
	{
        x = acceleration.x;
        y = acceleration.y;
        z = acceleration.z;
        timestamp = ([[NSDate date] timeIntervalSince1970] * 1000);
        
        // read frequency and compare to timeout so we can see if we should turn off accel listening
        if ((timestamp - lastAccessTime) > timeout) {
			[self stop];
		}		
	}
}

// TODO: Consider using filtering to isolate instantaneous data vs. gravity data -jm

/* 
 #define kFilteringFactor 0.1
 
 // Use a basic low-pass filter to keep only the gravity component of each axis.
 grav_accelX = (acceleration.x * kFilteringFactor) + ( grav_accelX * (1.0 - kFilteringFactor));
 grav_accelY = (acceleration.y * kFilteringFactor) + ( grav_accelY * (1.0 - kFilteringFactor));
 grav_accelZ = (acceleration.z * kFilteringFactor) + ( grav_accelZ * (1.0 - kFilteringFactor));
 
 // Subtract the low-pass value from the current value to get a simplified high-pass filter
 instant_accelX = acceleration.x - ( (acceleration.x * kFilteringFactor) + (instant_accelX * (1.0 - kFilteringFactor)) );
 instant_accelY = acceleration.y - ( (acceleration.y * kFilteringFactor) + (instant_accelY * (1.0 - kFilteringFactor)) );
 instant_accelZ = acceleration.z - ( (acceleration.z * kFilteringFactor) + (instant_accelZ * (1.0 - kFilteringFactor)) );
 

 */



@end
