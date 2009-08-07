/*
 *  Location.h
 *
 *  Created by Nitobi on 12/12/08.
 *  Copyright 2008 Nitobi. All rights reserved.
 *
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