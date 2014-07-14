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
#import "CDVWebViewPreferences.h"
#import "CDVAvailability.h"
#import <objc/message.h>

#ifdef __IPHONE_8_0
    #import <WebKit/WebKit.h>
#endif /* ifdef __IPHONE_8_0 */

@implementation CDVWebViewPreferences

- (instancetype)initWithWebView:(UIView*)webView
{
    self = [super init];
    if (self) {
        Class wk_class = NSClassFromString(@"WKWebView");
        if (!([webView isKindOfClass:wk_class] || [webView isKindOfClass:[UIWebView class]])) {
            return nil;
        }
        _webView = webView;
    }

    return self;
}

- (void)updateSettings:(NSDictionary*)settings
{
    Class wk_class = NSClassFromString(@"WKWebView");
    SEL ui_sel = NSSelectorFromString(@"updateUIWebView:settings:");
    SEL wk_sel = NSSelectorFromString(@"updateWKWebView:settings:");

    __weak id weakSelf = self;

    dispatch_block_t invoke = ^(void) {
        if ([_webView isKindOfClass:[UIWebView class]] && [weakSelf respondsToSelector:ui_sel]) {
            ((void (*)(id, SEL, id, id))objc_msgSend)(weakSelf, ui_sel, _webView, settings);
        } else if ([_webView isKindOfClass:wk_class] && [weakSelf respondsToSelector:wk_sel]) {
            ((void (*)(id, SEL, id, id))objc_msgSend)(weakSelf, wk_sel, _webView, settings);
        }
    };

    // UIKit operations have to be on the main thread.
    // perform a synchronous invoke on the main thread without deadlocking
    if ([NSThread isMainThread]) {
        invoke();
    } else {
        dispatch_sync(dispatch_get_main_queue(), invoke);
    }
}

- (id)cordovaSettings:(NSDictionary*)settings forKey:(NSString*)key
{
    return [settings objectForKey:[key lowercaseString]];
}

- (void)updateUIWebView:(UIWebView*)theWebView settings:(NSDictionary*)settings
{
    NSString* enableViewportScale = [self cordovaSettings:settings forKey:@"EnableViewportScale"];
    NSNumber* allowInlineMediaPlayback = [self cordovaSettings:settings forKey:@"AllowInlineMediaPlayback"];
    BOOL mediaPlaybackRequiresUserAction = YES;  // default value

    if ([self cordovaSettings:settings forKey:@"MediaPlaybackRequiresUserAction"]) {
        mediaPlaybackRequiresUserAction = [(NSNumber*)[self cordovaSettings:settings forKey:@"MediaPlaybackRequiresUserAction"] boolValue];
    }

    theWebView.scalesPageToFit = [enableViewportScale boolValue];

    /*
     * This is for iOS 4.x, where you can allow inline <video> and <audio>, and also autoplay them
     */
    if ([allowInlineMediaPlayback boolValue] && [theWebView respondsToSelector:@selector(allowsInlineMediaPlayback)]) {
        theWebView.allowsInlineMediaPlayback = YES;
    }
    if ((mediaPlaybackRequiresUserAction == NO) && [theWebView respondsToSelector:@selector(mediaPlaybackRequiresUserAction)]) {
        theWebView.mediaPlaybackRequiresUserAction = NO;
    }

    // By default, overscroll bouncing is allowed.
    // UIWebViewBounce has been renamed to DisallowOverscroll, but both are checked.
    BOOL bounceAllowed = YES;
    NSNumber* disallowOverscroll = [self cordovaSettings:settings forKey:@"DisallowOverscroll"];
    if (disallowOverscroll == nil) {
        NSNumber* bouncePreference = [self cordovaSettings:settings forKey:@"UIWebViewBounce"];
        bounceAllowed = (bouncePreference == nil || [bouncePreference boolValue]);
    } else {
        bounceAllowed = ![disallowOverscroll boolValue];
    }

    // prevent webView from bouncing
    // based on the DisallowOverscroll/UIWebViewBounce key in config.xml
    if (!bounceAllowed) {
        if ([theWebView respondsToSelector:@selector(scrollView)]) {
            ((UIScrollView*)[theWebView scrollView]).bounces = NO;
        } else {
            for (id subview in theWebView.subviews) {
                if ([[subview class] isSubclassOfClass:[UIScrollView class]]) {
                    ((UIScrollView*)subview).bounces = NO;
                }
            }
        }
    }

    NSString* decelerationSetting = [self cordovaSettings:settings forKey:@"UIWebViewDecelerationSpeed"];
    if (![@"fast" isEqualToString : decelerationSetting]) {
        [theWebView.scrollView setDecelerationRate:UIScrollViewDecelerationRateNormal];
    }

    /*
     * iOS 6.0 UIWebView properties
     */
    if (IsAtLeastiOSVersion(@"6.0")) {
        BOOL keyboardDisplayRequiresUserAction = YES; // KeyboardDisplayRequiresUserAction - defaults to YES
        if ([self cordovaSettings:settings forKey:@"KeyboardDisplayRequiresUserAction"] != nil) {
            if ([self cordovaSettings:settings forKey:@"KeyboardDisplayRequiresUserAction"]) {
                keyboardDisplayRequiresUserAction = [(NSNumber*)[self cordovaSettings:settings forKey:@"KeyboardDisplayRequiresUserAction"] boolValue];
            }
        }

        // property check for compiling under iOS < 6
        if ([theWebView respondsToSelector:@selector(setKeyboardDisplayRequiresUserAction:)]) {
            [theWebView setValue:[NSNumber numberWithBool:keyboardDisplayRequiresUserAction] forKey:@"keyboardDisplayRequiresUserAction"];
        }

        BOOL suppressesIncrementalRendering = NO; // SuppressesIncrementalRendering - defaults to NO
        if ([self cordovaSettings:settings forKey:@"SuppressesIncrementalRendering"] != nil) {
            if ([self cordovaSettings:settings forKey:@"SuppressesIncrementalRendering"]) {
                suppressesIncrementalRendering = [(NSNumber*)[self cordovaSettings:settings forKey:@"SuppressesIncrementalRendering"] boolValue];
            }
        }

        // property check for compiling under iOS < 6
        if ([theWebView respondsToSelector:@selector(setSuppressesIncrementalRendering:)]) {
            [theWebView setValue:[NSNumber numberWithBool:suppressesIncrementalRendering] forKey:@"suppressesIncrementalRendering"];
        }
    }

    /*
     * iOS 7.0 UIWebView properties
     */
    if (IsAtLeastiOSVersion(@"7.0")) {
        SEL ios7sel = nil;
        id prefObj = nil;

        CGFloat gapBetweenPages = 0.0; // default
        prefObj = [self cordovaSettings:settings forKey:@"GapBetweenPages"];
        if (prefObj != nil) {
            gapBetweenPages = [prefObj floatValue];
        }

        // property check for compiling under iOS < 7
        ios7sel = NSSelectorFromString(@"setGapBetweenPages:");
        if ([theWebView respondsToSelector:ios7sel]) {
            [theWebView setValue:[NSNumber numberWithFloat:gapBetweenPages] forKey:@"gapBetweenPages"];
        }

        CGFloat pageLength = 0.0; // default
        prefObj = [self cordovaSettings:settings forKey:@"PageLength"];
        if (prefObj != nil) {
            pageLength = [[self cordovaSettings:settings forKey:@"PageLength"] floatValue];
        }

        // property check for compiling under iOS < 7
        ios7sel = NSSelectorFromString(@"setPageLength:");
        if ([theWebView respondsToSelector:ios7sel]) {
            [theWebView setValue:[NSNumber numberWithBool:pageLength] forKey:@"pageLength"];
        }

        NSInteger paginationBreakingMode = 0; // default - UIWebPaginationBreakingModePage
        prefObj = [self cordovaSettings:settings forKey:@"PaginationBreakingMode"];
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

        // property check for compiling under iOS < 7
        ios7sel = NSSelectorFromString(@"setPaginationBreakingMode:");
        if ([theWebView respondsToSelector:ios7sel]) {
            [theWebView setValue:[NSNumber numberWithInteger:paginationBreakingMode] forKey:@"paginationBreakingMode"];
        }

        NSInteger paginationMode = 0; // default - UIWebPaginationModeUnpaginated
        prefObj = [self cordovaSettings:settings forKey:@"PaginationMode"];
        if (prefObj != nil) {
            NSArray* validValues = @[@"unpaginated", @"lefttoright", @"toptobottom", @"bottomtotop", @"righttoleft"];
            NSString* prefValue = [validValues objectAtIndex:0];

            if ([prefObj isKindOfClass:[NSString class]]) {
                prefValue = prefObj;
            }

            paginationMode = [validValues indexOfObject:[prefValue lowercaseString]];
            if (paginationMode == NSNotFound) {
                paginationMode = 0;
            }
        }

        // property check for compiling under iOS < 7
        ios7sel = NSSelectorFromString(@"setPaginationMode:");
        if ([theWebView respondsToSelector:ios7sel]) {
            [theWebView setValue:[NSNumber numberWithInteger:paginationMode] forKey:@"paginationMode"];
        }
    }
}

#ifdef __IPHONE_8_0

    - (void)updateWKWebView:(WKWebView*)theWebView settings:(NSDictionary*)settings
    {
        id prefObj = nil;

        CGFloat minimumFontSize = 0.0; // default

        prefObj = [self cordovaSettings:settings forKey:@"MinimumFontSize"];
        if (prefObj != nil) {
            minimumFontSize = [[self cordovaSettings:settings forKey:@"MinimumFontSize"] floatValue];
        }
        theWebView.configuration.preferences.minimumFontSize = minimumFontSize;

        /*
        BOOL javaScriptEnabled = YES;  // default value
        if ([self cordovaSettings:settings forKey:@"JavaScriptEnabled"]) {
            javaScriptEnabled = [(NSNumber*)[self cordovaSettings:settings forKey:@"JavaScriptEnabled"] boolValue];
        }
        theWebView.configuration.preferences.javaScriptEnabled = javaScriptEnabled;

        BOOL javaScriptCanOpenWindowsAutomatically = NO;  // default value
        if ([self cordovaSettings:settings forKey:@"JavaScriptEnabled"]) {
            javaScriptCanOpenWindowsAutomatically = [(NSNumber*)[self cordovaSettings:settings forKey:@"JavaScriptEnabled"] boolValue];
        }
        theWebView.configuration.preferences.javaScriptCanOpenWindowsAutomatically = javaScriptCanOpenWindowsAutomatically;
         */
    }
#endif /* ifdef __IPHONE_8_0 */

@end
