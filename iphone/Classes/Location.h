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
	id                delegate;
    BOOL              __started;
}

@property (nonatomic, retain) CLLocation *lastKnownLocation;
@property (nonatomic, retain) CLLocationManager *locationManager;
@property (nonatomic,assign) id <LocationDelegate> delegate;

+ (void)get:(NSString*)options forWebView:(UIWebView*)webView;
+ (void)start:(NSString*)options forWebView:(UIWebView*)webView;

- (void)start;
- (NSString *) getPosition;

- (void)locationManager:(CLLocationManager *)manager
    didUpdateToLocation:(CLLocation *)newLocation
           fromLocation:(CLLocation *)oldLocation;

+ (Location *)sharedInstance;

@end