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
#import <Cordova/CDVCommandDelegate.h>
#import <Cordova/CDVSettingsDictionary.h>
#import <Cordova/CDVViewController.h>
#import <Cordova/CDVWebViewEngineProtocol.h>
#import <Cordova/CDVInvokedUrlCommand.h>

// Forward declaration to avoid bringing WebKit API into public headers
@protocol WKURLSchemeTask;

typedef int CDVWebViewNavigationType;

NS_ASSUME_NONNULL_BEGIN

#ifndef __swift__
// This global extension to the UIView class causes issues for Swift subclasses
// of UIView with their own scrollView properties, so we're removing it from
// the exposed Swift API and marking it as deprecated
// TODO: Remove in Cordova 9
@interface UIView (org_apache_cordova_UIView_Extension)
@property (nonatomic, weak, nullable) UIScrollView* scrollView CDV_DEPRECATED(8, "Check for a scrollView property on the view object at runtime and invoke it dynamically.");
@end
#endif

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

NS_ASSUME_NONNULL_END

@interface CDVPlugin : NSObject {}

@property (nonatomic, readonly, weak) UIView* webView;
@property (nonatomic, readonly, weak) id <CDVWebViewEngineProtocol> webViewEngine;

@property (nonatomic, weak) CDVViewController* viewController;
@property (nonatomic, weak) id <CDVCommandDelegate> commandDelegate;

@property (readonly, assign) BOOL hasPendingOperation;

- (void)pluginInitialize;

- (void)handleOpenURL:(nonnull NSNotification*)notification;
- (void)handleOpenURLWithApplicationSourceAndAnnotation:(nonnull NSNotification*)notification CDV_DEPRECATED(8, "Use the handleOpenUrl method and the notification userInfo data.");
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

- (nonnull id)appDelegate;

@end

#pragma mark - Plugin protocols

NS_ASSUME_NONNULL_BEGIN

/**
 A protocol for Cordova plugins to intercept and respond to server
 authentication challenges through WebKit.

 Your plugin should implement this protocol and the
 ``willHandleAuthenticationChallenge:completionHandler:`` method to return
 `YES` if it wants to support responses to server-side authentication
 challenges, otherwise the default NSURLSession handling for authentication
 challenges will be used.
 */
@protocol CDVPluginAuthenticationHandler <NSObject>

/**
 Asks your plugin to respond to an authentication challenge.

 Return `YES` if the plugin is handling the challenge, and `NO` to fallback to
 the default handling.

 - Parameters:
   - challenge: The authentication challenge.
   - completionHandler: A completion handler block to execute with the response.
     This handler has no return value and takes the following parameters:
     - disposition: The option to use to handle the challenge. For a list of
       options, see `NSURLSessionAuthChallengeDisposition`.
     - credential: The credential to use for authentication when the
       `disposition` parameter contains the value
       `NSURLSessionAuthChallengeUseCredential`. Specify `nil` to continue
       without a credential.
 - Returns: A Boolean value indicating if the plugin is handling the request.
 */
- (BOOL)willHandleAuthenticationChallenge:(NSURLAuthenticationChallenge *)challenge completionHandler:(void (^)(NSURLSessionAuthChallengeDisposition, NSURLCredential * _Nullable))completionHandler;

@end


/**
 A protocol for Cordova plugins to manage permitting and denying of webview
 navigations.

 You plugin should implement this protocol if it wants to control whether the
 webview is allowed to navigate to a requested URL.
 */
@protocol CDVPluginNavigationHandler <NSObject>

/**
 Asks your plugin to decide whether a navigation request should be permitted or
 denied.

 - Parameters:
   - request: The navigation request.
   - navigationType: The type of action triggering the navigation.
   - navInfo: Descriptive information about the action triggering the navigation.

 - Returns: A Boolean representing whether the navigation should be allowed or not.
 */
- (BOOL)shouldOverrideLoadWithRequest:(NSURLRequest *)request navigationType:(CDVWebViewNavigationType)navigationType info:(NSDictionary *)navInfo;

@optional
/**
 @DeprecationSummary {
   Use ``shouldOverrideLoadWithRequest:navigationType:info:`` instead.
 }
 */
- (BOOL)shouldOverrideLoadWithRequest:(NSURLRequest *)request navigationType:(CDVWebViewNavigationType)navigationType CDV_DEPRECATED_WITH_REPLACEMENT(8, "Use shouldOverrideLoadWithRequest:navigationType:info: instead", "shouldOverrideLoadWithRequest:navigationType:info:");

@end


/**
 A protocol for Cordova plugins to intercept handling of WebKit resource
 loading for a custom URL scheme.

 Your plugin should implement this protocol if it wants to intercept requests
 to a custom URL scheme and provide its own resource loading. Otherwise,
 Cordova will use its default resource loading behavior from the app bundle.

 When a WebKit-based web view encounters a resource that uses a custom scheme,
 it creates a WKURLSchemeTask object and Cordova passes it to the methods of
 your scheme handler plugin for processing. Use the ``overrideSchemeTask:``
 method to indicate that your plugin will handle the request and to begin
 loading the resource. While your handler loads the object, Cordova may call
 your plugin’s ``stopSchemeTask:`` method to notify you that the resource is no
 longer needed.
 */
@protocol CDVPluginSchemeHandler <NSObject>

/**
 Asks your plugin to handle the specified request and begin loading data.

 If your plugin intends to handle the request and return data, this method
 should return `YES` as soon as possible to prevent the default request
 handling. If this method returns `NO`, Cordova will handle the resource
 loading using its default behavior.

 - Parameters:
   - task: The task object that identifies the resource to load. You also use
     this object to report the progress of the load operation back to the web
     view.
 - Returns: A Boolean value indicating if the plugin is handling the request.
 */
- (BOOL)overrideSchemeTask:(id <WKURLSchemeTask>)task;

/**
 Asks your plugin to stop loading the data for the specified resource.

 - Parameters:
   - task: The task object that identifies the resource the web view no
   longer needs.
 */
- (void)stopSchemeTask:(id <WKURLSchemeTask>)task;
@end

NS_ASSUME_NONNULL_END
