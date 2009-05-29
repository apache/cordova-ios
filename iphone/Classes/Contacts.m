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
#include "Categories.h"
#include "Notification.h"

@implementation ContactsPicker

@synthesize allowsEditing;

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
	NSString* jCallback = nil;
	
	if (argc > 0) {
		jCallback = [arguments objectAtIndex:0];
	} else {
		NSLog(@"Contacts.contactsCount: Missing 1st parameter.");
		return;
	}
	
	CFIndex numberOfPeople = ABAddressBookGetPersonCount(addressBook);
	NSString* jsString = [[NSString alloc] initWithFormat:@"%@(%d);", jCallback, numberOfPeople];
	
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
	
	NSString *firstName = nil, *lastName = nil, *contactJson = nil;
	NSString *phoneNumberLabel = nil, *phoneNumber = nil, *numberPair = nil;
	NSMutableString *phoneArray = nil;;
	ABMutableMultiValueRef multi;
	CFIndex phoneNumberCount, i, j;

	for (i = skipAmount; i < maxIndex; i++) 
	{ 
		ABRecordRef rec = CFArrayGetValueAtIndex(records, i);
		firstName = (NSString*)ABRecordCopyValue(rec, kABPersonFirstNameProperty);
		lastName = (NSString*)ABRecordCopyValue(rec, kABPersonLastNameProperty);		
		
		if (firstName != nil || lastName != nil) 
		{
			phoneArray =  [[NSMutableString alloc] initWithString:@"{"];
			multi = ABRecordCopyValue(rec, kABPersonPhoneProperty);
			phoneNumberCount = ABMultiValueGetCount(multi);
			
			for (j = 0; j < phoneNumberCount; j++) {
				phoneNumberLabel = (NSString*)ABMultiValueCopyLabelAtIndex(multi, j); // note that this will be a general label, for you to localize yourself
				phoneNumber      = (NSString*)ABMultiValueCopyValueAtIndex(multi, j);
				
				numberPair = [[NSString alloc] initWithFormat:@"'%@':'%@'", phoneNumberLabel, phoneNumber];
				[phoneArray appendString:numberPair];

				if (j+1 != phoneNumberCount) {
					[phoneArray appendString:@","];
				}
				
				[numberPair release];
				[phoneNumberLabel release];
				[phoneNumber release];
			}
			CFRelease(multi);
			[phoneArray appendString:@"}"];
			
			contactJson = [[NSString alloc] initWithFormat:@"{'recordID': %d,'firstName':'%@','lastName' : '%@', 'phoneNumber':%@, 'address':'%@'}", 
						   ABRecordGetRecordID(rec),
						   firstName == nil? @"" : firstName, 
						   lastName == nil? @"" : lastName, 
						   phoneArray, @""];
			[jsArray appendString:contactJson];
			
			if (i+1 != maxIndex) {
				[jsArray appendString:@","];
			}
			
			[contactJson release];
			[firstName release];
			[lastName release];
			[phoneArray release];
		}
	}
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
	NSString* firstName = nil, *lastName = nil;
	
	if (argc > 0) firstName = [arguments objectAtIndex:0];
	if (argc > 1) lastName = [arguments objectAtIndex:1];
	
	ABRecordRef rec = ABPersonCreate();
	ABRecordSetValue(rec, kABPersonFirstNameProperty, firstName , nil);
	ABRecordSetValue(rec, kABPersonLastNameProperty, lastName, nil);
	//TODO: add more items to set here, from arguments
	
	if ([options existsValue:@"true" forKey:@"gui"]) {
		ABNewPersonViewController* npController = [[[ABNewPersonViewController alloc] init] autorelease];
		
		npController.displayedPerson = rec;
		npController.addressBook = addressBook;
		npController.newPersonViewDelegate = self;

		UINavigationController *navController = [[[UINavigationController alloc] initWithRootViewController:npController] autorelease];
		[[super appViewController] presentModalViewController:navController animated: YES];
	} 
	else {
		ABAddressBookAddRecord(addressBook, rec, nil);
		ABAddressBookSave(addressBook, nil);
		[self addressBookDirty];
	}
	
	CFRelease(rec);
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
	
	if (argc > 0) {
		recordID = [[arguments objectAtIndex:0] intValue];
	} else {
		NSLog(@"Contacts.displayContact: Missing 1st parameter.");
		return;
	}
	
	bool allowsEditing = [options existsValue:@"true" forKey:@"allowsEditing"];
	
	ABRecordRef rec = ABAddressBookGetPersonWithRecordID(addressBook, recordID);
	ABPersonViewController* personController = [[[ABPersonViewController alloc] init] autorelease];
	personController.displayedPerson = rec;
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
	ContactsPicker* pickerController = [[[ContactsPicker alloc] init] autorelease];
	pickerController.peoplePickerDelegate = self;
	pickerController.allowsEditing = 	(BOOL)[options existsValue:@"true" forKey:@"allowsEditing"];
	
	[[super appViewController] presentModalViewController:pickerController animated: YES];
}

- (BOOL) peoplePickerNavigationController:(ABPeoplePickerNavigationController*)peoplePicker 
	     shouldContinueAfterSelectingPerson:(ABRecordRef)person
{
	ABPersonViewController* personController = [[[ABPersonViewController alloc] init] autorelease];
	personController.displayedPerson = person;
	personController.personViewDelegate = self;
	personController.allowsEditing = ((ContactsPicker*)peoplePicker).allowsEditing;
	
	[peoplePicker pushViewController:personController animated:YES];
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

- (void) addressBookDirty
{
	[allPeople release];
	allPeople = nil;
}

- (void)dealloc
{
	ABAddressBookUnregisterExternalChangeCallback(addressBook, addressBookChanged, self);

	if (addressBook != nil) {
		CFRelease(addressBook);
	}
	
	[allPeople release];
    [super dealloc];
}

@end

