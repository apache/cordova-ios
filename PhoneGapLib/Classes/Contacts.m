/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010, IBM Corporation
 */


#import "Contacts.h"
#import <UIKit/UIKit.h>
#import "PhoneGapDelegate.h"
#import "Categories.h"
#import "Notification.h"
#import "OCCFObject.h"
#import "OCABRecord.h"
#import "OCABMutableMultiValue.h"

@implementation ContactsPicker

@synthesize allowsEditing;
@synthesize jsCallback;
@synthesize selectedId;

@end
@implementation NewContactsController

@synthesize jsCallback;

@end

@implementation DisplayContactsController
@synthesize successCallback;
@synthesize errorCallback;

@end


@implementation Contacts

// no longer used since code gets AddressBook for each operation. 
// If address book changes during save or remove operation, may get error but not much we can do about it
// If address book changes during UI creation, display or edit, we don't control any saves so no need for callback
/*void addressBookChanged(ABAddressBookRef addressBook, CFDictionaryRef info, void* context)
{
	// note that this function is only called when another AddressBook instance modifies 
	// the address book, not the current one. For example, through an OTA MobileMe sync
	Contacts* contacts = (Contacts*)context;
	[contacts addressBookDirty];
}*/

-(PhoneGapCommand*) initWithWebView:(UIWebView*)theWebView
{
    self = (Contacts*)[super initWithWebView:(UIWebView*)theWebView];
    /*if (self) {
		addressBook = ABAddressBookCreate();
		ABAddressBookRegisterExternalChangeCallback(addressBook, addressBookChanged, self);
    }*/
	
	return self;
}
// iPhone only method to create a new contact through the GUI
- (void) newContact:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
{	
	NSUInteger argc = [arguments count];
	NSString* jsString = nil;
	if (argc > 0) { 
		jsString = [arguments objectAtIndex:0];
	} 
	

	NewContactsController* npController = [[[NewContactsController alloc] init] autorelease];
		
	npController.addressBook = ABAddressBookCreate();
	npController.newPersonViewDelegate = self;
	npController.jsCallback = jsString;

	UINavigationController *navController = [[[UINavigationController alloc] initWithRootViewController:npController] autorelease];
	[[super appViewController] presentModalViewController:navController animated: YES];
 

			
		
}

- (void) newPersonViewController:(ABNewPersonViewController*)newPersonViewController didCompleteWithNewPerson:(ABRecordRef)person
{
	NSString* jsString = nil;
	ABRecordID recordId = kABRecordInvalidID;
	NewContactsController* newCP = (NewContactsController*) newPersonViewController;

	if (person != NULL) {
		if (newCP.jsCallback){
			//return the contact id
			recordId = ABRecordGetRecordID(person);
		}
	}
	[newPersonViewController dismissModalViewControllerAnimated:YES];
	
	if (newCP.jsCallback){
		jsString = [NSString stringWithFormat: @"%@(%d);", newCP.jsCallback, recordId];
		[webView stringByEvaluatingJavaScriptFromString:jsString];
	}
}

- (void) displayContact:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	NSUInteger argc = [arguments count];
	ABRecordID recordID = kABRecordInvalidID;
	NSString* errorCallback = nil;
	NSString* successCallback = nil;
	//TODO: need better argument handling system
	if (argc > 0) {
		recordID = [[arguments objectAtIndex:0] intValue];
	} else {
		NSLog(@"Contacts.display: Missing 1st parameter.");
		return;
	}
	
	if (argc > 1) {
		successCallback = [arguments objectAtIndex:1];
	}
	if(argc > 2){
		errorCallback = [arguments objectAtIndex:1];
	}
		
	
	//bool allowsEditing = [options isKindOfClass:[NSNull class]] ? false : [options existsValue:@"true" forKey:@"allowsEditing"];
	ABAddressBookRef addrBook = ABAddressBookCreate();	
	ABRecordRef rec = ABAddressBookGetPersonWithRecordID(addrBook, recordID);
	if (rec) {
		ABPersonViewController* personController = [[[ABPersonViewController alloc] init] autorelease];
		personController.displayedPerson = rec;
		personController.personViewDelegate = self;
		personController.allowsEditing = NO; //allowsEditing currently not supported
		
		UIBarButtonItem* doneButton = [[UIBarButtonItem alloc]
									   initWithBarButtonSystemItem:UIBarButtonSystemItemDone
									   target: self
									   action: @selector(dismissModalView:)];
		
		UINavigationController *navController = [[[UINavigationController alloc] initWithRootViewController:personController] autorelease];
		[[super appViewController] presentModalViewController:navController animated: YES];
		
		// this needs to be AFTER presentModal, if not it does not show up (iOS 4 regression: workaround)
		personController.navigationItem.rightBarButtonItem = doneButton;
		
		[doneButton release];												
		CFRelease(rec);
		
	  //Commented out code is various attempts to get editing
		// navigation working properly
		
		/*CGFloat width = webView.frame.size.width;
		UINavigationBar *navBar = [[UINavigationBar alloc] initWithFrame:
								   CGRectMake(0,0,width,52)];
		navBar.autoresizingMask = UIViewAutoresizingFlexibleWidth;
		 */
		//[[super appNavController] pushViewController:personController animated: YES];
		
		/*ContactsPicker* pickerController = [[[ContactsPicker alloc] init] autorelease];
		pickerController.peoplePickerDelegate = self;
		*/
		//UINavigationController *navController = [[[UINavigationController alloc] initWithRootViewController:personController] autorelease];
		//UINavigationBar* navBar = navController.navigationBar;
		//NSLog(@"isNavBar == nil %d", (navBar == nil));
		//[navBar setNavigationBarHidden: NO animated: NO];
		
		//NSArray* navArray = [NSArray arrayWithObjects:pickerController, navController, nil];
		//[navController setViewControllers: navArray animated: YES];
		//[navController pushViewController:personController animated:NO];
		
	
	
		//[navBar pushNavigationItem: doneButton animated:YES];
		//UINavigationController *navController = [[[UINavigationController alloc] initWithRootViewController:personController] autorelease];
		//[navController pushViewController:personController animated:YES];
		
		
		//personController.navigationItem.rightBarButtonItem = [navController editButtonItem]; 
		
	} 
	else 
	{
		if (errorCallback) {
			ContactError errCode = NOT_FOUND_ERROR;
			NSString* jsString = [NSString stringWithFormat:@"%@(%d);", errorCallback, errCode];
			//NSLog(@"%@", jsString);
			
			[webView stringByEvaluatingJavaScriptFromString:jsString];
		}
	}
	CFRelease(addrBook);
}

- (void) dismissModalView:(id)sender 
{
	UIViewController* controller = ([super appViewController]);
	[controller.modalViewController dismissModalViewControllerAnimated:YES]; 
}
								   
- (BOOL) personViewController:(ABPersonViewController *)personViewController shouldPerformDefaultActionForPerson:(ABRecordRef)person 
					 property:(ABPropertyID)property identifier:(ABMultiValueIdentifier)identifierForValue
{
	return YES;
}
	
- (void) chooseContact:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	NSUInteger argc = [arguments count];
	NSString* jsCallback = nil;
	
	//TODO: need better argument handling system
	if (argc > 0) {
		jsCallback = [arguments objectAtIndex:0];
	} else {
		NSLog(@"Contacts.chooseContact: Missing 1st parameter.");
		return;
	}
	
	ContactsPicker* pickerController = [[[ContactsPicker alloc] init] autorelease];
	pickerController.peoplePickerDelegate = self;
	pickerController.jsCallback = jsCallback;
	pickerController.selectedId = kABRecordInvalidID;
	pickerController.allowsEditing = (BOOL)[options existsValue:@"true" forKey:@"allowsEditing"];
	
	[[super appViewController] presentModalViewController:pickerController animated: YES];
}

- (BOOL) peoplePickerNavigationController:(ABPeoplePickerNavigationController*)peoplePicker 
	     shouldContinueAfterSelectingPerson:(ABRecordRef)person
{
	
	ContactsPicker* picker = (ContactsPicker*)peoplePicker;
	ABRecordID contactId = ABRecordGetRecordID(person);
	picker.selectedId = contactId; // save so can return when dismiss
	
	if (picker.allowsEditing) {
		
		ABPersonViewController* personController = [[[ABPersonViewController alloc] init] autorelease];
		personController.displayedPerson = person;
		personController.personViewDelegate = self;
		personController.allowsEditing = picker.allowsEditing;
		
		
		[peoplePicker pushViewController:personController animated:YES];
	} else {
		// return the contact Id
		
		
		NSString* jsString = [NSString stringWithFormat:@"%@(%d);", picker.jsCallback, contactId];
		[webView stringByEvaluatingJavaScriptFromString:jsString];

		[picker dismissModalViewControllerAnimated:YES];
	}
	return NO;
}

- (BOOL) peoplePickerNavigationController:(ABPeoplePickerNavigationController*)peoplePicker 
	     shouldContinueAfterSelectingPerson:(ABRecordRef)person property:(ABPropertyID)property identifier:(ABMultiValueIdentifier)identifier
{
	return YES;
}

- (void) peoplePickerNavigationControllerDidCancel:(ABPeoplePickerNavigationController *)peoplePicker
{
	// return contactId or invalid if none picked
	ContactsPicker* picker = (ContactsPicker*)peoplePicker;
	NSString* jsString = [NSString stringWithFormat:@"%@(%d);", picker.jsCallback, picker.selectedId];
	[webView stringByEvaluatingJavaScriptFromString:jsString];
	
	[peoplePicker dismissModalViewControllerAnimated:YES]; 
}

- (void) search:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	NSUInteger argc = [arguments count];
	NSString* jsCallback = nil;
	NSString* jsErrCallback = nil;
	NSString* jsString = nil;
	bool bError = FALSE;
	ContactError errCode = UNKNOWN_ERROR;
	//args:
	// 0 = success callback function 
	// 1 = error callback function
	
	//TODO: need better argument handling system
	if (argc > 0) {
		jsCallback = [arguments objectAtIndex:0];
	} else {
		// could catch this in JS before making call
		bError = TRUE;
		NSLog(@"Contacts.chooseContact: Missing success callback parameter.");
		errCode = INVALID_ARGUMENT_ERROR;
	}
	if (argc >1) {
		jsErrCallback = [arguments objectAtIndex:1];
	}
	if (bError){
		if (jsErrCallback){
			jsString = [NSString stringWithFormat:@"%@(%d);", jsErrCallback, errCode];
			[webView stringByEvaluatingJavaScriptFromString:jsString];
		}
		return;
	}
	
	NSArray* fields = [options valueForKey:@"fields"];
	NSDictionary* findOptions = [options valueForKey:@"findOptions"];
	
	ABAddressBookRef  addrBook = nil;
	NSArray* foundRecords = nil;
	

	addrBook = ABAddressBookCreate();
	// get the findOptions values
	BOOL multiple = YES; // default is true
	int limit = 1; // default if multiple is FALSE, will be set below if multiple is TRUE
	double msUpdatedSince = 0;
	BOOL bCheckDate = NO;
	NSString* filter = nil;
	BOOL bIncludeRecord = YES;
	if (![findOptions isKindOfClass:[NSNull class]]){
		id value = nil;
		filter = (NSString*)[findOptions objectForKey:@"filter"];
		value = [findOptions objectForKey:@"multiple"];
		if ([value isKindOfClass:[NSNumber class]]){
			// multiple is a boolean that will come through as an NSNumber
			multiple = [(NSNumber*)value boolValue];
			//NSLog(@"multiple is: %d", multiple);
		}
		if (multiple == YES){
			// we only care about limit if multiple is true
			value = [findOptions objectForKey:@"limit"];
			if ([value isKindOfClass:[NSNumber class]]){
				limit = [(NSNumber*)value intValue];
				//NSLog(@"limit is: %d", limit);
			} else {
				// no limit specified, set it to -1 to get all
				limit = -1;
			}
		}
		// see if there is an updated date
		id ms = [findOptions valueForKey:@"updatedSince"];
		if (ms && [ms isKindOfClass:[NSNumber class]]){
			msUpdatedSince = [ms doubleValue];
			bCheckDate = YES;
		}
		
	}
		
	if (!filter || [filter isEqualToString:@""]){ 
		// get all records - use fields to determine what properties to return
		foundRecords = (NSArray*)ABAddressBookCopyArrayOfAllPeople(addrBook);
	}else {
		// currently we can search for names only
		foundRecords =  (NSArray*)ABAddressBookCopyPeopleWithName(addrBook, (CFStringRef)filter);
		/*
		NSArray* allRecords = (NSArray*)ABAddressBookCopyArrayOfAllPeople(addrBook);
		NSString* state = @"MA";
		@try {
			NSPredicate* predicate = [NSPredicate predicateWithFormat:@"%@ contains[cd] %@", kABPersonAddressState, state];
			NSLog(@"predicate description: %@", [predicate description]);
			foundRecords = [allRecords filteredArrayUsingPredicate:predicate];
		}
		@catch (NSException * e) {
			NSLog(@"exception searching addressbook: %@", [e reason]);
		}
		@finally {
			CFRelease(allRecords);
		}
	*/
	}
	NSMutableArray* returnContacts = [NSMutableArray arrayWithCapacity:1];
	if (foundRecords && [foundRecords count] > 0){
		
		NSMutableDictionary* returnFields = [[Contact class] calcReturnFields: fields];

		// convert to JS Contacts format and return in callback
		NSAutoreleasePool* pool = [[NSAutoreleasePool alloc] init]; 
		int count = (limit > 0 ? MIN(limit,[foundRecords count]) : [foundRecords count]);
		ABRecordRef aRecord;
		for(int i = 0; i<count; i++){
			aRecord = [foundRecords objectAtIndex:i];
			Contact* newContact = [[[Contact alloc  ]initFromABRecord:aRecord] autorelease];
			if (bCheckDate) {
				NSNumber* modDate = [newContact getDateAsNumber:kABPersonModificationDateProperty];
				if (modDate){
					double modDateMs = [modDate doubleValue];
					if(round(modDateMs) < round(msUpdatedSince)){
						bIncludeRecord = NO;
					} else {
						bIncludeRecord = YES;
					}

				}
			}
			if(bIncludeRecord){
				NSMutableDictionary* aContact = [newContact toDictionary: returnFields];
				NSString* contactStr = [aContact JSONRepresentation];
				[returnContacts addObject:contactStr];
			}
		}
		[pool release];
		
		CFRelease(foundRecords); 
	}
	
	if ([returnContacts count] == 0 && jsErrCallback){
		// return error
		jsString = [NSString stringWithFormat:@"%@(%d);", jsErrCallback, NOT_FOUND_ERROR];
	}else {
		// return found contacts or empty string
		jsString = [NSString stringWithFormat: @"%@([%@]);", @"navigator.service.contacts._findCallback", [returnContacts componentsJoinedByString:@","]];
	}

	if(addrBook){
		CFRelease(addrBook);
	}
	if(jsString){	
		[webView stringByEvaluatingJavaScriptFromString:jsString];
	}
	return;
	
	
}
- (void) save:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	NSUInteger argc = [arguments count];
	NSString* jsCallback = nil;
	NSString* jsErrCallback;
	NSString* jsString = nil;
	bool bIsError = FALSE, bSuccess = FALSE;
	BOOL bUpdate = NO;
	ContactError errCode = UNKNOWN_ERROR;
	CFErrorRef error;
	//args:
	// 0 = success callback function
	// 1 = error callback function
	
	//TODO: need better argument handling system
	if (argc > 0) {
		jsCallback = [arguments objectAtIndex:0];
	} else {
		bIsError = TRUE;
		errCode = INVALID_ARGUMENT_ERROR;
		NSLog(@"Contact.save: Missing success callback parameter.");
	}
	if (argc >1) {
		jsErrCallback = [arguments objectAtIndex:1];
	}
	
	if (!bIsError){
	
		NSMutableDictionary* contactDict = [options valueForKey:@"contact"];
		
		ABAddressBookRef addrBook = ABAddressBookCreate();	
		NSNumber* cId = [contactDict valueForKey:kW3ContactId];
		Contact* aContact = nil; 
		ABRecordRef rec;
		if (cId && ![cId isKindOfClass:[NSNull class]]){
			rec = ABAddressBookGetPersonWithRecordID(addrBook, [cId intValue]);
			if (rec){
				aContact = [[Contact alloc] initFromABRecord: rec ];
				bUpdate = YES;
			}
		}
		if (!aContact){
			aContact = [[Contact alloc] init]; 
			rec = ABPersonCreate();
			[aContact setRecord: rec];
		}
		
		bSuccess = [aContact setFromContactDict: contactDict asUpdate: bUpdate];
		if (bSuccess){
			if (!bUpdate){
				bSuccess = ABAddressBookAddRecord(addrBook, [aContact record], &error);
			}
			if (bSuccess) {
				bSuccess = ABAddressBookSave(addrBook, &error);
			}
			if (!bSuccess){  // need to provide error codes
				bIsError = TRUE;
				errCode = IO_ERROR; 
			} else {

				// give original dictionary back?  If generate dictionary from saved contact, have no returnFields specified
				// so would give back all fields (which W3C spec. indicates is not desired)
				// for now (while testing) give back saved, full contact
				NSMutableDictionary* newContact = [aContact toDictionary: [Contact defaultFields]];
				NSString* contactStr = [newContact JSONRepresentation];
				jsString = [NSString stringWithFormat: @"%@(%@);", @"navigator.service.contacts._contactCallback", contactStr];
			}
			CFRelease(addrBook);
		} else {
			bIsError = TRUE;
			errCode = IO_ERROR; 
		}
		[aContact release];	
	} // end of if !bIsError for argument check
	if (bIsError && jsErrCallback){
		jsString = [NSString stringWithFormat:@"%@(%d);", jsErrCallback, errCode];
	}
	if(jsString){
		[webView stringByEvaluatingJavaScriptFromString:jsString];
	}
}	
- (void) remove: (NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	NSUInteger argc = [arguments count];
	NSString* jsCallback = nil;
	NSString* jsErrCallback = nil;
	NSString* jsString = nil;
	bool bIsError = FALSE, bSuccess = FALSE;
	ContactError errCode = UNKNOWN_ERROR;
	CFErrorRef error;
	ABAddressBookRef addrBook = nil;
	ABRecordRef rec = nil;
	//args:
	// 0 = success callback function
	// 1 = error callback function
	
	//TODO: need better argument handling system
	if (argc > 0) {
		jsCallback = [arguments objectAtIndex:0];
	} else {
		bIsError = TRUE;
		errCode = INVALID_ARGUMENT_ERROR;
		NSLog(@"Contact.save: Missing success callback parameter.");
	}
	if (argc >1) {
		jsErrCallback = [arguments objectAtIndex:1];
	}
	
	if (!bIsError){
		NSMutableDictionary* contactDict = [options valueForKey:@"contact"];
		addrBook = ABAddressBookCreate();	
		NSNumber* cId = [contactDict valueForKey:kW3ContactId];
		if (cId && ![cId isKindOfClass:[NSNull class]] && [cId intValue] != kABRecordInvalidID){
			rec = ABAddressBookGetPersonWithRecordID(addrBook, [cId intValue]);
			if (rec){
				bSuccess = ABAddressBookRemoveRecord(addrBook, rec, &error);
				if (!bSuccess){
					bIsError = TRUE;
					errCode = IO_ERROR; 
				} else {
					rec = nil; // it was removed, don't release it
					bSuccess = ABAddressBookSave(addrBook, &error);
					if(!bSuccess){
						bIsError = TRUE;
						errCode = IO_ERROR;
					}else {
						// set id to null
						[contactDict setObject:[NSNull null] forKey:kW3ContactId];
						NSString* contactStr = [contactDict JSONRepresentation];
						jsString = [NSString stringWithFormat: @"%@(%@);", @"navigator.service.contacts._contactCallback", contactStr];
					}
				}						
			} else {
				// no record found return error
				bIsError = TRUE;
				errCode = NOT_FOUND_ERROR;
			}

		} else {
			// invalid contact id provided
			bIsError = TRUE;
			errCode = INVALID_ARGUMENT_ERROR;
		}
	}
	if (rec){
		CFRelease(rec);
	}
	if (addrBook){
		CFRelease(addrBook);
	}
	if (bIsError && jsErrCallback){
		jsString = [NSString stringWithFormat:@"%@(%d);", jsErrCallback, errCode];
	}
	if (jsString){
		[webView stringByEvaluatingJavaScriptFromString:jsString];
	}	
		
	return;
		
}

- (void) addressBookDirty
{
	
}

- (void)dealloc
{
	/*ABAddressBookUnregisterExternalChangeCallback(addressBook, addressBookChanged, self);

	if (addressBook) {
		CFRelease(addressBook);
	}
	*/
	
    [super dealloc];
}

@end

/*@implementation ContactsViewController
- (void)setEditing:(BOOL)flag animated:(BOOL)animated
{
	[super setEditing:flag animated:animated]; 
	if (flag == YES){ 
		// change the view to an editable view 
		[ [self navigationController] setEditing:YES animated:NO];
	} else {
		// save the changes and change the view to noneditable 
		[ [self navigationController] setEditing:NO animated:NO]; 
	}
}
@end		
*/

