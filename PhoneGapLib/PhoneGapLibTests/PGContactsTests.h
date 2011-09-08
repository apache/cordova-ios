//
//  PGContactsTests.h
//  PhoneGapLib
//
//  Created by Shazron Abdullah on 11-09-08.
//  Copyright 2011 Nitobi Software Inc. All rights reserved.
//


#import <SenTestingKit/SenTestingKit.h>

@class MockUIWebview, PGContacts;

@interface PGContactsTests : SenTestCase {
	
}

@property (nonatomic, retain) MockUIWebview* webView;
@property (nonatomic, retain) PGContacts* contacts;

@end
