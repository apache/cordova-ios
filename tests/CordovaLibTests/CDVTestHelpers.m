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

const NSNotificationName CDVTestingDeviceReadyFired = @"CDVTestingDeviceReadyFired";

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
