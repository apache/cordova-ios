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


- (void)willRotateToInterfaceOrientation: (UIInterfaceOrientation)toInterfaceOrientation duration: (NSTimeInterval)duration {
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

	NSString *jsCallBack = [[NSString alloc] initWithFormat:@"Device.Orientation=%f;", i];
	[webView stringByEvaluatingJavaScriptFromString:jsCallBack];
	[jsCallBack release];
}

- (void) setAutoRotate:(BOOL) shouldRotate {
    autoRotate = shouldRotate;
}

- (void) setRotateOrientation:(NSString*) orientation {
    rotateOrientation = orientation;
}

@end