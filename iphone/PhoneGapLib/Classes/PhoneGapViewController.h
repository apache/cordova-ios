//
//  PhoneGapViewController.h
//  PhoneGap
//
//  Created by Nitobi on 15/12/08.
//  Copyright 2008 Nitobi. All rights reserved.
//


#import <UIKit/UIKit.h>
#import <Foundation/Foundation.h>

@interface PhoneGapViewController : UIViewController {
    IBOutlet UIWebView *webView;
    BOOL     autoRotate;
    NSString *rotateOrientation;
}

- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation) interfaceOrientation; 
- (void)willRotateToInterfaceOrientation: (UIInterfaceOrientation)toInterfaceOrientation duration: (NSTimeInterval)duration;
- (void)setAutoRotate:(BOOL) shouldRotate;
- (void)setRotateOrientation:(NSString*) orientation;

@end
