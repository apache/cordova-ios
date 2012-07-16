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

#import "CDVCordovaView.h"

#import "JSONKit.h"
#import "CDVInvokedUrlCommand.h"
#import "CDVCommandDelegate.h"
#import "CDVWhitelist.h"


@interface CDVViewController : UIViewController<UIWebViewDelegate, CDVCommandDelegate> {
	
}

@property (nonatomic, retain) IBOutlet CDVCordovaView* webView;

@property (nonatomic, readonly, retain) NSMutableDictionary* pluginObjects;
@property (nonatomic, readonly, retain) NSDictionary* pluginsMap;
@property (nonatomic, readonly, retain) NSDictionary* settings;
@property (nonatomic, readonly, retain) CDVWhitelist* whitelist; // readonly for public
@property (nonatomic, readonly, retain) NSArray* supportedOrientations;
@property (nonatomic, readonly, assign) BOOL loadFromString;
@property (nonatomic, readwrite, copy) NSString* invokeString __attribute__ ((deprecated));

@property (nonatomic, readwrite, assign) BOOL useSplashScreen;
@property (nonatomic, readonly, retain) IBOutlet UIActivityIndicatorView* activityView;
@property (nonatomic, readonly, retain) UIImageView *imageView;
@property (nonatomic, readwrite, retain) id<CDVCommandDelegate> commandDelegate;

@property (nonatomic, readwrite, copy) NSString* wwwFolderName;
@property (nonatomic, readwrite, copy) NSString* startPage;

+ (NSDictionary*) getBundlePlist:(NSString*)plistName;
+ (NSString*) applicationDocumentsDirectory;

- (void) dispose;
- (void) printMultitaskingInfo;
- (void) createGapView;
- (CDVCordovaView*) newCordovaViewWithFrame:(CGRect)bounds;

- (int) executeQueuedCommands;
- (void) flushCommandQueue;

- (void) javascriptAlert:(NSString*)text;
- (NSString*) appURLScheme;

- (NSArray*) parseInterfaceOrientations:(NSArray*)orientations;

@end
