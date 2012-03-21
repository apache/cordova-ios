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

@end

@interface CLLocation(JSONMethods)

- (NSString*) JSONRepresentation;

@end


@interface CLHeading(JSONMethods)

- (NSString*) JSONRepresentation;

@end

#pragma mark -
#pragma mark CDVHeadingData

@implementation CDVHeadingData

@synthesize headingStatus, headingRepeats, headingInfo, headingCallbacks, headingFilter;
-(CDVHeadingData*) init
{
    self = (CDVHeadingData*)[super init];
    if (self) 
	{
        self.headingRepeats = NO;
        self.headingStatus = HEADINGSTOPPED;
        self.headingInfo = nil;
        self.headingCallbacks = nil;
        self.headingFilter = nil;
    }
    return self;
}
-(void) dealloc 
{
    self.headingInfo = nil;
    self.headingCallbacks = nil;
    self.headingFilter = nil;
    [super dealloc];  
}

@end

@implementation CDVLocationData

@synthesize locationStatus, locationInfo, locationCallbacks;
-(CDVLocationData*) init
{
    self = (CDVLocationData*)[super init];
    if (self) 
	{
        self.locationInfo = nil;
        self.locationCallbacks = nil;
    }
    return self;
}
-(void) dealloc 
{
    self.locationInfo = nil;
    self.locationCallbacks = nil;
    [super dealloc];  
}

@end

#pragma mark -
#pragma mark CDVLocation

@implementation CDVLocation

@synthesize locationManager, headingData, locationData;

- (CDVPlugin*) initWithWebView:(UIWebView*)theWebView
{
    self = (CDVLocation*)[super initWithWebView:(UIWebView*)theWebView];
    if (self) 
	{
        self.locationManager = [[[CLLocationManager alloc] init] autorelease];
        self.locationManager.delegate = self; // Tells the location manager to send updates to this object
        __locationStarted = NO;
        self.headingData = nil;   
        self.locationData = nil;
    }
    return self;
}

- (BOOL) hasHeadingSupport
{
	BOOL headingInstancePropertyAvailable = [self.locationManager respondsToSelector:@selector(headingAvailable)]; // iOS 3.x
	BOOL headingClassPropertyAvailable = [CLLocationManager respondsToSelector:@selector(headingAvailable)]; // iOS 4.x
	
	if (headingInstancePropertyAvailable) { // iOS 3.x
		return [(id)self.locationManager headingAvailable];
	} else if (headingClassPropertyAvailable) { // iOS 4.x
		return [CLLocationManager headingAvailable];
	} else { // iOS 2.x
		return NO;
	}
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
    // TODO: clean up the old options that were ios-only.
    if (![self isLocationServicesEnabled])
	{
		BOOL forcePrompt = NO;
		// if forcePrompt is true iPhone will still show the "Location Services not active." Settings | Cancel prompt.
        /*
		if ([options objectForKey:kPGLocationForcePromptKey]) 
		{
			forcePrompt = [[options objectForKey:kPGLocationForcePromptKey] boolValue];
		}
        */
		if (!forcePrompt)
		{
            [self returnLocationError:PERMISSIONDENIED withMessage: nil];
			return;
		}
    }
    if (![self isAuthorized]) 
    {
        NSString* message = nil;
        BOOL authStatusAvailable = [CLLocationManager respondsToSelector:@selector(authorizationStatus)]; // iOS 4.2+
        if (authStatusAvailable) {
            NSUInteger code = [CLLocationManager authorizationStatus];
            if (code == kCLAuthorizationStatusNotDetermined) {
                // could return POSITION_UNAVAILABLE but need to coordinate with other platforms
                message = @"User undecided on application's use of location services";
            } else if (code == kCLAuthorizationStatusRestricted) {
                message = @"application use of location services is restricted";
            }
        }
        //PERMISSIONDENIED is only PositionError that makes sense when authorization denied
        [self returnLocationError:PERMISSIONDENIED withMessage: message];
        
        return;
    }
	
    // Tell the location manager to start notifying us of location updates. We
    // first stop, and then start the updating to ensure we get at least one
    // update, even if our location did not change.
    [self.locationManager stopUpdatingLocation];
    [self.locationManager startUpdatingLocation];
    __locationStarted = YES;
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

- (void) locationManager:(CLLocationManager *)manager
     didUpdateToLocation:(CLLocation *)newLocation
            fromLocation:(CLLocation *)oldLocation
{
	CDVLocationData* cData = self.locationData;
    cData.locationInfo = newLocation;
    if (self.locationData.locationCallbacks.count > 0) {
        for (NSString *callbackId in self.locationData.locationCallbacks) {
            [self returnLocationInfo:callbackId];
        }
        [self.locationData.locationCallbacks removeAllObjects];
    }
}

- (void) getLocation:(NSMutableArray *)arguments withDict:(NSMutableDictionary *)options
{
    NSString* callbackId = [arguments objectAtIndex:0];
    if ([self isLocationServicesEnabled] == NO)
    {
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageToErrorObject:2];
        [super writeJavascript:[result toErrorCallbackString:callbackId]];
    } else {
        if (!self.locationData) {
            self.locationData = [[[CDVLocationData alloc] init] autorelease];
        }
        CDVLocationData* lData = self.locationData;
        if (!lData.locationCallbacks) {
            lData.locationCallbacks = [NSMutableArray arrayWithCapacity:1];
        }
        
        if (!__locationStarted) {
            // add the callbackId into the array so we can call back when get data
            [lData.locationCallbacks addObject:callbackId];
            // Tell the location manager to start notifying us of heading updates
            [self startLocation];
        }
        else {
            [self returnLocationInfo: callbackId]; 
        }

    }
}
- (void)returnLocationInfo: (NSString*) callbackId
{
    CDVPluginResult* result = nil;
    NSString* jsString = nil;
    CDVLocationData* lData = self.locationData;
    
    if (lData && !lData.locationInfo) {
        // return error
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageToErrorObject:POSITIONUNAVAILABLE];
        jsString = [result toErrorCallbackString:callbackId];
    } else if (lData && lData.locationInfo) {
        CLLocation* lInfo = lData.locationInfo;
        NSMutableDictionary* returnInfo = [NSMutableDictionary dictionaryWithCapacity:8];
        NSNumber* timestamp = [NSNumber numberWithDouble:([lInfo.timestamp timeIntervalSince1970]*1000)];
        [returnInfo setObject:timestamp forKey:@"timestamp"];
        [returnInfo setObject:[NSNumber numberWithDouble: lInfo.speed] forKey:@"velocity"];
        [returnInfo setObject:[NSNumber numberWithDouble: lInfo.verticalAccuracy] forKey:@"altitudeAccuracy"];
        [returnInfo setObject:[NSNumber numberWithDouble: lInfo.horizontalAccuracy] forKey:@"accuracy"];
        [returnInfo setObject:[NSNumber numberWithDouble: lInfo.course] forKey:@"heading"];
        [returnInfo setObject:[NSNumber numberWithDouble: lInfo.altitude] forKey:@"altitude"];
        [returnInfo setObject:[NSNumber numberWithDouble: lInfo.coordinate.latitude] forKey:@"latitude"];
        [returnInfo setObject:[NSNumber numberWithDouble: lInfo.coordinate.longitude] forKey:@"longitude"];
        
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary: returnInfo];
        [result setKeepCallbackAsBool:NO];
        
        jsString = [result toSuccessCallbackString:callbackId];
    }
    if (jsString) {
        [super writeJavascript:jsString];
    }
}
- (void)returnLocationError: (NSUInteger) errorCode withMessage: (NSString*) message
{
    NSMutableDictionary* posError = [NSMutableDictionary dictionaryWithCapacity:2];
    [posError setObject: [NSNumber numberWithInt: errorCode] forKey:@"code"];
    [posError setObject: message ? message : @"" forKey: @"message"];
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsDictionary:posError];
    for (NSString *callbackId in self.locationData.locationCallbacks) {
        [super writeJavascript:[result toErrorCallbackString:callbackId]];
    }
    [self.locationData.locationCallbacks removeAllObjects];
}
// called to get the current heading
// Will call location manager to startUpdatingHeading if necessary

- (void)getHeading:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
    NSString* callbackId = [arguments objectAtIndex:0];
    NSNumber* repeats = [options valueForKey:@"repeats"];  // indicates this call will be repeated at regular intervals
    
    if ([self hasHeadingSupport] == NO) 
    {
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsInt:20];
        [super writeJavascript:[result toErrorCallbackString:callbackId]];
    } else {
        // heading retrieval does is not affected by disabling locationServices and authorization of app for location services
        if (!self.headingData) {
            self.headingData = [[[CDVHeadingData alloc] init] autorelease];
        }
        CDVHeadingData* hData = self.headingData;
        
        if (repeats != nil) {
            hData.headingRepeats = YES;
        }
        if (!hData.headingCallbacks) {
            hData.headingCallbacks = [NSMutableArray arrayWithCapacity:1];
        }
        // add the callbackId into the array so we can call back when get data
        [hData.headingCallbacks addObject:callbackId]; 
        
        if (hData.headingStatus != HEADINGRUNNING && hData.headingStatus != HEADINGERROR) {
            // Tell the location manager to start notifying us of heading updates
            [self startHeadingWithFilter: 0.2];
        }
        else {
            [self returnHeadingInfo: callbackId keepCallback:NO]; 
        }
    }
    
    
} 
// called to request heading updates when heading changes by a certain amount (filter)
- (void)watchHeadingFilter:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
    NSString* callbackId = [arguments objectAtIndex:0];
    NSNumber* filter = [options valueForKey:@"filter"];
    CDVHeadingData* hData = self.headingData;
    if ([self hasHeadingSupport] == NO) {
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsInt:20];
        [super writeJavascript:[result toErrorCallbackString:callbackId]];
    } else {
        if (!hData) {
            self.headingData = [[[CDVHeadingData alloc] init] autorelease];
            hData = self.headingData;
        }
        if (hData.headingStatus != HEADINGRUNNING) {
            // Tell the location manager to start notifying us of heading updates
            [self startHeadingWithFilter: [filter doubleValue]];
        } else {
            // if already running check to see if due to existing watch filter
            if (hData.headingFilter && ![hData.headingFilter isEqualToString:callbackId]){
                // new watch filter being specified
                // send heading data one last time to clear old successCallback
                [self returnHeadingInfo:hData.headingFilter keepCallback: NO];
            } 
            
        }
        // save the new filter callback and update the headingFilter setting
        hData.headingFilter = callbackId;
        // check if need to stop and restart in order to change value???
        self.locationManager.headingFilter = [filter doubleValue];
    } 
}
- (void)returnHeadingInfo: (NSString*) callbackId keepCallback: (BOOL) bRetain
{
    CDVPluginResult* result = nil;
    NSString* jsString = nil;
    CDVHeadingData* hData = self.headingData;
    
    if (hData && hData.headingStatus == HEADINGERROR) {
        // return error
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsInt:0];
        jsString = [result toErrorCallbackString:callbackId];
    } else if (hData && hData.headingStatus == HEADINGRUNNING && hData.headingInfo) {
        // if there is heading info, return it
        CLHeading* hInfo = hData.headingInfo;
        NSMutableDictionary* returnInfo = [NSMutableDictionary dictionaryWithCapacity:4];
        NSNumber* timestamp = [NSNumber numberWithDouble:([hInfo.timestamp timeIntervalSince1970]*1000)];
        [returnInfo setObject:timestamp forKey:@"timestamp"];
        [returnInfo setObject:[NSNumber numberWithDouble: hInfo.magneticHeading] forKey:@"magneticHeading"];
        id trueHeading = __locationStarted ? (id)[NSNumber numberWithDouble:hInfo.trueHeading]:(id)[NSNull null];
        [returnInfo setObject:trueHeading forKey:@"trueHeading"];
        [returnInfo setObject:[NSNumber numberWithDouble: hInfo.headingAccuracy] forKey:@"headingAccuracy"];
        
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary: returnInfo];
        [result setKeepCallbackAsBool:bRetain];
        
        jsString = [result toSuccessCallbackString:callbackId];
    }
    if (jsString) {
        [super writeJavascript:jsString];
    }
    
    
}

- (void) stopHeading:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
    CDVHeadingData* hData = self.headingData;
    if (hData && hData.headingStatus != HEADINGSTOPPED)
	{
		if (hData.headingFilter) {
            // callback one last time to clear callback
            [self returnHeadingInfo:hData.headingFilter keepCallback:NO];
            hData.headingFilter = nil;
        }
        [self.locationManager stopUpdatingHeading];		
        self.headingData = nil;
	}
}	


// helper method to check the orientation and start updating headings
- (void) startHeadingWithFilter: (CLLocationDegrees) filter
{
    if ([self.locationManager respondsToSelector: @selector(headingOrientation)]) {
        UIDeviceOrientation currentOrientation = [[UIDevice currentDevice] orientation];
        if (currentOrientation != UIDeviceOrientationUnknown) {
            CDVViewController* pgViewController = (CDVViewController*)self.viewController;
            
            if ([pgViewController.supportedOrientations containsObject:
                 [NSNumber numberWithInt:currentOrientation]]) {
                
                self.locationManager.headingOrientation = (CLDeviceOrientation)currentOrientation;
                // FYI UIDeviceOrientation and CLDeviceOrientation enums are currently the same
            }   
        }
    }
    self.locationManager.headingFilter = filter;
    [self.locationManager startUpdatingHeading];
    self.headingData.headingStatus = HEADINGSTARTING;
}
- (BOOL)locationManagerShouldDisplayHeadingCalibration:(CLLocationManager *)manager
{
	return YES;
}

- (void) locationManager:(CLLocationManager *)manager
        didUpdateHeading:(CLHeading *)heading
{
    CDVHeadingData* hData = self.headingData;
    // save the data for next call into getHeadingData
    hData.headingInfo = heading;
    
    if (hData.headingStatus == HEADINGSTARTING) {
        hData.headingStatus = HEADINGRUNNING; // so returnHeading info will work
        //this is the first update
        for (NSString* callbackId in hData.headingCallbacks) {
            [self returnHeadingInfo:callbackId keepCallback:NO];
        }
        [hData.headingCallbacks removeAllObjects];
        if (!hData.headingRepeats && !hData.headingFilter) {
            [self stopHeading:nil withDict:nil];
        }
    }
    if (hData.headingFilter) {
        [self returnHeadingInfo: hData.headingFilter keepCallback:YES];
    }
    hData.headingStatus = HEADINGRUNNING;  // to clear any error
    
}
- (void)locationManager:(CLLocationManager *)manager didFailWithError:(NSError *)error
{
    NSLog(@"locationManager::didFailWithError %@", [error localizedFailureReason]);
	
    // Compass Error
	if ([error code] == kCLErrorHeadingFailure)
	{
		CDVHeadingData* hData = self.headingData;
        if (hData) {
            if (hData.headingStatus == HEADINGSTARTING) {
                // heading error during startup - report error
                for (NSString* callbackId in hData.headingCallbacks) {
                    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsInt:0];
                    [super writeJavascript: [result toErrorCallbackString:callbackId]];
                }
                [hData.headingCallbacks removeAllObjects];
            } // else for frequency watches next call to getCurrentHeading will report error
            else if (hData.headingFilter) {
                CDVPluginResult* resultFilter = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsInt:0];
                [super writeJavascript: [resultFilter toErrorCallbackString:hData.headingFilter]];
            }
            hData.headingStatus = HEADINGERROR;
        }
	} 
    // Location Error
	else 
	{
        CDVLocationData* lData = self.locationData;
        if (lData && __locationStarted) {
            // TODO: probably have to once over the various error codes and return one of:
            // PositionError.PERMISSION_DENIED = 1;
            // PositionError.POSITION_UNAVAILABLE = 2;
            // PositionError.TIMEOUT = 3;
            NSUInteger positionError = POSITIONUNAVAILABLE;
            if (error.code == kCLErrorDenied) {
                positionError = PERMISSIONDENIED;
            }
            [self returnLocationError:positionError withMessage: [error localizedDescription]];

        }
	}
    
	[self.locationManager stopUpdatingLocation];
    __locationStarted = NO;
}

- (void) dealloc 
{
	self.locationManager.delegate = nil;
	self.locationManager = nil;
    self.headingData = nil;
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
            coords: { latitude: %f, longitude: %f, altitude: %.02f, heading: %.02f, speed: %.02f, accuracy: %.02f, altitudeAccuracy: %.02f } \
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

@end