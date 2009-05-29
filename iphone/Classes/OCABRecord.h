//
//  OCABRecordRef.h
//  PhoneGap
//
//  Created by shazron on 29/05/09.
//  Copyright 2009 Nitobi Software Inc.. All rights reserved.
//
#import <AddressBook/AddressBook.h>

@class OCCFObject, OCABMutableMultiValue;

@interface OCABRecord : OCCFObject {
	CFErrorRef error;
}

- (ABRecordRef) ABRecordRef;

- (NSString*) firstName;
- (NSString*) lastName;
- (OCABMutableMultiValue*) phoneNumbers;

- (BOOL) setFirstName:(NSString*)firstName;
- (BOOL) setLastName:(NSString*)firstName;

- (BOOL) remove:(ABAddressBookRef)addressBook;

- (NSString*) JSONValue;

@end
