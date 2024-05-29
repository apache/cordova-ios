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

#import "AppDelegate.h"

#import "ViewController.h"

@interface AppDelegate () {
    UIWindow *_window;
    CDVViewController *_viewController;
}
@end

@implementation AppDelegate

@synthesize testViewController = _viewController;

- (void)createViewController
{
    _viewController = [[ViewController alloc] init];
    _viewController.wwwFolderName = @"www";
    _viewController.startPage = @"index.html";

    // NOTE: To customize the view's frame size (which defaults to full screen), override
    // [self.viewController viewWillAppear:] in your view controller.

    self.window.rootViewController = _viewController;
}

- (void)destroyViewController
{
    _viewController = nil;
}

- (BOOL)application:(UIApplication*)application didFinishLaunchingWithOptions:(NSDictionary*)launchOptions
{
    BOOL retVal = [super application:application didFinishLaunchingWithOptions:launchOptions];
    // Create the main view on start-up only when not running unit tests.
    if (!NSClassFromString(@"CDVWebViewTest")) {
        [self createViewController];
    }

    return retVal;
}

@end
