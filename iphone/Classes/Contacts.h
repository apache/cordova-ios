/*
 *  Contact.h
 *
 *  Created by Nitobi on 12/12/08.
 *  Copyright 2008 Nitobi. All rights reserved.
 *
 */

#import <Foundation/Foundation.h>
#import <AddressBook/ABAddressBook.h>
#import <AddressBookUI/ABNewPersonViewController.h>
#import "PhoneGapCommand.h"

@interface Contacts : PhoneGapCommand <ABNewPersonViewControllerDelegate> {
	ABAddressBookRef addressBook;
	NSArray* allPeople;
}

- (void) getAllContacts:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) newContact:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) displayContact:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;

- (void) newPersonViewController:(ABNewPersonViewController *)newPersonViewController didCompleteWithNewPerson:(ABRecordRef)person;

- (void) dealloc;

@end
