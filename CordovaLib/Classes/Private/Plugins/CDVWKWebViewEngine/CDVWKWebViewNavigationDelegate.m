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

#import "CDVWKWebViewNavigationDelegate.h"
#import <Cordova/CDVViewController.h>
#import <Cordova/CDVCommandDelegateImpl.h>
#import <Cordova/CDVUserAgentUtil.h>
#import <objc/message.h>

@implementation CDVWKWebViewNavigationDelegate

- (instancetype)initWithEnginePlugin:(CDVPlugin*)theEnginePlugin
{
    self = [super init];
    if (self) {
        self.enginePlugin = theEnginePlugin;
    }

    return self;
}

/**
 When web application loads Add stuff to the DOM, mainly the user-defined settings from the Settings.plist file, and
 the device's data such as device ID, platform version, etc.
 */
- (void) webView:(WKWebView *) webView didStartProvisionalNavigation:(WKNavigation *) navigation
{
    NSLog(@"Resetting plugins due to page load.");
    CDVViewController* vc = (CDVViewController*)self.enginePlugin.viewController;

    [vc.commandQueue resetRequestId];
    [[NSNotificationCenter defaultCenter] postNotification:[NSNotification notificationWithName:CDVPluginResetNotification object:self.enginePlugin.webView]];
}

/**
 Called when the webview finishes loading.  This stops the activity view.
 */
- (void) webView:(WKWebView *) theWebView didFinishNavigation:(WKNavigation *) navigation
{
    NSLog(@"Finished load of: %@", theWebView.URL);
    CDVViewController* vc = (CDVViewController*)self.enginePlugin.viewController;

    // It's safe to release the lock even if this is just a sub-frame that's finished loading.
    [CDVUserAgentUtil releaseLock:vc.userAgentLockToken];

    /*
     * Hide the Top Activity THROBBER in the Battery Bar
     */
    [[UIApplication sharedApplication] setNetworkActivityIndicatorVisible:NO];

    [[NSNotificationCenter defaultCenter] postNotification:[NSNotification notificationWithName:CDVPageDidLoadNotification object:self.enginePlugin.webView]];
}

- (void) webView:(WKWebView *) webView didFailNavigation:(WKNavigation *) navigation withError:(NSError *) error
{
    [self webView:webView didFailLoadWithError:error];
}

- (void) webView:(WKWebView *) webView didFailProvisionalNavigation:(WKNavigation *) navigation withError:(NSError *) error
{
    [self webView:webView didFailLoadWithError:error];
}

- (void) webView:(WKWebView *) theWebView didFailLoadWithError:(NSError *) error
{
    CDVViewController* vc = (CDVViewController*)self.enginePlugin.viewController;

    [CDVUserAgentUtil releaseLock:vc.userAgentLockToken];

    NSString* message = [NSString stringWithFormat:@"Failed to load webpage with error: %@", [error localizedDescription]];
    NSLog(@"%@", message);

    NSURL* errorUrl = vc.errorURL;
    if (errorUrl) {
        errorUrl = [NSURL URLWithString:[NSString stringWithFormat:@"?error=%@", [message stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding]] relativeToURL:errorUrl];
        NSLog(@"%@", [errorUrl absoluteString]);
        [theWebView loadRequest:[NSURLRequest requestWithURL:errorUrl]];
    }
}

- (BOOL)defaultResourcePolicyForURL:(NSURL*)url
{
    /*
     * If a URL is being loaded that's a file url, just load it internally
     */
    if ([url isFileURL]) {
        return YES;
    }
    
    return NO;
}

- (void) webView:(WKWebView *) webView decidePolicyForNavigationAction:(WKNavigationAction *) navigationAction decisionHandler:(void (^)(WKNavigationActionPolicy)) decisionHandler
{
    NSURL* url = navigationAction.request.URL;
    CDVViewController* vc = (CDVViewController*)self.enginePlugin.viewController;

    /*
     * Execute any commands queued with cordova.exec() on the JS side.
     * The part of the URL after gap:// is irrelevant.
     */
    if ([[url scheme] isEqualToString:@"gap"]) {
        [vc.commandQueue fetchCommandsFromJs];
        // The delegate is called asynchronously in this case, so we don't have to use
        // flushCommandQueueWithDelayedJs (setTimeout(0)) as we do with hash changes.
        [vc.commandQueue executePending];
        decisionHandler(WKNavigationActionPolicyCancel);
    }

    /*
     * Handle all other types of urls (tel:, sms:), and requests to load a url in the main webview.
     */
    BOOL shouldAllowNavigation = [self defaultResourcePolicyForURL:url];
    if (shouldAllowNavigation) {
        decisionHandler(WKNavigationActionPolicyAllow);
    } else {
        [[NSNotificationCenter defaultCenter] postNotification:[NSNotification notificationWithName:CDVPluginHandleOpenURLNotification object:url]];
    }
    
    decisionHandler(WKNavigationActionPolicyCancel);
}

@end
