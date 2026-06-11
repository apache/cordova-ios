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

#import <UIKit/UIKit.h>
#import <XCTest/XCTest.h>
#import <Cordova/Cordova.h>
#import "CDVWebViewEngine.h"
#import "CordovaApp-Swift.h"
#import "CDVTestHelpers.h"

@interface CDVStatusBarTests : XCTestCase

@property AppDelegate* appDelegate;
@property (nonatomic, strong) CDVWebViewEngine* plugin;
@property (nonatomic, strong) CDVViewController* viewController;

@end

@implementation CDVStatusBarTests

- (void)setUp {
    [super setUp];

    self.appDelegate = (AppDelegate*)[[UIApplication sharedApplication] delegate];
    [self.appDelegate createViewController];
    self.viewController = self.appDelegate.testViewController;

    self.plugin = (CDVWebViewEngine *)self.viewController.webViewEngine;
}

- (void)tearDown {
    [self.appDelegate destroyViewController];
    [super tearDown];
}

- (void) testStatusBarBackgroundColorNamedColor {
    CGFloat rgba[4] = {0.f, 0.f, 0.f, 0.f};

    [self.viewController loadStartPage];

    XCTestExpectation *loadExpectation = [[XCTNSNotificationExpectation alloc] initWithName:CDVTestingDeviceReadyFired];
    [self waitForExpectations:@[loadExpectation] timeout:5];

    __block XCTestExpectation *redExpectation = [self expectationWithDescription:@"red"];
    [self.plugin evaluateJavaScript:@"window.statusbar.setBackgroundColor('red');" completionHandler:^(id _, NSError* error) {
        XCTAssertNil(error);
        [redExpectation fulfill];
    }];
    [self waitForExpectations:@[redExpectation] timeout:5];

    [self.viewController.statusBarBackgroundColor getRed:&rgba[0] green:&rgba[1] blue:&rgba[2] alpha:&rgba[3]];
    XCTAssertEqual(rgba[0], 1.f);
    XCTAssertEqual(rgba[1], 0.f);
    XCTAssertEqual(rgba[2], 0.f);
    XCTAssertEqual(rgba[3], 1.f);
}

- (void) testStatusBarBackgroundColor3HexColor {
    CGFloat rgba[4] = {0.f, 0.f, 0.f, 0.f};

    [self.viewController loadStartPage];

    XCTestExpectation *loadExpectation = [[XCTNSNotificationExpectation alloc] initWithName:CDVTestingDeviceReadyFired];
    [self waitForExpectations:@[loadExpectation] timeout:5];

    __block XCTestExpectation *redExpectation = [self expectationWithDescription:@"red"];
    [self.plugin evaluateJavaScript:@"window.statusbar.setBackgroundColor('#f00');" completionHandler:^(id _, NSError* error) {
        XCTAssertNil(error);
        [redExpectation fulfill];
    }];
    [self waitForExpectations:@[redExpectation] timeout:5];

    [self.viewController.statusBarBackgroundColor getRed:&rgba[0] green:&rgba[1] blue:&rgba[2] alpha:&rgba[3]];
    XCTAssertEqual(rgba[0], 1.f);
    XCTAssertEqual(rgba[1], 0.f);
    XCTAssertEqual(rgba[2], 0.f);
    XCTAssertEqual(rgba[3], 1.f);
}

- (void) testStatusBarBackgroundColor6HexColor {
    CGFloat rgba[4] = {0.f, 0.f, 0.f, 0.f};

    [self.viewController loadStartPage];

    XCTestExpectation *loadExpectation = [[XCTNSNotificationExpectation alloc] initWithName:CDVTestingDeviceReadyFired];
    [self waitForExpectations:@[loadExpectation] timeout:5];

    __block XCTestExpectation *redExpectation = [self expectationWithDescription:@"red"];
    [self.plugin evaluateJavaScript:@"window.statusbar.setBackgroundColor('#ff0000');" completionHandler:^(id _, NSError* error) {
        XCTAssertNil(error);
        [redExpectation fulfill];
    }];
    [self waitForExpectations:@[redExpectation] timeout:5];

    [self.viewController.statusBarBackgroundColor getRed:&rgba[0] green:&rgba[1] blue:&rgba[2] alpha:&rgba[3]];
    XCTAssertEqual(rgba[0], 1.f);
    XCTAssertEqual(rgba[1], 0.f);
    XCTAssertEqual(rgba[2], 0.f);
    XCTAssertEqual(rgba[3], 1.f);
}

- (void) testStatusBarBackgroundColor8HexColor {
    CGFloat rgba[4] = {0.f, 0.f, 0.f, 0.f};

    [self.viewController loadStartPage];

    XCTestExpectation *loadExpectation = [[XCTNSNotificationExpectation alloc] initWithName:CDVTestingDeviceReadyFired];
    [self waitForExpectations:@[loadExpectation] timeout:5];

    __block XCTestExpectation *redExpectation = [self expectationWithDescription:@"red"];
    [self.plugin evaluateJavaScript:@"window.statusbar.setBackgroundColor('#ff000080');" completionHandler:^(id _, NSError* error) {
        XCTAssertNil(error);
        [redExpectation fulfill];
    }];
    [self waitForExpectations:@[redExpectation] timeout:5];

    [self.viewController.statusBarBackgroundColor getRed:&rgba[0] green:&rgba[1] blue:&rgba[2] alpha:&rgba[3]];
    XCTAssertEqual(rgba[0], 1.f);
    XCTAssertEqual(rgba[1], 0.f);
    XCTAssertEqual(rgba[2], 0.f);
    XCTAssertEqual(rgba[3], 0.5f);
}

- (void) testStatusBarBackgroundColorRGB {
    CGFloat rgba[4] = {0.f, 0.f, 0.f, 0.f};

    [self.viewController loadStartPage];

    XCTestExpectation *loadExpectation = [[XCTNSNotificationExpectation alloc] initWithName:CDVTestingDeviceReadyFired];
    [self waitForExpectations:@[loadExpectation] timeout:5];

    __block XCTestExpectation *redExpectation = [self expectationWithDescription:@"red"];
    [self.plugin evaluateJavaScript:@"window.statusbar.setBackgroundColor('rgb(255, 0, 0)');" completionHandler:^(id _, NSError* error) {
        XCTAssertNil(error);
        [redExpectation fulfill];
    }];
    [self waitForExpectations:@[redExpectation] timeout:5];

    [self.viewController.statusBarBackgroundColor getRed:&rgba[0] green:&rgba[1] blue:&rgba[2] alpha:&rgba[3]];
    XCTAssertEqual(rgba[0], 1.f);
    XCTAssertEqual(rgba[1], 0.f);
    XCTAssertEqual(rgba[2], 0.f);
    XCTAssertEqual(rgba[3], 1.f);
}

- (void) testStatusBarBackgroundColorRGBA {
    CGFloat rgba[4] = {0.f, 0.f, 0.f, 0.f};

    [self.viewController loadStartPage];

    XCTestExpectation *loadExpectation = [[XCTNSNotificationExpectation alloc] initWithName:CDVTestingDeviceReadyFired];
    [self waitForExpectations:@[loadExpectation] timeout:5];

    __block XCTestExpectation *redExpectation = [self expectationWithDescription:@"red"];
    [self.plugin evaluateJavaScript:@"window.statusbar.setBackgroundColor('rgba(255, 0, 0, 0.25)');" completionHandler:^(id _, NSError* error) {
        XCTAssertNil(error);
        [redExpectation fulfill];
    }];
    [self waitForExpectations:@[redExpectation] timeout:5];

    [self.viewController.statusBarBackgroundColor getRed:&rgba[0] green:&rgba[1] blue:&rgba[2] alpha:&rgba[3]];
    XCTAssertEqual(rgba[0], 1.f);
    XCTAssertEqual(rgba[1], 0.f);
    XCTAssertEqual(rgba[2], 0.f);
    XCTAssertEqual(rgba[3], 0.25f);
}

@end
