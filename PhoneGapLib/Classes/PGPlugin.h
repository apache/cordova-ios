/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Created by Michael Nachbaur on 13/04/09.
 * Copyright (c) 2009 Decaf Ninja Software. All rights reserved.
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010, IBM Corporation
 */

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import "PluginResult.h"

#define PGPluginHandleOpenURLNotification	@"PGPluginHandleOpenURLNotification"

@class PhoneGapDelegate;

@interface PGPlugin : NSObject {
}

@property (nonatomic, retain) UIWebView *webView;
@property (nonatomic, retain) NSDictionary *settings;

- (PGPlugin*) initWithWebView:(UIWebView*)theWebView settings:(NSDictionary*)classSettings;
- (PGPlugin*) initWithWebView:(UIWebView*)theWebView;

- (void) handleOpenURL:(NSNotification*)notification;
- (void) onAppTerminate;
- (void) onMemoryWarning;

/*
 // see initWithWebView implementation
 - (void) onPause {}
 - (void) onResume {}
 - (void) onOrientationWillChange {}
 - (void) onOrientationDidChange {}
 */

- (PhoneGapDelegate*) appDelegate;
- (UIViewController*) appViewController;

- (NSString*) writeJavascript:(NSString*)javascript;

@end
