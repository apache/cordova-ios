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

#import "CDVSystemSchemes.h"
#import "NSDictionary+CordovaPreferences.h"
#import "CDV.h"

@interface CDVSystemSchemes ()

@property (nonatomic, readwrite) NSArray* systemSchemes;

@end

@implementation CDVSystemSchemes

- (void)pluginInitialize
{
    // Read from preference, if not use default
    NSString* schemesToOverride = [[self.commandDelegate settings] cordovaSettingForKey:@"CDVSystemSchemesOverride"];

    if ((schemesToOverride == nil) || ([schemesToOverride length] == 0)) {
        self.systemSchemes = @[@"maps", @"tel", @"telprompt"];
    } else {
        // parse csv naïvely
        self.systemSchemes = [schemesToOverride componentsSeparatedByString:@","];
    }
}

- (BOOL)shouldOverrideLoadWithRequest:(NSURLRequest*)request navigationType:(UIWebViewNavigationType)navigationType
{
    NSURL* url = [request URL];

    // Push these system schemes off to the system, and do not let the UIWebView handle them
    if ([self.systemSchemes indexOfObject:[url scheme]] != NSNotFound) {
        [[UIApplication sharedApplication] openURL:url];
        return YES;
    }

    return NO;
}

@end
