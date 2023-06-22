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

#import "OneAppCDVTimer.h"

#pragma mark CDVTimerItem

@interface OneAppCDVTimerItem : NSObject

@property (nonatomic, strong) NSString* name;
@property (nonatomic, strong) NSDate* started;
@property (nonatomic, strong) NSDate* ended;

- (void)log;

@end

@implementation OneAppCDVTimerItem

- (void)log
{
    NSLog(@"[CDVTimer][%@] %fms", self.name, [self.ended timeIntervalSinceDate:self.started] * 1000.0);
}

@end

#pragma mark CDVTimer

@interface OneAppCDVTimer ()

@property (nonatomic, strong) NSMutableDictionary* items;

@end

@implementation OneAppCDVTimer

#pragma mark object methods

- (id)init
{
    if (self = [super init]) {
        self.items = [NSMutableDictionary dictionaryWithCapacity:6];
    }

    return self;
}

- (void)add:(NSString*)name
{
    if ([self.items objectForKey:[name lowercaseString]] == nil) {
        OneAppCDVTimerItem* item = [OneAppCDVTimerItem new];
        item.name = name;
        item.started = [NSDate new];
        [self.items setObject:item forKey:[name lowercaseString]];
    } else {
        NSLog(@"Timer called '%@' already exists.", name);
    }
}

- (void)remove:(NSString*)name
{
    OneAppCDVTimerItem* item = [self.items objectForKey:[name lowercaseString]];

    if (item != nil) {
        item.ended = [NSDate new];
        [item log];
        [self.items removeObjectForKey:[name lowercaseString]];
    } else {
        NSLog(@"Timer called '%@' does not exist.", name);
    }
}

- (void)removeAll
{
    [self.items removeAllObjects];
}

#pragma mark class methods

+ (void)start:(NSString*)name
{
    [[OneAppCDVTimer sharedInstance] add:name];
}

+ (void)stop:(NSString*)name
{
    [[OneAppCDVTimer sharedInstance] remove:name];
}

+ (void)clearAll
{
    [[OneAppCDVTimer sharedInstance] removeAll];
}

+ (OneAppCDVTimer*)sharedInstance
{
    static dispatch_once_t pred = 0;
    __strong static OneAppCDVTimer* _sharedObject = nil;

    dispatch_once(&pred, ^{
            _sharedObject = [[self alloc] init];
        });

    return _sharedObject;
}

@end
