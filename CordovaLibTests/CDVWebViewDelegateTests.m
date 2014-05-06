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

#import <Cordova/CDVWebViewDelegate.h>

@interface CDVWebViewDelegateTests : XCTestCase
@end

@implementation CDVWebViewDelegateTests

- (void)setUp
{
    [super setUp];
}

- (void)tearDown
{
    [super tearDown];
}

- (void)testFragmentIdentifiersWithHttpUrl
{
    [self doTestFragmentIdentifiersWithBaseUrl:@"http://cordova.apache.org" fragment:@"myfragment"];
}

- (void)testFragmentIdentifiersWithFileUrl
{
    [self doTestFragmentIdentifiersWithBaseUrl:@"file:///var/mobile/GASGEQGQsdga3313/www/index.html" fragment:@"myfragment"];
}

- (void)testFragmentIdentifiersWithFileUrlAndMalformedFragment
{
    [self doTestFragmentIdentifiersWithBaseUrl:@"file:///var/mobile/GASGEQGQsdga3313/www/index.html" fragment:@"/var/mobile/GASGEQGQsdga3313/www/index.html"];
}

- (void)doTestFragmentIdentifiersWithBaseUrl:(NSString*)baseUrl fragment:(NSString*)fragment
{
    CDVWebViewDelegate* wvd = [[CDVWebViewDelegate alloc] initWithDelegate:nil]; // not really testing delegate handling

    NSString* originalUrlString = baseUrl;
    NSURL* originalUrl = [NSURL URLWithString:originalUrlString];
    NSURL* originalUrlWithFragmentOnly = [NSURL URLWithString:[NSString stringWithFormat:@"%@#%@", originalUrlString, fragment]];
    NSURL* originalUrlWithFragmentOnlyNoIdentifier = [NSURL URLWithString:[NSString stringWithFormat:@"%@#", originalUrlString]];
    NSURL* originalUrlWithQueryParamsAndFragment = [NSURL URLWithString:[NSString stringWithFormat:@"%@?foo=bar#%@", originalUrlString, fragment]];

    NSURLRequest* originalRequest = [NSURLRequest requestWithURL:originalUrl];
    NSURLRequest* originalRequestWithFragmentOnly = [NSURLRequest requestWithURL:originalUrlWithFragmentOnly];
    NSURLRequest* originalRequestWithFragmentOnlyNoIdentifier = [NSURLRequest requestWithURL:originalUrlWithFragmentOnlyNoIdentifier];
    NSURLRequest* originalRequestWithQueryParamsAndFragment = [NSURLRequest requestWithURL:originalUrlWithQueryParamsAndFragment];
    NSURLRequest* notOriginalRequest = [NSURLRequest requestWithURL:[NSURL URLWithString:@"http://httpd.apache.org"]];

    XCTAssertTrue([wvd request:originalRequest isEqualToRequestAfterStrippingFragments:originalRequest], @"originalRequest should be a be equal to originalRequest after stripping fragments");
    XCTAssertTrue([wvd request:originalRequestWithFragmentOnly isEqualToRequestAfterStrippingFragments:originalRequest], @"originalRequestWithFragment should be equal to originalRequest after stripping fragment");
    XCTAssertTrue([wvd request:originalRequestWithFragmentOnlyNoIdentifier isEqualToRequestAfterStrippingFragments:originalRequest], @"originalRequestWithFragmentNoIdentifier should be equal to originalRequest after stripping fragment");
    XCTAssertFalse([wvd request:originalRequestWithQueryParamsAndFragment isEqualToRequestAfterStrippingFragments:originalRequest], @"originalRequestWithQueryParamsAndFragment should not be equal to originalRequest after stripping fragment");
    XCTAssertFalse([wvd request:notOriginalRequest isEqualToRequestAfterStrippingFragments:originalRequest], @"notOriginalRequest should not be equal to originalRequest after stripping fragment");

    // equality tests
    XCTAssertTrue([wvd request:originalRequestWithFragmentOnly isEqualToRequestAfterStrippingFragments:originalRequestWithFragmentOnly], @"originalRequestWithFragment should be a equal to itself after stripping fragments");
    XCTAssertTrue([wvd request:originalRequestWithFragmentOnlyNoIdentifier isEqualToRequestAfterStrippingFragments:originalRequestWithFragmentOnlyNoIdentifier], @"originalRequestWithFragmentNoIdentifier should be a equal to itself after stripping fragments");
    XCTAssertTrue([wvd request:originalRequestWithQueryParamsAndFragment isEqualToRequestAfterStrippingFragments:originalRequestWithQueryParamsAndFragment], @"originalRequestWithQueryParamsAndFragment should be equal to itself after stripping fragments");
}

@end
