//
//  OCCFObject.m
//  PhoneGap
//
//  Created by shazron on 28/05/09.
//  Copyright 2009 Nitobi Software Inc. All rights reserved.
//

#import "OCCFObject.h"

@implementation OCCFObject


- initWithCFTypeRef:(CFTypeRef)ref;
{
	if (ref){
		__baseRef = ref;
		CFRetain(ref);
	} else {
		[self autorelease];
		self = nil;
	}
	
	return self;
}

- (void) dealloc
{
	if (__baseRef) 
	{
		CFRelease(__baseRef);
	}
	[super dealloc];
}

- (CFTypeRef) CFTypeRef;
{
	return __baseRef;
}

- (void) release
{
	[super release];
}

- (id) retain
{
	return [super retain];
}

- (id) autorelease
{
	return [super autorelease];
}

- (BOOL)isEqual:(id)object;
{
	BOOL result = (object == self);
	
	if (!result && [object respondsToSelector:@selector(CFTypeRef)])
	{
		result = CFEqual(__baseRef, [object CFTypeRef]);
	}
	
	return result;
}

@end
