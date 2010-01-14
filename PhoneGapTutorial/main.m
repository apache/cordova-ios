//
//  main.m
//  PhoneGapTutorial
//
//  Created by Jesse MacFadyen on 10-01-06.
//  Copyright Nitobi 2010. All rights reserved.
//

#import <UIKit/UIKit.h>

int main(int argc, char *argv[]) {
    
    NSAutoreleasePool * pool = [[NSAutoreleasePool alloc] init];
    int retVal = UIApplicationMain(argc, argv, nil, @"PhoneGapTutorialAppDelegate");
    [pool release];
    return retVal;
}
