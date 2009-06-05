//
//  Categories.h
//  PhoneGap
//
//  Created by Shazron Abdullah on 26/05/09.
//  Copyright 2009 Nitobi Software. All rights reserved.
//


@interface NSMutableDictionary(NSDictionary_Extension)

- (bool) existsValue:(NSString*)expectedValue forKey:(NSString*)key;
- (NSUInteger) integerValueForKey:(NSString*)key defaultValue:(NSUInteger)defaultValue withRange:(NSRange)range;

@end
