/*
 *  Location.h
 *
 *  Created by Nitobi on 12/12/08.
 *  Copyright 2008 Nitobi. All rights reserved.
 *
 */

#import <UIKit/UIKit.h>
#import <CoreLocation/CoreLocation.h>

@protocol LocationDelegate <NSObject>
@required
@end


@interface Location : NSObject <CLLocationManagerDelegate> {
	CLLocationManager *locationManager;
	CLLocation		  *lastKnownLocation;
	id delegate;

}

@property (nonatomic, retain) CLLocation *lastKnownLocation;
@property (nonatomic, retain) CLLocationManager *locationManager;
@property (nonatomic,assign) id <LocationDelegate> delegate;

- (NSString *) getPosition;

- (void)locationManager:(CLLocationManager *)manager
    didUpdateToLocation:(CLLocation *)newLocation
           fromLocation:(CLLocation *)oldLocation;

+ (Location *)sharedInstance;

@end