//
//  UIControls.h
//  PhoneGap
//
//  Created by Michael Nachbaur on 13/04/09.
//  Copyright 2009 Decaf Ninja Software. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

@interface UIControls : NSObject {
}

+ (void)alert:(NSString*)options forWebView:(UIWebView*)webView;
+ (void)activityStart:(NSString*)options forWebView:(UIWebView*)webView;
+ (void)activityStop:(NSString*)options forWebView:(UIWebView*)webView;

@end
