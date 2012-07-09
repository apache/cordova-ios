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

#import "CDVWebViewTest.h"
#import "CDVViewController.h"

@implementation CDVWebViewTest

@synthesize webView;

- (void)setUp
{
    [super setUp];
    
    // setup code here
    id<UIApplicationDelegate> delegate = [[UIApplication sharedApplication] delegate];
    if ([delegate respondsToSelector:@selector(viewController)]) {
        id vc = [delegate performSelector:@selector(viewController)];
        if ([vc respondsToSelector:@selector(webView)]) {
            id wv = [vc webView];
            if ([wv isKindOfClass:[UIWebView class]]) {
                self.webView = wv;
            }
        }
    }
}

- (void)tearDown
{
    // Tear-down code here.
	
    [super tearDown];
	self.webView = nil;
}

- (void) testWebViewAvailable
{
	STAssertTrue(self.webView != nil, @"The test application's webView is not accessible. The webView is required by the test.");
}

@end
