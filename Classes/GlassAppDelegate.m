//
//  GlassAppDelegate.m
//  Glass
//
//  Created by Eric Oesterle on 8/2/08.
//  Copyright InPlace 2008. All rights reserved.
//

#import "GlassAppDelegate.h"
#import "GlassViewController.h"

@implementation GlassAppDelegate

@synthesize window;
@synthesize viewController;


- (void)applicationDidFinishLaunching:(UIApplication *)application {	
	
	// Override point for customization after app launch
    [window addSubview:viewController.view];
	webView.delegate = self;
	// [webView loadRequest:[NSURLRequest requestWithURL:[NSURL URLWithString:@"http://google.com"]]];
	
	
	NSString * htmlFileName;
	NSString * urlFileName;
	
	htmlFileName = @"index";
	urlFileName = @"url";
	
	// NSString * htmlPathString = [[NSBundle mainBundle] resourcePath];
	NSString * urlPathString; //= [[NSBundle mainBundle] resourcePath];
	
	NSBundle * thisBundle = [NSBundle bundleForClass:[self class]];
	
	/*
	 if (htmlPathString = [thisBundle pathForResource:htmlFileName ofType:@"html"]) {
		NSURL * anURL = [NSURL fileURLWithPath:htmlPathString];
		NSURLRequest * aRequest = [NSURLRequest requestWithURL:anURL];
		
	}
	 */
	
	if (urlPathString = [thisBundle pathForResource:urlFileName	ofType:@"txt"]){
		NSString * theURLString = [NSString stringWithContentsOfFile:urlPathString];
		
		
		NSURL * anURL = [NSURL URLWithString:theURLString];
		
		
		
		NSURLRequest * aRequest = [NSURLRequest requestWithURL:anURL];
		
		[webView loadRequest:aRequest];
	}
	
	
	[window makeKeyAndVisible];
}

- (BOOL)webView:(UIWebView *)webView shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType {
	NSString * myURL = [[request URL] absoluteString];
	NSLog(myURL);
	
	return YES;
}



- (void)dealloc {
    [viewController release];
	[window release];
	[super dealloc];
}


@end
