/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 */


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
