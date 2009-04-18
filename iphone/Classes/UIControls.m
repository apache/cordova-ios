//
//  UIControls.m
//  PhoneGap
//
//  Created by Michael Nachbaur on 13/04/09.
//  Copyright 2009 Decaf Ninja Software. All rights reserved.
//

#import "UIControls.h"

@implementation UIControls

- (void)createTabbar:(NSArray*)arguments withDict:(NSDictionary*)options
{
    CGFloat height = 49.0f;
    NSDictionary* tabSettings = [settings objectForKey:@"TabbarSettings"];
    if (tabSettings) {
        height = [[tabSettings objectForKey:@"height"] floatValue];
    }

    tabbar = [UITabBar new];
    [tabbar sizeToFit];
    tabbar.autoresizesSubviews = YES;
    
    CGRect mainViewBounds = self.webView.superview.bounds;

	[tabbar setFrame:CGRectMake(0.0f, 431.0f, 320.0f, height)];
    /*
	[tabbar setFrame:CGRectMake(CGRectGetMinX(mainViewBounds),
                                CGRectGetMinY(mainViewBounds) + CGRectGetHeight(mainViewBounds) - (height * 2.0) + 2.0,
                                CGRectGetWidth(mainViewBounds),
                                height)];
     */
	
	[self.webView.superview addSubview:tabbar];
    
    //tabbar.delegate = self;
}

/*
- (void)showToolbar:(NSArray*)arguments withDict:(NSDictionary*)options
{
    if (!tabbar)
        [self createTabbar:nil withDict:nil];
    [tabbar hi
}

- (void)showToolbar:(NSArray*)arguments withDict:(NSDictionary*)options
{
}

- (void)showTabbar:(NSArray*)arguments withDict:(NSDictionary*)options
{
}
                      
- (void)addTabButton:(NSArray*)arguments withDict:(NSDictionary*)options
{
//    id* controller = [[UITabBar alloc] initWithFrame:(
}
*/
    
- (void)dealloc
{
    if (tabbar)
        [tabbar release];
    if (toolbar)
        [toolbar release];
    [super dealloc];
}

@end
