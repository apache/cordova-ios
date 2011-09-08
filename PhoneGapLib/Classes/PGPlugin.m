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
	The arguments passed in should not included the callbackId. 
	If argument count is not as expected, it will call the error callback using PluginResult (if callbackId is available),
	or it will write to stderr using NSLog.
 
	Usage is through the VERIFY_ARGUMENTS macro.
 */
- (BOOL) verifyArguments:(NSMutableArray*)arguments withExpectedCount:(NSUInteger)expectedCount andCallbackId:(NSString*)callbackId 
		  callerFileName:(const char*)callerFileName callerFunctionName:(const char*)callerFunctionName 
{
	NSUInteger argc = [arguments count];
	BOOL ok = (argc >= expectedCount); // allow for optional arguments
	
	if (!ok) {
		NSString* errorString = [NSString stringWithFormat:@"Incorrect no. of arguments for plugin: was %d, expected %d", argc, expectedCount];
		if (callbackId) {
			NSString* callbackId = [arguments objectAtIndex:0];
			PluginResult* pluginResult = [PluginResult resultWithStatus:PGCommandStatus_ERROR messageAsString:errorString];
			[self writeJavascript:[pluginResult toErrorCallbackString:callbackId]];
		} else {
			NSString* fileName = [[[[NSString alloc] initWithBytes:callerFileName length:strlen(callerFileName) encoding:NSUTF8StringEncoding] autorelease] lastPathComponent];
			NSLog(@"%@::%s - Error: %@", fileName, callerFunctionName, errorString);
		}
	}
	
	return ok;
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

- (NSString*) success:(PluginResult*)pluginResult callbackId:(NSString*)callbackId
{
	return [self writeJavascript:[NSString stringWithFormat:@"setTimeout(function() { %@; }, 0);", [pluginResult toSuccessCallbackString:callbackId]]];
}

- (NSString*) error:(PluginResult*)pluginResult callbackId:(NSString*)callbackId
{
	return [self writeJavascript:[NSString stringWithFormat:@"setTimeout(function() { %@; }, 0);", [pluginResult toErrorCallbackString:callbackId]]];
}

@end