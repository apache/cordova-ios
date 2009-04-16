//
//  UIControls.h
//  PhoneGap
//
//  Created by Michael Nachbaur on 13/04/09.
//  Copyright 2009 Decaf Ninja Software. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
/*
#import <UIKit/UITabBar.h>
#import <UIKit/UITabBarController.h>
*/
#import "PhoneGapCommand.h"

@interface UIControls : PhoneGapCommand {
}

- (void)alert:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void)activityStart:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void)activityStop:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;

@end
