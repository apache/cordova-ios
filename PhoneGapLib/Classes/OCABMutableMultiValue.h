/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 */

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
