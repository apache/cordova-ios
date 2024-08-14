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

#import <Cordova/CDVSettingsDictionary.h>

@interface CDVSettingsDictionary () {
    NSDictionary *_dict;
}
@end

@implementation CDVSettingsDictionary

- (instancetype)init
{
    return [self initWithDictionary:@{}];
}

- (instancetype)initWithDictionary:(NSDictionary *)dict
{
    self = [super init];
    if (self != nil) {
        _dict = dict;
    }
    return self;
}

- (id)forwardingTargetForSelector:(SEL)selector
{
    return _dict;
}

- (NSUInteger)count
{
    return _dict.count;
}

- (id)objectForKey:(NSString *)key
{
    return [_dict objectForKey:key];
}

- (NSEnumerator *)keyEnumerator
{
    return [_dict keyEnumerator];
}

- (id)cordovaSettingForKey:(NSString *)key
{
    return [_dict objectForKey:[key lowercaseString]];
}

- (BOOL)cordovaBoolSettingForKey:(NSString *)key defaultValue:(BOOL)defaultValue
{
    BOOL value = defaultValue;

    id prefObj = [self cordovaSettingForKey:key];
    if (prefObj == nil) {
        NSLog(@"The preference key \"%@\" is not defined and will default to \"%@\"", key, (defaultValue ? @"TRUE" : @"FALSE"));
        return value;
    }

    if ([prefObj isKindOfClass:NSString.class]) {
        prefObj = [prefObj lowercaseString];

        if ([prefObj isEqualToString:@"true"] || [prefObj isEqualToString:@"1"]) {
            return YES;
        } else if ([prefObj isEqualToString:@"false"] || [prefObj isEqualToString:@"0"]) {
            return NO;
        }
    } else if ([prefObj isKindOfClass:NSNumber.class] && ([prefObj isEqual:@YES] || [prefObj isEqual:@NO])) {
        return [prefObj isEqual: @YES];
    }

    return value;
}

- (CGFloat)cordovaFloatSettingForKey:(NSString *)key defaultValue:(CGFloat)defaultValue
{
    CGFloat value = defaultValue;

    id prefObj = [self cordovaSettingForKey:key];
    if (prefObj != nil) {
        value = [prefObj floatValue];
    }

    return value;
}

@end
