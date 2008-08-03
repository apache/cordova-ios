//
//  GlassAppDelegate.h
//  Glass
//
//  Created by Eric Oesterle on 8/2/08.
//  Copyright InPlace 2008. All rights reserved.
//

#import <UIKit/UIKit.h>

@class GlassViewController;

@interface GlassAppDelegate : NSObject <UIApplicationDelegate, UIWebViewDelegate> {
	IBOutlet UIWindow *window;
	IBOutlet GlassViewController *viewController;
	IBOutlet UIWebView *webView;
}

@property (nonatomic, retain) UIWindow *window;
@property (nonatomic, retain) GlassViewController *viewController;

@end

