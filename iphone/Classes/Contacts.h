/*
 *  Contact.h
 *
 *  Created by Nitobi on 12/12/08.
 *  Copyright 2008 Nitobi. All rights reserved.
 *
 */

#import <Foundation/Foundation.h>
#import <AddressBook/ABAddressBook.h>
#import <AddressBookUI/AddressBookUI.h>
#import "PhoneGapCommand.h"

@interface Contacts : PhoneGapCommand <ABNewPersonViewControllerDelegate, 
									   ABPersonViewControllerDelegate,
									   ABPeoplePickerNavigationControllerDelegate
									  > 
{
	ABAddressBookRef addressBook;
	NSArray* allPeople;
}

- (void) allContacts:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) newContact:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) displayContact:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) chooseContact:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;

- (void) newPersonViewController:(ABNewPersonViewController *)newPersonViewController didCompleteWithNewPerson:(ABRecordRef)person;
- (BOOL) personViewController:(ABPersonViewController *)personViewController shouldPerformDefaultActionForPerson:(ABRecordRef)person 
					 property:(ABPropertyID)property identifier:(ABMultiValueIdentifier)identifierForValue;

- (void) addressBookDirty;
- (void) dealloc;

@end

@interface ContactsPicker : ABPeoplePickerNavigationController
{
	BOOL allowsEditing;
}

@property BOOL allowsEditing;

@end
