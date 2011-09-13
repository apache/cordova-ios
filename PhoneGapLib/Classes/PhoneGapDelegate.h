/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010, IBM Corporation
 */

#import <UIKit/UIKit.h>
#import "JSON.h"

@class InvokedUrlCommand;
@class PhoneGapViewController;
@class Sound;
@class Contacts;
@class Console;
@class PGWhitelist;

@interface PhoneGapDelegate : NSObject <UIApplicationDelegate, UIWebViewDelegate>
{
}

@property (nonatomic, readwrite, retain) IBOutlet UIWindow *window;
@property (nonatomic, readwrite, retain) IBOutlet UIWebView *webView;
@property (nonatomic, readonly, retain) IBOutlet PhoneGapViewController *viewController;
@property (nonatomic, readonly, retain) IBOutlet UIActivityIndicatorView *activityView;
@property (nonatomic, readonly, retain) UIImageView *imageView;
@property (nonatomic, readonly, retain) NSMutableDictionary *pluginObjects;
@property (nonatomic, readonly, retain) NSDictionary *pluginsMap;
@property (nonatomic, readonly, retain) NSDictionary *settings;
@property (nonatomic, readonly, retain) PGWhitelist* whitelist; // readonly for public

+ (NSDictionary*)getBundlePlist:(NSString *)plistName;
+ (NSString*) wwwFolderName;
+ (NSString*) pathForResource:(NSString*)resourcepath;
+ (NSString*) phoneGapVersion;
+ (NSString*) applicationDocumentsDirectory;
+ (NSString*) startPage;

- (int)executeQueuedCommands;
- (void)flushCommandQueue;

- (id) getCommandInstance:(NSString*)pluginName;
- (void) javascriptAlert:(NSString*)text;
- (BOOL) execute:(InvokedUrlCommand*)command;
- (NSString*) appURLScheme;
- (NSDictionary*) deviceProperties;

- (void)applicationDidEnterBackground:(UIApplication *)application;
- (void)applicationWillEnterForeground:(UIApplication *)application;
- (void)applicationWillResignActive:(UIApplication *)application;
- (void)applicationWillTerminate:(UIApplication *)application;

@end

@interface NSDictionary (LowercaseKeys)

- (NSDictionary*) dictionaryWithLowercaseKeys;

@end

