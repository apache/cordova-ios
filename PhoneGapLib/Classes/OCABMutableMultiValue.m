//
//  OCABMutableMultiValue.m
//  PhoneGap
//
//  Created by shazron on 29/05/09.
//  Copyright 2009 Nitobi Software Inc.. All rights reserved.
//

#import <AddressBook/AddressBook.h>
#import "OCCFObject.h"
#import "OCABMutableMultiValue.h"
#import "JSON.h"

@implementation OCABMutableMultiValue

- (ABMutableMultiValueRef) ABMutableMultiValueRef
{
	return (ABMutableMultiValueRef)__baseRef;
}

- (CFIndex) count
{
	return ABMultiValueGetCount([self ABMutableMultiValueRef]);
}

- (NSString*) labelAt:(CFIndex)index
{
	return [(id)ABMultiValueCopyLabelAtIndex([self ABMutableMultiValueRef], index) autorelease];
}

- (NSString*) localizedLabelAt:(CFIndex)index
{
	return [(id)ABAddressBookCopyLocalizedLabel((CFStringRef)[self labelAt:index]) autorelease];
}

- (NSString*) valueAt:(CFIndex)index
{
	return [(id)ABMultiValueCopyValueAtIndex([self ABMutableMultiValueRef], index) autorelease];
}

- (BOOL) addValue:(CFTypeRef)value withLabel:(CFStringRef)label
{
	return ABMultiValueAddValueAndLabel([self ABMutableMultiValueRef], value, label, NULL);
}

- (NSString*) JSONValue
{
	NSMutableString* json =  [[[NSMutableString alloc] initWithString:@"[{"] autorelease];
	NSString* pair = nil;
	CFIndex count = [self count];
	
	if (count == 0) {
		return @"[]";
	}
	
	NSAutoreleasePool* pool = [[NSAutoreleasePool alloc] init]; 
	for (CFIndex i = 0; i < count; i++)
	{
		NSString* pairLabel = [[self localizedLabelAt:i] stringByReplacingOccurrencesOfString:@"\"" withString:@"\'"];
		NSString* pairValueObj = [self valueAt:i];
		NSString* pairValue = [[pairValueObj JSONFragment] stringByReplacingOccurrencesOfString:@"\"" withString:@"\'"];
		
		pair = [[[NSString alloc] initWithFormat:@"label:'%@', value: %@", pairLabel, pairValue] autorelease];
        [json appendString:pair];
		
		if (i+1 != count) {
			[json appendString:@"},{"];
		}
	}
	[pool release];

	[json appendString:@"}]"];
	return json;
}

@end
