 /*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Created by Michael Nachbaur on 13/04/09.
 * Copyright (c) 2009 Decaf Ninja Software. All rights reserved.
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010, IBM Corporation
 */


#import "PGPlugin.h"
#import "PhoneGapDelegate.h"


@implementation PGPlugin
@synthesize webView;
@synthesize settings;


- (PGPlugin*) initWithWebView:(UIWebView*)theWebView settings:(NSDictionary*)classSettings
{
    self = [self initWithWebView:theWebView];
    if (self) {
        self.settings = classSettings;
	}
    return self;
}

- (PGPlugin*) initWithWebView:(UIWebView*)theWebView
{
    self = [super init];
    if (self) {
		[[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onAppTerminate) name:UIApplicationWillTerminateNotification object:nil];
		[[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onMemoryWarning) name:UIApplicationDidReceiveMemoryWarningNotification object:nil];
		[[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(handleOpenURL:) name:PGPluginHandleOpenURLNotification object:nil];
        
		self.webView = theWebView;
		
		// You can listen to more app notifications, see:
		// http://developer.apple.com/library/ios/#DOCUMENTATION/UIKit/Reference/UIApplication_Class/Reference/Reference.html#//apple_ref/doc/uid/TP40006728-CH3-DontLinkElementID_4
		/*
		 // NOTE: if you want to use these, make sure you uncomment the corresponding notification handler, and also the removeObserver in dealloc
		 [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onPause) name:UIApplicationDidEnterBackgroundNotification object:nil];
		 [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onResume) name:UIApplicationWillEnterForegroundNotification object:nil];
		 [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onOrientationWillChange) name:UIApplicationWillChangeStatusBarOrientationNotification object:nil];
		 [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onOrientationDidChange) name:UIApplicationDidChangeStatusBarOrientationNotification object:nil];
		 */
	}
    return self;
}

/*
// NOTE: for onPause and onResume, calls into JavaScript must not call or trigger any blocking UI, like alerts 
- (void) onPause {}
- (void) onResume {}
- (void) onOrientationWillChange {}
- (void) onOrientationDidChange {}
*/

/* NOTE: calls into JavaScript must not call or trigger any blocking UI, like alerts */
- (void) handleOpenURL:(NSNotification*)notification
{
	// override to handle urls sent to your app
	// register your url schemes in your App-Info.plist
	
	NSURL* url = [notification object];
	if ([url isKindOfClass:[NSURL class]]) {
		/* Do your thing! */
	}
}

/* NOTE: calls into JavaScript must not call or trigger any blocking UI, like alerts */
- (void) onAppTerminate
{
	// override this if you need to do any cleanup on app exit
}

- (void) onMemoryWarning
{
	// override to remove caches, etc
}

- (void) dealloc
{
	self.settings = nil;
	self.webView = nil;
	[[NSNotificationCenter defaultCenter] removeObserver:self name:UIApplicationWillTerminateNotification object:nil];
	[[NSNotificationCenter defaultCenter] removeObserver:self name:UIApplicationDidReceiveMemoryWarningNotification object:nil];
	[[NSNotificationCenter defaultCenter] removeObserver:self name:PGPluginHandleOpenURLNotification object:nil];
	/*
	 [[NSNotificationCenter defaultCenter] removeObserver:self name:UIApplicationDidEnterBackgroundNotification object:nil];
	 [[NSNotificationCenter defaultCenter] removeObserver:self name:UIApplicationWillEnterForegroundNotification object:nil];
	 [[NSNotificationCenter defaultCenter] removeObserver:self name:UIApplicationWillChangeStatusBarOrientationNotification object:nil];
	 [[NSNotificationCenter defaultCenter] removeObserver:self name:UIApplicationDidChangeStatusBarOrientationNotification object:nil];
	 */
    [super dealloc];
}

- (PhoneGapDelegate*) appDelegate
{
	return (PhoneGapDelegate*)[[UIApplication sharedApplication] delegate];
}

- (UIViewController*) appViewController
{
	return (UIViewController*)[self appDelegate].viewController;
}

- (NSString*) writeJavascript:(NSString*)javascript
{
	return [self.webView stringByEvaluatingJavaScriptFromString:javascript];
}

@end