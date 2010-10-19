/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 */


@interface NSMutableDictionary(NSDictionary_Extension)

- (bool) existsValue:(NSString*)expectedValue forKey:(NSString*)key;
- (NSUInteger) integerValueForKey:(NSString*)key defaultValue:(NSUInteger)defaultValue withRange:(NSRange)range;

@end
