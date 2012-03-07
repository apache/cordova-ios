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
#import "CDVPlugin.h"

@interface CDVLocation : CDVPlugin <CLLocationManagerDelegate> {
    @private BOOL __locationStarted;
    @private NSString *callbackId;
    double timestamp;
    double latitude;
    double longitude;
    double altitude;
    double velocity;
    double heading;
    double accuracy;
    double altitudeAccuracy;
}

@property (nonatomic, retain) CLLocationManager *locationManager;
@property double timestamp;
@property double latitude;
@property double longitude;
@property double altitude;
@property double velocity;
@property double heading;
@property double accuracy;
@property double altitudeAccuracy;

- (void)getLocation:(NSMutableArray*)arguments
     withDict:(NSMutableDictionary*)options;

- (void)startLocation;

- (void)stopLocation;

- (void)locationManager:(CLLocationManager *)manager
    didUpdateToLocation:(CLLocation *)newLocation
           fromLocation:(CLLocation *)oldLocation;

- (void)locationManager:(CLLocationManager *)manager
       didFailWithError:(NSError *)error;

- (BOOL) isLocationServicesEnabled;

@end


