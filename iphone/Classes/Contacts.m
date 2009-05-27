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
	// the address book, not the current one
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
	NSString* jcallback = nil;
	
	if (argc > 0) {
		jcallback = [arguments objectAtIndex:0];
	} else {
		NSLog(@"Contacts.contactsCount: Missing 1st parameter.");
		return;
	}
	
	CFIndex numberOfPeople = ABAddressBookGetPersonCount(addressBook);
	NSString* str = [[NSString alloc] initWithFormat:@"%@(%d);", jcallback, numberOfPeople];
	
    [webView stringByEvaluatingJavaScriptFromString:str];
	[str release];
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
	
	CFIndex numberOfPeople = ABAddressBookGetPersonCount(addressBook);
	CFIndex pageSize = [options integerValueForKey:@"pageSize" defaultValue:numberOfPeople withRange:NSMakeRange(1, numberOfPeople)];
	
	NSUInteger maxPages = ceil((double)numberOfPeople / (double)pageSize);
	CFIndex pageNumber = [options integerValueForKey:@"pageNumber" defaultValue:1 withRange:NSMakeRange(1, maxPages)];
	
	CFIndex skipAmount = (pageNumber - 1) * pageSize;
	CFIndex maxIndex = (skipAmount + pageSize);
	
	if (allPeople == nil) {
		allPeople = (NSArray*)ABAddressBookCopyArrayOfAllPeople(addressBook);
	}
	
	for (int i = skipAmount; i < maxIndex; i++) 
	{ 
		ABRecordRef rec = CFArrayGetValueAtIndex((CFArrayRef)allPeople, i);
		
		if (ABRecordCopyValue(rec, kABPersonFirstNameProperty) != nil && ABRecordCopyValue(rec, kABPersonLastNameProperty) != nil) 
		{
			CFStringRef firstName = ABRecordCopyValue(rec, kABPersonFirstNameProperty);
			CFStringRef lastName = ABRecordCopyValue(rec, kABPersonLastNameProperty);		
			NSMutableString* phoneArray =  [[NSMutableString alloc] initWithString:@"{"];

			CFStringRef phoneNumber, phoneNumberLabel;
			ABMutableMultiValueRef multi = ABRecordCopyValue(rec, kABPersonPhoneProperty);
			CFIndex phoneNumberCount = ABMultiValueGetCount(multi);
			
			for (CFIndex j = 0; j < phoneNumberCount; j++) {
				phoneNumberLabel = ABMultiValueCopyLabelAtIndex(multi, j); // note that this will be a general label, for you to localize yourself
				phoneNumber      = ABMultiValueCopyValueAtIndex(multi, j);
				
				NSString* pair = [[NSString alloc] initWithFormat:@"'%@':'%@'", (NSString*)phoneNumberLabel,(NSString*) phoneNumber];
				[phoneArray appendFormat:@"%@", pair];
				[pair release];

				if (j+1 != phoneNumberCount) {
					[phoneArray appendFormat:@","];
				}
				
				CFRelease(phoneNumberLabel);
				CFRelease(phoneNumber);
			}
			[phoneArray appendString:@"}"];
			
			NSString* contactStr = [[NSString alloc] initWithFormat:@"{'firstName':'%@','lastName' : '%@', 'phoneNumber':%@, 'address':'%@'}", firstName, lastName, phoneArray, @""];
			[jsArray appendFormat:@"%@", contactStr];
			
			if (i+1 != maxIndex) {
				[jsArray appendFormat:@","];
			}
			
			[contactStr release];
			CFRelease(firstName);
			CFRelease(lastName);
			CFRelease(phoneArray);
		}
	}
	
	[jsArray appendString:@"]"];
	
	NSString* jsString = [[NSString alloc] initWithFormat:@"%@(%@);", jsCallback, jsArray];
    NSLog(@"%@", jsString);

    [webView stringByEvaluatingJavaScriptFromString:jsString];
	
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
		PhoneGapDelegate* delg = (PhoneGapDelegate*)[[UIApplication sharedApplication] delegate];
		
		UIViewController* viewController = (UIViewController*)[delg viewController];
		[viewController presentModalViewController:navController animated: YES];
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
	if (person != NULL)
	{
		[self addressBookDirty];
	}
	[newPersonViewController dismissModalViewControllerAnimated:YES]; 
}

- (void) displayContact:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	NSLog(@"TODO: display contact");
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

