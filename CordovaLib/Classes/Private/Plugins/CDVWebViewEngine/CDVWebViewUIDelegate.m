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

#import "CDVWebViewUIDelegate.h"
#import <Cordova/CDVViewController.h>

#if __IPHONE_OS_VERSION_MIN_REQUIRED < 270000
#import <objc/runtime.h>
#endif

@interface CDVWebViewUIDelegate ()

@property (nonatomic, weak) CDVViewController *viewController;

@end

@implementation CDVWebViewUIDelegate
{
    NSMutableArray<UIViewController *> *windows;
}

#if __IPHONE_OS_VERSION_MIN_REQUIRED < 270000
+ (void)load {
    // iOS 27 makes public a delegate method for determining whether
    // geolocation should be allowed for a given origin:
    //
    // - webView:requestGeolocationPermissionForOrigin:initiatedByFrame:decisionHandler:
    //
    // This removes one of the main reasons for apps to need the geolocation
    // plugin.
    //
    // The same API exists as private API (prefixed with an underscore) as far
    // back as iOS 15, but we're not allowed to implement it directly.  Since
    // it's solifidied now into public API, we can be assured that the private
    // API signature won't change in future iOS versions, so we can grab the
    // implementation of the public API and dynamically inject it with the
    // private API method signature.
    //
    // Is this best practice? No.
    // Is this safe? Probably.
    // Is this useful for apps that use geolocation? Definitely.
    if (@available(iOS 27.0, *)) {
        /* Do nothing - iOS 27 supports the public API delegate method */
    } else if (@available(iOS 15.0, *)) {
        /* Alias the public API delegate method to the private API */
        Class class = [self class];

        SEL publicSelector = @selector(webView:requestGeolocationPermissionForOrigin:initiatedByFrame:decisionHandler:);
        SEL privateSelector = NSSelectorFromString([NSString stringWithFormat:@"_%@", NSStringFromSelector(publicSelector)]);

        Method publicMethod = class_getInstanceMethod(class, publicSelector);

        class_addMethod(class, privateSelector, method_getImplementation(publicMethod), method_getTypeEncoding(publicMethod));
    }
}
#endif

- (instancetype)initWithViewController:(CDVViewController *)vc
{
    self = [super init];

    if (self) {
        self.viewController = vc;
        self.title = vc.title;
        windows = [[NSMutableArray alloc] init];
    }
    return self;
}

- (void)webView:(WKWebView*)webView runJavaScriptAlertPanelWithMessage:(NSString*)message initiatedByFrame:(WKFrameInfo*)frame completionHandler:(CDV_SWIFT_UI_ACTOR void (^)(void))completionHandler
{
    UIAlertController* alert = [UIAlertController alertControllerWithTitle:self.title
                                                                   message:message
                                                            preferredStyle:UIAlertControllerStyleAlert];

    UIAlertAction* ok = [UIAlertAction actionWithTitle:NSLocalizedString(@"OK", @"OK")
                                                 style:UIAlertActionStyleDefault
                                               handler:^(UIAlertAction* action)
        {
            completionHandler();
            [alert dismissViewControllerAnimated:YES completion:nil];
        }];

    [alert addAction:ok];

    [[self topViewController] presentViewController:alert animated:YES completion:nil];
}

- (void)webView:(WKWebView*)webView runJavaScriptConfirmPanelWithMessage:(NSString*)message initiatedByFrame:(WKFrameInfo*)frame completionHandler:(CDV_SWIFT_UI_ACTOR void (^)(BOOL result))completionHandler
{
    UIAlertController* alert = [UIAlertController alertControllerWithTitle:self.title
                                                                   message:message
                                                            preferredStyle:UIAlertControllerStyleAlert];

    UIAlertAction* ok = [UIAlertAction actionWithTitle:NSLocalizedString(@"OK", @"OK")
                                                 style:UIAlertActionStyleDefault
                                               handler:^(UIAlertAction* action)
        {
            completionHandler(YES);
            [alert dismissViewControllerAnimated:YES completion:nil];
        }];

    [alert addAction:ok];

    UIAlertAction* cancel = [UIAlertAction actionWithTitle:NSLocalizedString(@"Cancel", @"Cancel")
                                                     style:UIAlertActionStyleDefault
                                                   handler:^(UIAlertAction* action)
        {
            completionHandler(NO);
            [alert dismissViewControllerAnimated:YES completion:nil];
        }];
    [alert addAction:cancel];

    [[self topViewController] presentViewController:alert animated:YES completion:nil];
}

- (void)webView:(WKWebView*)webView runJavaScriptTextInputPanelWithPrompt:(NSString*)prompt defaultText:(NSString*)defaultText initiatedByFrame:(WKFrameInfo*)frame completionHandler:(CDV_SWIFT_UI_ACTOR void (^)(NSString* result))completionHandler
{
    UIAlertController* alert = [UIAlertController alertControllerWithTitle:self.title
                                                                   message:prompt
                                                            preferredStyle:UIAlertControllerStyleAlert];

    UIAlertAction* ok = [UIAlertAction actionWithTitle:NSLocalizedString(@"OK", @"OK")
                                                 style:UIAlertActionStyleDefault
                                               handler:^(UIAlertAction* action)
        {
            completionHandler(((UITextField*)alert.textFields[0]).text);
            [alert dismissViewControllerAnimated:YES completion:nil];
        }];

    [alert addAction:ok];

    UIAlertAction* cancel = [UIAlertAction actionWithTitle:NSLocalizedString(@"Cancel", @"Cancel")
                                                     style:UIAlertActionStyleDefault
                                                   handler:^(UIAlertAction* action)
        {
            completionHandler(nil);
            [alert dismissViewControllerAnimated:YES completion:nil];
        }];
    [alert addAction:cancel];

    [alert addTextFieldWithConfigurationHandler:^(UITextField* textField) {
        textField.text = defaultText;
    }];

    [[self topViewController] presentViewController:alert animated:YES completion:nil];
}

- (nullable WKWebView*)webView:(WKWebView*)webView createWebViewWithConfiguration:(WKWebViewConfiguration*)configuration forNavigationAction:(WKNavigationAction*)navigationAction windowFeatures:(WKWindowFeatures*)windowFeatures
{
    if (!navigationAction.targetFrame.isMainFrame) {
        if (self.allowNewWindows) {
            WKWebView* v = [[WKWebView alloc] initWithFrame:webView.frame configuration:configuration];
            v.UIDelegate = webView.UIDelegate;
            v.navigationDelegate = webView.navigationDelegate;

            UIViewController* vc = [[UIViewController alloc] init];
            vc.modalPresentationStyle = UIModalPresentationOverCurrentContext;
            vc.view = v;

            [windows addObject:vc];

            [[self topViewController] presentViewController:vc animated:YES completion:nil];
            return v;
        } else {
            [webView loadRequest:navigationAction.request];
        }
    }

    return nil;
}

- (void)webViewDidClose:(WKWebView*)webView
{
    for (UIViewController* vc in windows) {
        if (vc.view == webView) {
            [vc dismissViewControllerAnimated:YES completion:nil];
            [windows removeObject:vc];
            break;
        }
    }

    // We do not allow closing the primary WebView
}

- (void)webView:(WKWebView *)webView requestMediaCapturePermissionForOrigin:(nonnull WKSecurityOrigin *)origin initiatedByFrame:(nonnull WKFrameInfo *)frame type:(WKMediaCaptureType)type decisionHandler:(CDV_SWIFT_UI_ACTOR void (^)(WKPermissionDecision))decisionHandler
  API_AVAILABLE(ios(15.0), macos(12.0))
{
    WKPermissionDecision decision;

    if (_mediaPermissionGrantType == CDVWebViewPermissionGrantType_Prompt) {
        decision = WKPermissionDecisionPrompt;
    }
    else if (_mediaPermissionGrantType == CDVWebViewPermissionGrantType_Deny) {
        decision = WKPermissionDecisionDeny;
    }
    else if (_mediaPermissionGrantType == CDVWebViewPermissionGrantType_Grant) {
        decision = WKPermissionDecisionGrant;
    }
    else {
        if ([origin.host isEqualToString:webView.URL.host]) {
            decision = WKPermissionDecisionGrant;
        } else if (_mediaPermissionGrantType == CDVWebViewPermissionGrantType_GrantIfSameHost_ElsePrompt) {
            decision = WKPermissionDecisionPrompt;
        } else {
            decision = WKPermissionDecisionDeny;
        }
    }

    decisionHandler(decision);
}

- (void)webView:(WKWebView *)webView requestGeolocationPermissionForOrigin:(WKSecurityOrigin*)origin initiatedByFrame:(WKFrameInfo *)frame decisionHandler:(CDV_SWIFT_UI_ACTOR void (^)(WKPermissionDecision decision))decisionHandler
    API_AVAILABLE(ios(27.0), macos(27.0), visionos(27.0))
{
    WKPermissionDecision decision;

    if (_geolocationPermissionGrantType == CDVWebViewPermissionGrantType_Prompt) {
        decision = WKPermissionDecisionPrompt;
    }
    else if (_geolocationPermissionGrantType == CDVWebViewPermissionGrantType_Deny) {
        decision = WKPermissionDecisionDeny;
    }
    else if (_geolocationPermissionGrantType == CDVWebViewPermissionGrantType_Grant) {
        decision = WKPermissionDecisionGrant;
    }
    else {
        if ([origin.host isEqualToString:webView.URL.host]) {
            decision = WKPermissionDecisionGrant;
        } else if (_geolocationPermissionGrantType == CDVWebViewPermissionGrantType_GrantIfSameHost_ElsePrompt) {
            decision = WKPermissionDecisionPrompt;
        } else {
            decision = WKPermissionDecisionDeny;
        }
    }

    decisionHandler(decision);
}

#pragma mark - Utility Methods

- (nullable UIViewController *)topViewController
{
    UIViewController *vc = self.viewController;

    while (vc.presentedViewController != nil && ![vc.presentedViewController isBeingDismissed]) {
        vc = vc.presentedViewController;
    }

    return vc;
}

@end
