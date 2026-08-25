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
#import <Cordova/Cordova.h>
#import <objc/runtime.h>

// UIOpenURLContext and UISceneConnectionOptions cannot be instantiated normally
// (their initializers are NS_UNAVAILABLE), but neither class is subclassing-
// restricted. We subclass each, allocate a bare instance with the Objective-C
// runtime, and override only the readonly getters CDVSceneDelegate actually
// reads — the objects are used purely as method-override shells.

@interface CDVFakeOpenURLContext : UIOpenURLContext
@property (nonatomic, strong) NSURL *fakeURL;
+ (instancetype)contextWithURL:(NSURL *)url;
@end

@implementation CDVFakeOpenURLContext
+ (instancetype)contextWithURL:(NSURL *)url
{
    CDVFakeOpenURLContext *context = class_createInstance(self, 0);
    context.fakeURL = url;
    return context;
}
- (NSURL *)URL { return self.fakeURL; }
- (UISceneOpenURLOptions *)options { return nil; }
@end

@interface CDVFakeSceneConnectionOptions : UISceneConnectionOptions
@property (nonatomic, strong) NSSet<UIOpenURLContext *> *fakeURLContexts;
+ (instancetype)optionsWithURLContexts:(NSSet<UIOpenURLContext *> *)contexts;
@end

@implementation CDVFakeSceneConnectionOptions
+ (instancetype)optionsWithURLContexts:(NSSet<UIOpenURLContext *> *)contexts
{
    CDVFakeSceneConnectionOptions *options = class_createInstance(self, 0);
    options.fakeURLContexts = contexts;
    return options;
}
- (NSSet<UIOpenURLContext *> *)URLContexts { return self.fakeURLContexts; }
@end

#pragma mark -

@interface CDVSceneDelegateTests : XCTestCase
@property (nonatomic, strong) CDVSceneDelegate *sceneDelegate;
@property (nonatomic, strong) UIScene *placeholderScene;
@property (nonatomic, strong) UISceneSession *placeholderSession;
@end

@implementation CDVSceneDelegateTests

- (void)setUp
{
    [super setUp];
    self.sceneDelegate = [[CDVSceneDelegate alloc] init];

    // The scene object is only stored and passed back through; it is never
    // messaged, so any non-nil placeholder cast to UIScene * is sufficient.
    self.placeholderScene = (UIScene *)[NSObject new];

    // You can't construct a UISceneSession directly, but you can workaround
    // that by indirectly sending +alloc to the class instance
    self.placeholderSession = [[[UISceneSession class] alloc] init];
}

- (void)tearDown
{
    // Ensure no pending launch-URL observer leaks into the next test.
    [self.sceneDelegate sceneDidDisconnect:self.placeholderScene];
    self.sceneDelegate = nil;
    self.placeholderScene = nil;
    self.placeholderSession = nil;
    [super tearDown];
}

- (CDVFakeSceneConnectionOptions *)connectionOptionsForURL:(NSURL *)url
{
    CDVFakeOpenURLContext *context = [CDVFakeOpenURLContext contextWithURL:url];
    return [CDVFakeSceneConnectionOptions optionsWithURLContexts:[NSSet setWithObject:context]];
}

// A cold-launch URL must NOT be posted during scene connection, because
// CDVHandleOpenURL has not registered its observer yet (issue #1671). It must be
// buffered and only replayed once the page has loaded.
- (void)testColdLaunchURLIsBufferedUntilPageDidLoad
{
    NSURL *launchURL = [NSURL URLWithString:@"testscheme://path?foo=bar"];

    XCTNSNotificationExpectation *notFiredYet = [[XCTNSNotificationExpectation alloc]
        initWithName:CDVPluginHandleOpenURLNotification];
    notFiredYet.inverted = YES;

    [self.sceneDelegate scene:self.placeholderScene
          willConnectToSession:self.placeholderSession
                       options:[self connectionOptionsForURL:launchURL]];

    // Before the page loads, the open-URL notification must not have fired.
    [self waitForExpectations:@[notFiredYet] timeout:0.3];
}

// Once CDVPageDidLoadNotification fires (the plugin observer now exists), the
// buffered launch URL must be replayed as CDVPluginHandleOpenURLNotification.
- (void)testColdLaunchURLIsReplayedAfterPageDidLoad
{
    NSURL *launchURL = [NSURL URLWithString:@"testscheme://path?foo=bar"];

    [self.sceneDelegate scene:self.placeholderScene
          willConnectToSession:self.placeholderSession
                       options:[self connectionOptionsForURL:launchURL]];

    XCTNSNotificationExpectation *openURLFired = [[XCTNSNotificationExpectation alloc]
        initWithName:CDVPluginHandleOpenURLNotification];
    openURLFired.handler = ^BOOL(NSNotification *notification) {
        return [notification.object isEqual:launchURL];
    };

    [[NSNotificationCenter defaultCenter] postNotificationName:CDVPageDidLoadNotification object:nil];

    [self waitForExpectations:@[openURLFired] timeout:1.0];
}

// A launch with no URL contexts must never post an open-URL notification, even
// after a page load (nothing to deliver).
- (void)testLaunchWithoutURLDoesNotPostOpenURL
{
    CDVFakeSceneConnectionOptions *options = [CDVFakeSceneConnectionOptions optionsWithURLContexts:[NSSet set]];

    [self.sceneDelegate scene:self.placeholderScene
          willConnectToSession:self.placeholderSession
                       options:options];

    XCTNSNotificationExpectation *notFired = [[XCTNSNotificationExpectation alloc]
        initWithName:CDVPluginHandleOpenURLNotification];
    notFired.inverted = YES;

    [[NSNotificationCenter defaultCenter] postNotificationName:CDVPageDidLoadNotification object:nil];

    [self waitForExpectations:@[notFired] timeout:0.3];
}

// If the scene disconnects before the page loads, the pending observer must be
// torn down so a later page-load cannot replay a URL for a defunct scene.
- (void)testSceneDisconnectBeforePageLoadCancelsPendingURL
{
    NSURL *launchURL = [NSURL URLWithString:@"testscheme://path?foo=bar"];

    [self.sceneDelegate scene:self.placeholderScene
          willConnectToSession:self.placeholderSession
                       options:[self connectionOptionsForURL:launchURL]];

    [self.sceneDelegate sceneDidDisconnect:self.placeholderScene];

    XCTNSNotificationExpectation *notFired = [[XCTNSNotificationExpectation alloc]
        initWithName:CDVPluginHandleOpenURLNotification];
    notFired.inverted = YES;

    [[NSNotificationCenter defaultCenter] postNotificationName:CDVPageDidLoadNotification object:nil];

    [self waitForExpectations:@[notFired] timeout:0.3];
}

// The warm path (app already running) posts immediately and is unaffected by the
// cold-launch buffering.
- (void)testWarmOpenURLContextsPostsImmediately
{
    NSURL *warmURL = [NSURL URLWithString:@"testscheme://warm"];

    CDVFakeOpenURLContext *context = [CDVFakeOpenURLContext contextWithURL:warmURL];

    XCTNSNotificationExpectation *openURLFired = [[XCTNSNotificationExpectation alloc]
        initWithName:CDVPluginHandleOpenURLNotification];
    openURLFired.handler = ^BOOL(NSNotification *notification) {
        return [notification.object isEqual:warmURL];
    };

    [self.sceneDelegate scene:self.placeholderScene openURLContexts:[NSSet setWithObject:context]];

    [self waitForExpectations:@[openURLFired] timeout:1.0];
}

@end
