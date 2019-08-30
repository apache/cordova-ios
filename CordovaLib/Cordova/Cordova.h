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

//! Project version number for Cordova.
FOUNDATION_EXPORT double CordovaVersionNumber;

//! Project version string for Cordova.
FOUNDATION_EXPORT const unsigned char CordovaVersionString[];

// In this header, you should import all the public headers of your framework using statements like #import <Cordova/PublicHeader.h>

#import <Cordova/CDV.h>
#import <Cordova/CDVCommandDelegateImpl.h>
#import <Cordova/CDVAvailability.h>
#import <Cordova/CDVAvailabilityDeprecated.h>
#import <Cordova/CDVAppDelegate.h>
#import <Cordova/CDVPlugin.h>
#import <Cordova/CDVPluginResult.h>
#import <Cordova/CDVViewController.h>
#import <Cordova/CDVCommandDelegate.h>
#import <Cordova/CDVCommandQueue.h>
#import <Cordova/CDVConfigParser.h>
#import <Cordova/CDVURLProtocol.h>
#import <Cordova/CDVInvokedUrlCommand.h>
#import <Cordova/CDVPlugin+Resources.h>
#import <Cordova/CDVWebViewEngineProtocol.h>
#import <Cordova/NSDictionary+CordovaPreferences.h>
#import <Cordova/NSMutableArray+QueueAdditions.h>
#import <Cordova/CDVWhitelist.h>
#import <Cordova/CDVScreenOrientationDelegate.h>
#import <Cordova/CDVTimer.h>
#import <Cordova/CDVUserAgentUtil.h>
