//
//  Notification.h
//  PhoneGap
//
//  Created by Michael Nachbaur on 16/04/09.
//  Copyright 2009 Decaf Ninja Software. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import <AudioToolbox/AudioServices.h>
#import "PGPlugin.h"
#import "LoadingView.h"

@interface Notification : PGPlugin <UIAlertViewDelegate>{
	LoadingView* loadingView;
}

@property (nonatomic, retain) LoadingView* loadingView;

- (void)alert:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options; // confirm is just a variant of alert
- (void)vibrate:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;

- (void)activityStart:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options __attribute__ ((deprecated));
- (void)activityStop:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options __attribute__ ((deprecated));
- (void)loadingStart:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options __attribute__ ((deprecated));
- (void)loadingStop:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options __attribute__ ((deprecated));

@end

@interface PGAlertView : UIAlertView {
	NSString* callBackId;
}
@property(nonatomic, retain) NSString* callbackId;

-(void) dealloc;

@end