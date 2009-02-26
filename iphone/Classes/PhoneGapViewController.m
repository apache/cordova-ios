//
//  PhoneGapViewController.m
//  PhoneGap
//
//  Created by Nitobi on 15/12/08.
//  Copyright 2008 Nitobi. All rights reserved.
//

#import "PhoneGapViewController.h"
#import "PhoneGapDelegate.h" 

@implementation PhoneGapViewController


- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation) interfaceOrientation 
{ 
    return YES; 
}


- (void)willRotateToInterfaceOrientation: (UIInterfaceOrientation)toInterfaceOrientation duration: (NSTimeInterval)duration {
	NSString * jsCallBack = nil;
	NSLog(@"IN Rotate");
	double i = 0;
	
	switch (toInterfaceOrientation){
		case UIInterfaceOrientationPortrait:
			i = 0;
			break;
		case UIInterfaceOrientationPortraitUpsideDown:
			i = 180;
			break;
		case UIInterfaceOrientationLandscapeLeft:
			i = 90;
			break;
		case UIInterfaceOrientationLandscapeRight:
			i = -90;
			break;
	}

	jsCallBack = [[NSString alloc] initWithFormat:@"var _orientation=%f;", i];
	[webView stringByEvaluatingJavaScriptFromString:jsCallBack];
	
	[jsCallBack release];
	
}

@end