/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010, IBM Corporation
 */

#import <UIKit/UIKit.h>
#import <CoreLocation/CoreLocation.h>

#import "Location.h"
#import "Sound.h"
#import "DebugConsole.h"
#import "Connection.h"

#import "PGURLProtocol.h"
#import "PGWhitelist.h"
#import "InvokedUrlCommand.h"
#import "PhoneGapDelegate.h"
#import "PGViewController.h"
#import "PGPlugin.h"

// class extension
@interface PhoneGapDelegate ()

// readwrite access for self

@property (nonatomic, readwrite, retain) IBOutlet PGViewController* viewController;

@end


@implementation PhoneGapDelegate

@synthesize window, viewController;

- (id) init
{
    self = [super init];
    if (self != nil) {
        // Turn on cookie support ( shared with our app only! )
        NSHTTPCookieStorage *cookieStorage = [NSHTTPCookieStorage sharedHTTPCookieStorage]; 
        [cookieStorage setCookieAcceptPolicy:NSHTTPCookieAcceptPolicyAlways];
        
        [PGURLProtocol registerPGHttpURLProtocol];
    }
    return self; 
}

/**
 * This is main kick off after the app inits, the views and Settings are setup here.
 */
- (BOOL) application:(UIApplication*)application didFinishLaunchingWithOptions:(NSDictionary*)launchOptions
{    
    CGRect screenBounds = [ [ UIScreen mainScreen ] bounds ];
    self.window = [ [ [ UIWindow alloc ] initWithFrame:screenBounds ] autorelease ];
    self.window.autoresizesSubviews = YES;
    
    CGRect viewBounds = [[UIScreen mainScreen] applicationFrame];
    viewBounds.origin = screenBounds.origin;
    self.viewController = [[[PGViewController alloc] init] autorelease];
    self.viewController.useSplashScreen = YES;
    self.viewController.view.bounds = viewBounds;
    
    // check whether the current orientation is supported: if it is, keep it, rather than forcing a rotation
    BOOL forceStartupRotation = YES;
    UIDeviceOrientation curDevOrientation = [[UIDevice currentDevice] orientation];

    if (UIDeviceOrientationUnknown == curDevOrientation) {
        // UIDevice isn't firing orientation notifications yet… go look at the status bar
        curDevOrientation = (UIDeviceOrientation)[[UIApplication sharedApplication] statusBarOrientation];
    }

    if (UIDeviceOrientationIsValidInterfaceOrientation(curDevOrientation)) {
        for (NSNumber *orient in self.viewController.supportedOrientations) {
            if ([orient intValue] == curDevOrientation) {
                forceStartupRotation = NO;
                break;
            }
        }
    } 
    
    if (forceStartupRotation) {
        NSLog(@"supportedOrientations: %@", self.viewController.supportedOrientations);
        // The first item in the supportedOrientations array is the start orientation (guaranteed to be at least Portrait)
        UIInterfaceOrientation newOrient = [[self.viewController.supportedOrientations objectAtIndex:0] intValue];
        NSLog(@"PhoneGapDelegate forcing status bar to: %d from: %d",newOrient,curDevOrientation);
        [[UIApplication sharedApplication] setStatusBarOrientation:newOrient];
    }
    
    [self.window addSubview:self.viewController.view];
    [self.window makeKeyAndVisible];
    
    return YES;
}

- (NSString*) appURLScheme
{
    NSString* URLScheme = nil;
    
    NSArray *URLTypes = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleURLTypes"];
    if(URLTypes != nil ) {
        NSDictionary* dict = [URLTypes objectAtIndex:0];
        if(dict != nil ) {
            NSArray* URLSchemes = [dict objectForKey:@"CFBundleURLSchemes"];
            if( URLSchemes != nil ) {    
                URLScheme = [URLSchemes objectAtIndex:0];
            }
        }
    }
    
    return URLScheme;
}

/*
 This method lets your application know that it is about to be terminated and purged from memory entirely
*/
- (void)applicationWillTerminate:(UIApplication *)application
{

    NSLog(@"applicationWillTerminate");
    
    // empty the tmp directory
    NSFileManager* fileMgr = [[NSFileManager alloc] init];
    NSError* err = nil;    

    // clear contents of NSTemporaryDirectory 
    NSString* tempDirectoryPath = NSTemporaryDirectory();
    NSDirectoryEnumerator* directoryEnumerator = [fileMgr enumeratorAtPath:tempDirectoryPath];    
    NSString* fileName = nil;
    BOOL result;
    
    while ((fileName = [directoryEnumerator nextObject])) {
        NSString* filePath = [tempDirectoryPath stringByAppendingPathComponent:fileName];
        result = [fileMgr removeItemAtPath:filePath error:&err];
        if (!result && err) {
            NSLog(@"Failed to delete: %@ (error: %@)", filePath, err);
        }
    }    
    [fileMgr release];
}

/*
 This method is called to let your application know that it is about to move from the active to inactive state.
 You should use this method to pause ongoing tasks, disable timer, ...
*/
- (void)applicationWillResignActive:(UIApplication *)application
{
    //NSLog(@"%@",@"applicationWillResignActive");
    [self.viewController.webView stringByEvaluatingJavaScriptFromString:@"PhoneGap.fireDocumentEvent('resign');"];
}

/*
 In iOS 4.0 and later, this method is called as part of the transition from the background to the inactive state. 
 You can use this method to undo many of the changes you made to your application upon entering the background.
 invariably followed by applicationDidBecomeActive
*/
- (void)applicationWillEnterForeground:(UIApplication *)application
{
    //NSLog(@"%@",@"applicationWillEnterForeground");
    [self.viewController.webView stringByEvaluatingJavaScriptFromString:@"PhoneGap.fireDocumentEvent('resume');"];
}

// This method is called to let your application know that it moved from the inactive to active state. 
- (void)applicationDidBecomeActive:(UIApplication *)application
{
    //NSLog(@"%@",@"applicationDidBecomeActive");
    [self.viewController.webView stringByEvaluatingJavaScriptFromString:@"PhoneGap.fireDocumentEvent('active');"];
}

/*
 In iOS 4.0 and later, this method is called instead of the applicationWillTerminate: method 
 when the user quits an application that supports background execution.
 */
- (void)applicationDidEnterBackground:(UIApplication *)application
{
    //NSLog(@"%@",@"applicationDidEnterBackground");
    [self.viewController.webView stringByEvaluatingJavaScriptFromString:@"PhoneGap.fireDocumentEvent('pause');"];
}


/*
 Determine the URL passed to this application.
 Described in http://iphonedevelopertips.com/cocoa/launching-your-own-application-via-a-custom-url-scheme.html
*/
- (BOOL)application:(UIApplication *)application handleOpenURL:(NSURL *)url
{
    if (!url) { 
        return NO; 
    }

    // Do something with the url here
    NSString* jsString = [NSString stringWithFormat:@"handleOpenURL(\"%@\");", url];
    [self.viewController.webView stringByEvaluatingJavaScriptFromString:jsString];
    
    [[NSNotificationCenter defaultCenter] postNotification:[NSNotification notificationWithName:PGPluginHandleOpenURLNotification object:url]];
    
    return YES;
}

- (void)dealloc
{
    [PluginResult releaseStatus];
    self.viewController = nil;
    self.window = nil;
    
    [super dealloc];
}

@end