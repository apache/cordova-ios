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

#import "CDVConfiguration.h"

@implementation CDVConfiguration

- (void)setData:(NSMutableDictionary*)settings
{
    self.settings = settings;
    
    self.enableViewportScale = [self boolSettingForKey:@"EnableViewportScale" withDefault:YES];
    self.mediaPlaybackRequiresUserAction = [self boolSettingForKey:@"MediaPlaybackRequiresUserAction" withDefault:YES];
    self.allowInlineMediaPlayback = [self boolSettingForKey:@"AllowInlineMediaPlayback" withDefault:NO];
    
    BOOL bouncing = [self boolSettingForKey:@"UIWebViewBounce" withDefault:YES];
    BOOL disallowOverscroll = [self boolSettingForKey:@"DisallowOverscroll" withDefault:!bouncing];
    self.bounceAllowed = !disallowOverscroll;
    
    self.keyboardDisplayRequiresUserAction = [self boolSettingForKey:@"KeyboardDisplayRequiresUserAction"
                                                         withDefault:YES];
    self.suppressesIncrementalRendering = [self boolSettingForKey:@"SuppressesIncrementalRendering"
                                                     withDefault:NO];
    
    self.gapBetweenPages = [self floatSettingForKey:@"GapBetweenPages" withDefault:0.0];
    self.pageLength = [self floatSettingForKey:@"PageLength" withDefault:0.0];
}

- (BOOL)boolSettingForKey:(NSString*)key withDefault:(BOOL)value
{
    NSNumber* val = (NSNumber*)[self settingForKey:key];
    if (val == nil) {
        return value;
    }
    
    return [val boolValue];
}

- (CGFloat)floatSettingForKey:(NSString*)key withDefault:(CGFloat)value
{
    id val = (NSNumber*)[self settingForKey:key];
    if (val == nil) {
        return value;
    }
    
#if CGFLOAT_IS_DOUBLE
    return [val doubleValue];
#else
    return [val floatValue];
#endif
}

- (id)settingForKey:(NSString*)key
{
    return [[self settings] objectForKey:[key lowercaseString]];
}

- (void)setSetting:(id)setting forKey:(NSString*)key
{
    [[self settings] setObject:setting forKey:[key lowercaseString]];
}

@end
