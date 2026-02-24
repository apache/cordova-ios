/**
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
#import "CDVURLSchemeHandler.h"

#import "CordovaApp-Swift.h"

@interface CDVURLSchemeHandler (Testing)
- (NSURL *)fileURLForRequestURL:(NSURL *)url;
@end

@interface CDVURLSchemeHandlerTest : XCTestCase

@property AppDelegate* appDelegate;
@property (nonatomic, strong) CDVViewController* viewController;

@end

@implementation CDVURLSchemeHandlerTest

- (void)setUp
{
    [super setUp];

    self.appDelegate = (AppDelegate*)[[UIApplication sharedApplication] delegate];
    [self.appDelegate createViewController];
    self.viewController = self.appDelegate.testViewController;
}

- (void)tearDown
{
    [self.appDelegate destroyViewController];
    [super tearDown];
}

- (void)testFileURLForRequestURL
{
    CDVURLSchemeHandler *handler = [[CDVURLSchemeHandler alloc] initWithViewController:self.viewController];
    NSURL *resDir = [[NSBundle mainBundle] URLForResource:self.viewController.webContentFolderName withExtension:nil];
    NSURL *result = nil;

    NSURL *appFileURL = [NSURL URLWithString:@"app://localhost/_app_file_/etc/hosts"];
    result = [handler fileURLForRequestURL:appFileURL];

    XCTAssertEqualObjects([result absoluteString], @"file:///etc/hosts");

    NSURL *resourceURL = [NSURL URLWithString:@"app://localhost/img/cordova.png"];
    result = [handler fileURLForRequestURL:resourceURL];

    NSString *expected = [NSString stringWithFormat:@"%@img/cordova.png", [resDir absoluteString]];
    XCTAssertEqualObjects([result absoluteString], expected);
}

@end
