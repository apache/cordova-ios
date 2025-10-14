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

#import <XCTest/XCTest.h>
#import <Cordova/CDVSettingsDictionary.h>

static NSDictionary *testSettings;

@interface CDVSettingsDictionary (Testing)
// Not actually implemented, but should forward to the internal dictionary
- (void)removeObjectForKey:(NSString *)key;
@end

@interface CDVSettingsDictionaryTests : XCTestCase
@end

@implementation CDVSettingsDictionaryTests

- (void)setUp
{
    [super setUp];

    testSettings = @{
        @"test": @"CDVSettingsDictionary Test",
        @"minimumfontsize": @1.1,
        @"disallowoverscroll": @YES,
        @"mediatypesrequiringuseractionforplayback": @"all"
    };
}

- (void)tearDown
{
    [super tearDown];
}

- (void)testEmptyInit
{
    CDVSettingsDictionary *dict = [[CDVSettingsDictionary alloc] init];

    XCTAssertEqual(0, dict.count, @"Newly initialized settings dictionary is not empty");
    XCTAssertEqualObjects(@[], [dict allKeys], @"Newly initialized settings dictionary had keys");
    XCTAssertEqualObjects(@[], [dict allValues], @"Newly initialized settings dictionary had values");
    XCTAssertNil([dict objectForKey:@"Test"], @"Value found with objectForKey:");
    XCTAssertNil([dict cordovaSettingForKey:@"Test"], @"Value found with objectForKey:");
}

- (void)testInitWithDictionary
{
    CDVSettingsDictionary *dict = [[CDVSettingsDictionary alloc] initWithDictionary:testSettings];

    XCTAssertEqual(4, dict.count, @"Incorrect dictionary length");
    XCTAssertEqual(4, [[dict allKeys] count], @"Incorrect number of keys");
    XCTAssertEqual(4, [[dict allValues] count], @"Incorrect number of values");
    XCTAssertNotNil([dict objectForKey:@"Test"], @"Value not found with objectForKey:");
    XCTAssertNotNil([dict cordovaSettingForKey:@"Test"], @"Value not found with objectForKey:");
    XCTAssertTrue([dict isEqualToDictionary:testSettings], @"Not equal to creating dictionary");
}

- (void)testInitWithCoder
{
    CDVSettingsDictionary *dict = [[CDVSettingsDictionary alloc] initWithDictionary:testSettings];

    NSError *err = nil;
    NSData *data = [NSKeyedArchiver archivedDataWithRootObject:dict requiringSecureCoding:YES error:&err];
    XCTAssertNil(err);

    NSSet<Class> *classes = [NSSet setWithArray:@[
      CDVSettingsDictionary.class,
      NSNumber.class,
      NSString.class,
    ]];

    err = nil;
    id result = [NSKeyedUnarchiver unarchivedObjectOfClasses:classes fromData:data error:&err];
    XCTAssertNil(err);

    XCTAssertTrue([dict isEqualToDictionary:result], @"Not equal to creating dictionary");
}

- (void)testInitWithObjectsForKeys
{
    CDVSettingsDictionary* dict = [[CDVSettingsDictionary alloc] initWithObjects:[testSettings allValues] forKeys:[testSettings allKeys]];
    XCTAssertTrue([dict isEqualToDictionary:testSettings], @"Not equal to creating dictionary");
}

- (void)testCreateWithDictionary
{
    CDVSettingsDictionary *dict = [CDVSettingsDictionary dictionaryWithDictionary:testSettings];
    XCTAssertTrue([dict isEqualToDictionary:testSettings], @"Not equal to creating dictionary");
}

- (void)testKeyAccessCaseInsensitive
{
    CDVSettingsDictionary* dict = [[CDVSettingsDictionary alloc] initWithDictionary:testSettings];

    XCTAssertEqualObjects(@YES, [dict objectForKey:@"DisallowOverscroll"], @"Uppercase key name failed to match");
    XCTAssertEqualObjects(@YES, [dict objectForKey:@"disallowoverscroll"], @"Lowercase key name failed to match");

    XCTAssertEqualObjects(@YES, [dict cordovaSettingForKey:@"DisallowOverscroll"], @"Uppercase key name failed to match");
    XCTAssertEqualObjects(@YES, [dict cordovaSettingForKey:@"disallowoverscroll"], @"Lowercase key name failed to match");

    XCTAssertEqualObjects(@YES, dict[@"DisallowOverscroll"], @"Uppercase key name failed to match");
    XCTAssertEqualObjects(@YES, dict[@"disallowoverscroll"], @"Lowercase key name failed to match");
}

- (void)testSetObjectForKeyCaseInsensitive
{
    CDVSettingsDictionary *dict = [[CDVSettingsDictionary alloc] init];

    [dict setObject:@NO forKey:@"AllowInlineMediaPlayback"];
    XCTAssertEqualObjects(@NO, [dict objectForKey:@"AllowInlineMediaPlayback"], @"Uppercase key name failed to match");
    XCTAssertEqualObjects(@NO, [dict objectForKey:@"allowinlinemediaplayback"], @"Lowercase key name failed to match");

    [dict setObject:@YES forKey:@"allowinlinemediaplayback"];
    XCTAssertEqualObjects(@YES, [dict cordovaSettingForKey:@"AllowInlineMediaPlayback"], @"Uppercase key name failed to match");
    XCTAssertEqualObjects(@YES, [dict cordovaSettingForKey:@"allowinlinemediaplayback"], @"Lowercase key name failed to match");

    XCTAssertEqual(1, dict.count, @"Incorrect dictionary length");
}

- (void)testSetCordovaSettingForKeyCaseInsensitive
{
    CDVSettingsDictionary *dict = [[CDVSettingsDictionary alloc] init];

    [dict setCordovaSetting:@NO forKey:@"AllowInlineMediaPlayback"];
    XCTAssertEqualObjects(@NO, [dict cordovaSettingForKey:@"AllowInlineMediaPlayback"], @"Uppercase key name failed to match");
    XCTAssertEqualObjects(@NO, [dict cordovaSettingForKey:@"allowinlinemediaplayback"], @"Lowercase key name failed to match");

    [dict setCordovaSetting:@YES forKey:@"allowinlinemediaplayback"];
    XCTAssertEqualObjects(@YES, [dict objectForKey:@"AllowInlineMediaPlayback"], @"Uppercase key name failed to match");
    XCTAssertEqualObjects(@YES, [dict objectForKey:@"allowinlinemediaplayback"], @"Lowercase key name failed to match");

    XCTAssertEqual(1, dict.count, @"Incorrect dictionary length");
}

- (void)testSubscriptSetForKeyCaseInsensitive
{
    CDVSettingsDictionary *dict = [[CDVSettingsDictionary alloc] init];

    dict[@"AllowInlineMediaPlayback"] = @NO;
    XCTAssertEqualObjects(@NO, [dict cordovaSettingForKey:@"AllowInlineMediaPlayback"], @"Uppercase key name failed to match");
    XCTAssertEqualObjects(@NO, [dict cordovaSettingForKey:@"allowinlinemediaplayback"], @"Lowercase key name failed to match");

    dict[@"allowinlinemediaplayback"] = @YES;
    XCTAssertEqualObjects(@YES, [dict objectForKey:@"AllowInlineMediaPlayback"], @"Uppercase key name failed to match");
    XCTAssertEqualObjects(@YES, [dict objectForKey:@"allowinlinemediaplayback"], @"Lowercase key name failed to match");

    XCTAssertEqual(1, dict.count, @"Incorrect dictionary length");
}

- (void)testMessageForwardingToDictionary
{
    CDVSettingsDictionary *dict = [[CDVSettingsDictionary alloc] initWithDictionary:testSettings];

    XCTAssertEqual(4, dict.count, @"Incorrect dictionary length");
    [dict removeObjectForKey:@"test"];
    XCTAssertEqual(3, dict.count, @"Incorrect dictionary length after removal");
}

- (void)testGetWithBoolDefaultValue
{
    CDVSettingsDictionary *dict = [[CDVSettingsDictionary alloc] initWithDictionary:@{
        @"btruthy": @YES,
        @"bfalsy": @NO,
        @"itruthy": @1,
        @"ifalsy": @0,
        @"struthy": @"true",
        @"sfalsy": @"false",
        @"sbtruthy": @"yes",
        @"sbfalsy": @"no",
        @"sitruthy": @"1",
        @"sifalsy": @"0",

        @"nonbool": @"some string"
    }];

    XCTAssertTrue([dict cordovaBoolSettingForKey:@"bTruthy" defaultValue:NO]);
    XCTAssertTrue([dict cordovaBoolSettingForKey:@"iTruthy" defaultValue:NO]);
    XCTAssertTrue([dict cordovaBoolSettingForKey:@"sTruthy" defaultValue:NO]);
    XCTAssertTrue([dict cordovaBoolSettingForKey:@"sbTruthy" defaultValue:NO]);
    XCTAssertTrue([dict cordovaBoolSettingForKey:@"siTruthy" defaultValue:NO]);

    XCTAssertFalse([dict cordovaBoolSettingForKey:@"bFalsy" defaultValue:YES]);
    XCTAssertFalse([dict cordovaBoolSettingForKey:@"iFalsy" defaultValue:YES]);
    XCTAssertFalse([dict cordovaBoolSettingForKey:@"sFalsy" defaultValue:YES]);
    XCTAssertFalse([dict cordovaBoolSettingForKey:@"sbFalsy" defaultValue:YES]);
    XCTAssertFalse([dict cordovaBoolSettingForKey:@"siFalsy" defaultValue:YES]);

    XCTAssertTrue([dict cordovaBoolSettingForKey:@"nonBool" defaultValue:YES]);
    XCTAssertTrue([dict cordovaBoolSettingForKey:@"nonExistentKey" defaultValue:YES]);

    XCTAssertFalse([dict cordovaBoolSettingForKey:@"nonBool" defaultValue:NO]);
    XCTAssertFalse([dict cordovaBoolSettingForKey:@"nonExistentKey" defaultValue:NO]);
}

- (void)testGetWithFloatDefaultValue
{
    CDVSettingsDictionary *dict = [[CDVSettingsDictionary alloc] initWithDictionary:@{
        @"floatvalue": @3.14,
        @"nonfloat": @"some string",
        @"boolvalue": @YES
    }];

    XCTAssertEqualWithAccuracy(3.14, [dict cordovaFloatSettingForKey:@"FloatValue" defaultValue:0.0], 0.001);

    // NSString floatValue always returns 0.0 for non-numeric strings
    XCTAssertEqualWithAccuracy(0.0, [dict cordovaFloatSettingForKey:@"nonFloat" defaultValue:0.0], 0.001);
    XCTAssertEqualWithAccuracy(0.0, [dict cordovaFloatSettingForKey:@"nonFloat" defaultValue:1.0], 0.001);

    // NSBoolean floatValue converts YES to 1.0
    XCTAssertEqualWithAccuracy(1.0, [dict cordovaFloatSettingForKey:@"BoolValue" defaultValue:0.0], 0.001);

    XCTAssertEqualWithAccuracy(0.0, [dict cordovaFloatSettingForKey:@"NonExistentKey" defaultValue:0.0], 0.001);
    XCTAssertEqualWithAccuracy(1.0, [dict cordovaFloatSettingForKey:@"NonExistentKey" defaultValue:1.0], 0.001);
}

@end
