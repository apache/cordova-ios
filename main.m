//
//  main.m
//  Glass
//
//  Created by Eric Oesterle on 8/2/08.
//  Copyright InPlace 2008. All rights reserved.
//

#import <UIKit/UIKit.h>

int main(int argc, char *argv[]) {
	
	NSAutoreleasePool * pool = [[NSAutoreleasePool alloc] init];
	int retVal = UIApplicationMain(argc, argv, nil, @"GlassAppDelegate");
	[pool release];
	return retVal;
}
