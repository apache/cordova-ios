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

@import UIKit;
@import WebKit;
#import <Foundation/NSJSONSerialization.h>
#import <Cordova/CDVAvailability.h>
#import <Cordova/CDVInvokedUrlCommand.h>
#import <Cordova/CDVCommandDelegate.h>
#import <Cordova/CDVCommandQueue.h>
#import <Cordova/CDVScreenOrientationDelegate.h>
#import <Cordova/CDVPlugin.h>
#import <Cordova/CDVWebViewEngineProtocol.h>

@protocol CDVWebViewEngineConfigurationDelegate <NSObject>

@optional
/// Provides a fully configured WKWebViewConfiguration which will be overriden with
/// any related settings you add to config.xml (e.g., `PreferredContentMode`).
/// Useful for more complex configuration, including websiteDataStore.
///
/// Example usage:
///
/// extension CDVViewController: CDVWebViewEngineConfigurationDelegate {
///     public func configuration() -> WKWebViewConfiguration {
///         // return your config here
///     }
/// }
- (nonnull WKWebViewConfiguration*)configuration;

@end

@interface CDVViewController : UIViewController <CDVScreenOrientationDelegate>{
    @protected
    id <CDVWebViewEngineProtocol> _webViewEngine;
    @protected
    id <CDVCommandDelegate> _commandDelegate;
    @protected
    CDVCommandQueue* _commandQueue;
}

NS_ASSUME_NONNULL_BEGIN

@property (nonatomic, readonly, weak) IBOutlet UIView* webView;
@property (nonatomic, readonly, strong) UIView* launchView;

@property (nullable, nonatomic, readonly, strong) NSMutableDictionary* pluginObjects;
@property (nonatomic, readonly, strong) NSDictionary* pluginsMap;
@property (nonatomic, readonly, strong) NSMutableDictionary* settings;
@property (nonatomic, readonly, strong) NSXMLParser* configParser;

@property (nonatomic, readwrite, copy) NSString* appScheme;
@property (nonatomic, readwrite, copy) NSString* configFile;
@property (nonatomic, readwrite, copy) NSString* wwwFolderName;
@property (nonatomic, readwrite, copy) NSString* startPage;
@property (nonatomic, readonly, strong) CDVCommandQueue* commandQueue;
@property (nonatomic, readonly, strong) id <CDVWebViewEngineProtocol> webViewEngine;
@property (nonatomic, readonly, strong) id <CDVCommandDelegate> commandDelegate;

/**
    Takes/Gives an array of UIInterfaceOrientation (int) objects
    ex. UIInterfaceOrientationPortrait
*/
@property (nonatomic, readwrite, strong) NSArray* supportedOrientations;

- (UIView*)newCordovaViewWithFrame:(CGRect)bounds;

- (nullable NSString*)appURLScheme;
- (nullable NSURL*)errorURL;

- (NSArray*)parseInterfaceOrientations:(NSArray*)orientations;
- (BOOL)supportsOrientation:(UIInterfaceOrientation)orientation;

- (nullable id)getCommandInstance:(NSString*)pluginName;
- (void)registerPlugin:(CDVPlugin*)plugin withClassName:(NSString*)className;
- (void)registerPlugin:(CDVPlugin*)plugin withPluginName:(NSString*)pluginName;

- (void)parseSettingsWithParser:(NSObject <NSXMLParserDelegate>*)delegate;

- (void)showLaunchScreen:(BOOL)visible;

NS_ASSUME_NONNULL_END

@end
