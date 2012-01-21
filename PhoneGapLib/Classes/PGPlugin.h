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
#import "PluginResult.h"
#import "NSMutableArray+QueueAdditions.h"
#import "PGCommandDelegate.h"

#define PGPluginHandleOpenURLNotification	@"PGPluginHandleOpenURLNotification"

#define VERIFY_ARGUMENTS(args, expectedCount, callbackId) if (![self verifyArguments:args withExpectedCount:expectedCount andCallbackId:callbackId \
callerFileName:__FILE__ callerFunctionName:__PRETTY_FUNCTION__]) { return; }


@interface PGPlugin : NSObject {
}

@property (nonatomic, retain) UIWebView* webView;
@property (nonatomic, retain) NSDictionary* settings;
@property (nonatomic, retain) UIViewController* viewController;
@property (nonatomic, retain) id<PGCommandDelegate> commandDelegate;

- (PGPlugin*) initWithWebView:(UIWebView*)theWebView settings:(NSDictionary*)classSettings;
- (PGPlugin*) initWithWebView:(UIWebView*)theWebView;

- (void) handleOpenURL:(NSNotification*)notification;
- (void) onAppTerminate;
- (void) onMemoryWarning;

/*
 // see initWithWebView implementation
 - (void) onPause {}
 - (void) onResume {}
 - (void) onOrientationWillChange {}
 - (void) onOrientationDidChange {}
 */

- (id) appDelegate;
- (UIViewController*) appViewController __attribute__((deprecated)); /* just use the .viewController property in the future */

- (NSString*) writeJavascript:(NSString*)javascript;
- (NSString*) success:(PluginResult*)pluginResult callbackId:(NSString*)callbackId;
- (NSString*) error:(PluginResult*)pluginResult callbackId:(NSString*)callbackId;

- (BOOL) verifyArguments:(NSMutableArray*)arguments withExpectedCount:(NSUInteger)expectedCount andCallbackId:(NSString*)callbackId 
		  callerFileName:(const char*)callerFileName callerFunctionName:(const char*)callerFunctionName;

@end
