/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 */


#import "PGSplashScreen.h"
#import "PGAppDelegate.h"
#import "PGViewController.h"

@implementation PGSplashScreen


- (void) __show:(BOOL)show
{
    PGViewController* vc = (PGViewController*)self.viewController;
	if (vc.imageView) {
		return;
	}
	
	vc.imageView.hidden = !show;
	vc.activityView.hidden = !show;
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
