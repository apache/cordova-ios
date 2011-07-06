/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 */


#import "Location.h"

@implementation PGLocation

@synthesize locationManager;

-(PGPlugin*) initWithWebView:(UIWebView*)theWebView
{
    self = (PGLocation*)[super initWithWebView:(UIWebView*)theWebView];
    if (self) 
	{
        self.locationManager = [[CLLocationManager alloc] init];
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

- (void)startLocation:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
    if ([self isLocationServicesEnabled] != YES)
	{
		BOOL forcePrompt = NO;
		// if forcePrompt is true iPhone will still show the "Location Services not active." Settings | Cancel prompt.
		if ([options objectForKey:@"forcePrompt"]) 
		{
			forcePrompt = [[options objectForKey:@"forcePrompt"] boolValue];
		}
		if(!forcePrompt)
		{
			NSString* jsErrorCallBack = [NSString stringWithFormat:@"navigator.geolocation.setError({ 'code': %d, 'message': '%@' });", 
									 1, // 1 is PERMISSION_DENIED
									 @"Location Services Not Enabled"];
			NSLog(@"%@", jsErrorCallBack);
			[super writeJavascript:jsErrorCallBack];
			return;
		}
	}
    
    // Tell the location manager to start notifying us of location updates
    [self.locationManager startUpdatingLocation];
    __locationStarted = YES;

    if ([options objectForKey:@"distanceFilter"]) 
	{
        CLLocationDistance distanceFilter = [(NSString *)[options objectForKey:@"distanceFilter"] doubleValue];
        self.locationManager.distanceFilter = distanceFilter;
    }
    
    if ([options objectForKey:@"desiredAccuracy"]) {
        int desiredAccuracy_num = [(NSString *)[options objectForKey:@"desiredAccuracy"] integerValue];
        CLLocationAccuracy desiredAccuracy = kCLLocationAccuracyBest;
        if (desiredAccuracy_num < 10)
            desiredAccuracy = kCLLocationAccuracyBest;
        else if (desiredAccuracy_num < 100)
            desiredAccuracy = kCLLocationAccuracyNearestTenMeters;
        else if (desiredAccuracy_num < 1000)
            desiredAccuracy = kCLLocationAccuracyHundredMeters;
        else if (desiredAccuracy_num < 3000)
            desiredAccuracy = kCLLocationAccuracyKilometer;
        else
            desiredAccuracy = kCLLocationAccuracyThreeKilometers;
        
        self.locationManager.desiredAccuracy = desiredAccuracy;
    }
}

- (void)stopLocation:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
    if (__locationStarted)
	{
		if ([self isLocationServicesEnabled] != YES)
			return;
    
		[self.locationManager stopUpdatingLocation];
		__locationStarted = NO;
	}
}

- (void)locationManager:(CLLocationManager *)manager
							didUpdateToLocation:(CLLocation *)newLocation
							fromLocation:(CLLocation *)oldLocation
{
    double epoch = [newLocation.timestamp timeIntervalSince1970] * 1000.0; // msec

	// <+49.20871478, -122.81349765> +/- 10.00m (speed 0.00 mps / course -1.00)
	// NSLog(@"newLocation: %@",[newLocation description]);
	
	
    float course = -1.0f;
    float speed  = -1.0f;

    course = newLocation.course;
    speed  = newLocation.speed;

	NSString* coords =  [NSString stringWithFormat:@"coords: { latitude: %f, longitude: %f, altitude: %.02f, heading: %.02f, speed: %.02f, accuracy: %.02f, altitudeAccuracy: %.02f }",
							newLocation.coordinate.latitude,
							newLocation.coordinate.longitude,
							newLocation.altitude,
							course,
							speed,
							newLocation.horizontalAccuracy,
							newLocation.verticalAccuracy
						 ];
	
    NSString * jsCallBack = [NSString stringWithFormat:@"navigator.geolocation.setLocation({ timestamp: %.00f, %@ });", epoch, coords];
    
    [super writeJavascript:jsCallBack];
}

- (void)startHeading:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
    if (!__headingStarted)
	{
		if ([self hasHeadingSupport] == NO) 
		{
			// TODO: error
			return;
		}
		
		int freq = 0;
		
		if ([options objectForKey:@"frequency"]) 
		{
			 freq = [(NSString *)[options objectForKey:@"frequency"] integerValue];
#pragma unused(freq)
		}
		
		
		// Tell the location manager to start notifying us of heading updates
		self.locationManager.headingFilter = 0.2;
		[self.locationManager startUpdatingHeading];
		__headingStarted = YES;
	}
}	

- (void)stopHeading:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
    if (__headingStarted)
	{
		if ([self hasHeadingSupport] == NO) 
		{
			// TODO: error
			return;
		}
		
		[self.locationManager stopUpdatingHeading];
		__headingStarted = NO;
	}
}	


- (BOOL)locationManagerShouldDisplayHeadingCalibration:(CLLocationManager *)manager
{
	return YES;
}

- (void)locationManager:(CLLocationManager *)manager
						didUpdateHeading:(CLHeading *)heading
{
	double epoch = [heading.timestamp timeIntervalSince1970] * 1000.0;

	
	
	// NSLog(@"Heading = %@",[heading description]);
	
    NSString * jsCallBack = [NSString stringWithFormat:@"navigator.compass.setHeading({ timestamp: %.00f, magneticHeading: %.02f, trueHeading: %.02f, headingAccuracy: %.02f, x:%.03f,y:%.03f,z:%.03f });", 
							 epoch, 
							 heading.magneticHeading, 
							 heading.trueHeading, 
							 heading.headingAccuracy,
							 heading.x,
							 heading.y,
							 heading.z];
    NSLog(@"%@", jsCallBack);
    
    [super writeJavascript:jsCallBack];
}


- (void)locationManager:(CLLocationManager *)manager didFailWithError:(NSError *)error
{

	NSString* jsCallBack = @"";
	
	if ([error code] == kCLErrorHeadingFailure)
	{
		jsCallBack = [NSString stringWithFormat:@"navigator.compass.setError(\"%@\");",
					  [error localizedDescription]
					  ];
	} 
	else 
	{
		NSString* pErrorDesc = [error localizedFailureReason];
		NSLog(@"locationManager::didFailWithError %@", pErrorDesc);
		
		/*
			W3C PositionError
			 PositionError.UNKNOWN_ERROR = 0;  // equivalent to kCLErrorLocationUnknown=0
			 PositionError.PERMISSION_DENIED = 1; // equivalent to kCLErrorDenied=1
			 PositionError.POSITION_UNAVAILABLE = 2; // equivalent to kCLErrorNetwork=2
		 
			(any other errors are translated to PositionError.UNKNOWN_ERROR)
		 */
		NSInteger code = [error code];
		if (code > kCLErrorNetwork) {
			code = kCLErrorLocationUnknown;
		}
		
		jsCallBack = [NSString stringWithFormat:@"navigator.geolocation.setError({ 'code': %d, 'message': '%@' });", 
									 code,
									 [ error localizedDescription ]];
	}
	
    [super writeJavascript:jsCallBack];
	[self.locationManager stopUpdatingLocation];
    __locationStarted = NO;
	
}

- (void)dealloc 
{
	self.locationManager.delegate = nil;
	self.locationManager = nil;
	[super dealloc];
}

@end
