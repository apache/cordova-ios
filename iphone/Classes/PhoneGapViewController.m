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
    if (autoRotate == YES) {
        return YES;
    } else {
        if ([rotateOrientation isEqualToString:@"portrait"]) {
            return (interfaceOrientation == UIInterfaceOrientationPortrait ||
                    interfaceOrientation == UIInterfaceOrientationPortraitUpsideDown);
        } else if ([rotateOrientation isEqualToString:@"landscape"]) {
            return (interfaceOrientation == UIInterfaceOrientationLandscapeLeft ||
                    interfaceOrientation == UIInterfaceOrientationLandscapeRight);
        } else {
            return NO;
        }
    }
}

/**
 Called by UIKit when the device starts to rotate to a new orientation.  This fires the \c setOrientation
 method on the Orientation object in JavaScript.  Look at the JavaScript documentation for more information.
 */
- (void)willRotateToInterfaceOrientation: (UIInterfaceOrientation)toInterfaceOrientation duration: (NSTimeInterval)duration {
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
	[webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"navigator.orientation.setOrientation(%f);", i]];
}

- (void) setAutoRotate:(BOOL) shouldRotate {
    autoRotate = shouldRotate;
}

- (void) setRotateOrientation:(NSString*) orientation {
    rotateOrientation = orientation;
}

@end