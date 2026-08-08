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

#import "CDVTestHelpers.h"
#import <Cordova/Cordova.h>

const NSNotificationName CDVTestingDeviceReadyFired = @"CDVTestingDeviceReadyFired";
static NSNotificationName const CDVTestingCommandQueueBarrierReached = @"CDVTestingCommandQueueBarrierReached";
static NSString * const CDVTestingCommandQueuePluginName = @"CordovaTestingCommandQueue";

/**
 * Test-only Cordova plugin used as a synchronization barrier.
 *
 * The production WKWebView bridge delivers cordova.exec calls to native code
 * asynchronously. A test that evaluates JavaScript and immediately checks native
 * state can therefore race with the native plugin command that JavaScript
 * enqueued. This plugin gives tests a known command that can be appended after
 * the JavaScript under test. When this command reaches native code, all earlier
 * exec commands from the same JavaScript evaluation have also reached native
 * code.
 *
 * The plugin intentionally performs no production behavior. It only posts an
 * XCTest-visible notification so the test can continue.
 */
@interface CDVTestingCommandQueue : CDVPlugin

- (void)barrier:(CDVInvokedUrlCommand *)command;

@end

@implementation CDVTestingCommandQueue

- (void)barrier:(CDVInvokedUrlCommand *)command
{
    [[NSNotificationCenter defaultCenter] postNotificationName:CDVTestingCommandQueueBarrierReached object:self];
}

@end

@implementation TestNavigationDelegate
- (void)webView:(WKWebView *)webView didFinishNavigation:(WKNavigation *)navigation
{
    if (_didFinishNavigation)
        _didFinishNavigation(webView, navigation);
}

- (void)waitForDidFinishNavigation:(XCTestExpectation *)expectation
{
    XCTAssertFalse(self.didFinishNavigation);

    __weak TestNavigationDelegate *weakSelf = self;
    self.didFinishNavigation = ^(WKWebView *_view, WKNavigation *_nav) {
        [expectation fulfill];
        weakSelf.didFinishNavigation = nil;
    };
}
@end

@implementation XCTestCase (CordovaTestHelpers)

- (void)registerCordovaCommandQueueTestPluginForViewController:(CDVViewController *)viewController
{
    // Register the barrier plugin with the Cordova plugin manager used by this
    // test view controller. The JavaScript side refers to this plugin by
    // CDVTestingCommandQueuePluginName when it appends the barrier exec call.
    [viewController registerPlugin:[[CDVTestingCommandQueue alloc] init] withPluginName:CDVTestingCommandQueuePluginName];
}

- (void)evaluateJavaScript:(NSString *)javaScript
andWaitForCordovaCommandQueueWithWebViewEngine:(id <CDVWebViewEngineProtocol>)webViewEngine
                   timeout:(NSTimeInterval)timeout
{
    XCTestExpectation *commandQueueExpectation = [[XCTNSNotificationExpectation alloc] initWithName:CDVTestingCommandQueueBarrierReached];
    XCTestExpectation *javaScriptExpectation = [self expectationWithDescription:@"JavaScript evaluation"];
    // The barrier must be appended to the same JavaScript evaluation as the code
    // under test. If it were evaluated in a separate evaluateJavaScript call,
    // WebKit could complete or schedule the second evaluation before the first
    // evaluation's cordova.exec message had been delivered to native code. By
    // putting both exec calls in one JavaScript evaluation, JavaScript enqueues
    // them in order and the native barrier becomes a reliable FIFO checkpoint.
    NSString *barrier = [NSString stringWithFormat:@"\ncordova.exec(null, null, '%@', 'barrier', []);", CDVTestingCommandQueuePluginName];
    NSString *javaScriptWithQueueBarrier = [javaScript stringByAppendingString:barrier];

    // Wait for both pieces:
    // 1. evaluateJavaScript completed without a WebKit/JavaScript error.
    // 2. The appended Cordova barrier command reached native code.
    //
    // Only after both are true is it safe for the test to assert native state
    // that should have been changed by a synchronous plugin command.
    [webViewEngine evaluateJavaScript:javaScriptWithQueueBarrier
                    completionHandler:^(id _, NSError* error) {
        XCTAssertNil(error);
        [javaScriptExpectation fulfill];
    }];

    [self waitForExpectations:@[javaScriptExpectation, commandQueueExpectation] timeout:timeout];
}

@end
