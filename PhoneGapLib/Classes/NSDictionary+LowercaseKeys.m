//
//  NSDictionary+LowercaseKeys.m
//  PhoneGapLib
//
//  Created by Shazron Abdullah on 12-01-17.

#import "NSDictionary+LowercaseKeys.h"

#pragma mark -

@implementation NSDictionary (LowercaseKeys)

- (NSDictionary*) dictionaryWithLowercaseKeys 
{
    NSMutableDictionary* result = [NSMutableDictionary dictionaryWithCapacity:self.count];
    NSString* key;
    
    for (key in self) {
        [result setObject:[self objectForKey:key] forKey:[key lowercaseString]];
    }
    
    return result;
}

@end
