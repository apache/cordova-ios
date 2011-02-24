/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 */


#import "Categories.h"
#import <math.h>

@implementation NSDictionary(com_phonegap_NSDictionary_Extension)

- (bool) existsValue:(NSString*)expectedValue forKey:(NSString*)key
{
	id val = [self valueForKey:key];
	bool exists = false;
	if (val != nil) {
		exists = [(NSString*)val compare:expectedValue options:NSCaseInsensitiveSearch] == 0;
	}
	
	return exists;
}

- (NSUInteger) integerValueForKey:(NSString*)key  defaultValue:(NSUInteger)defaultValue withRange:(NSRange)range
{

	NSUInteger value = defaultValue;
	
	NSNumber* val = [self valueForKey:key];  //value is an NSNumber
	if (val != nil) {
		value = [val unsignedIntValue];
	}
	
	// min, max checks
	value = MAX(range.location, value);
	value = MIN(range.length, value);
	
	return value;
}

/*
 *	Determine the type of object stored in a dictionary
 *	IN:
 *	(BOOL*) bString - if exists will be set to YES if object is an NSString, NO if not
 *	(BOOL*) bNull - if exists will be set to YES if object is an NSNull, NO if not
 *	(BOOL*) bArray - if exists will be set to YES if object is an NSArray, NO if not
 *	(BOOL*) bNumber - if exsists will be set to YES if object is an NSNumber, NO if not
 *
 *	OUT:
 *	YES if key exists
 *  NO if key does not exist.  Input parameters remain untouched
 *
 */

- (BOOL) typeValueForKey:(NSString *)key isArray:(BOOL*)bArray isNull:(BOOL*)bNull isNumber:(BOOL*) bNumber isString:(BOOL*)bString   
{
	BOOL bExists = YES;
	NSObject* value = [self objectForKey: key];
	if (value) {
		bExists = YES;
		if (bString)
			*bString = [value isKindOfClass: [NSString class]];
		if (bNull)
			*bNull = [value isKindOfClass: [NSNull class]];
		if (bArray)
			*bArray = [value isKindOfClass: [NSArray class]];
		if (bNumber)
			*bNumber = [value isKindOfClass:[NSNumber class]];
	}
	return bExists;
}
- (BOOL) valueForKeyIsArray:(NSString *)key
{
	BOOL bArray = NO;
	NSObject* value = [self objectForKey: key];
	if (value) {
		bArray = [value isKindOfClass: [NSArray class]];
	}
	return bArray;
}
- (BOOL) valueForKeyIsNull:(NSString *)key
{
	BOOL bNull = NO;
	NSObject* value = [self objectForKey: key];
	if (value) {
		bNull = [value isKindOfClass: [NSNull class]];
	}
	return bNull;
}
- (BOOL) valueForKeyIsString:(NSString *)key
{
	BOOL bString = NO;
	NSObject* value = [self objectForKey: key];
	if (value) {
		bString = [value isKindOfClass: [NSString class]];
	}
	return bString;
}
- (BOOL) valueForKeyIsNumber:(NSString *)key
{
	BOOL bNumber = NO;
	NSObject* value = [self objectForKey: key];
	if (value) {
		bNumber = [value isKindOfClass: [NSNumber class]];
	}
	return bNumber;
}
	
@end

