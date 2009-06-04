//
//  LoadingView.h
//  LoadingView
//
//  Created by Matt Gallagher on 12/04/09.
//  Copyright Matt Gallagher 2009. All rights reserved.
// 
//  Permission is given to use this source code file without charge in any
//  project, commercial or otherwise, entirely at your risk, with the condition
//  that any redistribution (in part or whole) of source code must retain
//  this copyright and permission notice. Attribution in compiled projects is
//  appreciated but not required.
//

#import <UIKit/UIKit.h>

@interface LoadingView : UIView
{
	NSTimeInterval minDuration;
	NSDate* timestamp;
}

@property NSTimeInterval minDuration;
@property (retain) NSDate* timestamp;

+ (id)loadingViewInView:(UIView *)aSuperview;
- (void)removeView;

@end
