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
 
 Created by Bharath Hariharan on 7/15/16.
 */

#import "CDVWKWebViewEngine.h"
#import "CDVWKWebViewDelegate.h"
#import "CDVWKWebViewNavigationDelegate.h"
#import "NSDictionary+CordovaPreferences.h"

#import <objc/message.h>

@interface CDVWKWebViewEngine ()

@property (nonatomic, strong, readwrite) UIView* engineWebView;
@property (nonatomic, strong, readwrite) id <WKNavigationDelegate> wkWebViewDelegate;
@property (nonatomic, strong, readwrite) CDVWKWebViewNavigationDelegate* navWebViewDelegate;

@end

@implementation CDVWKWebViewEngine

@synthesize engineWebView = _engineWebView;

- (instancetype)initWithFrame:(CGRect)frame
{
    self = [super init];
    if (self) {
        self.engineWebView = [[WKWebView alloc] initWithFrame:frame];
        NSLog(@"Using WKWebView");
    }

    return self;
}

- (void)pluginInitialize
{
    // viewController would be available now. we attempt to set all possible delegates to it, by default

    WKWebView* wkWebView = (WKWebView*)_engineWebView;

    if ([self.viewController conformsToProtocol:@protocol(WKNavigationDelegate)]) {
        self.wkWebViewDelegate = [[CDVWKWebViewDelegate alloc] initWithDelegate:(id <WKNavigationDelegate>)self.viewController];
        wkWebView.navigationDelegate = self.wkWebViewDelegate;
    } else {
        self.navWebViewDelegate = [[CDVWKWebViewNavigationDelegate alloc] initWithEnginePlugin:self];
        self.wkWebViewDelegate = [[CDVWKWebViewDelegate alloc] initWithDelegate:self.navWebViewDelegate];
        wkWebView.navigationDelegate = self.wkWebViewDelegate;
    }

    [self updateSettings:self.commandDelegate.settings];
}

- (void)evaluateJavaScript:(NSString*)javaScriptString completionHandler:(void (^)(id, NSError*))completionHandler
{
    [(WKWebView*) _engineWebView evaluateJavaScript:javaScriptString completionHandler:^(id result, NSError *error) {
        if (completionHandler) {
            completionHandler(result, error);
        }
    }];
}

- (id)loadRequest:(NSURLRequest*)request
{
    [(WKWebView*)_engineWebView loadRequest:request];
    return nil;
}

- (id)loadHTMLString:(NSString*)string baseURL:(NSURL*)baseURL
{
    [(WKWebView*)_engineWebView loadHTMLString:string baseURL:baseURL];
    return nil;
}

- (NSURL*)URL
{
    return [(WKWebView*)_engineWebView URL];
}

- (BOOL) canLoadRequest:(NSURLRequest*)request
{
    return (request != nil);
}

- (void)updateSettings:(NSDictionary*)settings
{
    WKWebView* wkWebView = (WKWebView*)_engineWebView;

    wkWebView.configuration.allowsInlineMediaPlayback = [settings cordovaBoolSettingForKey:@"AllowInlineMediaPlayback" defaultValue:NO];
    wkWebView.configuration.mediaPlaybackRequiresUserAction = [settings cordovaBoolSettingForKey:@"MediaPlaybackRequiresUserAction" defaultValue:YES];
    wkWebView.configuration.mediaPlaybackAllowsAirPlay = [settings cordovaBoolSettingForKey:@"MediaPlaybackAllowsAirPlay" defaultValue:YES];
    wkWebView.configuration.suppressesIncrementalRendering = [settings cordovaBoolSettingForKey:@"SuppressesIncrementalRendering" defaultValue:NO];

    id prefObj = nil;

    // By default, DisallowOverscroll is false (thus bounce is allowed)
    BOOL bounceAllowed = !([settings cordovaBoolSettingForKey:@"DisallowOverscroll" defaultValue:NO]);

    // prevent webView from bouncing
    if (!bounceAllowed) {
        if ([wkWebView respondsToSelector:@selector(scrollView)]) {
            ((UIScrollView*)[wkWebView scrollView]).bounces = NO;
        } else {
            for (id subview in self.webView.subviews) {
                if ([[subview class] isSubclassOfClass:[UIScrollView class]]) {
                    ((UIScrollView*)subview).bounces = NO;
                }
            }
        }
    }

    NSString* decelerationSetting = [settings cordovaSettingForKey:@"UIWebViewDecelerationSpeed"];
    if (![@"fast" isEqualToString:decelerationSetting]) {
        [wkWebView.scrollView setDecelerationRate:UIScrollViewDecelerationRateNormal];
    }

    NSInteger paginationBreakingMode = 0; // default - UIWebPaginationBreakingModePage
    prefObj = [settings cordovaSettingForKey:@"PaginationBreakingMode"];
    if (prefObj != nil) {
        NSArray* validValues = @[@"page", @"column"];
        NSString* prefValue = [validValues objectAtIndex:0];

        if ([prefObj isKindOfClass:[NSString class]]) {
            prefValue = prefObj;
        }

        paginationBreakingMode = [validValues indexOfObject:[prefValue lowercaseString]];
        if (paginationBreakingMode == NSNotFound) {
            paginationBreakingMode = 0;
        }
    }
}

- (void)updateWithInfo:(NSDictionary*)info
{
    WKWebView* wkWebView = (WKWebView*)_engineWebView;

    id <WKNavigationDelegate> wkWebViewDelegate = [info objectForKey:kCDVWebViewEngineWKNavigationDelegate];
    NSDictionary* settings = [info objectForKey:kCDVWebViewEngineWebViewPreferences];

    if (wkWebViewDelegate &&
        [wkWebViewDelegate conformsToProtocol:@protocol(WKNavigationDelegate)]) {
        self.wkWebViewDelegate = [[CDVWKWebViewDelegate alloc] initWithDelegate:(id <WKNavigationDelegate>)self.viewController];
        wkWebView.navigationDelegate = self.wkWebViewDelegate;
    }

    if (settings && [settings isKindOfClass:[NSDictionary class]]) {
        [self updateSettings:settings];
    }
}

// This forwards the methods that are in the header that are not implemented here.
// Both WKWebView and UIWebView implement the below:
//     loadHTMLString:baseURL:
//     loadRequest:
- (id)forwardingTargetForSelector:(SEL)aSelector
{
    return _engineWebView;
}

- (UIView*)webView
{
    return self.engineWebView;
}

@end
