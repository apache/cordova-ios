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
#import <Cordova/CDVCommandDelegate.h>
#import <Cordova/CDVSettingsDictionary.h>
#import "CDVURLSchemeHandler.h"

#import "CordovaApp-Swift.h"

@interface CDVURLSchemeHandler (Testing)
- (NSURL *)fileURLForRequestURL:(NSURL *)url;
@end

@interface CDVTestCommandDelegate : NSObject <CDVCommandDelegate>

@property (nonatomic, strong) CDVSettingsDictionary* settings;
@property (nonatomic, copy) void (^pendingBlock)(void);

- (void)runPendingBlock;

@end

@implementation CDVTestCommandDelegate

- (instancetype)init
{
    self = [super init];
    if (self != nil) {
        _settings = [[CDVSettingsDictionary alloc] init];
    }
    return self;
}

- (NSString *)pathForResource:(NSString *)resourcepath
{
    return resourcepath;
}

- (nullable CDVPlugin *)getCommandInstance:(NSString *)pluginName
{
    return nil;
}

- (void)sendPluginResult:(CDVPluginResult *)result callbackId:(NSString *)callbackId
{
}

- (void)evalJs:(NSString *)js
{
}

- (void)evalJs:(NSString *)js scheduledOnRunLoop:(BOOL)scheduledOnRunLoop
{
}

- (void)runInBackground:(void (^)(void))block
{
    self.pendingBlock = block;
}

- (void)runPendingBlock
{
    void (^block)(void) = self.pendingBlock;
    self.pendingBlock = nil;
    if (block != nil) {
        block();
    }
}

@end

@interface CDVTestURLSchemeTask : NSObject <WKURLSchemeTask>

@property (nonatomic, strong) NSURLRequest* request;
@property (nonatomic, strong) NSMutableArray<NSData *>* receivedData;
@property (nonatomic, strong, nullable) NSURLResponse* response;
@property (nonatomic, strong, nullable) NSError* error;
@property (nonatomic) NSUInteger responseCount;
@property (nonatomic) NSUInteger finishedCount;
@property (nonatomic) NSUInteger failedCount;

- (instancetype)initWithURL:(NSURL *)url;

@end

@implementation CDVTestURLSchemeTask

- (instancetype)initWithURL:(NSURL *)url
{
    self = [super init];
    if (self != nil) {
        _request = [NSURLRequest requestWithURL:url];
        _receivedData = [NSMutableArray array];
    }
    return self;
}

- (void)didReceiveResponse:(NSURLResponse *)response
{
    self.response = response;
    self.responseCount += 1;
}

- (void)didReceiveData:(NSData *)data
{
    [self.receivedData addObject:data];
}

- (void)didFinish
{
    self.finishedCount += 1;
}

- (void)didFailWithError:(NSError *)error
{
    self.error = error;
    self.failedCount += 1;
}

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

- (void)testStartURLSchemeTaskSendsResponseBeforeBackgroundWork
{
    CDVTestCommandDelegate *commandDelegate = [[CDVTestCommandDelegate alloc] init];
    [self.viewController setValue:commandDelegate forKey:@"commandDelegate"];

    CDVURLSchemeHandler *handler = [[CDVURLSchemeHandler alloc] initWithViewController:self.viewController];
    CDVTestURLSchemeTask *task = [[CDVTestURLSchemeTask alloc] initWithURL:[NSURL URLWithString:@"app://localhost/index.html"]];

    [handler webView:nil startURLSchemeTask:task];

    XCTAssertEqual(task.responseCount, 1u);
    XCTAssertNotNil(task.response);
    XCTAssertEqual(task.failedCount, 0u);
    XCTAssertEqual(task.finishedCount, 0u);
    XCTAssertNotNil(commandDelegate.pendingBlock);
}

- (void)testStopURLSchemeTaskDoesNotFinishStoppedTask
{
    CDVTestCommandDelegate *commandDelegate = [[CDVTestCommandDelegate alloc] init];
    [self.viewController setValue:commandDelegate forKey:@"commandDelegate"];

    CDVURLSchemeHandler *handler = [[CDVURLSchemeHandler alloc] initWithViewController:self.viewController];
    CDVTestURLSchemeTask *task = [[CDVTestURLSchemeTask alloc] initWithURL:[NSURL URLWithString:@"app://localhost/index.html"]];

    [handler webView:nil startURLSchemeTask:task];
    [handler webView:nil stopURLSchemeTask:task];

    XCTAssertEqual(task.responseCount, 1u);
    XCTAssertEqual(task.finishedCount, 0u);
    XCTAssertEqual(task.failedCount, 0u);

    [commandDelegate runPendingBlock];

    XCTAssertEqual(task.finishedCount, 0u);
    XCTAssertEqual(task.failedCount, 0u);
}

- (void)testMissingFileFailsBeforeBackgroundWork
{
    CDVTestCommandDelegate *commandDelegate = [[CDVTestCommandDelegate alloc] init];
    [self.viewController setValue:commandDelegate forKey:@"commandDelegate"];

    CDVURLSchemeHandler *handler = [[CDVURLSchemeHandler alloc] initWithViewController:self.viewController];
    CDVTestURLSchemeTask *task = [[CDVTestURLSchemeTask alloc] initWithURL:[NSURL URLWithString:@"app://localhost/does-not-exist.html"]];

    [handler webView:nil startURLSchemeTask:task];

    XCTAssertEqual(task.responseCount, 0u);
    XCTAssertEqual(task.failedCount, 1u);
    XCTAssertNotNil(task.error);
    XCTAssertNil(commandDelegate.pendingBlock);
}

@end
