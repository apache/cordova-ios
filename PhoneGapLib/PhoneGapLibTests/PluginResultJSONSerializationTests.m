/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Created by David Hu on 9/1/11.
 * Copyright (c) 2005-2011, Nitobi Software Inc.
 */

#import <Foundation/Foundation.h>
#import "PluginResultJSONSerializationTests.h"
#import "PluginResult.h"
#import "JSON.h"

@implementation PluginResultJSONSerializationTests

- (void)testSerializingMessageAsInt {
    PluginResult *result = [PluginResult resultWithStatus:PGCommandStatus_OK messageAsInt:5];
    NSDictionary *dic = [[result toJSONString] JSONFragmentValue];
    NSNumber *message = [dic objectForKey:@"message"];
    STAssertTrue([[NSNumber numberWithInt:5] isEqual:message], nil);
}

- (void)testSerializingMessageAsDouble {
    PluginResult *result = [PluginResult resultWithStatus:PGCommandStatus_OK messageAsDouble:5.5];
    NSDictionary *dic = [[result toJSONString] JSONFragmentValue];
    NSNumber *message = [dic objectForKey:@"message"];
    STAssertTrue([[NSNumber numberWithDouble:5.5] isEqual:message], nil);
}

- (void)testSerializingMessageAsArray {
    NSArray *testValues = [NSArray arrayWithObjects:
                           [NSNull null],
                           @"string",
                           [NSNumber numberWithInt:5],
                           [NSNumber numberWithDouble:5.5],
                           [NSNumber numberWithBool:true],
                           nil];
    
    PluginResult *result = [PluginResult resultWithStatus:PGCommandStatus_OK messageAsArray:testValues];
    NSDictionary *dic = [[result toJSONString] JSONFragmentValue];
    NSArray *message = [dic objectForKey:@"message"];

    STAssertTrue([message isKindOfClass:[NSArray class]], nil);
    STAssertTrue([testValues count] == [message count], nil);

    for (NSInteger i = 0; i < [testValues count]; i++) {
        STAssertTrue([[testValues objectAtIndex:i] isEqual:[message objectAtIndex:i]], nil);
    }
}

- (void)testSerializingMessageAsStringContainingQuotes {
    NSString *quotedString = @"\"quoted\"";
    PluginResult *result = [PluginResult resultWithStatus:PGCommandStatus_OK messageAsString:quotedString];
    NSDictionary *dic = [[result toJSONString] JSONFragmentValue];
    NSString *message = [dic objectForKey:@"message"];
    STAssertTrue([quotedString isEqual:message], nil);
}

- (void)testSerializingMessageAsStringThatIsNil {
    NSString *nilString = nil;
    PluginResult *result = [PluginResult resultWithStatus:PGCommandStatus_OK messageAsString:nilString];
    NSDictionary *dic = [[result toJSONString] JSONFragmentValue];
    NSString *message = [dic objectForKey:@"message"];
    STAssertTrue([[NSNull null] isEqual:message], nil);    
}

@end
