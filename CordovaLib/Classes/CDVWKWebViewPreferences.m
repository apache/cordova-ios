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

#import "CDVWKWebViewPreferences.h"

@implementation CDVWKWebViewPreferences

- (instancetype)initWithWebView:(WKWebView*)webView settings:(NSDictionary*)settings
{
    self = [super initWithSettings:settings];
    if (self) {
        self.webView = webView;
    }

    return self;
}

- (void)update
{
    self.webView.configuration.preferences.minimumFontSize = [self floatSettingForKey:@"MinimumFontSize" defaultValue:0.0];
    self.webView.configuration.allowsInlineMediaPlayback = [self boolSettingForKey:@"AllowInlineMediaPlayback" defaultValue:NO];
    self.webView.configuration.mediaPlaybackRequiresUserAction = [self boolSettingForKey:@"MediaPlaybackRequiresUserAction" defaultValue:YES];
    self.webView.configuration.suppressesIncrementalRendering = [self boolSettingForKey:@"SuppressesIncrementalRendering" defaultValue:NO];
    self.webView.configuration.mediaPlaybackAllowsAirPlay = [self boolSettingForKey:@"MediaPlaybackAllowsAirPlay" defaultValue:YES];

    /*
     self.webView.configuration.preferences.javaScriptEnabled = [self boolSettingForKey:@"JavaScriptEnabled" default:YES];
     self.webView.configuration.preferences.javaScriptCanOpenWindowsAutomatically = [self boolSettingForKey:@"JavaScriptCanOpenWindowsAutomatically" default:NO];
     */
}

@end
