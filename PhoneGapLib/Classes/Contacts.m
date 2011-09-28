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


@implementation ContactsPicker

@synthesize allowsEditing;
@synthesize callbackId;
@synthesize selectedId;

@end
@implementation NewContactsController

@synthesize callbackId;

@end

@implementation PGContacts

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

-(PGPlugin*) initWithWebView:(UIWebView*)theWebView
{
    self = (PGContacts*)[super initWithWebView:(UIWebView*)theWebView];
    /*if (self) {
		addressBook = ABAddressBookCreate();
		ABAddressBookRegisterExternalChangeCallback(addressBook, addressBookChanged, self);
    }*/
	
	return self;
}


// overridden to clean up Contact statics
-(void)onAppTerminate
{
	//NSLog(@"Contacts::onAppTerminate");
	[PGContact releaseDefaults];
}


// iPhone only method to create a new contact through the GUI
- (void) newContact:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
{	
	NSString* callbackId = [arguments objectAtIndex:0];

	NewContactsController* npController = [[[NewContactsController alloc] init] autorelease];
	
	ABAddressBookRef ab = ABAddressBookCreate();
	npController.addressBook = ab; // a CF retaining assign
    CFRelease(ab);
    
	npController.newPersonViewDelegate = self;
	npController.callbackId = callbackId;

	UINavigationController *navController = [[[UINavigationController alloc] initWithRootViewController:npController] autorelease];
	[[super appViewController] presentModalViewController:navController animated: YES];
 
}

- (void) newPersonViewController:(ABNewPersonViewController*)newPersonViewController didCompleteWithNewPerson:(ABRecordRef)person
{

	ABRecordID recordId = kABRecordInvalidID;
	NewContactsController* newCP = (NewContactsController*) newPersonViewController;
	NSString* callbackId = newCP.callbackId;
	
	if (person != NULL) {
			//return the contact id
			recordId = ABRecordGetRecordID(person);
	}
	[newPersonViewController dismissModalViewControllerAnimated:YES];
	PluginResult* result = [PluginResult resultWithStatus: PGCommandStatus_OK messageAsInt:  recordId];
	//jsString = [NSString stringWithFormat: @"%@(%d);", newCP.jsCallback, recordId];
	[self writeJavascript: [result toSuccessCallbackString:callbackId]];
	
}

- (void) displayContact:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	ABRecordID recordID = kABRecordInvalidID;
	NSString* callbackId = [arguments objectAtIndex:0];
	
	recordID = [[arguments objectAtIndex:1] intValue];

		
	
	bool bEdit = [options isKindOfClass:[NSNull class]] ? false : [options existsValue:@"true" forKey:@"allowsEditing"];
	ABAddressBookRef addrBook = ABAddressBookCreate();	
	ABRecordRef rec = ABAddressBookGetPersonWithRecordID(addrBook, recordID);
	if (rec) {
		DisplayContactViewController* personController = [[[DisplayContactViewController alloc] init] autorelease];
		personController.displayedPerson = rec;
		personController.personViewDelegate = self;
		personController.allowsEditing = NO;
        personController.contactsPlugin = self;  //pass in the PGPlugin object so can dismiss the picker view later
		
        // create this so DisplayContactViewController will have a "back" button.
        UIViewController* parentController = [[[UIViewController alloc] init] autorelease];
        UINavigationController *navController = [[UINavigationController alloc] initWithRootViewController:parentController];

        [navController pushViewController:personController animated:YES];

		[self.appViewController presentModalViewController:navController animated: YES];

		if (bEdit) {
            // create the editing controller and push it onto the stack
            ABPersonViewController* editPersonController = [[[ABPersonViewController alloc] init] autorelease];
            editPersonController.displayedPerson = rec;
            editPersonController.personViewDelegate = self;
            editPersonController.allowsEditing = YES; 
            [navController pushViewController:editPersonController animated:YES];
            
        }
	} 
	else 
	{
		// no record, return error
		PluginResult* result = [PluginResult resultWithStatus: PGCommandStatus_OK messageAsInt:  UNKNOWN_ERROR];
		[self writeJavascript:[result toErrorCallbackString:callbackId]];
		
	}
	CFRelease(addrBook);
}
								   
- (BOOL) personViewController:(ABPersonViewController *)personViewController shouldPerformDefaultActionForPerson:(ABRecordRef)person 
					 property:(ABPropertyID)property identifier:(ABMultiValueIdentifier)identifierForValue
{
	return YES;
}
	
- (void) chooseContact:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	NSString* callbackId = [arguments objectAtIndex:0];
	
	ContactsPicker* pickerController = [[[ContactsPicker alloc] init] autorelease];
	pickerController.peoplePickerDelegate = self;
	pickerController.callbackId = callbackId;
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
		PluginResult* result = [PluginResult resultWithStatus: PGCommandStatus_OK messageAsInt: contactId];
		[self writeJavascript:[result toSuccessCallbackString: picker.callbackId]];
		

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
	PluginResult* result = [PluginResult resultWithStatus:PGCommandStatus_OK messageAsInt: picker.selectedId];
	[self writeJavascript:[result toSuccessCallbackString:picker.callbackId]];
	
	[peoplePicker dismissModalViewControllerAnimated:YES]; 
}

- (void) search:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	NSString* jsString = nil;
	NSString* callbackId = [arguments objectAtIndex:0];
	
	
	NSArray* fields = [options valueForKey:@"fields"];
	NSDictionary* findOptions = [options valueForKey:@"findOptions"];
	
	ABAddressBookRef  addrBook = nil;
	NSArray* foundRecords = nil;
	

	addrBook = ABAddressBookCreate();
	// get the findOptions values
	BOOL multiple = NO; // default is false
	NSString* filter = nil;
	if (![findOptions isKindOfClass:[NSNull class]]){
		id value = nil;
		filter = (NSString*)[findOptions objectForKey:@"filter"];
		value = [findOptions objectForKey:@"multiple"];
		if ([value isKindOfClass:[NSNumber class]]){
			// multiple is a boolean that will come through as an NSNumber
			multiple = [(NSNumber*)value boolValue];
			//NSLog(@"multiple is: %d", multiple);
		}
	}

	NSDictionary* returnFields = [[PGContact class] calcReturnFields: fields];
	
	NSMutableArray* matches = nil;
	if (!filter || [filter isEqualToString:@""]){ 
		// get all records 
		foundRecords = (NSArray*)ABAddressBookCopyArrayOfAllPeople(addrBook);
		if (foundRecords && [foundRecords count] > 0){
			// create Contacts and put into matches array
            // doesn't make sense to ask for all records when multiple == NO but better check
			int xferCount = multiple == YES ? [foundRecords count] : 1;
			matches = [NSMutableArray arrayWithCapacity:xferCount];
			for(int k = 0; k<xferCount; k++){
				PGContact* xferContact = [[[PGContact alloc] initFromABRecord:(ABRecordRef)[foundRecords objectAtIndex:k]] autorelease];
				[matches addObject:xferContact];
				xferContact = nil;
				
			}
		}
	} else {
		foundRecords = (NSArray*)ABAddressBookCopyArrayOfAllPeople(addrBook);
		matches = [NSMutableArray arrayWithCapacity:1];
		BOOL bFound = NO;
		int testCount = [foundRecords count];
		for(int j=0; j<testCount; j++){
			PGContact* testContact = [[[PGContact alloc] initFromABRecord: (ABRecordRef)[foundRecords objectAtIndex:j]] autorelease];
			if (testContact){
				bFound = [testContact foundValue:filter inFields:returnFields];
				if(bFound){
					[matches addObject:testContact];
				}
				testContact = nil;
			}
		}
	}

	NSMutableArray* returnContacts = [NSMutableArray arrayWithCapacity:1];
	
	if (matches != nil && [matches count] > 0){
		// convert to JS Contacts format and return in callback
        // - returnFields  determines what properties to return
		NSAutoreleasePool* pool = [[NSAutoreleasePool alloc] init]; 
		int count = multiple == YES ? [matches count] : 1;
		for(int i = 0; i<count; i++){
			PGContact* newContact = [matches objectAtIndex:i];
			NSDictionary* aContact = [newContact toDictionary: returnFields];
			[returnContacts addObject:aContact];
		}
		[pool release];
	}
	PluginResult* result = nil;
    // return found contacts (array is empty if no contacts found)
    result = [PluginResult resultWithStatus:PGCommandStatus_OK messageAsArray: returnContacts  cast: @"navigator.contacts._findCallback"];
    jsString = [result toSuccessCallbackString:callbackId];
    NSLog(@"findCallback string: %@", jsString);
	

	if(addrBook){
		CFRelease(addrBook);
	}
	if (foundRecords){
		[foundRecords release];
	}
	
	if(jsString){
		[self writeJavascript:jsString];
    }
	return;
	
	
}
- (void) save:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	NSString* callbackId = [arguments objectAtIndex:0];
	NSString* jsString = nil;
	bool bIsError = FALSE, bSuccess = FALSE;
	BOOL bUpdate = NO;
	ContactError errCode = UNKNOWN_ERROR;
	CFErrorRef error;
	PluginResult* result = nil;	
	
	NSMutableDictionary* contactDict = [options valueForKey:@"contact"];
	
	ABAddressBookRef addrBook = ABAddressBookCreate();	
	NSNumber* cId = [contactDict valueForKey:kW3ContactId];
	PGContact* aContact = nil; 
	ABRecordRef rec = nil;
	if (cId && ![cId isKindOfClass:[NSNull class]]){
		rec = ABAddressBookGetPersonWithRecordID(addrBook, [cId intValue]);
		if (rec){
			aContact = [[PGContact alloc] initFromABRecord: rec ];
			bUpdate = YES;
		}
	}
	if (!aContact){
		aContact = [[PGContact alloc] init]; 			
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
			NSDictionary* newContact = [aContact toDictionary: [PGContact defaultFields]];
			//NSString* contactStr = [newContact JSONRepresentation];
			result = [PluginResult resultWithStatus:PGCommandStatus_OK messageAsDictionary: newContact cast: @"navigator.contacts._contactCallback" ];
			jsString = [result toSuccessCallbackString:callbackId];
		}
	} else {
		bIsError = TRUE;
		errCode = IO_ERROR; 
	}
	[aContact release];	
	CFRelease(addrBook);
		
	if (bIsError){
		result = [PluginResult resultWithStatus:PGCommandStatus_ERROR messageAsInt: errCode cast:@"navigator.contacts._errCallback" ];
		jsString = [result toErrorCallbackString:callbackId];
	}
	
	if(jsString){
		[self writeJavascript: jsString];
		//[webView stringByEvaluatingJavaScriptFromString:jsString];
	}
	
	
}	
- (void) remove: (NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	NSString* callbackId = [arguments objectAtIndex:0];
	NSString* jsString = nil;
	bool bIsError = FALSE, bSuccess = FALSE;
	ContactError errCode = UNKNOWN_ERROR;
	CFErrorRef error;
	ABAddressBookRef addrBook = nil;
	ABRecordRef rec = nil;
	PluginResult* result = nil;
	
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
				bSuccess = ABAddressBookSave(addrBook, &error);
				if(!bSuccess){
					bIsError = TRUE;
					errCode = IO_ERROR;
				}else {
					// set id to null
					[contactDict setObject:[NSNull null] forKey:kW3ContactId];
					result = [PluginResult resultWithStatus:PGCommandStatus_OK messageAsDictionary: contactDict cast: @"navigator.contacts._contactCallback"];
					jsString = [result toSuccessCallbackString:callbackId];
					//NSString* contactStr = [contactDict JSONRepresentation];
				}
			}						
		} else {
			// no record found return error
			bIsError = TRUE;
			errCode = UNKNOWN_ERROR;
		}
		
	} else {
		// invalid contact id provided
		bIsError = TRUE;
		errCode = INVALID_ARGUMENT_ERROR;
	}
	

	if (addrBook){
		CFRelease(addrBook);
	}
	if (bIsError){
		result = [PluginResult resultWithStatus:PGCommandStatus_ERROR messageAsInt: errCode cast: @"navigator.contacts._errCallback"];
		 jsString = [result toErrorCallbackString:callbackId];
	}
	if (jsString){
		[self writeJavascript:jsString];
	}	
		
	return;
		
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

/* ABPersonViewController does not have any UI to dismiss.  Adding navigationItems to it does not work properly
 * The navigationItems are lost when the app goes into the background.  The solution was to create an empty
 * NavController in front of the ABPersonViewController. This will cause the ABPersonViewController to have a back button. By subclassing the ABPersonViewController, we can override viewDidDisappear and take down the entire NavigationController.
 */ 
@implementation DisplayContactViewController
@synthesize contactsPlugin;


- (void)viewDidDisappear: (BOOL)animated
{
    [super viewDidDisappear: animated];
    // I couldn't find the appViewController in the hierarchy of this UIViewController 
    // so using the passed ContactPlugin to access it.
    [self.contactsPlugin.appViewController dismissModalViewControllerAnimated:NO];
    
}
-(void) dealloc
{
    self.contactsPlugin=nil;
    [super dealloc];
}

@end

