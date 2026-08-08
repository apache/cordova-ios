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

#import <WebKit/WebKit.h>
#import <XCTest/XCTest.h>

extern const NSNotificationName CDVTestingDeviceReadyFired;

@class CDVViewController;
@protocol CDVWebViewEngineProtocol;

@interface TestNavigationDelegate : NSObject <WKNavigationDelegate>
@property (nonatomic, copy) void (^didFinishNavigation)(WKWebView *, WKNavigation *);

- (void)waitForDidFinishNavigation:(XCTestExpectation *)expectation;
@end

@interface XCTestCase (CordovaTestHelpers)

/**
 * Registers the test-only Cordova command queue barrier plugin.
 *
 * Some tests execute JavaScript that calls Cordova APIs. Those APIs often call
 * cordova.exec, which sends work from JavaScript to native code asynchronously.
 * XCTest should not assert native state until that native work has actually
 * been handled. Register this plugin before using
 * evaluateJavaScript:andWaitForCordovaCommandQueueWithWebViewEngine:timeout:.
 */
- (void)registerCordovaCommandQueueTestPluginForViewController:(CDVViewController *)viewController;

/**
 * Evaluates JavaScript and waits until all cordova.exec calls queued by that
 * JavaScript have reached native code.
 *
 * WKWebView's evaluateJavaScript completion handler only tells us that the
 * JavaScript expression finished evaluating. It does not guarantee that native
 * plugin commands triggered by cordova.exec have already run. This helper
 * appends a test-only no-op exec call after the provided JavaScript and waits
 * until that no-op command is received natively. Since Cordova processes exec
 * messages in order, receiving the no-op command means earlier exec calls from
 * the same JavaScript evaluation have already reached native code.
 *
 * This is a synchronization helper for tests that need to read native state
 * after invoking JavaScript APIs backed by Cordova plugins.
 */
- (void)evaluateJavaScript:(NSString *)javaScript
andWaitForCordovaCommandQueueWithWebViewEngine:(id <CDVWebViewEngineProtocol>)webViewEngine
                   timeout:(NSTimeInterval)timeout;

@end
