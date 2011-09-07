/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 */


#import <UIKit/UIKit.h>
#import <CoreLocation/CoreLocation.h>
#import "PGPlugin.h"

enum HeadingStatus {
	HEADINGSTOPPED = 0,
    HEADINGSTARTING,
	HEADINGRUNNING,
    HEADINGERROR
};
typedef NSUInteger HeadingStatus;

// simple object to keep track of heading information
@interface PGHeadingData : NSObject {
    HeadingStatus     headingStatus;
    BOOL              headingRepeats;
    CLHeading*        headingInfo;
    NSMutableArray*   headingCallbacks;
    NSString*         headingFilter;
    
}

@property (nonatomic, assign) HeadingStatus headingStatus;
@property (nonatomic, assign) BOOL headingRepeats;
@property (nonatomic, retain) CLHeading* headingInfo;
@property (nonatomic, retain) NSMutableArray* headingCallbacks;
@property (nonatomic, retain) NSString* headingFilter;

@end

@interface PGLocation : PGPlugin <CLLocationManagerDelegate> {

    @private BOOL              __locationStarted;
    PGHeadingData*    headingData;
}

@property (nonatomic, retain) CLLocationManager *locationManager;
@property (nonatomic, retain) PGHeadingData* headingData;


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

- (void)getCurrentHeading:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void)returnHeadingInfo: (NSString*) callbackId keepCallback: (BOOL) bRetain;

- (void)stopHeading:(NSMutableArray*)arguments
		   withDict:(NSMutableDictionary*)options;
- (void) startHeadingWithFilter: (CLLocationDegrees) filter;
- (void)locationManager:(CLLocationManager *)manager
	   didUpdateHeading:(CLHeading *)heading;

- (BOOL)locationManagerShouldDisplayHeadingCalibration:(CLLocationManager *)manager;

@end


