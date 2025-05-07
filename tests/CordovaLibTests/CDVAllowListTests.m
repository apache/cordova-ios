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

#import "CDVAllowList.h"
#import "CDVIntentAndNavigationFilter.h"

@interface CDVAllowListTests : XCTestCase
@end

@implementation CDVAllowListTests

- (void)setUp
{
    [super setUp];

    // setup code here
}

- (void)tearDown
{
    // Tear-down code here.

    [super tearDown];
}

- (void)testAllowedSchemes
{
    NSArray* allowedHosts = [NSArray arrayWithObjects:
        @"*.apache.org",
        nil];

    CDVAllowList* allowList = [[CDVAllowList alloc] initWithArray:allowedHosts];

    XCTAssertTrue([allowList schemeIsAllowed:@"http"]);
    XCTAssertTrue([allowList schemeIsAllowed:@"https"]);
    XCTAssertTrue([allowList schemeIsAllowed:@"ftp"]);
    XCTAssertTrue([allowList schemeIsAllowed:@"ftps"]);
    XCTAssertFalse([allowList schemeIsAllowed:@"gopher"]);
}

- (void)testSubdomainWildcard
{
    NSArray* allowedHosts = [NSArray arrayWithObjects:
        @"*.apache.org",
        nil];

    CDVAllowList* allowList = [[CDVAllowList alloc] initWithArray:allowedHosts];

    XCTAssertTrue([allowList URLIsAllowed:[NSURL URLWithString:@"http://build.apache.org"]]);
    XCTAssertTrue([allowList URLIsAllowed:[NSURL URLWithString:@"http://apache.org"]]);
    XCTAssertTrue([allowList URLIsAllowed:[NSURL URLWithString:@"http://sub1.sub0.build.apache.org"]]);
    XCTAssertFalse([allowList URLIsAllowed:[NSURL URLWithString:@"http://apache.org.ca"]]);
}

- (void)testCatchallWildcardOnly
{
    NSArray* allowedHosts = [NSArray arrayWithObjects:
        @"*",
        nil];

    CDVAllowList* allowList = [[CDVAllowList alloc] initWithArray:allowedHosts];

    XCTAssertTrue([allowList URLIsAllowed:[NSURL URLWithString:@"http://apache.org"]]);
    XCTAssertTrue([allowList URLIsAllowed:[NSURL URLWithString:@"https://build.apache.prg"]]);
    XCTAssertTrue([allowList URLIsAllowed:[NSURL URLWithString:@"ftp://MyDangerousSite.org"]]);
    XCTAssertTrue([allowList URLIsAllowed:[NSURL URLWithString:@"ftps://apache.org.SuspiciousSite.com"]]);
    XCTAssertTrue([allowList URLIsAllowed:[NSURL URLWithString:@"gopher://apache.org"]]);
}

- (void)testURISchemesNotFollowedByDoubleSlashes
{
    NSArray* allowedHosts = [NSArray arrayWithObjects:
                             @"tel:*",
                             @"sms:*",
                             nil];

    CDVAllowList* allowList = [[CDVAllowList alloc] initWithArray:allowedHosts];

    XCTAssertTrue([allowList URLIsAllowed:[NSURL URLWithString:@"tel:1234567890"]]);
    XCTAssertTrue([allowList URLIsAllowed:[NSURL URLWithString:@"sms:1234567890"]]);
}

- (void)testCatchallWildcardByProto
{
    NSArray* allowedHosts = [NSArray arrayWithObjects:
        @"http://*",
        @"https://*",
        @"ftp://*",
        @"ftps://*",
        nil];

    CDVAllowList* allowList = [[CDVAllowList alloc] initWithArray:allowedHosts];

    XCTAssertTrue([allowList URLIsAllowed:[NSURL URLWithString:@"http://apache.org"]]);
    XCTAssertTrue([allowList URLIsAllowed:[NSURL URLWithString:@"https://build.apache.prg"]]);
    XCTAssertTrue([allowList URLIsAllowed:[NSURL URLWithString:@"ftp://MyDangerousSite.org"]]);
    XCTAssertTrue([allowList URLIsAllowed:[NSURL URLWithString:@"ftps://apache.org.SuspiciousSite.com"]]);
    XCTAssertFalse([allowList URLIsAllowed:[NSURL URLWithString:@"gopher://apache.org"]]);
}

- (void)testExactMatch
{
    NSArray* allowedHosts = [NSArray arrayWithObjects:
        @"www.apache.org",
        nil];

    CDVAllowList* allowList = [[CDVAllowList alloc] initWithArray:allowedHosts];

    XCTAssertTrue([allowList URLIsAllowed:[NSURL URLWithString:@"http://www.apache.org"]]);
    XCTAssertFalse([allowList URLIsAllowed:[NSURL URLWithString:@"http://build.apache.org"]]);
    XCTAssertFalse([allowList URLIsAllowed:[NSURL URLWithString:@"http://apache.org"]]);
}

- (void)testNoMatchInQueryParam
{
    NSArray* allowedHosts = [NSArray arrayWithObjects:
        @"www.apache.org",
        nil];

    CDVAllowList* allowList = [[CDVAllowList alloc] initWithArray:allowedHosts];

    XCTAssertFalse([allowList URLIsAllowed:[NSURL URLWithString:@"www.malicious-site.org?url=http://www.apache.org"]]);
    XCTAssertFalse([allowList URLIsAllowed:[NSURL URLWithString:@"www.malicious-site.org?url=www.apache.org"]]);
}

- (void)testIpExactMatch
{
    NSArray* allowedHosts = [NSArray arrayWithObjects:
        @"192.168.1.1",
        @"192.168.2.1",
        nil];

    CDVAllowList* allowList = [[CDVAllowList alloc] initWithArray:allowedHosts];

    XCTAssertFalse([allowList URLIsAllowed:[NSURL URLWithString:@"http://apache.org"]]);
    XCTAssertTrue([allowList URLIsAllowed:[NSURL URLWithString:@"http://192.168.1.1"]]);
    XCTAssertTrue([allowList URLIsAllowed:[NSURL URLWithString:@"http://192.168.2.1"]]);
    XCTAssertFalse([allowList URLIsAllowed:[NSURL URLWithString:@"http://192.168.3.1"]]);
}

- (void)testIpWildcardMatch
{
    NSArray* allowedHosts = [NSArray arrayWithObjects:
        @"192.168.1.*",
        @"192.168.2.*",
        nil];

    CDVAllowList* allowList = [[CDVAllowList alloc] initWithArray:allowedHosts];

    XCTAssertFalse([allowList URLIsAllowed:[NSURL URLWithString:@"http://apache.org"]]);

    // Ever since Cordova 3.1, allowList wildcards are simplified, only "*" and "*.apache.org" (subdomain example) are allowed. Therefore the next four tests should fail
    XCTAssertFalse([allowList URLIsAllowed:[NSURL URLWithString:@"http://192.168.1.1"]]);
    XCTAssertFalse([allowList URLIsAllowed:[NSURL URLWithString:@"http://192.168.1.2"]]);
    XCTAssertFalse([allowList URLIsAllowed:[NSURL URLWithString:@"http://192.168.2.1"]]);
    XCTAssertFalse([allowList URLIsAllowed:[NSURL URLWithString:@"http://192.168.2.2"]]);

    XCTAssertFalse([allowList URLIsAllowed:[NSURL URLWithString:@"http://192.168.3.1"]]);
}

- (void)testHostnameExtraction
{
    NSArray* allowedHosts = [NSArray arrayWithObjects:
        @"http://apache.org/",
        @"http://apache.org/foo/bar?x=y",
        @"ftp://apache.org/foo/bar?x=y",
        @"ftps://apache.org/foo/bar?x=y",
        @"http://apache.*/foo/bar?x=y",
        nil];

    CDVAllowList* allowList = [[CDVAllowList alloc] initWithArray:allowedHosts];

    XCTAssertTrue([allowList URLIsAllowed:[NSURL URLWithString:@"http://apache.org/"]]);
    XCTAssertFalse([allowList URLIsAllowed:[NSURL URLWithString:@"http://google.com/"]]);
}

- (void)testAllowListRejectionString
{
    NSArray* allowedHosts = [NSArray arrayWithObject:@"http://www.yahoo.com/"];  // Doesn't matter in this test.
    CDVAllowList* allowList = [[CDVAllowList alloc] initWithArray:allowedHosts];

    NSURL* testUrl = [NSURL URLWithString:@"http://www/google.com"];
    NSString* errorString = [allowList errorStringForURL:testUrl];
    NSString* expectedErrorString = [NSString stringWithFormat:kCDVDefaultAllowListRejectionString, [testUrl absoluteString]];

    XCTAssertTrue([expectedErrorString isEqualToString:errorString], @"Default error string has an unexpected value.");

    allowList.allowListRejectionFormatString = @"Hey, '%@' is, like, bogus man!";
    errorString = [allowList errorStringForURL:testUrl];
    expectedErrorString = [NSString stringWithFormat:allowList.allowListRejectionFormatString, [testUrl absoluteString]];
    XCTAssertTrue([expectedErrorString isEqualToString:errorString], @"Customized allowList rejection string has unexpected value.");
}

- (void)testUnusualSchemes
{
    NSArray* allowedHosts = [NSArray arrayWithObjects:
        @"com.myapp://*",
        @"web+app://*",
        @"a12345://*",
        nil];

    CDVAllowList* allowList = [[CDVAllowList alloc] initWithArray:allowedHosts];

    XCTAssertTrue([allowList URLIsAllowed:[NSURL URLWithString:@"com.myapp://www.apache.org"]]);
    XCTAssertTrue([allowList URLIsAllowed:[NSURL URLWithString:@"web+app://www.apache.org"]]);
    XCTAssertTrue([allowList URLIsAllowed:[NSURL URLWithString:@"a12345://www.apache.org"]]);
}

- (void)testSpecificProtocol
{
    NSArray* allowedHosts = [NSArray arrayWithObjects:
        @"http://www.apache.org",
        @"cordova://www.google.com",
        nil];

    CDVAllowList* allowList = [[CDVAllowList alloc] initWithArray:allowedHosts];

    XCTAssertTrue([allowList URLIsAllowed:[NSURL URLWithString:@"http://www.apache.org"]]);
    XCTAssertTrue([allowList URLIsAllowed:[NSURL URLWithString:@"cordova://www.google.com"]]);
    XCTAssertFalse([allowList URLIsAllowed:[NSURL URLWithString:@"cordova://www.apache.org"]]);
    XCTAssertFalse([allowList URLIsAllowed:[NSURL URLWithString:@"http://www.google.com"]]);
}

- (void)testSpecificPort
{
    NSArray* allowedHosts = [NSArray arrayWithObjects:
        @"http://www.apache.org:8080",
        nil];

    CDVAllowList* allowList = [[CDVAllowList alloc] initWithArray:allowedHosts];

    XCTAssertFalse([allowList URLIsAllowed:[NSURL URLWithString:@"http://www.apache.org/index.html"]]);
    XCTAssertTrue([allowList URLIsAllowed:[NSURL URLWithString:@"http://www.apache.org:8080/index.html"]]);
}

- (void)testWildcardPlusOtherUrls
{
    // test for https://issues.apache.org/jira/browse/CB-3394

    NSArray* allowedHosts = [NSArray arrayWithObjects:
        @"*",
        @"cordova.apache.org",
        nil];

    CDVAllowList* allowList = [[CDVAllowList alloc] initWithArray:allowedHosts];

    XCTAssertTrue([allowList URLIsAllowed:[NSURL URLWithString:@"http://*.apache.org"]]);
    XCTAssertTrue([allowList URLIsAllowed:[NSURL URLWithString:@"https://www.google.com"]]);
    XCTAssertTrue([allowList URLIsAllowed:[NSURL URLWithString:@"ftp://cordova.apache.org"]]);
    XCTAssertTrue([allowList URLIsAllowed:[NSURL URLWithString:@"http://cordova.apache.org"]]);
    XCTAssertTrue([allowList URLIsAllowed:[NSURL URLWithString:@"https://cordova.apache.org"]]);
}

- (void)testWildcardScheme
{
    NSArray* allowedHosts = [NSArray arrayWithObjects:
        @"*://*.test.com",
        nil];

    CDVAllowList* allowList = [[CDVAllowList alloc] initWithArray:allowedHosts];

    XCTAssertFalse([allowList URLIsAllowed:[NSURL URLWithString:@"http://apache.org"]]);
    XCTAssertFalse([allowList URLIsAllowed:[NSURL URLWithString:@"gopher://testtt.com"]]);

    XCTAssertTrue([allowList URLIsAllowed:[NSURL URLWithString:@"gopher://test.com"]]);
    XCTAssertTrue([allowList URLIsAllowed:[NSURL URLWithString:@"http://test.com"]]);
    XCTAssertTrue([allowList URLIsAllowed:[NSURL URLWithString:@"http://my.test.com"]]);
    XCTAssertTrue([allowList URLIsAllowed:[NSURL URLWithString:@"https://test.com"]]);
    XCTAssertTrue([allowList URLIsAllowed:[NSURL URLWithString:@"https://my.test.com"]]);

    XCTAssertTrue([allowList URLIsAllowed:[NSURL URLWithString:@"http://test.com/my/path"]]);
    XCTAssertTrue([allowList URLIsAllowed:[NSURL URLWithString:@"http://my.test.com/my/path"]]);
    XCTAssertTrue([allowList URLIsAllowed:[NSURL URLWithString:@"https://test.com/my/path"]]);
    XCTAssertTrue([allowList URLIsAllowed:[NSURL URLWithString:@"https://my.test.com/my/path"]]);

    XCTAssertTrue([allowList URLIsAllowed:[NSURL URLWithString:@"gopher://test.com#foo"]]);
    XCTAssertFalse([allowList URLIsAllowed:[NSURL URLWithString:@"#foo"]]);
}

- (void)testCredentials
{
    NSArray* allowedHosts = [NSArray arrayWithObjects:
        @"http://*.apache.org",
        @"http://www.google.com",
        nil];

    CDVAllowList* allowList = [[CDVAllowList alloc] initWithArray:allowedHosts];

    XCTAssertTrue([allowList URLIsAllowed:[NSURL URLWithString:@"http://user:pass@www.apache.org"]]);
    XCTAssertTrue([allowList URLIsAllowed:[NSURL URLWithString:@"http://user:pass@www.google.com"]]);
}

- (void)testAllowIntentsAndNavigations
{
    NSArray* allowIntents = @[ @"https://*" ];
    NSArray* allowNavigations = @[ @"https://*.apache.org" ];

    CDVAllowList* allowIntentsList = [[CDVAllowList alloc] initWithArray:allowIntents];
    CDVAllowList* navigationsAllowList = [[CDVAllowList alloc] initWithArray:allowNavigations];

    // Test allow-navigation superceding allow-intent
    XCTAssertEqual([CDVIntentAndNavigationFilter filterUrl:[NSURL URLWithString:@"https://apache.org/foo.html"] allowIntentsList:allowIntentsList navigationsAllowList:navigationsAllowList], CDVIntentAndNavigationFilterValueNavigationAllowed);
    // Test wildcard https as allow-intent
    XCTAssertEqual([CDVIntentAndNavigationFilter filterUrl:[NSURL URLWithString:@"https://google.com"] allowIntentsList:allowIntentsList navigationsAllowList:navigationsAllowList], CDVIntentAndNavigationFilterValueIntentAllowed);
    // Test http (not allowed in either)
    XCTAssertEqual([CDVIntentAndNavigationFilter filterUrl:[NSURL URLWithString:@"http://google.com"] allowIntentsList:allowIntentsList navigationsAllowList:navigationsAllowList], CDVIntentAndNavigationFilterValueNoneAllowed);

    NSURL* telUrl = [NSURL URLWithString:@"tel:5555555"];
    NSMutableURLRequest* telRequest = [NSMutableURLRequest requestWithURL:telUrl];
    telRequest.mainDocumentURL = telUrl;
}

@end
