//
//  MockUIWebview.m
//  PhoneGapLib
//
//  Created by Shazron Abdullah on 11-09-08.
//  Copyright 2011 Nitobi Software Inc. All rights reserved.
//

#import "MockUIWebview.h"


@implementation MockUIWebview

@synthesize javascriptQueue, webView;

- (id) init
{
	if (self = [super init]) {
		self.javascriptQueue = [NSMutableArray arrayWithCapacity:5];
#ifdef APPLICATION_TESTS
        self.webView = [[UIWebView alloc] init];
#else 
        self.webView = nil;
        NSLog(@"No UIWebView javascript interpreter can be used in this mode.");
#endif
	}
	
	return self;
}


- (NSString*) stringByEvaluatingJavaScriptFromString:(NSString*)script
{
	// a correct "result" is predicated on the unit-test adding some meaningful 
    // HTML+JS into the UIWebView first! in APPLICATION_TESTS mode
	NSString* result = self.webView? [self.webView stringByEvaluatingJavaScriptFromString:script] : @"";
    
	JsOperation* op = [[[JsOperation alloc] initWithScript:script andResult:result] autorelease];
	
	[self.javascriptQueue addObject:op];
	
	return result;
}

@end


@implementation JsOperation

@synthesize script, scriptResult;


- (id) initWithScript:(NSString*)aScript andResult:(NSString*)aResult
{
	if (self = [super init]) {
		self.script = aScript;
		self.scriptResult = aResult;
	}
	
	return self;
}

@end