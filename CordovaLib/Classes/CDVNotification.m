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


#import "CDVNotification.h"
#import "NSDictionary+Extensions.h"


@implementation CDVNotification


- (void)alert:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	NSString* callbackId = [arguments objectAtIndex:0];
	NSString* message = [arguments objectAtIndex:1];
	NSString* title   = [options objectForKey:@"title"];
	NSString* button  = [options objectForKey:@"buttonLabel"];
	
	if (!title)
        title = @"Alert";
	if (!button)
        button = @"OK";
	
	CDVAlertView *alertView = [[CDVAlertView alloc]
							  initWithTitle:title
							  message:message 
							  delegate:self 
							  cancelButtonTitle:nil 
							  otherButtonTitles:nil];
	
	[alertView setCallbackId:callbackId];
	NSArray* labels = [ button componentsSeparatedByString:@","];
	
	int count = [ labels count ];
	
	for(int n = 0; n < count; n++)
	{
		[ alertView addButtonWithTitle:[labels objectAtIndex:n]];
	}
	
	[alertView show];
	[alertView release];
}


- (void)prompt:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	NSString* callbackId = [arguments objectAtIndex:0];
	NSString* message = [arguments objectAtIndex:1];
	NSString* title   = [options objectForKey:@"title"];
	NSString* button  = [options objectForKey:@"buttonLabel"];
    
    if (!title)
        title = @"Alert";
    if (!button)
        button = @"OK";
    
	CDVAlertView *openURLAlert = [[CDVAlertView alloc]
								 initWithTitle:title
								 message:message delegate:self cancelButtonTitle:button otherButtonTitles:nil];
	[openURLAlert setCallbackId: callbackId];
	[openURLAlert show];
	[openURLAlert release];
}

/**
 Callback invoked when an alert dialog's buttons are clicked.   
 Passes the index + label back to JS
 */

- (void)alertView:(UIAlertView *)alertView clickedButtonAtIndex:(NSInteger)buttonIndex
{
    //NSString *buttonLabel = [alertView buttonTitleAtIndex:buttonIndex];
	
	CDVAlertView* pgAlertView = (CDVAlertView*) alertView;
	CDVPluginResult* result = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK messageAsInt: ++buttonIndex]; 
	[self writeJavascript:[result toSuccessCallbackString: [pgAlertView callbackId]]];
	//NSString * jsCallBack = [NSString stringWithFormat:@"navigator.notification._alertCallback(%d,\"%@\");", ++buttonIndex, buttonLabel];    
    //[webView stringByEvaluatingJavaScriptFromString:jsCallBack];
}
 
- (void)vibrate:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	AudioServicesPlaySystemSound(kSystemSoundID_Vibrate);
}

@end

@implementation CDVAlertView
@synthesize callbackId;

- (void) dealloc
{
	if (callbackId) {
		[callbackId release];
	}
	
	
	[super dealloc];
}
@end