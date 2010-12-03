/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 */


#import "Location.h"

@implementation Location

@synthesize locationManager;

-(PhoneGapCommand*) initWithWebView:(UIWebView*)theWebView
{
    self = (Location*)[super initWithWebView:(UIWebView*)theWebView];
    if (self) {
        self.locationManager = [[[CLLocationManager alloc] init] autorelease];
        self.locationManager.delegate = self; // Tells the location manager to send updates to this object
    }
    return self;
}

- (BOOL) hasHeadingSupport
{
	BOOL headingInstancePropertyAvailable = [self.locationManager respondsToSelector:@selector(headingAvailable)]; // iOS 3.x
	BOOL headingClassPropertyAvailable = [[self.locationManager class] respondsToSelector:@selector(headingAvailable)]; // iOS 4.x
	
	if (headingInstancePropertyAvailable) { // iOS 3.x
		return [(id)self.locationManager headingAvailable];
	} else if (headingClassPropertyAvailable) { // iOS 4.x
		return [[self.locationManager class] headingAvailable];
	} else { // iOS 2.x
		return NO;
	}
}

- (BOOL) isLocationServicesEnabled
{
	BOOL locationServicesEnabledInstancePropertyAvailable = [self.locationManager respondsToSelector:@selector(locationServicesEnabled)]; // iOS 3.x
	BOOL locationServicesEnabledClassPropertyAvailable = [[self.locationManager class] respondsToSelector:@selector(locationServicesEnabled)]; // iOS 4.x
	
	if (locationServicesEnabledInstancePropertyAvailable) { // iOS 2.x, iOS 3.x
		return [(id)self.locationManager locationServicesEnabled];
	} else if (locationServicesEnabledClassPropertyAvailable) { // iOS 4.x
		return [[self.locationManager class] locationServicesEnabled];
	} else {
		return NO;
	}
}

- (void)startLocation:(NSMutableArray*)arguments
     withDict:(NSMutableDictionary*)options
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
			[webView stringByEvaluatingJavaScriptFromString:jsErrorCallBack];
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

- (void)stopLocation:(NSMutableArray*)arguments
    withDict:(NSMutableDictionary*)options
{
    if (__locationStarted == NO)
        return;
    if ([self isLocationServicesEnabled] != YES)
        return;
    
    [self.locationManager stopUpdatingLocation];
    __locationStarted = NO;
}

- (void)locationManager:(CLLocationManager *)manager
    didUpdateToLocation:(CLLocation *)newLocation
           fromLocation:(CLLocation *)oldLocation
{
    int epoch = [newLocation.timestamp timeIntervalSince1970];
    float course = -1.0f;
    float speed  = -1.0f;
#ifdef __IPHONE_2_2
    course = newLocation.course;
    speed  = newLocation.speed;
#endif
	NSString* coords =  [NSString stringWithFormat:@"coords: { latitude: %f, longitude: %f, altitude: %f, heading: %f, speed: %f, accuracy: %f, altitudeAccuracy: %f }",
							newLocation.coordinate.latitude,
							newLocation.coordinate.longitude,
							newLocation.altitude,
							course,
							speed,
							newLocation.horizontalAccuracy,
							newLocation.verticalAccuracy
						 ];
	
    NSString * jsCallBack = [NSString stringWithFormat:@"navigator.geolocation.setLocation({ timestamp: %d, %@ });", epoch, coords];
    NSLog(@"%@", jsCallBack);
    
    [webView stringByEvaluatingJavaScriptFromString:jsCallBack];
}

- (void)startHeading:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
#ifdef __IPHONE_3_0
    if (__headingStarted == YES)
        return;
    if ([self hasHeadingSupport] == NO) 
        return;
	
    // Tell the location manager to start notifying us of heading updates
    [self.locationManager startUpdatingHeading];
    __headingStarted = YES;
#endif	
}	

- (void)stopHeading:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
#ifdef __IPHONE_3_0
    if (__headingStarted == NO)
        return;
    if ([self hasHeadingSupport] == NO) 
		return;
    
    [self.locationManager stopUpdatingHeading];
    __headingStarted = NO;
#endif
}	

#ifdef __IPHONE_3_0

- (BOOL)locationManagerShouldDisplayHeadingCalibration:(CLLocationManager *)manager
{
	return YES;
}

- (void)locationManager:(CLLocationManager *)manager
	   didUpdateHeading:(CLHeading *)heading
{
	int epoch = [heading.timestamp timeIntervalSince1970];
	
    NSString * jsCallBack = [NSString stringWithFormat:@"navigator.compass.setHeading({ timestamp: %d, magneticHeading: %f, trueHeading: %f, headingAccuracy: %f });", 
							 epoch, heading.magneticHeading, heading.trueHeading, heading.headingAccuracy];
   // NSLog(@"%@", jsCallBack);
    
    [webView stringByEvaluatingJavaScriptFromString:jsCallBack];
}

#endif

- (void)locationManager:(CLLocationManager *)manager
       didFailWithError:(NSError *)error
{

	
	NSString* jsCallBack = @"";
	
	#ifdef __IPHONE_3_0
	if ([error code] == kCLErrorHeadingFailure) {
		jsCallBack = [NSString stringWithFormat:@"navigator.compass.setError(\"%@\");",
					  [error localizedDescription]
					  ];
	} else 
	#endif
	{
		NSString* pErrorDesc = [error localizedFailureReason];
#pragma unused(pErrorDesc)
		jsCallBack = [NSString stringWithFormat:@"navigator.geolocation.setError({ 'code': %d, 'message': '%@' });", 
									 1, // 1 is PERMISSION_DENIED
									 [error localizedDescription]];
	}
    NSLog(@"%@", jsCallBack);
	
    [webView stringByEvaluatingJavaScriptFromString:jsCallBack];
	[self.locationManager stopUpdatingLocation];
    __locationStarted = NO;
	
}

- (void)dealloc {
    [self.locationManager release];
	[super dealloc];
}

@end
