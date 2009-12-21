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

@property CFErrorRef error;

- (ABRecordRef) ABRecordRef;
+ (OCABRecord*) newFromRecordID:(ABRecordID)recordID andAddressBook:(ABAddressBookRef)addressBook;

- (NSString*) firstName;
- (NSString*) lastName;
- (NSString*) compositeName;
- (BOOL) setPhoneNumber:(NSString*)phoneNumber withLabel:(NSString*)label;

- (OCABMutableMultiValue*) phoneNumbers;

- (BOOL) setFirstName:(NSString*)firstName;
- (BOOL) setLastName:(NSString*)lastName;

- (BOOL) removeFrom:(ABAddressBookRef)addressBook;

- (NSString*) JSONValue;

@end
