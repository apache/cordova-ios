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

#import <XCTest/XCTest.h>
#import <Cordova/CDV.h>
#import "AppDelegate.h"

@interface CDVPluginInitTests : XCTestCase
@property AppDelegate* appDelegate;
@property CDVViewController* viewController;
@end

@implementation CDVPluginInitTests

- (void)setUp
{
    [super setUp];

    // Stop tests on the first failed assertion. Having the test stop on the
    // first exception makes it much easier to identify the source of the error.
    // On iOS < 5 there is a bug in SenTestingKit where the exception is
    // uncaught and the app crashes upon a failed STAssert (oh well).
    // [self raiseAfterFailure];

    self.appDelegate = (AppDelegate*)[[UIApplication sharedApplication] delegate];
    [self.appDelegate createViewController];
    self.viewController = self.appDelegate.viewController;
}

- (void)tearDown
{
    // Enforce that the view controller is released between tests to ensure
    // tests don't affect each other.
    [self.appDelegate destroyViewController];
    [super tearDown];
}

- (id)pluginInstance:(NSString*)pluginName
{
    id ret = [self.viewController getCommandInstance:pluginName];

    XCTAssertNotNil(ret, @"Missing plugin %@", pluginName);
    return ret;
}

- (void)testSwiftVariablesInitialized
{
    CDVPlugin* swiftPlugin = [self pluginInstance:@"SwiftInit"];

    XCTAssertTrue([@"Successfully initialized" isEqualToString:[swiftPlugin performSelector:@selector(getInitString)]]);
}

// Unused, just to avoid a warning about the selector use above
- (NSString*)getInitString
{
    return nil;
}
@end
