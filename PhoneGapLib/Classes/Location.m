/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 */


#import "Location.h"

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
#pragma mark PGLocation

@implementation PGLocation

@synthesize locationManager;

- (PGPlugin*) initWithWebView:(UIWebView*)theWebView
{
    self = (PGLocation*)[super initWithWebView:(UIWebView*)theWebView];
    if (self) 
	{
        self.locationManager = [[[CLLocationManager alloc] init] autorelease];
        self.locationManager.delegate = self; // Tells the location manager to send updates to this object
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
        return [CLLocationManager authorizationStatus] == kCLAuthorizationStatusAuthorized;
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
            
			NSString* jsCallback = [NSString stringWithFormat:@"navigator.geolocation.setError(%@);", [error JSONRepresentation]]; 
			[super writeJavascript:jsCallback];
            
			return;
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

			NSString* jsCallback = [NSString stringWithFormat:@"navigator.geolocation.setError(%@);", [error localizedDescription]];
			[super writeJavascript:jsCallback];
            
			return;
        }
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

- (void) startHeading:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
    if (!__headingStarted)
	{
		if (![self hasHeadingSupport]) {
			return;
		}
		
		int freq = 0;
		
		if ([options objectForKey:kPGLocationFrequencyKey]) 
		{
			 freq = [(NSString *)[options objectForKey:kPGLocationFrequencyKey] integerValue];
#pragma unused(freq)
		}
		
		
		// Tell the location manager to start notifying us of heading updates
		self.locationManager.headingFilter = 0.2;
		[self.locationManager startUpdatingHeading];
		__headingStarted = YES;
	}
}	

- (void) stopHeading:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
    if (__headingStarted)
	{
		if (![self hasHeadingSupport]) {
			return;
		}
		
		[self.locationManager stopUpdatingHeading];
		__headingStarted = NO;
	}
}	

- (BOOL) locationManagerShouldDisplayHeadingCalibration:(CLLocationManager *)manager
{
	return YES;
}

- (void) locationManager:(CLLocationManager *)manager
						didUpdateHeading:(CLHeading *)heading
{
    NSString* jsCallback = [NSString stringWithFormat:@"navigator.compass.setHeading(%@)", [heading JSONRepresentation]];
    [super writeJavascript:jsCallback];
}


- (void) locationManager:(CLLocationManager *)manager didFailWithError:(NSError *)error
{
    NSLog(@"locationManager::didFailWithError %@", [error localizedFailureReason]);
	NSString* jsCallback = @"";
	
    // Compass Error
	if ([error code] == kCLErrorHeadingFailure)
	{
		jsCallback = [NSString stringWithFormat:@"navigator.compass.setError(%@);", [error JSONRepresentation] ];
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

#pragma mark CLHeading(JSONMethods)

@implementation CLHeading(JSONMethods)

- (NSString*) JSONRepresentation
{
    return [NSString stringWithFormat:
            @"{ timestamp: %.00f, magneticHeading: %.02f, trueHeading: %.02f, headingAccuracy: %.02f, x:%.03f, y:%.03f, z:%.03f }", 
            [self.timestamp timeIntervalSince1970] * 1000.0, 
			self.magneticHeading, 
			self.trueHeading, 
			self.headingAccuracy,
			self.x,
			self.y,
			self.z
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