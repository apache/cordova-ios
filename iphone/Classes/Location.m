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
    self = [super initWithWebView:(UIWebView*)theWebView];
    if (self) {
        self.locationManager = [[[CLLocationManager alloc] init] autorelease];
        self.locationManager.delegate = self; // Tells the location manager to send updates to this object
    }
    return self;
}

- (void)start:(NSMutableArray*)arguments
     withDict:(NSMutableDictionary*)options
{
    if (__started == YES)
        return;
    if ([self.locationManager locationServicesEnabled] != YES)
        return;
    
    // Tell the location manager to start notifying us of location updates
    [self.locationManager startUpdatingLocation];
    __started = YES;

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

- (void)stop:(NSMutableArray*)arguments
    withDict:(NSMutableDictionary*)options
{
    if (__started == NO)
        return;
    if ([self.locationManager locationServicesEnabled] != YES)
        return;
    
    [self.locationManager stopUpdatingLocation];
    __started = NO;
}

- (void)locationManager:(CLLocationManager *)manager
    didUpdateToLocation:(CLLocation *)newLocation
           fromLocation:(CLLocation *)oldLocation
{
    int epoch = [newLocation.timestamp timeIntervalSince1970];
    NSString * jsCallBack = [NSString stringWithFormat:@"navigator.geolocation.setLocation({timestamp: %d, latitude: %f, longitude: %f, altitude: %f, course: %f, speed: %f, accuracy: {horizontal: %f, vertical: %f}});",
                             epoch,
                             newLocation.coordinate.latitude,
                             newLocation.coordinate.longitude,
                             newLocation.altitude,
                             newLocation.course,
                             newLocation.speed,
                             newLocation.horizontalAccuracy,
                             newLocation.verticalAccuracy
    ];
    NSLog(@"%@", jsCallBack);
    
    [webView stringByEvaluatingJavaScriptFromString:jsCallBack];
}

- (void)locationManager:(CLLocationManager *)manager
       didFailWithError:(NSError *)error
{
    NSString * jsCallBack = [NSString stringWithFormat:@"navigator.geolocation.setError(\"%s\");",
                             [error localizedDescription]
                            ];
    NSLog(@"%@", jsCallBack);
    
    [webView stringByEvaluatingJavaScriptFromString:jsCallBack];
}

- (void)dealloc {
    [self.locationManager release];
	[super dealloc];
}

@end
