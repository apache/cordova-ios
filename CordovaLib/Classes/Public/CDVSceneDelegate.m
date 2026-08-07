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

#import <Cordova/CDVSceneDelegate.h>
#import <Cordova/CDVPluginNotifications.h>

@interface CDVSceneDelegate ()

// URL contexts captured on a cold launch, held until the page loads so that
// CDVHandleOpenURL has registered its observer before we post the notification.
@property (nonatomic, strong, nullable) NSSet<UIOpenURLContext *> *launchURLContexts;
@property (nonatomic, weak, nullable) UIScene *launchScene;

@end

@implementation CDVSceneDelegate

- (void)scene:(UIScene *)scene willConnectToSession:(UISceneSession *)session options:(UISceneConnectionOptions *)connectionOptions
{
    // If the app was launched from a URL, that should also fire the CDVPluginHandleOpenURLNotification.
    //
    // On a cold launch this runs during scene connection, which is *before*
    // CDVHandleOpenURL registers its observer in -pluginInitialize. Posting the
    // notification now would deliver it to no observer and the URL would be lost
    // (see https://github.com/apache/cordova-ios/issues/1671). Buffer the URL
    // contexts and replay them once the page has loaded, by which time the
    // plugin observer exists.
    if (connectionOptions.URLContexts.count > 0) {
        self.launchScene = scene;
        self.launchURLContexts = connectionOptions.URLContexts;
        [[NSNotificationCenter defaultCenter] addObserver:self
                                                 selector:@selector(pageDidLoad:)
                                                     name:CDVPageDidLoadNotification
                                                   object:nil];
    }
}

- (void)pageDidLoad:(NSNotification *)notification
{
    [[NSNotificationCenter defaultCenter] removeObserver:self name:CDVPageDidLoadNotification object:nil];

    UIScene *scene = self.launchScene;
    NSSet<UIOpenURLContext *> *contexts = self.launchURLContexts;
    self.launchScene = nil;
    self.launchURLContexts = nil;

    if (scene != nil && contexts != nil) {
        [self scene:scene openURLContexts:contexts];
    }
}

- (void)sceneDidDisconnect:(UIScene *)scene
{
    // If the scene disconnects before the page loaded, tear down the pending
    // launch-URL observer so it cannot fire for a defunct scene.
    if (self.launchURLContexts != nil) {
        [[NSNotificationCenter defaultCenter] removeObserver:self name:CDVPageDidLoadNotification object:nil];
        self.launchScene = nil;
        self.launchURLContexts = nil;
    }
}

- (void)scene:(UIScene *)scene openURLContexts:(NSSet<UIOpenURLContext *> *)URLContexts
{
    for (UIOpenURLContext *context in URLContexts) {
        NSMutableDictionary *options = [[NSMutableDictionary alloc] init];
        [options setValue:context.options.sourceApplication forKey:@"sourceApplication"];
        [options setValue:context.options.annotation forKey:@"annotation"];
        [options setValue:@(context.options.openInPlace) forKey:@"openInPlace"];

#if __IPHONE_OS_VERSION_MAX_ALLOWED >= 140500
        if (@available(iOS 14.5, *)) {
            [options setValue:context.options.eventAttribution forKey:@"eventAttribution"];
        }
#endif

        [[NSNotificationCenter defaultCenter] postNotificationName:CDVPluginHandleOpenURLNotification object:context.URL userInfo:options];

    }
}

- (void)scene:(UIScene *)scene continueUserActivity:(NSUserActivity *)userActivity
{
    [[NSNotificationCenter defaultCenter] postNotificationName:CDVPluginContinueUserActivityNotification object:userActivity];
}

@end
