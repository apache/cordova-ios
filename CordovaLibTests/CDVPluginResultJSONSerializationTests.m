/*
 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
 */

#import <Foundation/Foundation.h>
#import <XCTest/XCTest.h>

#import "CDVPluginResult.h"
#import "CDVJSON.h"

@interface CDVPluginResultJSONSerializationTests : XCTestCase
@end

@implementation CDVPluginResultJSONSerializationTests

- (void)testSerializingMessageAsInt
{
    int val = 5;
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsInt:val];
    NSString* argJson = [[result argumentsAsJSON] stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];

    XCTAssertTrue([[NSNumber numberWithInt:val] isEqual:@([argJson intValue])]);
}

- (void)testSerializingMessageAsDouble
{
    double val = 5.5;
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDouble:val];
    NSString* argJson = [[result argumentsAsJSON] stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];

    XCTAssertTrue([[NSNumber numberWithDouble:val] isEqual:@([argJson doubleValue])]);
}

- (void)testSerializingMessageAsBool
{
    BOOL val = YES;
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool:val];
    NSString* argJson = [[result argumentsAsJSON] stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];

    XCTAssertTrue([[NSNumber numberWithBool:val] isEqual:@([argJson boolValue])]);
}

- (void)testSerializingMessageAsArray
{
    NSArray* testValues = [NSArray arrayWithObjects:
        [NSNull null],
        @"string",
        [NSNumber numberWithInt:5],
        [NSNumber numberWithDouble:5.5],
        [NSNumber numberWithBool:true],
        nil];

    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsArray:testValues];
    NSArray* arr = [[result argumentsAsJSON] JSONObject];

    XCTAssertTrue([arr isKindOfClass:[NSArray class]]);
    XCTAssertTrue([testValues count] == [arr count]);

    for (NSInteger i = 0; i < [testValues count]; i++) {
        XCTAssertTrue([[testValues objectAtIndex:i] isEqual:[arr objectAtIndex:i]]);
    }
}

- (void)__testDictionary:(NSDictionary*)dictA withDictionary:(NSDictionary*)dictB
{
    XCTAssertTrue([dictA isKindOfClass:[NSDictionary class]]);
    XCTAssertTrue([dictB isKindOfClass:[NSDictionary class]]);

    XCTAssertTrue([[dictA allKeys] count] == [[dictB allKeys] count]);

    for (NSInteger i = 0; i < [dictA count]; i++) {
        id keyA = [[dictA allKeys] objectAtIndex:i];
        id objA = [dictA objectForKey:keyA];
        id objB = [dictB objectForKey:keyA];

        XCTAssertTrue([[dictB allKeys] containsObject:keyA]); // key exists
        if ([objA isKindOfClass:[NSDictionary class]]) {
            [self __testDictionary:objA withDictionary:objB];
        } else {
            XCTAssertTrue([objA isEqual:objB]); // key's value equality
        }
    }
}

- (void)testSerializingMessageAsDictionary
{
    NSMutableDictionary* testValues = [NSMutableDictionary dictionaryWithObjectsAndKeys:
        [NSNull null], @"nullItem",
        @"string", @"stringItem",
        [NSNumber numberWithInt:5], @"intItem",
        [NSNumber numberWithDouble:5.5], @"doubleItem",
        [NSNumber numberWithBool:true], @"boolItem",
        nil];

    NSDictionary* nestedDict = [testValues copy];

    [testValues setValue:nestedDict forKey:@"nestedDict"];

    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:testValues];
    NSDictionary* dic = [[result argumentsAsJSON] JSONObject];

    [self __testDictionary:testValues withDictionary:dic];
}

- (void)testSerializingMessageAsErrorCode
{
    NSMutableDictionary* testValues = [NSMutableDictionary dictionaryWithObjectsAndKeys:
        [NSNumber numberWithInt:1], @"code",
        nil];

    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageToErrorObject:1];
    NSDictionary* dic = [[result argumentsAsJSON] JSONObject];

    [self __testDictionary:testValues withDictionary:dic];
}

- (void)testSerializingMessageAsStringContainingQuotes
{
    NSString* quotedString = @"\"quoted\"";
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:quotedString];
    NSString* argJson = [[result argumentsAsJSON] stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];

    // argJson here will return this will "\"quoted\""
    // TODO: obviously this is ok when passing to JavaScript, but will fail this test

    XCTAssertTrue([quotedString isEqual:argJson]);
}

- (void)testSerializingMessageAsStringThatIsNil
{
    NSString* nilString = nil;
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:nilString];
    NSString* argJson = [[result argumentsAsJSON] stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];

    XCTAssertTrue([@"null" isEqual: argJson]);
}

@end
