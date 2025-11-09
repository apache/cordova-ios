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
#import <XCTest/XCTest.h>
#import "CDVWebViewEngine.h"
#import <Cordova/CDVWebViewProcessPoolFactory.h>
#import <Cordova/CDVSettingsDictionary.h>
#import <Cordova/CDVAvailability.h>

#import "CordovaApp-Swift.h"

@interface CDVWebViewEngineTest : XCTestCase

@property AppDelegate* appDelegate;
@property (nonatomic, strong) CDVWebViewEngine* plugin;
@property (nonatomic, strong) CDVViewController* viewController;

@end

@interface CDVViewController ()

// expose property as readwrite, for test purposes
@property (nonatomic, readwrite, strong) CDVSettingsDictionary* settings;

@end

@interface TestNavigationDelegate : NSObject <WKNavigationDelegate>
@property (nonatomic, copy) void (^didFinishNavigation)(WKWebView *, WKNavigation *);

- (void)waitForDidFinishNavigation:(XCTestExpectation *)expectation;
@end

@interface WKWebView ()
@property (nonatomic, readonly) pid_t _webProcessIdentifier;
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

@implementation CDVWebViewEngineTest

- (void)setUp {
    [super setUp];
    // Put setup code here. This method is called before the invocation of each test method in the class.

    self.appDelegate = (AppDelegate*)[[UIApplication sharedApplication] delegate];
    [self.appDelegate createViewController];
    self.viewController = self.appDelegate.testViewController;

    self.plugin = (CDVWebViewEngine *)self.viewController.webViewEngine;

    XCTAssert([self.plugin conformsToProtocol:@protocol(CDVWebViewEngineProtocol)], @"Plugin does not conform to CDVWebViewEngineProtocol");
}

- (void)tearDown {
    // Put teardown code here. This method is called after the invocation of each test method in the class.
    [self.appDelegate destroyViewController];
    [super tearDown];
}

- (void)waitForDidFinishNavigation:(WKWebView *)webView
{
    NSObject<WKNavigationDelegate> *oldNavigationDelegate = webView.navigationDelegate;

    __block XCTestExpectation *expectation = [self expectationWithDescription:@"didFinishNavigation"];

    TestNavigationDelegate *navigationDelegate = [[TestNavigationDelegate alloc] init];
    webView.navigationDelegate = navigationDelegate;
    [navigationDelegate waitForDidFinishNavigation:expectation];

    [self waitForExpectations:@[expectation] timeout:5];

    webView.navigationDelegate = oldNavigationDelegate;
}

- (void) testCanLoadRequest {
    NSURLRequest* fileUrlRequest = [NSURLRequest requestWithURL:[NSURL fileURLWithPath:@"path/to/file.html"]];
    NSURLRequest* httpUrlRequest = [NSURLRequest requestWithURL:[NSURL URLWithString:@"http://apache.org"]];
    NSURLRequest* miscUrlRequest = [NSURLRequest requestWithURL:[NSURL URLWithString:@"foo://bar"]];
    id<CDVWebViewEngineProtocol> webViewEngineProtocol = self.plugin;

    SEL wk_sel = NSSelectorFromString(@"loadFileURL:allowingReadAccessToURL:");
    if ([self.plugin.engineWebView respondsToSelector:wk_sel]) {
        XCTAssertTrue([webViewEngineProtocol canLoadRequest:fileUrlRequest]);
    } else {
        XCTAssertFalse([webViewEngineProtocol canLoadRequest:fileUrlRequest]);
    }

    XCTAssertTrue([webViewEngineProtocol canLoadRequest:httpUrlRequest]);
    XCTAssertTrue([webViewEngineProtocol canLoadRequest:miscUrlRequest]);
}

- (void) testUpdateInfo {
    // Add -ObjC to Other Linker Flags to test project, to load Categories
    // Update objc test template generator as well

    id<CDVWebViewEngineProtocol> webViewEngineProtocol = self.plugin;
    WKWebView* wkWebView = (WKWebView*)self.plugin.engineWebView;

    NSDictionary* preferences = @{
                               [@"MinimumFontSize" lowercaseString] : @1.1, // default is 0.0
                               [@"AllowInlineMediaPlayback" lowercaseString] : @YES, // default is NO
                               [@"MediaTypesRequiringUserActionForPlayback" lowercaseString] : @"all", // default is none
                               [@"SuppressesIncrementalRendering" lowercaseString] : @YES, // default is NO
                               [@"AllowsAirPlayForMediaPlayback" lowercaseString] : @NO, // default is YES
                               [@"DisallowOverscroll" lowercaseString] : @YES, // so bounces is to be NO. defaults to NO
                               [@"WKWebViewDecelerationSpeed" lowercaseString] : @"fast" // default is 'normal'
                               };
    NSDictionary* info = @{
                           kCDVWebViewEngineWebViewPreferences : preferences
                           };
    [webViewEngineProtocol updateWithInfo:info];

    // the only preference we can set, we **can** change this during runtime
    XCTAssertEqualWithAccuracy(wkWebView.configuration.preferences.minimumFontSize, 1.1, 0.0001);

    // the WKWebViewConfiguration properties, we **cannot** change outside of initialization
    XCTAssertTrue(wkWebView.configuration.mediaTypesRequiringUserActionForPlayback);
    XCTAssertFalse(wkWebView.configuration.allowsInlineMediaPlayback);
    XCTAssertFalse(wkWebView.configuration.suppressesIncrementalRendering);
    XCTAssertTrue(wkWebView.configuration.allowsAirPlayForMediaPlayback);

    // in the test above, DisallowOverscroll is YES, so no bounce
    if ([wkWebView respondsToSelector:@selector(scrollView)]) {
        XCTAssertFalse(((UIScrollView*)[wkWebView scrollView]).bounces);
    } else {
        for (id subview in wkWebView.subviews) {
            if ([[subview class] isSubclassOfClass:[UIScrollView class]]) {
                XCTAssertFalse(((UIScrollView*)subview).bounces = NO);
            }
        }
    }

    XCTAssertTrue(wkWebView.scrollView.decelerationRate == UIScrollViewDecelerationRateFast);
}

- (void) testConfigurationFromSettings {
    // we need to re-set the plugin from the "setup" to take in the app settings we need
    self.plugin = [[CDVWebViewEngine alloc] initWithFrame:CGRectMake(0, 0, 100, 100) configuration:nil];
    self.viewController = [[CDVViewController alloc] init];

    // generate the app settings
    CDVSettingsDictionary* settings = [[CDVSettingsDictionary alloc] initWithDictionary:@{
                                  [@"MinimumFontSize" lowercaseString] : @1.1, // default is 0.0
                                  [@"AllowInlineMediaPlayback" lowercaseString] : @YES, // default is NO
                                  [@"MediaTypesRequiringUserActionForPlayback" lowercaseString] : @"all", // default is none
                                  [@"SuppressesIncrementalRendering" lowercaseString] : @YES, // default is NO
                                  [@"AllowsAirPlayForMediaPlayback" lowercaseString] : @NO, // default is YES
                                  [@"DisallowOverscroll" lowercaseString] : @YES, // so bounces is to be NO. defaults to NO
                                  [@"WKWebViewDecelerationSpeed" lowercaseString] : @"fast" // default is 'normal'
                                  }];
    // this can be set because of the Category at the top of the file
    self.viewController.settings = settings;

    // app settings are read after you register the plugin
    [self.viewController registerPlugin:self.plugin withClassName:NSStringFromClass([self.plugin class])];
    XCTAssert([self.plugin conformsToProtocol:@protocol(CDVWebViewEngineProtocol)], @"Plugin does not conform to CDVWebViewEngineProtocol");

    // after registering (thus plugin initialization), we can grab the webview configuration
    WKWebView* wkWebView = (WKWebView*)self.plugin.engineWebView;

    // the only preference we can set, we **can** change this during runtime
    XCTAssertEqualWithAccuracy(wkWebView.configuration.preferences.minimumFontSize, 1.1, 0.0001);

    // the WKWebViewConfiguration properties, we **cannot** change outside of initialization
    XCTAssertTrue(wkWebView.configuration.mediaTypesRequiringUserActionForPlayback);
    XCTAssertTrue(wkWebView.configuration.allowsInlineMediaPlayback);
    XCTAssertTrue(wkWebView.configuration.suppressesIncrementalRendering);
    // The test case below is in a separate test "testConfigurationWithMediaPlaybackAllowsAirPlay" (Apple bug)
    // XCTAssertFalse(wkWebView.configuration.allowsAirPlayForMediaPlayback);

    // in the test above, DisallowOverscroll is YES, so no bounce
    if ([wkWebView respondsToSelector:@selector(scrollView)]) {
        XCTAssertFalse(((UIScrollView*)[wkWebView scrollView]).bounces);
    } else {
        for (id subview in wkWebView.subviews) {
            if ([[subview class] isSubclassOfClass:[UIScrollView class]]) {
                XCTAssertFalse(((UIScrollView*)subview).bounces == NO);
            }
        }
    }

    XCTAssertTrue(wkWebView.scrollView.decelerationRate == UIScrollViewDecelerationRateFast);
}

- (void) testCrashRecoveryRefresh {
    WKWebView* wkWebView = (WKWebView*)self.plugin.engineWebView;
    [self waitForDidFinishNavigation:wkWebView];

    NSString *startPage = @"https://cordova.apache.org/";
    self.viewController.startPage = startPage;

    [self.viewController loadStartPage];
    [self waitForDidFinishNavigation:wkWebView];
    XCTAssertTrue([[[self.plugin URL] absoluteString] isEqualToString:startPage]);

    NSURLRequest *nextPage = [NSURLRequest requestWithURL:[NSURL URLWithString:@"https://cordova.apache.org/blog/"]];
    [self.plugin loadRequest:nextPage];
    [self waitForDidFinishNavigation:wkWebView];
    XCTAssertFalse([[[self.plugin URL] absoluteString] isEqualToString:startPage]);

    pid_t webViewPID = [wkWebView _webProcessIdentifier];
    kill(webViewPID, 9);

    XCTestExpectation *expectation = [self expectationWithDescription:@"Waiting for 10 seconds"];
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(2.0 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        [expectation fulfill];
    });
    [self waitForExpectations:@[expectation] timeout:10.0];

    XCTAssertFalse([[[self.plugin URL] absoluteString] isEqualToString:startPage]);
    XCTAssertTrue([[[self.plugin URL] absoluteString] isEqualToString:@"https://cordova.apache.org/blog/"]);
}

- (void) testCrashRecoveryReload {
    WKWebView* wkWebView = (WKWebView*)self.plugin.engineWebView;
    [self waitForDidFinishNavigation:wkWebView];

    NSString *startPage = @"https://cordova.apache.org/";
    self.viewController.startPage = startPage;
    [self.viewController.settings setCordovaSetting:@"reload" forKey:@"CrashRecoveryBehavior"];

    [self.viewController loadStartPage];
    [self waitForDidFinishNavigation:wkWebView];
    XCTAssertTrue([[[self.plugin URL] absoluteString] isEqualToString:startPage]);

    NSURLRequest *nextPage = [NSURLRequest requestWithURL:[NSURL URLWithString:@"https://cordova.apache.org/blog/"]];
    [self.plugin loadRequest:nextPage];
    [self waitForDidFinishNavigation:wkWebView];
    XCTAssertFalse([[[self.plugin URL] absoluteString] isEqualToString:startPage]);

    pid_t webViewPID = [wkWebView _webProcessIdentifier];
    kill(webViewPID, 9);

    XCTestExpectation *expectation = [self expectationWithDescription:@"Waiting for 10 seconds"];
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(2.0 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        [expectation fulfill];
    });
    [self waitForExpectations:@[expectation] timeout:10.0];

    XCTAssertTrue([[[self.plugin URL] absoluteString] isEqualToString:startPage]);
}

- (void) testWKProcessPoolFactory {
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"
    WKProcessPool* shared = [[CDVWebViewProcessPoolFactory sharedFactory] sharedProcessPool];
#pragma clang diagnostic pop

    XCTAssertTrue(shared != nil);
}

@end
