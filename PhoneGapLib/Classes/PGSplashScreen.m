/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 */


#import "PGSplashScreen.h"
#import "PhoneGapDelegate.h"

@implementation PGSplashScreen


- (void) __show:(BOOL)show
{
	PhoneGapDelegate* delegate = [super appDelegate];
	if (!delegate.imageView) {
		return;
	}
	
	delegate.imageView.hidden = !show;
	delegate.activityView.hidden = !show;
}

- (void) show:(NSArray*)arguments withDict:(NSMutableDictionary*)options
{
	[self __show:YES];
}

- (void) hide:(NSArray*)arguments withDict:(NSMutableDictionary*)options
{
	[self __show:NO];
}

@end
