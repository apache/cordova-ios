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
#import "CDVWebViewProcessPoolFactory.h"
#import <Cordova/NSDictionary+CordovaPreferences.h>
#import <Cordova/CDVAvailability.h>

@interface CDVWebViewEngineTest : XCTestCase

@property (nonatomic, strong) CDVWebViewEngine* plugin;
@property (nonatomic, strong) CDVViewController* viewController;

@end

@interface CDVWebViewEngine ()

// TODO: expose private interface, if needed
- (BOOL)shouldReloadWebView;
- (BOOL)shouldReloadWebView:(NSURL*)location title:(NSString*)title;

@end

@interface CDVViewController ()

// expose property as readwrite, for test purposes
@property (nonatomic, readwrite, strong) NSMutableDictionary* settings;

@end

@implementation CDVWebViewEngineTest

- (void)setUp {
    [super setUp];
    // Put setup code here. This method is called before the invocation of each test method in the class.

    // NOTE: no app settings are set, so it will rely on default WKWebViewConfiguration settings
    self.plugin = [[CDVWebViewEngine alloc] initWithFrame:CGRectMake(0, 0, 100, 100)];

    XCTAssert([self.plugin conformsToProtocol:@protocol(CDVWebViewEngineProtocol)], @"Plugin does not conform to CDVWebViewEngineProtocol");
}

- (void)tearDown {
    // Put teardown code here. This method is called after the invocation of each test method in the class.
    [super tearDown];
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
    self.plugin = [[CDVWebViewEngine alloc] initWithFrame:CGRectMake(0, 0, 100, 100)];
    self.viewController = [[CDVViewController alloc] init];

    // generate the app settings
    NSDictionary* settings = @{
                                  [@"MinimumFontSize" lowercaseString] : @1.1, // default is 0.0
                                  [@"AllowInlineMediaPlayback" lowercaseString] : @YES, // default is NO
                                  [@"MediaTypesRequiringUserActionForPlayback" lowercaseString] : @"all", // default is none
                                  [@"SuppressesIncrementalRendering" lowercaseString] : @YES, // default is NO
                                  [@"AllowsAirPlayForMediaPlayback" lowercaseString] : @NO, // default is YES
                                  [@"DisallowOverscroll" lowercaseString] : @YES, // so bounces is to be NO. defaults to NO
                                  [@"WKWebViewDecelerationSpeed" lowercaseString] : @"fast" // default is 'normal'
                                  };
    // this can be set because of the Category at the top of the file
    self.viewController.settings = [settings mutableCopy];

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
                XCTAssertFalse(((UIScrollView*)subview).bounces = NO);
            }
        }
    }

    XCTAssertTrue(wkWebView.scrollView.decelerationRate == UIScrollViewDecelerationRateFast);
}

- (void) testShouldReloadWebView {
    WKWebView* wkWebView = (WKWebView*)self.plugin.engineWebView;

    NSURL* about_blank = [NSURL URLWithString:@"about:blank"];
    NSURL* real_site = [NSURL URLWithString:@"https://cordova.apache.org"];
    NSString* empty_title_document = @"<html><head><title></title></head></html>";

    // about:blank should reload
    [wkWebView loadRequest:[NSURLRequest requestWithURL:about_blank]];
    XCTAssertTrue([self.plugin shouldReloadWebView]);

    // a network location should *not* reload
    [wkWebView loadRequest:[NSURLRequest requestWithURL:real_site]];
    XCTAssertFalse([self.plugin shouldReloadWebView]);

    // document with empty title should *not* reload
    // baseURL:nil results in about:blank, so we use a dummy here
    [wkWebView loadHTMLString:empty_title_document baseURL:[NSURL URLWithString:@"about:"]];
    XCTAssertFalse([self.plugin shouldReloadWebView]);

    // Anecdotal assertion that when the WKWebView process has died,
    // the title is nil, should always reload
    XCTAssertTrue([self.plugin shouldReloadWebView:about_blank title:nil]);
    XCTAssertTrue([self.plugin shouldReloadWebView:real_site title:nil]);

    // about:blank should always reload
    XCTAssertTrue([self.plugin shouldReloadWebView:about_blank title:@"some title"]);

    // non about:blank with a non-nil title should **not** reload
    XCTAssertFalse([self.plugin shouldReloadWebView:real_site title:@""]);
}

- (void) testWKProcessPoolFactory {
    WKProcessPool* shared = [[CDVWebViewProcessPoolFactory sharedFactory] sharedProcessPool];
    XCTAssertTrue(shared != nil);
}

@end
