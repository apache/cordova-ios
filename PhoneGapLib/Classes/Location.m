/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 */


#import "Location.h"
#import "PhoneGapViewController.h"
#import "PhoneGapDelegate.h"

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
#pragma mark PGHeadingData

@implementation PGHeadingData

@synthesize headingStatus, headingRepeats, headingInfo, headingCallbacks, headingFilter;
-(PGHeadingData*) init
{
    self = (PGHeadingData*)[super init];
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

#pragma mark -
#pragma mark PGLocation

@implementation PGLocation

@synthesize locationManager, headingData;

- (PGPlugin*) initWithWebView:(UIWebView*)theWebView
{
    self = (PGLocation*)[super initWithWebView:(UIWebView*)theWebView];
    if (self) 
	{
        self.locationManager = [[[CLLocationManager alloc] init] autorelease];
        self.locationManager.delegate = self; // Tells the location manager to send updates to this object
        __locationStarted = NO;
        self.headingData = nil;        
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

- (void) startLocation:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
    if (![self isLocationServicesEnabled])
	{
		BOOL forcePrompt = NO;
		// if forcePrompt is true iPhone will still show the "Location Services not active." Settings | Cancel prompt.
		if ([options objectForKey:kPGLocationForcePromptKey]) 
		{
			forcePrompt = [[options objectForKey:kPGLocationForcePromptKey] boolValue];
		}
        
		if (!forcePrompt)
		{
            NSError* error = [NSError errorWithDomain:kPGLocationErrorDomain code:1 userInfo:
                              [NSDictionary dictionaryWithObject:@"Location services is not enabled" forKey:NSLocalizedDescriptionKey]];
            NSLog(@"%@", [error JSONRepresentation]);
            
			NSString* jsCallback = [NSString stringWithFormat:@"navigator.geolocation.setError(%@);", [error JSONRepresentation]]; 
			[super writeJavascript:jsCallback];
            
			return;
		}
    }
    if (![self isAuthorized]) 
    {
        NSUInteger code = -1;
        BOOL authStatusAvailable = [CLLocationManager respondsToSelector:@selector(authorizationStatus)]; // iOS 4.2+
        if (authStatusAvailable) {
            code = [CLLocationManager authorizationStatus];
        }
        
        NSError* error = [NSError errorWithDomain:NSCocoaErrorDomain code:code userInfo:
                          [NSDictionary dictionaryWithObject:@"App is not authorized for Location Services" forKey:NSLocalizedDescriptionKey]];
        NSLog(@"%@", [error JSONRepresentation]);

        NSString* jsCallback = [NSString stringWithFormat:@"navigator.geolocation.setError(%@);", [error JSONRepresentation]];
        [super writeJavascript:jsCallback];
        
        return;
    }
	
    // Tell the location manager to start notifying us of location updates
    [self.locationManager startUpdatingLocation];
    __locationStarted = YES;

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
}

- (void) stopLocation:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
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
	
    NSString* jsCallback = [NSString stringWithFormat:@"navigator.geolocation.setLocation(%@);", [newLocation JSONRepresentation]];
    [super writeJavascript:jsCallback];
}
// called to get the current heading
// Will call location manager to startUpdatingHeading if necessary

- (void)getCurrentHeading:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
    NSString* callbackId = [arguments objectAtIndex:0];
    NSNumber* repeats = [options valueForKey:@"repeats"];  // indicates this call will be repeated at regular intervals
    
    if ([self hasHeadingSupport] == NO) 
    {
        PluginResult* result = [PluginResult resultWithStatus:PGCommandStatus_OK messageToErrorObject:20];
        [super writeJavascript:[result toErrorCallbackString:callbackId]];
    } else {
       // heading retrieval does is not affected by disabling locationServices and authorization of app for location services
        if (!self.headingData) {
            self.headingData = [[[PGHeadingData alloc] init] autorelease];
        }
        PGHeadingData* hData = self.headingData;
        
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
    PGHeadingData* hData = self.headingData;
    if ([self hasHeadingSupport] == NO) {
        PluginResult* result = [PluginResult resultWithStatus:PGCommandStatus_OK messageToErrorObject:20];
        [super writeJavascript:[result toErrorCallbackString:callbackId]];
    } else {
        if (!hData) {
            self.headingData = [[[PGHeadingData alloc] init] autorelease];
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
    PluginResult* result = nil;
    NSString* jsString = nil;
    PGHeadingData* hData = self.headingData;
    
    if (hData && hData.headingStatus == HEADINGERROR) {
        // return error
        result = [PluginResult resultWithStatus:PGCommandStatus_OK messageToErrorObject:0];
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
        
        result = [PluginResult resultWithStatus:PGCommandStatus_OK messageAsDictionary: returnInfo];
        [result setKeepCallbackAsBool:bRetain];

        jsString = [result toSuccessCallbackString:callbackId];
    }
    if (jsString) {
        [super writeJavascript:jsString];
    }
    
    
}

- (void) stopHeading:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
    PGHeadingData* hData = self.headingData;
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
            PhoneGapDelegate* pgDelegate = [self appDelegate];
            PhoneGapViewController* pgViewController = pgDelegate.viewController;
            
            if ([[pgViewController supportedOrientations] containsObject:
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
    PGHeadingData* hData = self.headingData;
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
	NSString* jsCallback = @"";
	
    // Compass Error
	if ([error code] == kCLErrorHeadingFailure)
	{
		PGHeadingData* hData = self.headingData;
        if (hData) {
            if (hData.headingStatus == HEADINGSTARTING) {
                // heading error during startup - report error
                for (NSString* callbackId in hData.headingCallbacks) {
                    PluginResult* result = [PluginResult resultWithStatus:PGCommandStatus_OK messageToErrorObject:0];
                    [super writeJavascript: [result toErrorCallbackString:callbackId]];
                }
                [hData.headingCallbacks removeAllObjects];
            } // else for frequency watches next call to getCurrentHeading will report error
            else if (hData.headingFilter) {
                PluginResult* resultFilter = [PluginResult resultWithStatus:PGCommandStatus_OK messageToErrorObject:0];
                [super writeJavascript: [resultFilter toErrorCallbackString:hData.headingFilter]];
            }
            hData.headingStatus = HEADINGERROR;
        }
	} 
    // Location Error
	else 
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
		
		jsCallback = [NSString stringWithFormat:@"navigator.geolocation.setError(%@);", [error JSONRepresentation]];
	}
	
    [super writeJavascript:jsCallback];
    
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
