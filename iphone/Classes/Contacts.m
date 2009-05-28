/*
 *  Contact.m
 *
 *  Created by Nitobi on 2/3/09
 *  Copyright 2008 Nitobi. All rights reserved.
 *  Rob Ellis rob.ellis@nitobi.com
 *  Shazron Abdullah shazron@nitobi.com
 *
 */

#import <AddressBook/AddressBook.h>
#import <AddressBookUI/ABNewPersonViewController.h>
#import <UIKit/UIApplication.h>
#import "Contacts.h"
#import "PhoneGapDelegate.h"
#include "Categories.h"

@implementation Contacts

void addressBookChanged(ABAddressBookRef addressBook, CFDictionaryRef info, void* context)
{
	// note that this function is only called when another AddressBook instance modifies 
	// the address book, not the current one. For example, through a MobileMe sync
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
	
	NSString* firstName = nil, *lastName = nil, *contactJson = nil;
	NSString* phoneNumberLabel = nil, *phoneNumber = nil, *numberPair = nil;
	NSMutableString* phoneArray = nil;;
	ABMutableMultiValueRef multi;

	for (int i = skipAmount; i < maxIndex; i++) 
	{ 
		ABRecordRef rec = CFArrayGetValueAtIndex(records, i);
		
		if (ABRecordCopyValue(rec, kABPersonFirstNameProperty) != nil && ABRecordCopyValue(rec, kABPersonLastNameProperty) != nil) 
		{
			firstName = (NSString*)ABRecordCopyValue(rec, kABPersonFirstNameProperty);
			lastName = (NSString*)ABRecordCopyValue(rec, kABPersonLastNameProperty);		
			phoneArray =  [[NSMutableString alloc] initWithString:@"{"];

			multi = ABRecordCopyValue(rec, kABPersonPhoneProperty);
			CFIndex phoneNumberCount = ABMultiValueGetCount(multi);
			
			for (CFIndex j = 0; j < phoneNumberCount; j++) {
				phoneNumberLabel = (NSString*)ABMultiValueCopyLabelAtIndex(multi, j); // note that this will be a general label, for you to localize yourself
				phoneNumber      = (NSString*)ABMultiValueCopyValueAtIndex(multi, j);
				
				numberPair = [[NSString alloc] initWithFormat:@"'%@':'%@'", (NSString*)phoneNumberLabel,(NSString*) phoneNumber];
				[phoneArray appendString:numberPair];

				if (j+1 != phoneNumberCount) {
					[phoneArray appendString:@","];
				}
				
				[numberPair release];
				[phoneNumberLabel release];
				[phoneNumber release];
				CFRelease(multi);
			}
			[phoneArray appendString:@"}"];
			
			contactJson = [[NSString alloc] initWithFormat:@"{'firstName':'%@','lastName' : '%@', 'phoneNumber':%@, 'address':'%@'}", firstName, lastName, phoneArray, @""];
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
	
	ABRecordRef persona = ABPersonCreate();
	ABRecordSetValue(persona, kABPersonFirstNameProperty, firstName , nil);
	ABRecordSetValue(persona, kABPersonLastNameProperty, lastName, nil);
	//TODO: add more items to set here, from arguments
	
	if ([options existsValue:@"true" forKey:@"gui"]) {
		ABNewPersonViewController* npController = [[[ABNewPersonViewController alloc] init] autorelease];
		
		npController.displayedPerson = persona;
		npController.addressBook = addressBook;
		npController.newPersonViewDelegate = self;

		UINavigationController *navController = [[[UINavigationController alloc] initWithRootViewController:npController] autorelease];
		[[super appViewController] presentModalViewController:navController animated: YES];
	} 
	else {
		ABAddressBookAddRecord(addressBook, persona, nil);
		ABAddressBookSave(addressBook, nil);
		[self addressBookDirty];
	}
	
	CFRelease(persona);
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
}

- (void) addressBookDirty
{
	[allPeople release];
	allPeople = nil;
}

- (void)dealloc
{
	ABAddressBookUnregisterExternalChangeCallback(addressBook, addressBookChanged, self);

	if (addressBook == nil) {
		CFRelease(addressBook);
	}
	
	[allPeople release];
    [super dealloc];
}

@end

