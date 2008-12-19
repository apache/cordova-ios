//
//  Contacts.m
//  Glass
//
//  Created by Nitobi on 13/12/08.
//  Copyright 2008 Nitobi. All rights reserved.
//

#import <AddressBook/AddressBook.h>
#import "Contacts.h"
//#import <JSON/JSON.h>

@implementation Contacts

- (id)init
{
	self = [super init];
	addressBook = ABAddressBookCreate();
	return self;
}

- (NSArray *)getContacts {
	if (nil == allPeople) {
		allPeople = (NSArray *)ABAddressBookCopyArrayOfAllPeople(self.addressBook);
		CFIndex nPeople = ABAddressBookGetPersonCount(self.addressBook);
				
		
		NSMutableArray *contacts;
		contacts = [[NSMutableArray alloc] init ];

		
		for (int i=0;i < nPeople;i++) { 
			ABRecordRef ref = CFArrayGetValueAtIndex(allPeople,i);

			CFStringRef firstName = ABRecordCopyValue(ref, kABPersonFirstNameProperty);
			CFStringRef lastName = ABRecordCopyValue(ref, kABPersonLastNameProperty);
			CFStringRef phoneNumber = ABMultiValueCopyValueAtIndex(ABRecordCopyValue(ref,kABPersonPhoneProperty) ,0);
			NSString *contactFirstLast = [NSString stringWithFormat:@"%@ %@",firstName, lastName];
			NSString *contactFirstLast2 = [NSString stringWithFormat:@"{'name':'%@'}",contactFirstLast];
			NSLog(@"%@",contactFirstLast2);

			NSDictionary *dict = [NSDictionary dictionaryWithObjectsAndKeys:contactFirstLast, @"name",phoneNumber, @"phone",nil];
			[contacts addObject:dict];
			
			CFRelease(firstName);
			CFRelease(lastName);
			CFRelease(phoneNumber);
		}
	}
	
//	SBJSON *json = [SBJSON new];
//	json.humanReadable = YES;

//	NSString *jsonStr = [json stringWithObject:contacts error:NULL];
//	NSLog(@"%@",jsonStr);
	
	return contacts;
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
