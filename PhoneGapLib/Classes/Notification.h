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

@interface PGNotification : PGPlugin <UIAlertViewDelegate>{
}

- (void)alert:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options; // confirm is just a variant of alert
- (void)vibrate:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;

@end

@interface PGAlertView : UIAlertView {
	NSString* callBackId;
}
@property(nonatomic, retain) NSString* callbackId;

-(void) dealloc;

@end