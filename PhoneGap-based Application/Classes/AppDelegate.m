/*
 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at
 
 http://www.apache.org/licenses/LICENSE-2.0
 
 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
 */
//
//  AppDelegate.m
//  ___PROJECTNAME___
//
//  Created by ___FULLUSERNAME___ on ___DATE___.
//  Copyright ___ORGANIZATIONNAME___ ___YEAR___. All rights reserved.
//

#import "AppDelegate.h"

@implementation AppDelegate

@synthesize invokeString;

- (id) init
{	
	/** If you need to do any extra app-specific initialization, you can do it here
	 *  -jm
	 **/
    return [super init];
}

/**
 * This is main kick off after the app inits, the views and Settings are setup here. (preferred - iOS4 and up)
 */
- (BOOL) application:(UIApplication*)application didFinishLaunchingWithOptions:(NSDictionary*)launchOptions
{    
    NSURL* url = [launchOptions objectForKey:UIApplicationLaunchOptionsURLKey];
    if (url && [url isKindOfClass:[NSURL class]])
    {
        self.invokeString = [url absoluteString];
		NSLog(@"___PROJECTNAME___ launchOptions = %@",url);
    }    
		
	BOOL ok = [super application:application didFinishLaunchingWithOptions:launchOptions];
    if (ok) {
        self.viewController.webView.delegate = self;
        self.viewController.commandDelegate = self;
    }
    return ok;
}

// this happens while we are running ( in the background, or from within our own app )
// only valid if ___PROJECTNAME___.plist specifies a protocol to handle
- (BOOL) application:(UIApplication*)application handleOpenURL:(NSURL*)url 
{
    // must call super so all plugins will get the notification, and their handlers will be called 
	// super also calls into javascript global function 'handleOpenURL'
    return [super application:application handleOpenURL:url];
}

- (id) getCommandInstance:(NSString*)className
{
	return [super.viewController getCommandInstance:className];
}

- (BOOL) execute:(InvokedUrlCommand*)command
{
	return [super.viewController execute:command];
}

- (NSString*) pathForResource:(NSString*)resourcepath;
{
	return [super.viewController pathForResource:resourcepath];
}

#pragma UIWebDelegate implementation

- (void) webViewDidFinishLoad:(UIWebView*) theWebView 
{
	// only valid if ___PROJECTNAME___.plist specifies a protocol to handle
	if (self.invokeString)
	{
		// this is passed before the deviceready event is fired, so you can access it in js when you receive deviceready
		NSString* jsString = [NSString stringWithFormat:@"var invokeString = \"%@\";", self.invokeString];
		[theWebView stringByEvaluatingJavaScriptFromString:jsString];
	}
	
	 // Black base color for background matches the native apps
   	theWebView.backgroundColor = [UIColor blackColor];
    
	return [super.viewController webViewDidFinishLoad:theWebView];
}

- (void) webViewDidStartLoad:(UIWebView*)theWebView 
{
	return [super.viewController webViewDidStartLoad:theWebView];
}

- (void) webView:(UIWebView*)theWebView didFailLoadWithError:(NSError*)error 
{
	return [super.viewController webView:theWebView didFailLoadWithError:error];
}

- (BOOL) webView:(UIWebView*)theWebView shouldStartLoadWithRequest:(NSURLRequest*)request navigationType:(UIWebViewNavigationType)navigationType
{
	return [super.viewController webView:theWebView shouldStartLoadWithRequest:request navigationType:navigationType];
}

- (void) dealloc
{
	[super dealloc];
}

@end