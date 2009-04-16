//
//  PhoneGapCommand.m
//  PhoneGap
//
//  Created by Michael Nachbaur on 13/04/09.
//  Copyright 2009 Decaf Ninja Software. All rights reserved.
//

#import "PhoneGapCommand.h"

@implementation PhoneGapCommand
@synthesize webView;

-(PhoneGapCommand*) initWithWebView:(UIWebView*)theWebView
{
    NSLog(@"phonegap command initializing");
    self = [super init];
    if (self) {
        [self setWebView:theWebView];
    }
    return self;
}

-(void) setWebView:(UIWebView*) theWebView
{
    webView = theWebView;
}

@end
