/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010, IBM Corporation
 */

#import <UIKit/UIKit.h>
#import <CoreLocation/CoreLocation.h>
#import <UIKit/UINavigationController.h>
#import "JSON.h"

#import "Location.h"
#import "Sound.h"


#import "DebugConsole.h"


@class InvokedUrlCommand;
@class PhoneGapViewController;
@class Sound;
@class Contacts;
@class Console;


@interface PhoneGapDelegate : NSObject <UIApplicationDelegate, UIWebViewDelegate>
{
}

@property (nonatomic, retain) IBOutlet UIWindow *window;
@property (nonatomic, retain) IBOutlet UIWebView *webView;
@property (nonatomic, retain) IBOutlet PhoneGapViewController *viewController;
@property (nonatomic, retain) IBOutlet UIActivityIndicatorView *activityView;
@property (nonatomic, retain) UIImageView *imageView;
@property (nonatomic, retain) NSMutableDictionary *pluginObjects;
@property (nonatomic, retain) NSDictionary *pluginsMap;
@property (nonatomic, retain) NSDictionary *settings;
@property (nonatomic, retain) NSURL *invokedURL;
@property (assign) BOOL loadFromString;
@property (assign) UIInterfaceOrientation orientationType;
@property (nonatomic, retain) NSString *sessionKey;

+ (NSDictionary*)getBundlePlist:(NSString *)plistName;
+ (NSString*) wwwFolderName;
+ (NSString*) pathForResource:(NSString*)resourcepath;
+ (NSString*) phoneGapVersion;
+ (NSString*) applicationDocumentsDirectory;
+ (NSString*) startPage;


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

