//
//  Console.h
//  PhoneGap
//
//  Created by Michael Nachbaur on 14/03/09.
//  Copyright 2009 Decaf Ninja Software. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

@interface Console : NSObject {
}

+ (void)log:(NSString*)options forWebView:(UIWebView*)webView;
+ (void)alert:(NSString*)options forWebView:(UIWebView*)webView;
+ (void)activityStart:(NSString*)options forWebView:(UIWebView*)webView;
+ (void)activityStop:(NSString*)options forWebView:(UIWebView*)webView;

@end
