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

#import <SenTestingKit/SenTestingKit.h>

#import "CDVWhitelist.h"

@interface CDVWhitelistTests : SenTestCase
@end

@implementation CDVWhitelistTests

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

    CDVWhitelist* whitelist = [[CDVWhitelist alloc] initWithArray:allowedHosts];

    STAssertTrue([whitelist schemeIsAllowed:@"http"], nil);
    STAssertTrue([whitelist schemeIsAllowed:@"https"], nil);
    STAssertTrue([whitelist schemeIsAllowed:@"ftp"], nil);
    STAssertTrue([whitelist schemeIsAllowed:@"ftps"], nil);
    STAssertFalse([whitelist schemeIsAllowed:@"gopher"], nil);
}

- (void)testSubdomainWildcard
{
    NSArray* allowedHosts = [NSArray arrayWithObjects:
        @"*.apache.org",
        nil];

    CDVWhitelist* whitelist = [[CDVWhitelist alloc] initWithArray:allowedHosts];

    STAssertTrue([whitelist URLIsAllowed:[NSURL URLWithString:@"http://build.apache.org"]], nil);
    STAssertTrue([whitelist URLIsAllowed:[NSURL URLWithString:@"http://apache.org"]], nil);
    STAssertTrue([whitelist URLIsAllowed:[NSURL URLWithString:@"http://sub1.sub0.build.apache.org"]], nil);
    STAssertFalse([whitelist URLIsAllowed:[NSURL URLWithString:@"http://apache.org.ca"]], nil);
}

- (void)testCatchallWildcardOnly
{
    NSArray* allowedHosts = [NSArray arrayWithObjects:
        @"*",
        nil];

    CDVWhitelist* whitelist = [[CDVWhitelist alloc] initWithArray:allowedHosts];

    STAssertTrue([whitelist URLIsAllowed:[NSURL URLWithString:@"http://apache.org"]], nil);
    STAssertTrue([whitelist URLIsAllowed:[NSURL URLWithString:@"https://build.apache.prg"]], nil);
    STAssertTrue([whitelist URLIsAllowed:[NSURL URLWithString:@"ftp://MyDangerousSite.org"]], nil);
    STAssertTrue([whitelist URLIsAllowed:[NSURL URLWithString:@"ftps://apache.org.SuspiciousSite.com"]], nil);
    STAssertTrue([whitelist URLIsAllowed:[NSURL URLWithString:@"gopher://apache.org"]], nil);
}

- (void)testCatchallWildcardByProto
{
    NSArray* allowedHosts = [NSArray arrayWithObjects:
        @"http://*",
        @"https://*",
        @"ftp://*",
        @"ftps://*",
        nil];

    CDVWhitelist* whitelist = [[CDVWhitelist alloc] initWithArray:allowedHosts];

    STAssertTrue([whitelist URLIsAllowed:[NSURL URLWithString:@"http://apache.org"]], nil);
    STAssertTrue([whitelist URLIsAllowed:[NSURL URLWithString:@"https://build.apache.prg"]], nil);
    STAssertTrue([whitelist URLIsAllowed:[NSURL URLWithString:@"ftp://MyDangerousSite.org"]], nil);
    STAssertTrue([whitelist URLIsAllowed:[NSURL URLWithString:@"ftps://apache.org.SuspiciousSite.com"]], nil);
    STAssertFalse([whitelist URLIsAllowed:[NSURL URLWithString:@"gopher://apache.org"]], nil);
}

- (void)testExactMatch
{
    NSArray* allowedHosts = [NSArray arrayWithObjects:
        @"www.apache.org",
        nil];

    CDVWhitelist* whitelist = [[CDVWhitelist alloc] initWithArray:allowedHosts];

    STAssertTrue([whitelist URLIsAllowed:[NSURL URLWithString:@"http://www.apache.org"]], nil);
    STAssertFalse([whitelist URLIsAllowed:[NSURL URLWithString:@"http://build.apache.org"]], nil);
    STAssertFalse([whitelist URLIsAllowed:[NSURL URLWithString:@"http://apache.org"]], nil);
}

- (void)testNoMatchInQueryParam
{
    NSArray* allowedHosts = [NSArray arrayWithObjects:
        @"www.apache.org",
        nil];

    CDVWhitelist* whitelist = [[CDVWhitelist alloc] initWithArray:allowedHosts];

    STAssertFalse([whitelist URLIsAllowed:[NSURL URLWithString:@"www.malicious-site.org?url=http://www.apache.org"]], nil);
    STAssertFalse([whitelist URLIsAllowed:[NSURL URLWithString:@"www.malicious-site.org?url=www.apache.org"]], nil);
}

- (void)testIpExactMatch
{
    NSArray* allowedHosts = [NSArray arrayWithObjects:
        @"192.168.1.1",
        @"192.168.2.1",
        nil];

    CDVWhitelist* whitelist = [[CDVWhitelist alloc] initWithArray:allowedHosts];

    STAssertFalse([whitelist URLIsAllowed:[NSURL URLWithString:@"http://apache.org"]], nil);
    STAssertTrue([whitelist URLIsAllowed:[NSURL URLWithString:@"http://192.168.1.1"]], nil);
    STAssertTrue([whitelist URLIsAllowed:[NSURL URLWithString:@"http://192.168.2.1"]], nil);
    STAssertFalse([whitelist URLIsAllowed:[NSURL URLWithString:@"http://192.168.3.1"]], nil);
}

- (void)testIpWildcardMatch
{
    NSArray* allowedHosts = [NSArray arrayWithObjects:
        @"192.168.1.*",
        @"192.168.2.*",
        nil];

    CDVWhitelist* whitelist = [[CDVWhitelist alloc] initWithArray:allowedHosts];

    STAssertFalse([whitelist URLIsAllowed:[NSURL URLWithString:@"http://apache.org"]], nil);
    STAssertTrue([whitelist URLIsAllowed:[NSURL URLWithString:@"http://192.168.1.1"]], nil);
    STAssertTrue([whitelist URLIsAllowed:[NSURL URLWithString:@"http://192.168.1.2"]], nil);
    STAssertTrue([whitelist URLIsAllowed:[NSURL URLWithString:@"http://192.168.2.1"]], nil);
    STAssertTrue([whitelist URLIsAllowed:[NSURL URLWithString:@"http://192.168.2.2"]], nil);
    STAssertFalse([whitelist URLIsAllowed:[NSURL URLWithString:@"http://192.168.3.1"]], nil);
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

    CDVWhitelist* whitelist = [[CDVWhitelist alloc] initWithArray:allowedHosts];

    STAssertTrue([whitelist URLIsAllowed:[NSURL URLWithString:@"http://apache.org/"]], nil);
    STAssertFalse([whitelist URLIsAllowed:[NSURL URLWithString:@"http://google.com/"]], nil);
}

- (void)testWhitelistRejectionString
{
    NSArray* allowedHosts = [NSArray arrayWithObject:@"http://www.yahoo.com/"];  // Doesn't matter in this test.
    CDVWhitelist* whitelist = [[CDVWhitelist alloc] initWithArray:allowedHosts];

    NSURL* testUrl = [NSURL URLWithString:@"http://www/google.com"];
    NSString* errorString = [whitelist errorStringForURL:testUrl];
    NSString* expectedErrorString = [NSString stringWithFormat:kCDVDefaultWhitelistRejectionString, [testUrl absoluteString]];

    STAssertTrue([expectedErrorString isEqualToString:errorString], @"Default error string has an unexpected value.");

    whitelist.whitelistRejectionFormatString = @"Hey, '%@' is, like, bogus man!";
    errorString = [whitelist errorStringForURL:testUrl];
    expectedErrorString = [NSString stringWithFormat:whitelist.whitelistRejectionFormatString, [testUrl absoluteString]];
    STAssertTrue([expectedErrorString isEqualToString:errorString], @"Customized whitelist rejection string has unexpected value.");
}

- (void)testSpecificProtocol
{
    NSArray* allowedHosts = [NSArray arrayWithObjects:
        @"http://www.apache.org",
        @"cordova://www.google.com",
        nil];

    CDVWhitelist* whitelist = [[CDVWhitelist alloc] initWithArray:allowedHosts];

    STAssertTrue([whitelist URLIsAllowed:[NSURL URLWithString:@"http://www.apache.org"]], nil);
    STAssertTrue([whitelist URLIsAllowed:[NSURL URLWithString:@"cordova://www.google.com"]], nil);
    STAssertFalse([whitelist URLIsAllowed:[NSURL URLWithString:@"cordova://www.apache.org"]], nil);
    STAssertFalse([whitelist URLIsAllowed:[NSURL URLWithString:@"http://www.google.com"]], nil);
}

- (void)testWildcardPlusOtherUrls
{
    // test for https://issues.apache.org/jira/browse/CB-3394

    NSArray* allowedHosts = [NSArray arrayWithObjects:
        @"*",
        @"cordova.apache.org",
        nil];

    CDVWhitelist* whitelist = [[CDVWhitelist alloc] initWithArray:allowedHosts];

    STAssertTrue([whitelist URLIsAllowed:[NSURL URLWithString:@"http://*.apache.org"]], nil);
    STAssertTrue([whitelist URLIsAllowed:[NSURL URLWithString:@"https://www.google.com"]], nil);
    STAssertTrue([whitelist URLIsAllowed:[NSURL URLWithString:@"ftp://cordova.apache.org"]], nil);
    STAssertTrue([whitelist URLIsAllowed:[NSURL URLWithString:@"http://cordova.apache.org"]], nil);
    STAssertTrue([whitelist URLIsAllowed:[NSURL URLWithString:@"https://cordova.apache.org"]], nil);
}

- (void)testWildcardPlusScheme
{
    NSArray* allowedHosts = [NSArray arrayWithObjects:
        @"http://*.apache.org",
        nil];

    CDVWhitelist* whitelist = [[CDVWhitelist alloc] initWithArray:allowedHosts];

    STAssertTrue([whitelist URLIsAllowed:[NSURL URLWithString:@"http://www.apache.org"]], nil);
    STAssertFalse([whitelist URLIsAllowed:[NSURL URLWithString:@"https://www.google.com"]], nil);
    STAssertFalse([whitelist URLIsAllowed:[NSURL URLWithString:@"ftp://cordova.apache.org"]], nil);
    STAssertTrue([whitelist URLIsAllowed:[NSURL URLWithString:@"http://cordova.apache.org"]], nil);
    STAssertFalse([whitelist URLIsAllowed:[NSURL URLWithString:@"https://cordova.apache.org"]], nil);
}

- (void)testCredentials
{
    NSArray* allowedHosts = [NSArray arrayWithObjects:
        @"http://*.apache.org",
        @"http://www.google.com",
        nil];

    CDVWhitelist* whitelist = [[CDVWhitelist alloc] initWithArray:allowedHosts];

    STAssertTrue([whitelist URLIsAllowed:[NSURL URLWithString:@"http://user:pass@www.apache.org"]], nil);
    STAssertTrue([whitelist URLIsAllowed:[NSURL URLWithString:@"http://user:pass@www.google.com"]], nil);
}

@end
