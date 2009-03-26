//
//  Bonjour.h
//  PhoneGap
//
//  Created by Brant Vasilieff on 3/1/09.
//  Copyright 2009 __MyCompanyName__. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>


@interface Bonjour : NSObject
{
    NSString* __identifier;
}

+ (void)start:(NSString*)options forWebView:(UIWebView*)webView;
+ (void)stop:(NSString*)options forWebView:(UIWebView*)webView;

@end
