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

/*
 * allContacts
 *
 * arguments:
 *	1: this is the javascript function that will be called with the results, the first parameter passed to the
 *		javascript function is a javascript array
 * options:
 *	nameFilter: filter the results by this name (wildcards ok), if available
 *	pageSize: maximum number of results to retrieve
 *	pageNumber: page number of results to retrieve
 */
- (void) allContacts:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;

/*
 * newContact
 *
 * arguments:
 *	1: first name of the new contact
 *	2: last name of the new contact
 * options:
 *	gui: set to true to allow the user to add a new contact through the iPhone contact editor
 *  successCallback: this is the javascript function that will be called with the newly created contact as a JSON object
 */
- (void) newContact:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;

/*
 * displayContact
 *
 * arguments:
 *	1: recordID of the contact to display in the iPhone contact display
 * options:
 *	allowsEditing: set to true to allow the user to edit the contact
 */
- (void) displayContact:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;

/*
 * chooseContact
 *	
 * arguments:
 *	1: this is the javascript function that will be called with the contact data as a JSON object (as the first param)
 * options:
 *	allowsEditing: set to true to not choose the contact, but to edit it in the iPhone contact editor
 */
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
	NSString* jsCallback;
}

@property BOOL allowsEditing;
@property (retain) NSString* jsCallback;

@end
