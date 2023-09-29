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

#import <Cordova/CDVAppDelegate.h>

@implementation CDVAppDelegate

@synthesize window, viewController;

- (BOOL)application:(UIApplication *)application willFinishLaunchingWithOptions:(NSDictionary<UIApplicationLaunchOptionsKey, id> *)launchOptions
{
#if DEBUG
    NSLog(@"Apache Cordova iOS platform version %@ is starting.", CDV_VERSION);
#endif

    return YES;
}

/**
 * This is main kick off after the app inits, the views and Settings are setup here. (preferred - iOS4 and up)
 */
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary<UIApplicationLaunchOptionsKey, id> *)launchOptions
{
    CGRect screenBounds = [[UIScreen mainScreen] bounds];

    self.window = [[UIWindow alloc] initWithFrame:screenBounds];
    self.window.autoresizesSubviews = YES;

    // only set if not already set in subclass
    if (self.viewController == nil) {
        self.viewController = [[CDVViewController alloc] init];
    }

    // Set your app's start page by setting the <content src='foo.html' /> tag in config.xml.
    // If necessary, uncomment the line below to override it.
    // self.viewController.startPage = @"index.html";

    // NOTE: To customize the view's frame size (which defaults to full screen), override
    // [self.viewController viewWillAppear:] in your view controller.

    self.window.rootViewController = self.viewController;
    [self.window makeKeyAndVisible];

    return YES;
}

// this happens while we are running ( in the background, or from within our own app )
// only valid if Info.plist specifies a protocol to handle
- (BOOL)application:(UIApplication *)app openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey, id> *)options
{
    if (!url) {
        return NO;
    }

    NSMutableDictionary * openURLData = [[NSMutableDictionary alloc] init];

    [openURLData setValue:url forKey:@"url"];

    if (options[UIApplicationOpenURLOptionsSourceApplicationKey]) {
        [openURLData setValue:options[UIApplicationOpenURLOptionsSourceApplicationKey] forKey:@"sourceApplication"];
    }

    if (options[UIApplicationOpenURLOptionsAnnotationKey]) {
        [openURLData setValue:options[UIApplicationOpenURLOptionsAnnotationKey] forKey:@"annotation"];
    }

    // all plugins will get the notification, and their handlers will be called
    [[NSNotificationCenter defaultCenter] postNotification:[NSNotification notificationWithName:CDVPluginHandleOpenURLNotification object:url]];
    [[NSNotificationCenter defaultCenter] postNotification:[NSNotification notificationWithName:CDVPluginHandleOpenURLWithAppSourceAndAnnotationNotification object:openURLData]];

    return YES;
}

@end
