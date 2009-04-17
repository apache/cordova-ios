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
    BOOL              __started;
}

@property (nonatomic, retain) CLLocationManager *locationManager;

- (void)start:(NSMutableArray*)arguments
     withDict:(NSMutableDictionary*)options;

- (void)stop:(NSMutableArray*)arguments
    withDict:(NSMutableDictionary*)options;

- (void)locationManager:(CLLocationManager *)manager
    didUpdateToLocation:(CLLocation *)newLocation
           fromLocation:(CLLocation *)oldLocation;

- (void)locationManager:(CLLocationManager *)manager
       didFailWithError:(NSError *)error;

@end