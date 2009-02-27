/*
 *  Contact.m
 *
 *  Created by Nitobi on 2/3/09
 *  Copyright 2008 Nitobi. All rights reserved.
 *  Rob Ellis rob.ellis@nitobi.com
 *
 */


#import <AddressBook/AddressBook.h>
#import "Contacts.h"

@implementation Contacts

@synthesize addressBook;
@synthesize allPeople;

- (id)init
{
	self = [super init];
	addressBook = ABAddressBookCreate();
	return self;
}

- (NSMutableString *)getContacts {
	NSMutableString *update = [[[NSMutableString alloc] init] autorelease];
	
	if (allPeople == nil) {
		allPeople = (NSArray *)ABAddressBookCopyArrayOfAllPeople(self.addressBook);
		CFIndex numberOfPeople = ABAddressBookGetPersonCount(self.addressBook);
				
		[update appendString:@"var _contacts=["];
		
		for (int i=0;i < numberOfPeople;i++) { 
			ABRecordRef ref = CFArrayGetValueAtIndex(allPeople,i);

			if (ABRecordCopyValue(ref, kABPersonFirstNameProperty) != nil && ABRecordCopyValue(ref, kABPersonLastNameProperty) != nil) {
				CFStringRef firstName = ABRecordCopyValue(ref, kABPersonFirstNameProperty);
				CFStringRef lastName = ABRecordCopyValue(ref, kABPersonLastNameProperty);			
				CFStringRef phoneNumber = ABMultiValueCopyValueAtIndex(ABRecordCopyValue(ref,kABPersonPhoneProperty) ,0);
				
				NSString *contactFirstLast = [NSString stringWithFormat:@"%@ %@",firstName, lastName];
				NSString *contactFirstLast2 = [NSString stringWithFormat:@"{'name':'%@','phone':'%@'}",contactFirstLast,phoneNumber];
				[update appendFormat:@"%@", contactFirstLast2];
				if (i+1 != numberOfPeople) {
					[update appendFormat:@","];
				}
				
				CFRelease(firstName);
				CFRelease(lastName);
				CFRelease(phoneNumber);
			}
		}

		[update appendString:@"];"];
	}
	return update;
}

- (void) addContact {
	
	ABAddressBookRef libroDirec = ABAddressBookCreate();
	ABRecordRef persona = ABPersonCreate();
	
	ABRecordSetValue(persona, kABPersonFirstNameProperty, @"kate" , nil);
	ABRecordSetValue(persona, kABPersonLastNameProperty, @"Hutson", nil);
	ABAddressBookAddRecord(libroDirec, persona, nil);
	ABAddressBookSave(libroDirec, nil);
	
	CFRelease(persona);
}


- (void) displayContact:(ABRecordRef *) person {
	NSLog(@"HERE");
}

- (ABAddressBookRef)getAddressBook {
	if (nil == addressBook)
	{
		addressBook = ABAddressBookCreate();
	}
	return addressBook;
}
@end
