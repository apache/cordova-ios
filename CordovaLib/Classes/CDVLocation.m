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


#import "CDVLocation.h"
#import "CDVViewController.h"

#pragma mark Constants

#define kPGLocationErrorDomain          @"kPGLocationErrorDomain"
#define kPGLocationDesiredAccuracyKey   @"desiredAccuracy"
#define kPGLocationForcePromptKey       @"forcePrompt"
#define kPGLocationDistanceFilterKey    @"distanceFilter"
#define kPGLocationFrequencyKey         @"frequency"

#pragma mark -
#pragma mark Categories

@interface NSError(JSONMethods)

- (NSString*) JSONRepresentation;
- (NSDictionary*) DictionaryRepresentation;

@end

@interface CLLocation(JSONMethods)

- (NSString*) JSONRepresentation;

@end

#pragma mark -
#pragma mark CDVLocation

@implementation CDVLocation

@synthesize locationManager, latitude, longitude, heading, velocity, altitude, accuracy, altitudeAccuracy, timestamp;

- (CDVPlugin*) initWithWebView:(UIWebView*)theWebView
{
    self = (CDVLocation*)[super initWithWebView:(UIWebView*)theWebView];
    if (self) 
	{
        self.locationManager = [[[CLLocationManager alloc] init] autorelease];
        self.locationManager.delegate = self; // Tells the location manager to send updates to this object
        __locationStarted = NO;
        self.timestamp = 0.0;
        self.latitude = 0.0;
        self.longitude = 0.0;
        self.altitude = 0.0;
        self.accuracy = 0.0;
        self.heading = 0.0;
        self.velocity = 0.0;
        self.altitudeAccuracy = 0.0;
    }
    return self;
}

- (BOOL) isAuthorized
{
	BOOL authorizationStatusClassPropertyAvailable = [CLLocationManager respondsToSelector:@selector(authorizationStatus)]; // iOS 4.2+
    if (authorizationStatusClassPropertyAvailable)
    {
        NSUInteger authStatus = [CLLocationManager authorizationStatus];
        return  (authStatus == kCLAuthorizationStatusAuthorized) || (authStatus == kCLAuthorizationStatusNotDetermined);
    }
    
    // by default, assume YES (for iOS < 4.2)
    return YES;
}

- (BOOL) isLocationServicesEnabled
{
	BOOL locationServicesEnabledInstancePropertyAvailable = [self.locationManager respondsToSelector:@selector(locationServicesEnabled)]; // iOS 3.x
	BOOL locationServicesEnabledClassPropertyAvailable = [CLLocationManager respondsToSelector:@selector(locationServicesEnabled)]; // iOS 4.x
    
	if (locationServicesEnabledClassPropertyAvailable) 
	{ // iOS 4.x
		return [CLLocationManager locationServicesEnabled];
	} 
	else if (locationServicesEnabledInstancePropertyAvailable) 
	{ // iOS 2.x, iOS 3.x
		return [(id)self.locationManager locationServicesEnabled];
	} 
	else 
	{
		return NO;
	}
}

- (void) startLocation
{
    if (![self isLocationServicesEnabled])
	{
    }
    if (![self isAuthorized]) 
    {
        NSUInteger code = -1;
        BOOL authStatusAvailable = [CLLocationManager respondsToSelector:@selector(authorizationStatus)]; // iOS 4.2+
        if (authStatusAvailable) {
            code = [CLLocationManager authorizationStatus];
        }
        
        CDVPluginResult* result = nil;
        NSString* jsString = nil;
        
        NSError* error = [NSError errorWithDomain:NSCocoaErrorDomain code:code userInfo:
                          [NSDictionary dictionaryWithObject:@"App is not authorized for Location Services" forKey:NSLocalizedDescriptionKey]];

        NSLog(@"%@", [error JSONRepresentation]);
        
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ILLEGAL_ACCESS_EXCEPTION messageAsDictionary:[error DictionaryRepresentation]];
        jsString = [result toErrorCallbackString:callbackId];

        [super writeJavascript:jsString];
        
        return;
    }
	
    // Tell the location manager to start notifying us of location updates. We
    // first stop, and then start the updating to ensure we get at least one
    // update, even if our location did not change.
    [self.locationManager stopUpdatingLocation];
    [self.locationManager startUpdatingLocation];
    __locationStarted = YES;
    // TODO: what should we do about all this stuff?
    /*
    if ([options objectForKey:kPGLocationDistanceFilterKey]) 
	{
        CLLocationDistance distanceFilter = [(NSString *)[options objectForKey:kPGLocationDistanceFilterKey] doubleValue];
        self.locationManager.distanceFilter = distanceFilter;
    }
    
    if ([options objectForKey:kPGLocationDesiredAccuracyKey]) 
    {
        int desiredAccuracy_num = [(NSString *)[options objectForKey:kPGLocationDesiredAccuracyKey] integerValue];
        CLLocationAccuracy desiredAccuracy = kCLLocationAccuracyBest;
        
        if (desiredAccuracy_num < 10) {
            desiredAccuracy = kCLLocationAccuracyBest;
        }
        else if (desiredAccuracy_num < 100) {
            desiredAccuracy = kCLLocationAccuracyNearestTenMeters;
        }
        else if (desiredAccuracy_num < 1000) {
            desiredAccuracy = kCLLocationAccuracyHundredMeters;
        }
        else if (desiredAccuracy_num < 3000) {
            desiredAccuracy = kCLLocationAccuracyKilometer;
        }
        else {
            desiredAccuracy = kCLLocationAccuracyThreeKilometers;
        }
        
        self.locationManager.desiredAccuracy = desiredAccuracy;
    }
     */
}

- (void) stopLocation
{
    if (__locationStarted)
	{
		if (![self isLocationServicesEnabled]) {
			return;
        }
    
		[self.locationManager stopUpdatingLocation];
		__locationStarted = NO;
	}
}

- (void) getLocation:(NSMutableArray *)arguments withDict:(NSMutableDictionary *)options
{
    CDVPluginResult* result = nil;
    NSString* jsString = nil;
	callbackId = [arguments objectAtIndex:0];
    
    if (!__locationStarted)
    {
        [self startLocation];
    }
    
    NSMutableDictionary *currentLocation = [NSMutableDictionary dictionaryWithCapacity:8];
    [currentLocation setValue:[NSNumber numberWithDouble:self.timestamp] forKey:@"timestamp"];
    [currentLocation setValue:[NSNumber numberWithDouble:self.latitude] forKey:@"latitude"];
    [currentLocation setValue:[NSNumber numberWithDouble:self.longitude] forKey:@"longitude"];
    [currentLocation setValue:[NSNumber numberWithDouble:self.altitude] forKey:@"altitude"];
    [currentLocation setValue:[NSNumber numberWithDouble:self.heading] forKey:@"heading"];
    [currentLocation setValue:[NSNumber numberWithDouble:self.accuracy] forKey:@"accuracy"];
    [currentLocation setValue:[NSNumber numberWithDouble:self.velocity] forKey:@"velocity"];
    [currentLocation setValue:[NSNumber numberWithDouble:self.altitudeAccuracy] forKey:@"altitudeAccuracy"];

    result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:currentLocation];
    jsString = [result toSuccessCallbackString:callbackId];
    [self writeJavascript:jsString];
}

- (void) locationManager:(CLLocationManager *)manager
							didUpdateToLocation:(CLLocation *)newLocation
							fromLocation:(CLLocation *)oldLocation
{
    self.timestamp = [newLocation.timestamp timeIntervalSince1970] * 1000.0;
    self.latitude = newLocation.coordinate.latitude;
    self.longitude = newLocation.coordinate.longitude;
    self.altitude = newLocation.altitude;
    self.heading = newLocation.course;
    self.velocity = newLocation.speed;
    self.accuracy = newLocation.horizontalAccuracy;
    self.altitudeAccuracy = newLocation.verticalAccuracy;
}

- (void)locationManager:(CLLocationManager *)manager didFailWithError:(NSError *)error
{
    NSLog(@"locationManager::didFailWithError %@", [error localizedFailureReason]);
	
    // Location Error
	if ([error code] != kCLErrorHeadingFailure)
	{
		/*
			W3C PositionError
			 PositionError.UNKNOWN_ERROR = 0;  // equivalent to kCLErrorLocationUnknown=0
			 PositionError.PERMISSION_DENIED = 1; // equivalent to kCLErrorDenied=1
			 PositionError.POSITION_UNAVAILABLE = 2; // equivalent to kCLErrorNetwork=2
		 
			(any other errors are translated to PositionError.UNKNOWN_ERROR)
		 */
		if (error.code > kCLErrorNetwork) {
            error = [NSError errorWithDomain:error.domain code:kCLErrorLocationUnknown userInfo:error.userInfo];
		}
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:[error DictionaryRepresentation]];
        NSString* jsString = [result toErrorCallbackString:callbackId];
        [self writeJavascript:jsString];
	}
    
    [self stopLocation];
}

- (void) dealloc 
{
	self.locationManager.delegate = nil;
	self.locationManager = nil;
	[super dealloc];
}

@end

#pragma mark -
#pragma mark CLLocation(JSONMethods)

@implementation CLLocation(JSONMethods)

- (NSString*) JSONRepresentation
{
	return [NSString stringWithFormat:
            @"{ timestamp: %.00f, \
                latitude: %f, longitude: %f, altitude: %.02f, heading: %.02f, velocity: %.02f, accuracy: %.02f, altitudeAccuracy: %.02f \
              }",
            [self.timestamp timeIntervalSince1970] * 1000.0,
            self.coordinate.latitude,
            self.coordinate.longitude,
            self.altitude,
            self.course,
            self.speed,
            self.horizontalAccuracy,
            self.verticalAccuracy
			];
}

@end


#pragma mark NSError(JSONMethods)

@implementation NSError(JSONMethods)

- (NSString*) JSONRepresentation
{
    return [NSString stringWithFormat:
            @"{ code: %d, message: '%@'}", 
			self.code, 
			[self localizedDescription]
            ];
}
- (NSDictionary*) DictionaryRepresentation
{
    NSMutableDictionary *error = [NSMutableDictionary dictionaryWithCapacity:2];
    [error setValue:[NSNumber numberWithInteger:self.code] forKey:@"code"];
    [error setValue:[self localizedDescription] forKey:@"message"];
    
    return error;
}

@end
