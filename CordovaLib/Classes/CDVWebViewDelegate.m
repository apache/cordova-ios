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

#import "CDVWebViewDelegate.h"
#import "CDVAvailability.h"

// #define VerboseLog NSLog
#define VerboseLog(...) do {} while (0)

typedef enum {
    STATE_NORMAL,
    STATE_SHOULD_LOAD_MISSING,
    STATE_WAITING_FOR_START,
    STATE_WAITING_FOR_FINISH
} State;

@implementation CDVWebViewDelegate

- (id)initWithDelegate:(NSObject <UIWebViewDelegate>*)delegate
{
    self = [super init];
    if (self != nil) {
        _delegate = delegate;
        _loadCount = -1;
        _state = STATE_NORMAL;
    }
    return self;
}

- (BOOL)isPageLoaded:(UIWebView*)webView
{
    NSString* readyState = [webView stringByEvaluatingJavaScriptFromString:@"document.readyState"];

    return [readyState isEqualToString:@"loaded"] || [readyState isEqualToString:@"complete"];
}

- (BOOL)isJsLoadTokenSet:(UIWebView*)webView
{
    NSString* loadToken = [webView stringByEvaluatingJavaScriptFromString:@"window.__cordovaLoadToken"];

    return [[NSString stringWithFormat:@"%d", _curLoadToken] isEqualToString:loadToken];
}

- (void)setLoadToken:(UIWebView*)webView
{
    _curLoadToken += 1;
    [webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"window.__cordovaLoadToken=%d", _curLoadToken]];
}

- (void)pollForPageLoadStart:(UIWebView*)webView
{
    if ((_state != STATE_WAITING_FOR_START) && (_state != STATE_SHOULD_LOAD_MISSING)) {
        return;
    }
    if (![self isJsLoadTokenSet:webView]) {
        VerboseLog(@"Polled for page load start. result = YES!");
        _state = STATE_WAITING_FOR_FINISH;
        [self setLoadToken:webView];
        if ([_delegate respondsToSelector:@selector(webViewDidStartLoad:)]) {
            [_delegate webViewDidStartLoad:webView];
        }
        [self pollForPageLoadFinish:webView];
    } else {
        VerboseLog(@"Polled for page load start. result = NO");
        [self performSelector:@selector(pollForPageLoadStart) withObject:webView afterDelay:50];
    }
}

- (void)pollForPageLoadFinish:(UIWebView*)webView
{
    if (_state != STATE_WAITING_FOR_FINISH) {
        return;
    }
    if ([self isPageLoaded:webView]) {
        VerboseLog(@"Polled for page load finish. result = YES!");
        _state = STATE_SHOULD_LOAD_MISSING;
        if ([_delegate respondsToSelector:@selector(webViewDidFinishLoad:)]) {
            [_delegate webViewDidFinishLoad:webView];
        }
    } else {
        VerboseLog(@"Polled for page load finish. result = NO");
        [self performSelector:@selector(pollForPageLoadFinish) withObject:webView afterDelay:50];
    }
}

- (BOOL)webView:(UIWebView*)webView shouldStartLoadWithRequest:(NSURLRequest*)request navigationType:(UIWebViewNavigationType)navigationType
{
    BOOL shouldLoad = YES;

    if ([_delegate respondsToSelector:@selector(webView:shouldStartLoadWithRequest:navigationType:)]) {
        shouldLoad = [_delegate webView:webView shouldStartLoadWithRequest:request navigationType:navigationType];
    }

    VerboseLog(@"webView shouldLoad=%d state=%d loadCount=%d URL=%@", shouldLoad, _state, _loadCount, request.URL);

    if (shouldLoad) {
        BOOL isTopLevelNavigation = [request.URL isEqual:[request mainDocumentURL]];
        if (isTopLevelNavigation) {
            _loadCount = 0;
            _state = STATE_NORMAL;
        }
        VerboseLog(@"webView shouldLoad isTopLevelNavigation=%d state=%d loadCount=%d", isTopLevelNavigation, _state, _loadCount);
    }
    return shouldLoad;
}

- (void)webViewDidStartLoad:(UIWebView*)webView
{
    VerboseLog(@"webView didStartLoad (before). state=%d loadCount=%d", _state, _loadCount);
    BOOL fireCallback = NO;
    if (_state == STATE_NORMAL) {
        if (_loadCount == 0) {
            fireCallback = [_delegate respondsToSelector:@selector(webViewDidStartLoad:)];
            _loadCount += 1;
        } else if (_loadCount > 0) {
            _loadCount += 1;
        } else if (!IsAtLeastiOSVersion(@"6.0")) {
            // If history.go(-1) is used pre-iOS6, the shouldStartLoadWithRequest function is not called.
            // Without shouldLoad, we can't distinguish an iframe from a top-level navigation.
            // We could try to distinguish using [UIWebView canGoForward], but that's too much complexity,
            // and would work only on the first time it was used.

            // Our work-around is to set a JS variable and poll until it disappears (from a naviagtion).
            _state = STATE_WAITING_FOR_START;
            [self setLoadToken:webView];
        }
    } else {
        [self pollForPageLoadStart:webView];
        [self pollForPageLoadFinish:webView];
    }
    VerboseLog(@"webView didStartLoad (after). state=%d loadCount=%d", _state, _loadCount);
    if (fireCallback) {
        [_delegate webViewDidStartLoad:webView];
    }
}

- (void)webViewDidFinishLoad:(UIWebView*)webView
{
    VerboseLog(@"webView didFinishLoad (before). state=%d loadCount=%d", _state, _loadCount);
    BOOL fireCallback = NO;
    if (_state == STATE_NORMAL) {
        if (_loadCount == 1) {
            fireCallback = [_delegate respondsToSelector:@selector(webViewDidFinishLoad:)];
            _loadCount = -1;
        } else if (_loadCount > 1) {
            _loadCount -= 1;
        }
    } else {
        [self pollForPageLoadStart:webView];
        [self pollForPageLoadFinish:webView];
    }
    VerboseLog(@"webView didFinishLoad (after). state=%d loadCount=%d", _state, _loadCount);
    if (fireCallback) {
        [_delegate webViewDidFinishLoad:webView];
    }
}

- (void)webView:(UIWebView*)webView didFailLoadWithError:(NSError*)error
{
    VerboseLog(@"webView didFailLoad (before). state=%d loadCount=%d", _state, _loadCount);
    BOOL fireCallback = NO;

    if (_state == STATE_NORMAL) {
        if (_loadCount == 1) {
            fireCallback = [_delegate respondsToSelector:@selector(webView:didFailLoadWithError:)];
            _loadCount = -1;
        } else if (_loadCount > 1) {
            _loadCount -= 1;
        }
    } else {
        [self pollForPageLoadStart:webView];
        [self pollForPageLoadFinish:webView];
    }
    VerboseLog(@"webView didFailLoad (after). state=%d loadCount=%d", _state, _loadCount);
    if (fireCallback) {
        [_delegate webView:webView didFailLoadWithError:error];
    }
}

@end
