/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010, IBM Corporation
 */

#import <Foundation/Foundation.h>
#import <AddressBook/ABAddressBook.h>
#import <AddressBookUI/AddressBookUI.h>
#import "PhoneGapCommand.h"
#import "Contact.h"

@interface Contacts : PhoneGapCommand <ABNewPersonViewControllerDelegate, 
									   ABPersonViewControllerDelegate,
									   ABPeoplePickerNavigationControllerDelegate
									  > 
{
	ABAddressBookRef addressBook;
}



/*
 * newContact - create a new contact via the GUI
 *
 * arguments:
 *	1: successCallback: this is the javascript function that will be called with the newly created contactId 
 */
- (void) newContact:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;

/*
 * displayContact  - IN PROGRESS
 *
 * arguments:
 *	1: recordID of the contact to display in the iPhone contact display
 *	2: successCallback - currently not used
 *  3: error callback
 * options:
 *	allowsEditing: set to true to allow the user to edit the contact - currently not supported
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

/*
 * search - searchs for contacts.  Only person records are currently supported.
 *
 * arguments:
 *  1: successcallback - this is the javascript function that will be called with the array of found contacts
 *  2:  errorCallback - optional javascript functiont to be called in the event of an error with an error code.
 * options:  dictionary containing ContactFields and ContactFindOptions 
 *	fields - ContactFields array
 *  findOptions - ContactFindOptions object as dictionary
 *
 */
- (void) search:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
/* 
 * save - saves a new contact or updates and existing contact
 *
 * arguments:
 *  1: success callback - this is the javascript function that will be called with the JSON representation of the saved contact
 *		search calls a fixed navigator.service.contacts._findCallback which then calls the succes callback stored before making the call into obj. c
 *  
 */
- (void) save:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
/*
 * remove - removes a contact from the address book
 * 
 * arguments:
 *  1:  1: successcallback - this is the javascript function that will be called with a (now) empty contact object
 *  
 * options:  dictionary containing Contact object to remove
 *	contact - Contact object as dictionary
 */
- (void) remove: (NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;

- (void) dealloc;

@end

@interface ContactsPicker : ABPeoplePickerNavigationController
{
	BOOL allowsEditing;
	NSString* jsCallback;
	ABRecordID selectedId;
}

@property BOOL allowsEditing;
@property (retain) NSString* jsCallback;
@property ABRecordID selectedId;

@end

@interface NewContactsController : ABNewPersonViewController
{
	NSString* jsCallback;
}
@property (retain) NSString* jsCallback;
@end

@interface DisplayContactsController : ABPersonViewController
{
	NSString* successCallback;
	NSString* errorCallback;
}
@property (retain) NSString* successCallback;
@property (retain) NSString* errorCallback;

//- (void)setEditing:(BOOL)flag animated:(BOOL)animated; 

@end
