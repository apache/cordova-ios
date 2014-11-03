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

#import "CDVUIWebViewPreferences.h"

@implementation CDVUIWebViewPreferences

- (instancetype)initWithWebView:(UIWebView*)webView settings:(NSDictionary*)settings
{
    self = [super initWithSettings:settings];
    if (self) {
        self.webView = webView;
    }

    return self;
}

- (void)update
{
    self.webView.scalesPageToFit = [self boolSettingForKey:@"EnableViewportScale" defaultValue:NO];
    self.webView.allowsInlineMediaPlayback = [self boolSettingForKey:@"AllowInlineMediaPlayback" defaultValue:NO];
    self.webView.mediaPlaybackRequiresUserAction = [self boolSettingForKey:@"MediaPlaybackRequiresUserAction" defaultValue:YES];
    self.webView.mediaPlaybackAllowsAirPlay = [self boolSettingForKey:@"MediaPlaybackAllowsAirPlay" defaultValue:YES];
    self.webView.keyboardDisplayRequiresUserAction = [self boolSettingForKey:@"KeyboardDisplayRequiresUserAction" defaultValue:YES];
    self.webView.suppressesIncrementalRendering = [self boolSettingForKey:@"SuppressesIncrementalRendering" defaultValue:NO];
    self.webView.gapBetweenPages = [self floatSettingForKey:@"GapBetweenPages" defaultValue:0.0];
    self.webView.pageLength = [self floatSettingForKey:@"PageLength" defaultValue:0.0];

    id prefObj = nil;

    // By default, DisallowOverscroll is false (thus bounce is allowed)
    BOOL bounceAllowed = !([self boolSettingForKey:@"DisallowOverscroll" defaultValue:NO]);

    // prevent webView from bouncing
    if (!bounceAllowed) {
        if ([self.webView respondsToSelector:@selector(scrollView)]) {
            ((UIScrollView*)[self.webView scrollView]).bounces = NO;
        } else {
            for (id subview in self.webView.subviews) {
                if ([[subview class] isSubclassOfClass:[UIScrollView class]]) {
                    ((UIScrollView*)subview).bounces = NO;
                }
            }
        }
    }

    NSString* decelerationSetting = [self settingForKey:@"UIWebViewDecelerationSpeed"];
    if (![@"fast" isEqualToString : decelerationSetting]) {
        [self.webView.scrollView setDecelerationRate:UIScrollViewDecelerationRateNormal];
    }

    NSInteger paginationBreakingMode = 0; // default - UIWebPaginationBreakingModePage
    prefObj = [self settingForKey:@"PaginationBreakingMode"];
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
    self.webView.paginationBreakingMode = paginationBreakingMode;

    NSInteger paginationMode = 0; // default - UIWebPaginationModeUnpaginated
    prefObj = [self settingForKey:@"PaginationMode"];
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
    self.webView.paginationMode = paginationMode;
}

@end
