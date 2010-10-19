/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 */

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
- (OCABMutableMultiValue*) emails;
- (OCABMutableMultiValue*) addresses;

- (BOOL) setFirstName:(NSString*)firstName;
- (BOOL) setLastName:(NSString*)lastName;

- (BOOL) removeFrom:(ABAddressBookRef)addressBook;

- (NSString*) JSONValue;

@end
