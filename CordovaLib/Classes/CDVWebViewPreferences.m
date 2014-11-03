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
#import "CDVWKWebViewPreferences.h"
#import "CDVUIWebViewPreferences.h"
#import "CDVAvailability.h"
#import <objc/message.h>
#import <WebKit/WebKit.h>

@implementation CDVWebViewPreferences

- (instancetype)initWithWebView:(UIView*)webView settings:(NSDictionary*)settings
{
    self = [super init];
    if (self) {
        if ([webView isKindOfClass:[WKWebView class]]) {
            return [[CDVWKWebViewPreferences alloc] initWithWebView:(WKWebView*)webView settings:settings];
        } else if ([webView isKindOfClass:[UIWebView class]]) {
            return [[CDVUIWebViewPreferences alloc] initWithWebView:(UIWebView*)webView settings:settings];
        } else {
            return nil;
        }
    }

    return self;
}

- (instancetype)initWithSettings:(NSDictionary*)settings
{
    self = [super init];
    if (self) {
        self.settings = settings;
    }

    return self;
}

- (void)update
{
    [NSException raise:@"Invoked abstract method" format:@"Invoked abstract method"];
}

- (id)settingForKey:(NSString*)key
{
    return [self.settings objectForKey:[key lowercaseString]];
}

- (BOOL)boolSettingForKey:(NSString*)key defaultValue:(BOOL)defaultValue
{
    BOOL value = defaultValue;
    id prefObj = [self settingForKey:key];

    if (prefObj != nil) {
        value = [(NSNumber*)prefObj boolValue];
    }

    return value;
}

- (CGFloat)floatSettingForKey:(NSString*)key defaultValue:(CGFloat)defaultValue
{
    CGFloat value = defaultValue;
    id prefObj = [self settingForKey:key];

    if (prefObj != nil) {
        value = [prefObj floatValue];
    }

    return value;
}

@end
