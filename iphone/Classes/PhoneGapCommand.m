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
@synthesize settings;

-(PhoneGapCommand*) initWithWebView:(UIWebView*)theWebView settings:(NSDictionary*)classSettings
{
    self = [self initWithWebView:theWebView];
    if (self)
        [self setSettings:classSettings];
    return self;
}

-(PhoneGapCommand*) initWithWebView:(UIWebView*)theWebView
{
    self = [super init];
    if (self)
        [self setWebView:theWebView];
    return self;
}

- (void)dealloc
{
    if (self.settings)
        [self.settings release];
    [super dealloc];
}

@end