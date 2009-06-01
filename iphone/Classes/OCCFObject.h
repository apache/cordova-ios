//
//  OCCFObject.h
//  PhoneGap
//
//  Created by shazron on 28/05/09.
//  Copyright 2009 Nitobi Software Inc.. All rights reserved.
//

@interface OCCFObject : NSObject {
	CFTypeRef __baseRef;
}

- initWithCFTypeRef:(CFTypeRef)ref;
- (CFTypeRef) CFTypeRef;
- (BOOL) isEqual:other;

@end
