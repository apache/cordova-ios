/*
 *  Contact.m
 *
 *  Created by Nitobi on 2/3/09
 *  Copyright 2008 Nitobi. All rights reserved.
 *  Rob Ellis rob.ellis@nitobi.com
 *  Shazron Abdullah shazron@nitobi.com
 *
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

@end


@implementation Contacts

void addressBookChanged(ABAddressBookRef addressBook, CFDictionaryRef info, void* context)
{
	// note that this function is only called when another AddressBook instance modifies 
	// the address book, not the current one. For example, through an OTA MobileMe sync
	Contacts* contacts = (Contacts*)context;
	[contacts addressBookDirty];
}

-(PhoneGapCommand*) initWithWebView:(UIWebView*)theWebView
{
    self = (Contacts*)[super initWithWebView:(UIWebView*)theWebView];
    if (self) {
        addressBook = ABAddressBookCreate();
		allPeople = nil;
		ABAddressBookRegisterExternalChangeCallback(addressBook, addressBookChanged, self);
    }
	return self;
}

- (void) contactsCount:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	NSUInteger argc = [arguments count];
	NSString* jsCallback = nil;
	
	if (argc > 0) {
		jsCallback = [arguments objectAtIndex:0];
	} else {
		NSLog(@"Contacts.contactsCount: Missing 1st parameter.");
		return;
	}
	
	CFIndex numberOfPeople = ABAddressBookGetPersonCount(addressBook);
	NSString* jsString = [[NSString alloc] initWithFormat:@"%@(%d);", jsCallback, numberOfPeople];
	
    [webView stringByEvaluatingJavaScriptFromString:jsString];
	[jsString release];
}

- (void) allContacts:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	NSUInteger argc = [arguments count];
	NSString* jsCallback = nil;
	
	if (argc > 0) {
		jsCallback = [arguments objectAtIndex:0];
	} else {
		NSLog(@"Contacts.allContacts: Missing 1st parameter.");
		return;
	}
		
	NSMutableString* jsArray = [[NSMutableString alloc] init];
	[jsArray appendString:@"["];
	
	NSString* filter = [options valueForKey:@"nameFilter"];
	CFArrayRef records = NULL;
	CFIndex numberOfPeople = 0;

	if (filter) {
		records =  ABAddressBookCopyPeopleWithName(addressBook, (CFStringRef)filter);
		numberOfPeople = CFArrayGetCount(records);
	} else {
		if (allPeople == nil) { // lazy loading
			allPeople = (NSArray*)ABAddressBookCopyArrayOfAllPeople(addressBook);
		}
		records = (CFArrayRef)allPeople;
		numberOfPeople = ABAddressBookGetPersonCount(addressBook);
	}
	
	CFIndex pageSize = [options integerValueForKey:@"pageSize" defaultValue:numberOfPeople withRange:NSMakeRange(1, numberOfPeople)];
	
	NSUInteger maxPages = ceil((double)numberOfPeople / (double)pageSize);
	CFIndex pageNumber = [options integerValueForKey:@"pageNumber" defaultValue:1 withRange:NSMakeRange(1, maxPages)];
	
	CFIndex skipAmount = (pageNumber - 1) * pageSize;
	CFIndex maxIndex = (skipAmount + pageSize);
	CFIndex i;

	NSAutoreleasePool* pool = [[NSAutoreleasePool alloc] init]; 
	for (i = skipAmount; i < maxIndex; i++) 
	{ 
		OCABRecord* rec = [[OCABRecord alloc] initWithCFTypeRef:CFArrayGetValueAtIndex(records, i)];
		[jsArray appendString:[rec JSONValue]];
		[rec release];
		
		if (i+1 != maxIndex) {
			[jsArray appendString:@","];
		}
	}
	[pool release];
	[jsArray appendString:@"]"];
	
	NSString* jsString = [[NSString alloc] initWithFormat:@"%@(%@);", jsCallback, jsArray];
    NSLog(@"%@", jsString);
	
    [webView stringByEvaluatingJavaScriptFromString:jsString];
	
	if (filter) {
		CFRelease(records);
	}
	
	[jsArray release];
	[jsString release];
}

- (void) newContact:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
{	
	NSUInteger argc = [arguments count];
	NSString* firstName = nil, *lastName = nil, *phoneNumber = nil;
	
	if (argc > 0) firstName = [arguments objectAtIndex:0];
	if (argc > 1) lastName = [arguments objectAtIndex:1];
	if (argc > 2) phoneNumber = [arguments objectAtIndex:2];
	
	ABRecordRef ref = ABPersonCreate();
	OCABRecord* rec = [[OCABRecord alloc] initWithCFTypeRef:ref];
	CFRelease(ref);
	
	[rec setFirstName: firstName];
	[rec setLastName: lastName];
	
	if (phoneNumber) {
		[rec setPhoneNumber:phoneNumber withLabel:(NSString*)kABPersonPhoneMainLabel];
	}
	
	//TODO: add more items to set here, from arguments
	
	if ([options existsValue:@"true" forKey:@"gui"]) {
		ABNewPersonViewController* npController = [[[ABNewPersonViewController alloc] init] autorelease];
		
		npController.displayedPerson = [rec ABRecordRef];
		npController.addressBook = addressBook;
		npController.newPersonViewDelegate = self;

		UINavigationController *navController = [[[UINavigationController alloc] initWithRootViewController:npController] autorelease];
		[[super appViewController] presentModalViewController:navController animated: YES];
	} 
	else {
		CFErrorRef errorRef;
		bool addOk = false, saveOk = false;

		addOk = ABAddressBookAddRecord(addressBook, [rec ABRecordRef], &errorRef);
		if (addOk) {
			saveOk = ABAddressBookSave(addressBook, &errorRef);
		}
		if (saveOk) {
			[self addressBookDirty];
		}
		
		NSString* jsCallback = [options valueForKey:@"successCallback"];
		NSString* firstParam = (addOk && saveOk)? [rec JSONValue] : @"";
		
		if (jsCallback) {
			NSString* jsString = [[NSString alloc] initWithFormat:@"%@(%@);", jsCallback, firstParam];
			[webView stringByEvaluatingJavaScriptFromString:jsString];
			
			[jsString release];
		}
	}
	
	[rec release];
}

- (void) newPersonViewController:(ABNewPersonViewController*)newPersonViewController didCompleteWithNewPerson:(ABRecordRef)person
{
	if (person != NULL) {
		[self addressBookDirty];
	}
	[newPersonViewController dismissModalViewControllerAnimated:YES]; 
}

- (void) displayContact:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	NSUInteger argc = [arguments count];
	ABRecordID recordID = kABRecordInvalidID;
	NSString* errorCallback = nil;
	
	//TODO: need better argument handling system
	if (argc > 0) {
		recordID = [[arguments objectAtIndex:0] intValue];
	} else {
		NSLog(@"Contacts.displayContact: Missing 1st parameter.");
		return;
	}
	
	if (argc > 1) {
		errorCallback = [arguments objectAtIndex:1];
	}
	
	bool allowsEditing = [options existsValue:@"true" forKey:@"allowsEditing"];
	
	OCABRecord* rec = [OCABRecord newFromRecordID:recordID andAddressBook:addressBook];
	if (rec) {
		ABPersonViewController* personController = [[[ABPersonViewController alloc] init] autorelease];
		personController.displayedPerson = [rec ABRecordRef];
		personController.personViewDelegate = self;
		personController.allowsEditing = allowsEditing;
		
		UIBarButtonItem *cancelButton = [[UIBarButtonItem alloc]
										  initWithBarButtonSystemItem:UIBarButtonSystemItemCancel
										  target: self
										  action: @selector(dimissModalView:)];
		
		personController.navigationItem.leftBarButtonItem = cancelButton;
		[cancelButton release];												

		UINavigationController *navController = [[[UINavigationController alloc] initWithRootViewController:personController] autorelease];
		[[super appViewController] presentModalViewController:navController animated: YES];
		
		[rec release];
	} 
	else 
	{
		if (errorCallback) {
			NSString* jsString = [[NSString alloc] initWithFormat:@"%@('Contacts.displayContact: Record id %d not found.');", 
								  errorCallback, recordID];
			NSLog(@"%@", jsString);
			
			[webView stringByEvaluatingJavaScriptFromString:jsString];
			[jsString release];
		}
	}
}

- (void) dimissModalView:(id)sender 
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
	pickerController.allowsEditing = (BOOL)[options existsValue:@"true" forKey:@"allowsEditing"];
	
	[[super appViewController] presentModalViewController:pickerController animated: YES];
}

- (BOOL) peoplePickerNavigationController:(ABPeoplePickerNavigationController*)peoplePicker 
	     shouldContinueAfterSelectingPerson:(ABRecordRef)person
{
	ABPersonViewController* personController = [[[ABPersonViewController alloc] init] autorelease];
	ContactsPicker* picker = (ContactsPicker*)peoplePicker;
	
	personController.displayedPerson = person;
	personController.personViewDelegate = self;
	personController.allowsEditing = picker.allowsEditing;
	
	if (picker.allowsEditing) {
		[peoplePicker pushViewController:personController animated:YES];
	} else {
		OCABRecord* rec = [[OCABRecord alloc] initWithCFTypeRef:person];
		NSString* jsString = [[NSString alloc] initWithFormat:@"%@(%@);", picker.jsCallback, [rec JSONValue]];
		[webView stringByEvaluatingJavaScriptFromString:jsString];
		
		[jsString release];
		[rec release];
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
	[peoplePicker dismissModalViewControllerAnimated:YES]; 
}

- (void) removeContact:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	NSUInteger argc = [arguments count];
	ABRecordID recordID = kABRecordInvalidID;
	NSString* jsCallback = nil;
	
	if (argc > 0) {
		recordID = [[arguments objectAtIndex:0] intValue];
	} else {
		NSLog(@"Contacts.removeContact: Missing 1st parameter.");
		return;
	}
	
	if (argc > 1)
		jsCallback = [arguments objectAtIndex:1];
	
	OCABRecord* rec = [OCABRecord newFromRecordID:recordID andAddressBook:addressBook];
	NSString* firstParam = @"";
	bool removeOk = false, saveOk = false;
	CFErrorRef errorRef;
	
	if (rec) {
		removeOk = [rec removeFrom:addressBook];
		if (removeOk) {
			saveOk = ABAddressBookSave(addressBook, &errorRef);
		}
		if (saveOk) {
			[self addressBookDirty];
			firstParam = [rec JSONValue];
		}
		[rec release];
	}
	
	if (jsCallback) {
		NSString* jsString = [[NSString alloc] initWithFormat:@"%@(%@);", jsCallback, firstParam];
		[webView stringByEvaluatingJavaScriptFromString:jsString];
		[jsString release];
	}
}

- (void) addressBookDirty
{
	[allPeople release];
	allPeople = nil;
}

- (void)dealloc
{
	ABAddressBookUnregisterExternalChangeCallback(addressBook, addressBookChanged, self);

	if (addressBook) {
		CFRelease(addressBook);
	}
	
	[allPeople release];
    [super dealloc];
}

@end

