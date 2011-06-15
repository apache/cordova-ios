/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Created by Michael Nachbaur on 13/04/09.
 * Copyright (c) 2009 Decaf Ninja Software. All rights reserved.
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010, IBM Corporation
 *
 * DEPRECATED: Use PGPlugin instead, this will be removed in 1.0
 * add "__attribute__ ((unavailable))" when finally removed.
 */

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import "PluginResult.h"

@class PhoneGapDelegate;

__attribute__ ((deprecated)) @interface PhoneGapCommand : NSObject {
    UIWebView*    webView;
    NSDictionary* settings;
}
@property (nonatomic, retain) UIWebView *webView;
@property (nonatomic, retain) NSDictionary *settings;

-(PhoneGapCommand*) initWithWebView:(UIWebView*)theWebView settings:(NSDictionary*)classSettings;
-(PhoneGapCommand*) initWithWebView:(UIWebView*)theWebView;

-(void)onAppTerminate;

-(PhoneGapDelegate*) appDelegate;
-(UIViewController*) appViewController;

- (void) writeJavascript:(NSString*)javascript;
- (void) clearCaches;

@end
