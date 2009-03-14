//
//  Bonjour.m
//  PhoneGap
//
//  Created by Brant Vasilieff on 3/1/09.
//  Copyright 2009 __MyCompanyName__. All rights reserved.
//

#import "Bonjour.h"


@implementation Bonjour

+ (void)start:(NSString*)options forWebView:(UIWebView*)webView
{
}

+ (void)stop:(NSString*)options forWebView:(UIWebView*)webView
{
}

- (id)init
{
    if (self = [super init])
    {
        __identifier = nil;
    }
    return self;
}

- (void)dealloc
{
    [__identifier release];
    [super dealloc];
}

@end
