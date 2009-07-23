/*
 *  Location.m
 *
 *  Created by Nitobi on 12/12/08.
 *  Copyright 2008 Nitobi. All rights reserved.
 *
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
	 // check whether headingAvailable property is avail (for 2.x devices)
	if ([self.locationManager respondsToSelector:@selector(headingAvailable)] == NO)
        return NO;

	#ifdef __IPHONE_3_0
	// now 3.x device, check whether it has heading support (eg Compass)
	if ([self.locationManager headingAvailable] == NO) 
		return NO;
	#endif
	
	return YES;
}

- (void)startLocation:(NSMutableArray*)arguments
     withDict:(NSMutableDictionary*)options
{
    if (__locationStarted == YES)
        return;
    if ([self.locationManager locationServicesEnabled] != YES)
        return;
    
    // Tell the location manager to start notifying us of location updates
    [self.locationManager startUpdatingLocation];
    __locationStarted = YES;

    if ([options objectForKey:@"distanceFilter"]) {
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
    if ([self.locationManager locationServicesEnabled] != YES)
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
	NSString* coords =  [NSString stringWithFormat:@"coords: { latitude: %f, longitude: %f, altitude: %f, heading: %f, speed: %f, accuracy: {horizontal: %f, vertical: %f}, altitudeAccuracy: null }",
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
		jsCallBack = [NSString stringWithFormat:@"navigator.compass.setError(\"%s\");",
					  [error localizedDescription]
					  ];
	} else 
	#endif
	{
		jsCallBack = [NSString stringWithFormat:@"navigator.geolocation.setError(\"%s\");",
								 [error localizedDescription]
								];
	}
    NSLog(@"%@", jsCallBack);
    
    [webView stringByEvaluatingJavaScriptFromString:jsCallBack];
}

- (void)dealloc {
    [self.locationManager release];
	[super dealloc];
}

@end
