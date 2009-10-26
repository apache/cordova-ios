//
//  main.m
//  SampleApp
//
//  Created by Jesse MacFadyen on 09-10-23.
//  Copyright Nitobi 2009. All rights reserved.
//

#import <UIKit/UIKit.h>

int main(int argc, char *argv[]) {
    
    NSAutoreleasePool * pool = [[NSAutoreleasePool alloc] init];
    int retVal = UIApplicationMain(argc, argv, nil, @"SampleAppAppDelegate");
    [pool release];
    return retVal;
}
