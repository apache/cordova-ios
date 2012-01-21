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
#import "JSONKit.h"
#import "PGCommandDelegate.h"

@class InvokedUrlCommand;
@class PhoneGapViewController;
@class Sound;
@class Contacts;
@class Console;
@class PGWhitelist;

__attribute__((deprecated)) @interface PhoneGapDelegate : NSObject <UIApplicationDelegate, UIWebViewDelegate, PGCommandDelegate>
{
}

@property (nonatomic, readwrite, retain) IBOutlet UIWindow *window;
@property (nonatomic, readwrite, retain) IBOutlet UIWebView *webView;
@property (nonatomic, readonly, retain) IBOutlet PhoneGapViewController *viewController;
@property (nonatomic, readonly, retain) IBOutlet UIActivityIndicatorView *activityView;
@property (nonatomic, readonly, retain) UIImageView *imageView;
@property (nonatomic, readonly, retain) NSMutableDictionary *pluginObjects;
@property (nonatomic, readonly, retain) NSDictionary *pluginsMap;
@property (nonatomic, readonly, retain) NSDictionary *settings;
@property (nonatomic, readonly, retain) PGWhitelist* whitelist; // readonly for public

+ (NSDictionary*)getBundlePlist:(NSString *)plistName;
+ (NSString*) wwwFolderName;
+ (NSString*) phoneGapVersion;
+ (NSString*) applicationDocumentsDirectory;
+ (NSString*) startPage;

- (int)executeQueuedCommands;
- (void)flushCommandQueue;

- (void) javascriptAlert:(NSString*)text;
- (NSString*) appURLScheme;
- (NSDictionary*) deviceProperties;

- (void)applicationDidEnterBackground:(UIApplication *)application;
- (void)applicationWillEnterForeground:(UIApplication *)application;
- (void)applicationWillResignActive:(UIApplication *)application;
- (void)applicationWillTerminate:(UIApplication *)application;

@end

