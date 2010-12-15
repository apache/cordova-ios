/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 */


#import <UIKit/UIKit.h>
#import <CoreLocation/CoreLocation.h>
#import "PhoneGapCommand.h"

@interface Location : PhoneGapCommand <CLLocationManagerDelegate> {
	CLLocationManager *locationManager;
    BOOL              __locationStarted;
    BOOL              __headingStarted;
}

@property (nonatomic, retain) CLLocationManager *locationManager;

- (BOOL) hasHeadingSupport;

- (void)startLocation:(NSMutableArray*)arguments
     withDict:(NSMutableDictionary*)options;

- (void)stopLocation:(NSMutableArray*)arguments
    withDict:(NSMutableDictionary*)options;

- (void)locationManager:(CLLocationManager *)manager
    didUpdateToLocation:(CLLocation *)newLocation
           fromLocation:(CLLocation *)oldLocation;

- (void)locationManager:(CLLocationManager *)manager
       didFailWithError:(NSError *)error;

- (BOOL) isLocationServicesEnabled;

#ifdef __IPHONE_3_0

- (void)startHeading:(NSMutableArray*)arguments
			withDict:(NSMutableDictionary*)options;

- (void)stopHeading:(NSMutableArray*)arguments
		   withDict:(NSMutableDictionary*)options;

- (void)locationManager:(CLLocationManager *)manager
	   didUpdateHeading:(CLHeading *)heading;

- (BOOL)locationManagerShouldDisplayHeadingCalibration:(CLLocationManager *)manager;

#endif

@end