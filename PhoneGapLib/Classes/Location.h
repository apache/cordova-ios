/*
 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at
 
 http://www.apache.org/licenses/LICENSE-2.0
 
 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
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


