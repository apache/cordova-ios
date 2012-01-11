//
//  PGViewController.h
//
//  Created by Jesse MacFadyen on 11-12-08.
//  Copyright 2011 Nitobi. All rights reserved.
//

#import "UIGapView.h"

#import "JSONKit.h"
#import "InvokedUrlCommand.h"

#import "PGWhitelist.h"


/* PGCommandDelegate */

@protocol PGCommandDelegate <NSObject>

- (id) getCommandInstance:(NSString*)pluginName;
- (BOOL) execute:(InvokedUrlCommand*)command;

@end

/* PGViewController */

@interface PGViewController : UIViewController<UIWebViewDelegate, PGCommandDelegate> {
	
}

@property (nonatomic, retain) IBOutlet UIGapView* webView;

@property (nonatomic, readonly, retain) NSMutableDictionary* pluginObjects;
@property (nonatomic, readonly, retain) NSDictionary* pluginsMap;
@property (nonatomic, readonly, retain) NSDictionary* settings;
@property (nonatomic, readonly, retain) PGWhitelist* whitelist; // readonly for public
@property (nonatomic, readonly, retain) NSArray* supportedOrientations;
@property (nonatomic, readonly, copy)   NSString* sessionKey;
@property (nonatomic, readonly, assign) BOOL loadFromString;

@property (nonatomic, readwrite, assign) BOOL useSplashScreen;
@property (nonatomic, readonly, retain) IBOutlet UIActivityIndicatorView* activityView;
@property (nonatomic, readonly, retain) UIImageView *imageView;
@property (nonatomic, readwrite, assign) id<PGCommandDelegate> commandDelegate;

+ (NSDictionary*) getBundlePlist:(NSString*)plistName;
+ (NSString*) wwwFolderName;
+ (NSString*) pathForResource:(NSString*)resourcepath;
+ (NSString*) phoneGapVersion;
+ (NSString*) applicationDocumentsDirectory;
- (NSString*) startPage;


- (void) createGapView;

- (int) executeQueuedCommands;
- (void) flushCommandQueue;

- (id) getCommandInstance:(NSString*)pluginName;
- (void) javascriptAlert:(NSString*)text;
- (BOOL) execute:(InvokedUrlCommand*)command;
- (NSString*) appURLScheme;
- (NSDictionary*) deviceProperties;

- (NSArray*) parseInterfaceOrientations:(NSArray*)orientations;

@end

/* Category */

@interface NSDictionary (LowercaseKeys)

- (NSDictionary*) dictionaryWithLowercaseKeys;

@end
