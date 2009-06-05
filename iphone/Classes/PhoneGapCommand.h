//
//  PhoneGapCommand.h
//  PhoneGap
//
//  Created by Michael Nachbaur on 13/04/09.
//  Copyright 2009 Decaf Ninja Software. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

@class PhoneGapDelegate;

@interface PhoneGapCommand : NSObject {
    UIWebView*    webView;
    NSDictionary* settings;
}
@property (nonatomic, retain) UIWebView *webView;
@property (nonatomic, retain) NSDictionary *settings;

-(PhoneGapCommand*) initWithWebView:(UIWebView*)theWebView settings:(NSDictionary*)classSettings;
-(PhoneGapCommand*) initWithWebView:(UIWebView*)theWebView;

-(PhoneGapDelegate*) appDelegate;
-(UIViewController*) appViewController;

@end
