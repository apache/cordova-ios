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
		ABRecordRef rec = CFArrayGetValueAtIndex((CFArrayRef)allPeople, i);
		
		if (ABRecordCopyValue(rec, kABPersonFirstNameProperty) != nil && ABRecordCopyValue(rec, kABPersonLastNameProperty) != nil) 
		{
			CFStringRef firstName = ABRecordCopyValue(rec, kABPersonFirstNameProperty);
			CFStringRef lastName = ABRecordCopyValue(rec, kABPersonLastNameProperty);		
			NSMutableString* phoneArray =  [[NSMutableString alloc] initWithString:@"{"];

			CFStringRef phoneNumber, phoneNumberLabel;
			ABMutableMultiValueRef multi = ABRecordCopyValue(rec, kABPersonPhoneProperty);
			CFIndex phoneNumberCount = ABMultiValueGetCount(multi);
			
			for (CFIndex i = 0; i < phoneNumberCount; i++) {
				phoneNumberLabel = ABMultiValueCopyLabelAtIndex(multi, i);
				phoneNumber      = ABMultiValueCopyValueAtIndex(multi, i);
				
				NSString* pair = [[NSString alloc] initWithFormat:@"'%@':'%@'", (NSString*)phoneNumberLabel,(NSString*) phoneNumber];
				[phoneArray appendFormat:@"%@", pair];
				[pair release];

				if (i+1 != phoneNumberCount) {
					[phoneArray appendFormat:@","];
				}
				
				CFRelease(phoneNumberLabel);
				CFRelease(phoneNumber);
			}
			[phoneArray appendString:@"}"];
			
			NSString* contactStr = [[NSString alloc] initWithFormat:@"{'firstName':'%@','lastName' : '%@', 'phoneNumber':%@, 'address':'%@'}", firstName, lastName, phoneArray, @""];
			[jsCallBack appendFormat:@"%@", contactStr];
			
			if (i+1 != numberOfPeople) {
				[jsCallBack appendFormat:@","];
			}
			
			[contactStr release];
			CFRelease(firstName);
			CFRelease(lastName);
			CFRelease(phoneArray);
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

	ABNewPersonViewController* npController = [[[ABNewPersonViewController alloc] init] autorelease];
	
	npController.displayedPerson = persona;
	npController.addressBook = addressBook;
	npController.newPersonViewDelegate = self;

	UINavigationController *navController = [[[UINavigationController alloc] initWithRootViewController:npController] autorelease];
	[[super viewController] presentModalViewController:navController animated: YES];
	
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

