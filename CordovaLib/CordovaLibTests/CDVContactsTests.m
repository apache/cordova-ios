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

#import "CDVContactsTests.h"
#import "CDVMockUIWebview.h"
#import "CDVContacts.h"

@implementation CDVContactsTests

@synthesize webView, contacts;

- (void)setUp
{
    [super setUp];
    
    // setup code here
    //CGRect webViewBounds = CGRectMake(0, 0, 320.0, 480.0);
	self.webView = [[[CDVMockUIWebview alloc] init] autorelease];
	self.contacts = (CDVContacts*)[[CDVContacts alloc] initWithWebView:(UIWebView*)self.webView];
}

- (void)tearDown
{
    // Tear-down code here.
	
    [super tearDown];
	self.webView = nil;
	self.contacts = nil;
}

- (void) testSearchContacts
{
	STAssertTrue(NO, @"TODO: testSearchContacts");
}

- (void) testSaveContact
{
	STAssertTrue(NO, @"TODO: testSaveContact");
}

- (void) testNewContact
{
	STAssertTrue(NO, @"TODO: testNewContact");
}

- (void) testRemoveContact
{
	STAssertTrue(NO, @"TODO: testRemoveContact");
}

@end
