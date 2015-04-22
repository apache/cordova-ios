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

#import "CDVUIWebViewNavigationDelegate.h"
#import <Cordova/CDVViewController.h>
#import <Cordova/CDVCommandDelegateImpl.h>
#import <Cordova/CDVUserAgentUtil.h>
#import <objc/message.h>

@implementation CDVUIWebViewNavigationDelegate

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
- (void)webViewDidStartLoad:(UIWebView*)theWebView
{
    NSLog(@"Resetting plugins due to page load.");
    CDVViewController* vc = (CDVViewController*)self.enginePlugin.viewController;

    [vc.commandQueue resetRequestId];
    [[NSNotificationCenter defaultCenter] postNotification:[NSNotification notificationWithName:CDVPluginResetNotification object:self.enginePlugin.webView]];
}

/**
 Called when the webview finishes loading.  This stops the activity view.
 */
- (void)webViewDidFinishLoad:(UIWebView*)theWebView
{
    NSLog(@"Finished load of: %@", theWebView.request.URL);
    CDVViewController* vc = (CDVViewController*)self.enginePlugin.viewController;

    // It's safe to release the lock even if this is just a sub-frame that's finished loading.
    [CDVUserAgentUtil releaseLock:vc.userAgentLockToken];

    /*
     * Hide the Top Activity THROBBER in the Battery Bar
     */
    [[UIApplication sharedApplication] setNetworkActivityIndicatorVisible:NO];

    [[NSNotificationCenter defaultCenter] postNotification:[NSNotification notificationWithName:CDVPageDidLoadNotification object:self.enginePlugin.webView]];
}

- (void)webView:(UIWebView*)theWebView didFailLoadWithError:(NSError*)error
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

- (BOOL)webView:(UIWebView*)theWebView shouldStartLoadWithRequest:(NSURLRequest*)request navigationType:(UIWebViewNavigationType)navigationType
{
    NSURL* url = [request URL];
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
        return NO;
    }

    if ([[url fragment] hasPrefix:@"%01"] || [[url fragment] hasPrefix:@"%02"]) {
        // Delegate is called *immediately* for hash changes. This means that any
        // calls to stringByEvaluatingJavascriptFromString will occur in the middle
        // of an existing (paused) call stack. This doesn't cause errors, but may
        // be unexpected to callers (exec callbacks will be called before exec() even
        // returns). To avoid this, we do not do any synchronous JS evals by using
        // flushCommandQueueWithDelayedJs.
        NSString* inlineCommands = [[url fragment] substringFromIndex:3];
        if ([inlineCommands length] == 0) {
            // Reach in right away since the WebCore / Main thread are already synchronized.
            [vc.commandQueue fetchCommandsFromJs];
        } else {
            inlineCommands = [inlineCommands stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
            [vc.commandQueue enqueueCommandBatch:inlineCommands];
        }
        // Switch these for minor performance improvements, and to really live on the wild side.
        // Callbacks will occur in the middle of the location.hash = ... statement!
        [(CDVCommandDelegateImpl*)self.enginePlugin.commandDelegate flushCommandQueueWithDelayedJs];
        // [_commandQueue executePending];

        // Although we return NO, the hash change does end up taking effect.
        return NO;
    }

    /*
     * Give plugins the chance to handle the url
     */
    for (NSString* pluginName in vc.pluginObjects) {
        CDVPlugin* plugin = [vc.pluginObjects objectForKey:pluginName];
        SEL selector = NSSelectorFromString(@"shouldOverrideLoadWithRequest:navigationType:");
        if ([plugin respondsToSelector:selector]) {
            if (((BOOL (*)(id, SEL, id, int))objc_msgSend)(plugin, selector, request, navigationType)) {
                return NO;
            }
        }
    }

    /*
     * Handle all other types of urls (tel:, sms:), and requests to load a url in the main webview.
     */
    BOOL shouldAllowNavigation = [vc shouldAllowNavigationToURL:url];
    if (shouldAllowNavigation) {
        return YES;
    } else {
        BOOL shouldOpenExternalURL = [vc shouldOpenExternalURL:url];
        if (shouldOpenExternalURL) {
            if ([[UIApplication sharedApplication] canOpenURL:url]) {
                [[UIApplication sharedApplication] openURL:url];
            } else { // handle any custom schemes to plugins
                [[NSNotificationCenter defaultCenter] postNotification:[NSNotification notificationWithName:CDVPluginHandleOpenURLNotification object:url]];
            }
        }
    }

    return NO;
}

@end
