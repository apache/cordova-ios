/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010, IBM Corporation
 */

#import <UIKit/UIKit.h>
#import "JSONKit.h"

@class PGViewController;

@interface PhoneGapDelegate : NSObject <UIApplicationDelegate, UIWebViewDelegate>
{
}

@property (nonatomic, readwrite, retain) IBOutlet UIWindow* window;
@property (nonatomic, readonly, retain) IBOutlet PGViewController* viewController;

- (void)applicationDidEnterBackground:(UIApplication *)application;
- (void)applicationWillEnterForeground:(UIApplication *)application;
- (void)applicationWillResignActive:(UIApplication *)application;
- (void)applicationWillTerminate:(UIApplication *)application;

@end

