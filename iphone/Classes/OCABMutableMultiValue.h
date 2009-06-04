//
//  OCABMutableMultiValue.h
//  PhoneGap
//
//  Created by shazron on 29/05/09.
//  Copyright 2009 Nitobi Software Inc.. All rights reserved.
//

@class OCCFObject;

@interface OCABMutableMultiValue : OCCFObject {

}

- (ABMutableMultiValueRef) ABMutableMultiValueRef;
- (CFIndex) count;

- (NSString*) labelAt:(CFIndex)index;
- (NSString*) localizedLabelAt:(CFIndex)index;
- (NSString*) valueAt:(CFIndex)index;
- (BOOL) addValue:(CFTypeRef)value withLabel:(CFStringRef)label;

- (NSString*) JSONValue;

@end
