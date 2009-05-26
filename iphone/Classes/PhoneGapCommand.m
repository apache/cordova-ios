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
@synthesize viewController;

-(PhoneGapCommand*) initWithWebView:(UIWebView*)theWebView settings:(NSDictionary*)classSettings andViewController:(UIViewController*)theViewController
{
    self = [super init];
    if (self) {
		[self setWebView:theWebView];
        [self setSettings:classSettings];
		[self setViewController:theViewController];
	}
    return self;
}

- (void)dealloc
{
    if (self.settings)
        [self.settings release];
    [super dealloc];
}

@end
