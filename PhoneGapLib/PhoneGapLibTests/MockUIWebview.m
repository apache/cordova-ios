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