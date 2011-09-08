//
//  PGContactsTests.m
//  PhoneGapLib
//
//  Created by Shazron Abdullah on 11-09-08.
//  Copyright Nitobi Software Inc. 2011 . All rights reserved.
//

#import "PGContactsTests.h"
#import "MockUIWebview.h"
#import "Contacts.h"

@implementation PGContactsTests

@synthesize webView, contacts;

- (void)setUp
{
    [super setUp];
    
    // setup code here
    //CGRect webViewBounds = CGRectMake(0, 0, 320.0, 480.0);
	self.webView = [[[MockUIWebview alloc] init] autorelease];
	self.contacts = (PGContacts*)[[PGContacts alloc] initWithWebView:(UIWebView*)self.webView];
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
