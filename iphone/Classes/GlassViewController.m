//
//  GlassViewController.m
//  PhoneGap
//
//  Created by Nitobi on 15/12/08.
//  Copyright 2008 Nitobi. All rights reserved.
//

#import "GlassViewController.h"

@implementation GlassViewController


- (IBAction)viewDidLoad {

}

- (IBAction)pushBack {
    
}

- (IBAction)pushHome {
    
}

- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation) interfaceOrientation 
{ 
    return autoRotate; 
}


- (void) setAutoRotate:(BOOL) shouldRotate
{
	autoRotate = shouldRotate;
}
@end