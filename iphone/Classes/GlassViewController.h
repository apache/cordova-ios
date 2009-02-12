//
//  GlassViewController.h
//  PhoneGap
//
//  Created by Nitobi on 15/12/08.
//  Copyright 2008 Nitobi. All rights reserved.
//


#import <UIKit/UIKit.h>
#import <Foundation/Foundation.h>

@interface GlassViewController : UIViewController {
	BOOL autoRotate;
}
- (IBAction)viewDidLoad;
- (IBAction)pushBack;
- (IBAction)pushHome;
- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation) interfaceOrientation; 
- (void)setAutoRotate:(BOOL) shouldRotate;

@end
