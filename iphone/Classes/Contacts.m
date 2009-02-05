/*
 *  Contact.m
 *
 *  Created by Nitobi on 2/3/09
 *  Copyright 2008 Nitobi. All rights reserved.
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

- (NSArray *)getContacts {
  NSMutableArray *contactsArray = [[NSMutableArray alloc] init ];

	if (nil == allPeople) {
		allPeople = (NSArray *)ABAddressBookCopyArrayOfAllPeople(self.addressBook);
		CFIndex numberOfPeople = ABAddressBookGetPersonCount(self.addressBook);
		
		for (int i=0;i < numberOfPeople;i++) { 
			ABRecordRef ref = CFArrayGetValueAtIndex(allPeople,i);

			CFStringRef firstName = ABRecordCopyValue(ref, kABPersonFirstNameProperty);
			CFStringRef lastName = ABRecordCopyValue(ref, kABPersonLastNameProperty);
			CFStringRef phoneNumber = ABMultiValueCopyValueAtIndex(ABRecordCopyValue(ref,kABPersonPhoneProperty) ,0);
			NSString *contactFirstLast = [NSString stringWithFormat:@"%@ %@",firstName, lastName];
			NSString *contactFirstLast2 = [NSString stringWithFormat:@"{'name':'%@'}",contactFirstLast];
			NSLog(@"%@",contactFirstLast2);

			NSDictionary *dict = [NSDictionary dictionaryWithObjectsAndKeys:contactFirstLast, @"name",phoneNumber, @"phone",nil];
			[contactsArray addObject:dict];
			
			CFRelease(firstName);
			CFRelease(lastName);
			CFRelease(phoneNumber);
		}
	}
	
	
	return contactsArray;
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
