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
#import <Foundation/NSJSONSerialization.h>
#import "OneAppCDVAvailability.h"
#import "OneAppCDVInvokedUrlCommand.h"
#import "OneAppCDVCommandDelegate.h"
#import "OneAppCDVCommandQueue.h"
#import "OneAppCDVScreenOrientationDelegate.h"
#import "OneAppCDVPlugin.h"
#import "OneAppCDVWebViewEngineProtocol.h"

@interface OneAppCDVViewController : UIViewController <OneAppCDVScreenOrientationDelegate>{
    @protected
    id <OneAppCDVWebViewEngineProtocol> _webViewEngine;
    @protected
    id <OneAppCDVCommandDelegate> _commandDelegate;
    @protected
    OneAppCDVCommandQueue* _commandQueue;
}

@property (nonatomic, readonly, weak) IBOutlet UIView* webView;
@property (nonatomic, readonly, strong) UIView* launchView;

@property (nonatomic, readonly, strong) NSMutableDictionary* pluginObjects;
@property (nonatomic, readonly, strong) NSDictionary* pluginsMap;
@property (nonatomic, readonly, strong) NSMutableDictionary* settings;
@property (nonatomic, readonly, strong) NSXMLParser* configParser;

@property (nonatomic, readwrite, copy) NSString* appScheme;
@property (nonatomic, readwrite, copy) NSString* configFile;
@property (nonatomic, readwrite, copy) NSString* wwwFolderName;
@property (nonatomic, readwrite, copy) NSString* startPage;
@property (nonatomic, readonly, strong) OneAppCDVCommandQueue* commandQueue;
@property (nonatomic, readonly, strong) id <OneAppCDVWebViewEngineProtocol> webViewEngine;
@property (nonatomic, readonly, strong) id <OneAppCDVCommandDelegate> commandDelegate;

/**
	Takes/Gives an array of UIInterfaceOrientation (int) objects
	ex. UIInterfaceOrientationPortrait
*/
@property (nonatomic, readwrite, strong) NSArray* supportedOrientations;

- (UIView*)newCordovaViewWithFrame:(CGRect)bounds;

- (NSString*)appURLScheme;
- (NSURL*)errorURL;

- (UIColor*)colorFromColorString:(NSString*)colorString CDV_DEPRECATED(7.0.0, "Use BackgroundColor in xcassets");
- (NSArray*)parseInterfaceOrientations:(NSArray*)orientations;
- (BOOL)supportsOrientation:(UIInterfaceOrientation)orientation;

- (id)getCommandInstance:(NSString*)pluginName;
- (void)registerPlugin:(OneAppCDVPlugin*)plugin withClassName:(NSString*)className;
- (void)registerPlugin:(OneAppCDVPlugin*)plugin withPluginName:(NSString*)pluginName;

- (void)parseSettingsWithParser:(NSObject <NSXMLParserDelegate>*)delegate;

- (void)showLaunchScreen:(BOOL)visible;

@end
