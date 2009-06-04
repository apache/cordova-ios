//
//  OCABRecordRef.m
//  PhoneGap
//
//  Created by shazron on 29/05/09.
//  Copyright 2009 Nitobi Software Inc.. All rights reserved.
//

#import "OCCFObject.h"
#import "OCABRecord.h"
#import "OCABMutableMultiValue.h"


@implementation OCABRecord

@synthesize error;

+ (OCABRecord*) CreateFromRecordID:(ABRecordID)recordID andAddressBook:(ABAddressBookRef)addressBook
{
	ABRecordRef ref = ABAddressBookGetPersonWithRecordID(addressBook, recordID);
	return [[OCABRecord alloc] initWithCFTypeRef:ref];
}

- (ABRecordRef) ABRecordRef
{
	return (ABRecordRef)__baseRef;
}

- (NSString*) firstName
{
	return [(id)ABRecordCopyValue([self ABRecordRef], kABPersonFirstNameProperty) autorelease];
}

- (NSString*) lastName
{
	return [(id)ABRecordCopyValue([self ABRecordRef], kABPersonLastNameProperty) autorelease];		
}

- (NSString*) compositeName
{
	return [(id)ABRecordCopyCompositeName([self ABRecordRef]) autorelease];		
}

- (BOOL) setPhoneNumber:(NSString*)phoneNumber withLabel:(NSString*)label
{
	OCABMutableMultiValue* phoneNumbers = [self phoneNumbers];
	[phoneNumbers addValue:phoneNumber withLabel:(CFStringRef)label];
	return ABRecordSetValue([self ABRecordRef], kABPersonPhoneProperty, [phoneNumbers ABMutableMultiValueRef], &error);
}

- (ABRecordID) recordID
{
	return ABRecordGetRecordID([self ABRecordRef]);
}

- (OCABMutableMultiValue*) phoneNumbers
{
	CFTypeRef rec = ABRecordCopyValue([self ABRecordRef], kABPersonPhoneProperty);
	if (!rec) {
		rec = ABMultiValueCreateMutable(kABMultiStringPropertyType);
	}

	id val =  [[[OCABMutableMultiValue alloc] initWithCFTypeRef:rec] autorelease];
	CFRelease(rec);
	return val;
}

- (BOOL) setFirstName:(NSString*)firstName
{
	return ABRecordSetValue ([self ABRecordRef], kABPersonFirstNameProperty, firstName, &error);	
}

- (BOOL) setLastName:(NSString*)lastName
{
	return ABRecordSetValue ([self ABRecordRef], kABPersonLastNameProperty, lastName, &error);	
}

- (BOOL) removeFrom:(ABAddressBookRef)addressBook
{
	return ABAddressBookRemoveRecord(addressBook, [self ABRecordRef], &error);
}

- (NSString*) JSONValue
{
	NSString* firstName = [self firstName];
	NSString* lastName = [self lastName];
	NSString* emptyString = @"";
	
	return [[[NSString alloc] initWithFormat:@"{ recordID: %d, firstName:'%@', lastName: '%@', phoneNumber:%@, address:'%@'}", 
					   [self recordID],
						firstName == nil? emptyString : firstName, 
						lastName == nil? emptyString : lastName, 
						[[self phoneNumbers] JSONValue], 
					   @""
					  ] autorelease];
}


@end