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

#import "CDVInAppBrowser.h"
#import "CDVPluginResult.h"
#import "CDVViewController.h"

#define    kInAppBrowserTargetSelf @"_self"
#define    kInAppBrowserTargetSystem @"_system"
#define    kInAppBrowserTargetBlank @"_blank"

#define    TOOLBAR_HEIGHT 44.0
#define    LOCATIONBAR_HEIGHT 21.0
#define    FOOTER_HEIGHT ((TOOLBAR_HEIGHT) + (LOCATIONBAR_HEIGHT))

#pragma mark CDVInAppBrowser

@implementation CDVInAppBrowser

- (CDVInAppBrowser*)initWithWebView:(UIWebView*)theWebView
{
    self = [super initWithWebView:theWebView];
    if (self != nil) {
        // your initialization here
    }

    return self;
}

- (void)onReset
{
    [self close:nil];
}

- (void)close:(CDVInvokedUrlCommand*)command
{
    if (self.inAppBrowserViewController != nil) {
        [self.inAppBrowserViewController close];
        self.inAppBrowserViewController = nil;
    }

    self.callbackId = nil;
}

- (void)open:(CDVInvokedUrlCommand*)command
{
    CDVPluginResult* pluginResult;

    NSString* url = [command argumentAtIndex:0];
    NSString* target = [command argumentAtIndex:1 withDefault:kInAppBrowserTargetSelf];
    NSString* options = [command argumentAtIndex:2 withDefault:@"" andClass:[NSString class]];

    self.callbackId = command.callbackId;

    if (url != nil) {
        NSURL* baseUrl = [self.webView.request URL];
        NSURL* absoluteUrl = [[NSURL URLWithString:url relativeToURL:baseUrl] absoluteURL];
        if ([target isEqualToString:kInAppBrowserTargetSelf]) {
            [self openInCordovaWebView:absoluteUrl withOptions:options];
        } else if ([target isEqualToString:kInAppBrowserTargetSystem]) {
            [self openInSystem:absoluteUrl];
        } else { // _blank or anything else
            [self openInInAppBrowser:absoluteUrl withOptions:options];
        }

        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    } else {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"incorrect number of arguments"];
    }

    [pluginResult setKeepCallback:[NSNumber numberWithBool:YES]];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void)openInInAppBrowser:(NSURL*)url withOptions:(NSString*)options
{
    if (self.inAppBrowserViewController == nil) {
        NSString* originalUA = [CDVViewController originalUserAgent];
        self.inAppBrowserViewController = [[CDVInAppBrowserViewController alloc] initWithUserAgent:originalUA];
        self.inAppBrowserViewController.navigationDelegate = self;

        if ([self.viewController conformsToProtocol:@protocol(CDVScreenOrientationDelegate)]) {
            self.inAppBrowserViewController.orientationDelegate = (UIViewController <CDVScreenOrientationDelegate>*)self.viewController;
        }
    }

    CDVInAppBrowserOptions* browserOptions = [CDVInAppBrowserOptions parseOptions:options];
    [self.inAppBrowserViewController showLocationBar:browserOptions.location];

    // Set Presentation Style
    UIModalPresentationStyle presentationStyle = UIModalPresentationFullScreen; // default
    if (browserOptions.presentationstyle != nil) {
        if ([browserOptions.presentationstyle isEqualToString:@"pagesheet"]) {
            presentationStyle = UIModalPresentationPageSheet;
        } else if ([browserOptions.presentationstyle isEqualToString:@"formsheet"]) {
            presentationStyle = UIModalPresentationFormSheet;
        }
    }
    self.inAppBrowserViewController.modalPresentationStyle = presentationStyle;

    // Set Transition Style
    UIModalTransitionStyle transitionStyle = UIModalTransitionStyleCoverVertical; // default
    if (browserOptions.transitionstyle != nil) {
        if ([browserOptions.transitionstyle isEqualToString:@"fliphorizontal"]) {
            transitionStyle = UIModalTransitionStyleFlipHorizontal;
        } else if ([browserOptions.transitionstyle isEqualToString:@"crossdissolve"]) {
            transitionStyle = UIModalTransitionStyleCrossDissolve;
        }
    }
    self.inAppBrowserViewController.modalTransitionStyle = transitionStyle;

    if (self.viewController.modalViewController != self.inAppBrowserViewController) {
        [self.viewController presentModalViewController:self.inAppBrowserViewController animated:YES];
    }
    [self.inAppBrowserViewController navigateTo:url];
}

- (void)openInCordovaWebView:(NSURL*)url withOptions:(NSString*)options
{
    BOOL passesWhitelist = YES;

    if ([self.viewController isKindOfClass:[CDVViewController class]]) {
        CDVViewController* vc = (CDVViewController*)self.viewController;
        if ([vc.whitelist schemeIsAllowed:[url scheme]]) {
            passesWhitelist = [vc.whitelist URLIsAllowed:url];
        }
    } else { // something went wrong, we can't get the whitelist
        passesWhitelist = NO;
    }

    if (passesWhitelist) {
        NSURLRequest* request = [NSURLRequest requestWithURL:url];
        [self.webView loadRequest:request];
    } else { // this assumes the InAppBrowser can be excepted from the white-list
        [self openInInAppBrowser:url withOptions:options];
    }
}

- (void)openInSystem:(NSURL*)url
{
    if ([[UIApplication sharedApplication] canOpenURL:url]) {
        [[UIApplication sharedApplication] openURL:url];
    } else { // handle any custom schemes to plugins
        [[NSNotificationCenter defaultCenter] postNotification:[NSNotification notificationWithName:CDVPluginHandleOpenURLNotification object:url]];
    }
}

#pragma mark CDVInAppBrowserNavigationDelegate

- (void)browserLoadStart:(NSURL*)url
{
    if (self.callbackId != nil) {
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                                                      messageAsDictionary:@ {@"type":@"loadstart", @"url":[url absoluteString]}];
        [pluginResult setKeepCallback:[NSNumber numberWithBool:YES]];

        [self.commandDelegate sendPluginResult:pluginResult callbackId:self.callbackId];
    }
}

- (void)browserLoadStop:(NSURL*)url
{
    if (self.callbackId != nil) {
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                                                      messageAsDictionary:@ {@"type":@"loadstop", @"url":[url absoluteString]}];
        [pluginResult setKeepCallback:[NSNumber numberWithBool:YES]];

        [self.commandDelegate sendPluginResult:pluginResult callbackId:self.callbackId];
    }
}

- (void)browserExit
{
    if (self.callbackId != nil) {
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                                                      messageAsDictionary:@ {@"type":@"exit"}];
        [pluginResult setKeepCallback:[NSNumber numberWithBool:YES]];

        [self.commandDelegate sendPluginResult:pluginResult callbackId:self.callbackId];
    }
}

@end

#pragma mark CDVInAppBrowserViewController

@implementation CDVInAppBrowserViewController

- (id)initWithUserAgent:(NSString*)userAgent
{
    self = [super init];
    if (self != nil) {
        self.userAgent = userAgent;
        [self createViews];
    }

    return self;
}

- (void)createViews
{
    // We create the views in code for primarily for ease of upgrades and not requiring an external .xib to be included

    CGRect webViewBounds = self.view.bounds;

    webViewBounds.size.height -= FOOTER_HEIGHT;

    if (!self.webView) {
        // setting the UserAgent must occur before the UIWebView is instantiated.
        // This is read per instantiation, so it does not affect the main Cordova UIWebView
        NSDictionary* dict = [[NSDictionary alloc] initWithObjectsAndKeys:self.userAgent, @"UserAgent", nil];
        [[NSUserDefaults standardUserDefaults] registerDefaults:dict];

        self.webView = [[UIWebView alloc] initWithFrame:webViewBounds];
        self.webView.autoresizingMask = (UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight);

        [self.view addSubview:self.webView];
        [self.view sendSubviewToBack:self.webView];

        self.webView.delegate = self;
        self.webView.scalesPageToFit = TRUE;
        self.webView.backgroundColor = [UIColor whiteColor];

        self.webView.clearsContextBeforeDrawing = YES;
        self.webView.clipsToBounds = YES;
        self.webView.contentMode = UIViewContentModeScaleToFill;
        self.webView.contentStretch = CGRectFromString(@"{{0, 0}, {1, 1}}");
        self.webView.multipleTouchEnabled = YES;
        self.webView.opaque = YES;
        self.webView.scalesPageToFit = NO;
        self.webView.userInteractionEnabled = YES;
    }

    self.spinner = [[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle:UIActivityIndicatorViewStyleWhite];
    self.spinner.alpha = 1.000;
    self.spinner.autoresizesSubviews = YES;
    self.spinner.autoresizingMask = UIViewAutoresizingFlexibleLeftMargin | UIViewAutoresizingFlexibleTopMargin;
    self.spinner.clearsContextBeforeDrawing = NO;
    self.spinner.clipsToBounds = NO;
    self.spinner.contentMode = UIViewContentModeScaleToFill;
    self.spinner.contentStretch = CGRectFromString(@"{{0, 0}, {1, 1}}");
    self.spinner.frame = CGRectMake(454.0, 231.0, 20.0, 20.0);
    self.spinner.hidden = YES;
    self.spinner.hidesWhenStopped = YES;
    self.spinner.multipleTouchEnabled = NO;
    self.spinner.opaque = NO;
    self.spinner.userInteractionEnabled = NO;
    [self.spinner stopAnimating];

    self.closeButton = [[UIBarButtonItem alloc] initWithBarButtonSystemItem:UIBarButtonSystemItemDone target:self action:@selector(close)];
    self.closeButton.enabled = YES;
    self.closeButton.imageInsets = UIEdgeInsetsZero;
    self.closeButton.style = UIBarButtonItemStylePlain;
    self.closeButton.width = 32.000;

    UIBarButtonItem* flexibleSpaceButton = [[UIBarButtonItem alloc] initWithBarButtonSystemItem:UIBarButtonSystemItemFlexibleSpace target:nil action:nil];

    UIBarButtonItem* fixedSpaceButton = [[UIBarButtonItem alloc] initWithBarButtonSystemItem:UIBarButtonSystemItemFixedSpace target:nil action:nil];
    fixedSpaceButton.width = 20;

    self.toolbar = [[UIToolbar alloc] initWithFrame:CGRectMake(0.0, (self.view.bounds.size.height - TOOLBAR_HEIGHT), self.view.bounds.size.width, TOOLBAR_HEIGHT)];
    self.toolbar.alpha = 1.000;
    self.toolbar.autoresizesSubviews = YES;
    self.toolbar.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleTopMargin;
    self.toolbar.barStyle = UIBarStyleBlackOpaque;
    self.toolbar.clearsContextBeforeDrawing = NO;
    self.toolbar.clipsToBounds = NO;
    self.toolbar.contentMode = UIViewContentModeScaleToFill;
    self.toolbar.contentStretch = CGRectFromString(@"{{0, 0}, {1, 1}}");
    self.toolbar.hidden = NO;
    self.toolbar.multipleTouchEnabled = NO;
    self.toolbar.opaque = NO;
    self.toolbar.userInteractionEnabled = YES;

    CGFloat labelInset = 5.0;
    self.addressLabel = [[UILabel alloc] initWithFrame:CGRectMake(labelInset, (self.view.bounds.size.height - FOOTER_HEIGHT), self.view.bounds.size.width - labelInset, LOCATIONBAR_HEIGHT)];
    self.addressLabel.adjustsFontSizeToFitWidth = NO;
    self.addressLabel.alpha = 1.000;
    self.addressLabel.autoresizesSubviews = YES;
    self.addressLabel.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleRightMargin | UIViewAutoresizingFlexibleTopMargin;
    self.addressLabel.backgroundColor = [UIColor clearColor];
    self.addressLabel.baselineAdjustment = UIBaselineAdjustmentAlignCenters;
    self.addressLabel.clearsContextBeforeDrawing = YES;
    self.addressLabel.clipsToBounds = YES;
    self.addressLabel.contentMode = UIViewContentModeScaleToFill;
    self.addressLabel.contentStretch = CGRectFromString(@"{{0, 0}, {1, 1}}");
    self.addressLabel.enabled = YES;
    self.addressLabel.hidden = NO;
    self.addressLabel.lineBreakMode = UILineBreakModeTailTruncation;
    self.addressLabel.minimumFontSize = 10.000;
    self.addressLabel.multipleTouchEnabled = NO;
    self.addressLabel.numberOfLines = 1;
    self.addressLabel.opaque = NO;
    self.addressLabel.shadowOffset = CGSizeMake(0.0, -1.0);
    self.addressLabel.text = @"Loading...";
    self.addressLabel.textAlignment = UITextAlignmentLeft;
    self.addressLabel.textColor = [UIColor colorWithWhite:1.000 alpha:1.000];
    self.addressLabel.userInteractionEnabled = NO;

    NSString* frontArrowString = @"►"; // create arrow from Unicode char
    self.forwardButton = [[UIBarButtonItem alloc] initWithTitle:frontArrowString style:UIBarButtonItemStylePlain target:self action:@selector(goForward:)];
    self.forwardButton.enabled = YES;
    self.forwardButton.imageInsets = UIEdgeInsetsZero;

    NSString* backArrowString = @"◄"; // create arrow from Unicode char
    self.backButton = [[UIBarButtonItem alloc] initWithTitle:backArrowString style:UIBarButtonItemStylePlain target:self action:@selector(goBack:)];
    self.backButton.enabled = YES;
    self.backButton.imageInsets = UIEdgeInsetsZero;

    [self.toolbar setItems:@[self.closeButton, flexibleSpaceButton, self.backButton, fixedSpaceButton, self.forwardButton]];

    self.view.backgroundColor = [UIColor grayColor];
    [self.view addSubview:self.toolbar];
    [self.view addSubview:self.addressLabel];
    [self.view addSubview:self.spinner];
}

- (void)showLocationBar:(BOOL)show
{
    CGRect addressLabelFrame = self.addressLabel.frame;
    BOOL locationBarVisible = (addressLabelFrame.size.height > 0);

    // prevent double show/hide
    if (locationBarVisible == show) {
        return;
    }

    if (show) {
        CGRect webViewBounds = self.view.bounds;
        webViewBounds.size.height -= FOOTER_HEIGHT;
        self.webView.frame = webViewBounds;

        CGRect addressLabelFrame = self.addressLabel.frame;
        addressLabelFrame.size.height = LOCATIONBAR_HEIGHT;
        self.addressLabel.frame = addressLabelFrame;
    } else {
        CGRect webViewBounds = self.view.bounds;
        webViewBounds.size.height -= TOOLBAR_HEIGHT;
        self.webView.frame = webViewBounds;

        CGRect addressLabelFrame = self.addressLabel.frame;
        addressLabelFrame.size.height = 0;
        self.addressLabel.frame = addressLabelFrame;
    }
}

- (void)viewDidLoad
{
    [super viewDidLoad];
}

- (void)viewDidUnload
{
    [self.webView loadHTMLString:nil baseURL:nil];
    [super viewDidUnload];
}

- (void)close
{
    if ([self respondsToSelector:@selector(presentingViewController)]) {
        [[self presentingViewController] dismissViewControllerAnimated:YES completion:nil];
    } else {
        [[self parentViewController] dismissModalViewControllerAnimated:YES];
    }

    if ((self.navigationDelegate != nil) && [self.navigationDelegate respondsToSelector:@selector(browserExit)]) {
        [self.navigationDelegate browserExit];
    }
}

- (void)navigateTo:(NSURL*)url
{
    NSURLRequest* request = [NSURLRequest requestWithURL:url];

    [self.webView loadRequest:request];
}

- (void)goBack:(id)sender
{
    [self.webView goBack];
}

- (void)goForward:(id)sender
{
    [self.webView goForward];
}

#pragma mark UIWebViewDelegate

- (void)webViewDidStartLoad:(UIWebView*)theWebView
{
    // loading url, start spinner, update back/forward

    self.addressLabel.text = @"Loading...";
    self.backButton.enabled = theWebView.canGoBack;
    self.forwardButton.enabled = theWebView.canGoForward;

    [self.spinner startAnimating];

    if ((self.navigationDelegate != nil) && [self.navigationDelegate respondsToSelector:@selector(browserLoadStart:)]) {
        [self.navigationDelegate browserLoadStart:theWebView.request.URL];
    }
}

- (void)webViewDidFinishLoad:(UIWebView*)theWebView
{
    // update url, stop spinner, update back/forward

    self.addressLabel.text = theWebView.request.URL.absoluteString;
    self.backButton.enabled = theWebView.canGoBack;
    self.forwardButton.enabled = theWebView.canGoForward;

    [self.spinner stopAnimating];

    if ((self.navigationDelegate != nil) && [self.navigationDelegate respondsToSelector:@selector(browserLoadStop:)]) {
        [self.navigationDelegate browserLoadStop:theWebView.request.URL];
    }
}

- (void)webView:(UIWebView*)theWebView didFailLoadWithError:(NSError*)error
{
    // log fail message, stop spinner, update back/forward
    NSLog(@"webView:didFailLoadWithError - %@", [error localizedDescription]);

    self.backButton.enabled = theWebView.canGoBack;
    self.forwardButton.enabled = theWebView.canGoForward;
    [self.spinner stopAnimating];

    self.addressLabel.text = @"Load Error";
}

#pragma mark CDVScreenOrientationDelegate

- (BOOL)shouldAutorotate
{
    if ((self.orientationDelegate != nil) && [self.orientationDelegate respondsToSelector:@selector(shouldAutorotate)]) {
        return [self.orientationDelegate shouldAutorotate];
    }
    return YES;
}

- (NSUInteger)supportedInterfaceOrientations
{
    if ((self.orientationDelegate != nil) && [self.orientationDelegate respondsToSelector:@selector(supportedInterfaceOrientations)]) {
        return [self.orientationDelegate supportedInterfaceOrientations];
    }

    return 1 << UIInterfaceOrientationPortrait;
}

- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation
{
    if ((self.orientationDelegate != nil) && [self.orientationDelegate respondsToSelector:@selector(shouldAutorotateToInterfaceOrientation:)]) {
        return [self.orientationDelegate shouldAutorotateToInterfaceOrientation:interfaceOrientation];
    }

    return YES;
}

@end

@implementation CDVInAppBrowserOptions

- (id)init
{
    if (self = [super init]) {
        // default values
        self.location = YES;
    }

    return self;
}

+ (CDVInAppBrowserOptions*)parseOptions:(NSString*)options
{
    CDVInAppBrowserOptions* obj = [[CDVInAppBrowserOptions alloc] init];

    // NOTE: this parsing does not handle quotes within values
    NSArray* pairs = [options componentsSeparatedByString:@","];

    // parse keys and values, set the properties
    for (NSString* pair in pairs) {
        NSArray* keyvalue = [pair componentsSeparatedByString:@"="];

        if ([keyvalue count] == 2) {
            NSString* key = [[keyvalue objectAtIndex:0] lowercaseString];
            NSString* value = [[keyvalue objectAtIndex:1] lowercaseString];

            BOOL isBoolean = [value isEqualToString:@"yes"] || [value isEqualToString:@"no"];
            NSNumberFormatter* numberFormatter = [[NSNumberFormatter alloc] init];
            [numberFormatter setAllowsFloats:YES];
            BOOL isNumber = [numberFormatter numberFromString:value] != nil;

            // set the property according to the key name
            if ([obj respondsToSelector:NSSelectorFromString(key)]) {
                if (isNumber) {
                    [obj setValue:[numberFormatter numberFromString:value] forKey:key];
                } else if (isBoolean) {
                    [obj setValue:[NSNumber numberWithBool:[value isEqualToString:@"yes"]] forKey:key];
                } else {
                    [obj setValue:value forKey:key];
                }
            }
        }
    }

    return obj;
}

@end
