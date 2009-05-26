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
#import "Contacts.h"

@implementation Contacts

-(PhoneGapCommand*) initWithWebView:(UIWebView*)theWebView settings:(NSDictionary*)theSettings andViewController:(UIViewController*)theViewController
{
    self = (Contacts*)[super initWithWebView:(UIWebView*)theWebView settings:theSettings andViewController:theViewController];
    if (self) {
        addressBook = ABAddressBookCreate();
		allPeople = nil;
    }
	return self;
}

- (void) getAllContacts:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	NSMutableString* jsCallBack = [[NSMutableString alloc] init];
	[jsCallBack appendString:@"var _contacts=["];
	
	CFIndex numberOfPeople = ABAddressBookGetPersonCount(addressBook);
	
	if (allPeople == nil) {
		allPeople = (NSArray*)ABAddressBookCopyArrayOfAllPeople(addressBook);
	}
	
	for (int i = 0; i < numberOfPeople; i++) 
	{ 
		ABRecordRef ref = CFArrayGetValueAtIndex((CFArrayRef)allPeople, i);
		
		if (ABRecordCopyValue(ref, kABPersonFirstNameProperty) != nil && ABRecordCopyValue(ref, kABPersonLastNameProperty) != nil) 
		{
			CFStringRef firstName = ABRecordCopyValue(ref, kABPersonFirstNameProperty);
			CFStringRef lastName = ABRecordCopyValue(ref, kABPersonLastNameProperty);			
			CFStringRef phoneNumber = ABMultiValueCopyValueAtIndex(ABRecordCopyValue(ref,kABPersonPhoneProperty) ,0);
			
			NSString *contactFirstLast = [[NSString alloc] initWithFormat:@"%@ %@",firstName, lastName];
			NSString *contactFirstLast2 = [[NSString alloc] initWithFormat:@"{'name':'%@','phone':'%@'}",contactFirstLast,phoneNumber];
			[jsCallBack appendFormat:@"%@", contactFirstLast2];
			
			if (i+1 != numberOfPeople) {
				[jsCallBack appendFormat:@","];
			}
			
			[contactFirstLast release];
			[contactFirstLast2 release];
			CFRelease(firstName);
			CFRelease(lastName);
			CFRelease(phoneNumber);
		}
	}
	
	[jsCallBack appendString:@"];"];
	
    NSLog(@"%@", jsCallBack);
    [webView stringByEvaluatingJavaScriptFromString:jsCallBack];
	
	[jsCallBack release];
}

- (void) newContact:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
{	
	NSString* firstName = [arguments objectAtIndex:0];
	NSString* lastName = [arguments objectAtIndex:1];
	
	ABRecordRef persona = ABPersonCreate();
	ABRecordSetValue(persona, kABPersonFirstNameProperty, firstName , nil);
	ABRecordSetValue(persona, kABPersonLastNameProperty, lastName, nil);

	ABNewPersonViewController* npController = [[ABNewPersonViewController alloc] init];
	npController.displayedPerson = persona;
	npController.addressBook = addressBook;
	npController.newPersonViewDelegate = self;
	[[super viewController] presentModalViewController:npController animated: YES];
	
	CFRelease(persona);
}

- (void) newPersonViewController:(ABNewPersonViewController *)newPersonViewController didCompleteWithNewPerson:(ABRecordRef)person
{
	if (person != NULL)
	{
		//TODO: write person record to Javascript?? It is already saved before reaching this point.
	}
	[newPersonViewController dismissModalViewControllerAnimated:YES]; 
}

- (void) displayContact:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	NSLog(@"TODO: display contact");
}

- (void)dealloc
{
	if (addressBook == nil) {
		CFRelease(addressBook);
	}
	
	[allPeople release];
    [super dealloc];
}

@end
