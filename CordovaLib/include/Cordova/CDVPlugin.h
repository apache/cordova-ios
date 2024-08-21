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

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import <Cordova/CDVAvailabilityDeprecated.h>
#import <Cordova/CDVPluginResult.h>
#import <Cordova/NSMutableArray+QueueAdditions.h>
#import <Cordova/CDVCommandDelegate.h>
#import <Cordova/CDVSettingsDictionary.h>
#import <Cordova/CDVViewController.h>
#import <Cordova/CDVWebViewEngineProtocol.h>
#import <Cordova/CDVInvokedUrlCommand.h>

@interface UIView (org_apache_cordova_UIView_Extension)

@property (nonatomic, weak) UIScrollView* scrollView;

@end

extern const NSNotificationName CDVPageDidLoadNotification;
extern const NSNotificationName CDVPluginHandleOpenURLNotification;
extern const NSNotificationName CDVPluginHandleOpenURLWithAppSourceAndAnnotationNotification CDV_DEPRECATED(8, "Find sourceApplication and annotations in the userInfo of the CDVPluginHandleOpenURLNotification notification.");
extern const NSNotificationName CDVPluginResetNotification;
extern const NSNotificationName CDVViewWillAppearNotification;
extern const NSNotificationName CDVViewDidAppearNotification;
extern const NSNotificationName CDVViewWillDisappearNotification;
extern const NSNotificationName CDVViewDidDisappearNotification;
extern const NSNotificationName CDVViewWillLayoutSubviewsNotification;
extern const NSNotificationName CDVViewDidLayoutSubviewsNotification;
extern const NSNotificationName CDVViewWillTransitionToSizeNotification;

@interface CDVPlugin : NSObject {}

@property (nonatomic, readonly, weak) UIView* webView;
@property (nonatomic, readonly, weak) id <CDVWebViewEngineProtocol> webViewEngine;

@property (nonatomic, weak) CDVViewController* viewController;
@property (nonatomic, weak) id <CDVCommandDelegate> commandDelegate;

@property (readonly, assign) BOOL hasPendingOperation;

- (void)pluginInitialize;

- (void)handleOpenURL:(NSNotification*)notification;
- (void)handleOpenURLWithApplicationSourceAndAnnotation:(NSNotification*)notification CDV_DEPRECATED(8, "Use the handleOpenUrl method and the notification userInfo data.");
- (void)onAppTerminate;
- (void)onMemoryWarning;
- (void)onReset;
- (void)dispose;

/*
 // see initWithWebView implementation
 - (void) onPause {}
 - (void) onResume {}
 - (void) onOrientationWillChange {}
 - (void) onOrientationDidChange {}
 */

- (id)appDelegate;

@end
