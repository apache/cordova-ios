/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 */

#import <Foundation/Foundation.h>

@interface NSDictionary(com_phonegap_NSDictionary_Extension)

- (bool) existsValue:(NSString*)expectedValue forKey:(NSString*)key;
- (NSInteger) integerValueForKey:(NSString*)key defaultValue:(NSInteger)defaultValue withRange:(NSRange)range;
- (BOOL) typeValueForKey:(NSString *)key isArray:(BOOL*)bArray isNull:(BOOL*)bNull isNumber:(BOOL*) bNumber isString:(BOOL*)bString;
- (BOOL) valueForKeyIsArray:(NSString *)key;
- (BOOL) valueForKeyIsNull:(NSString *)key;
- (BOOL) valueForKeyIsString:(NSString *)key;
- (BOOL) valueForKeyIsNumber:(NSString *)key;
@end


