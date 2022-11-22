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
#import <Cordova/CDVViewController.h>

#define CDVViewControllerTestSettingKey @"test_cdvconfigfile"
#define CDVViewControllerTestSettingValueDefault @"config.xml"
#define CDVViewControllerTestSettingValueCustom @"config-custom.xml"

@interface CDVViewControllerTest : XCTestCase

@end

@interface CDVViewController ()

// expose private interface
- (bool)checkAndReinitViewUrl;
- (bool)isUrlEmpty:(NSURL*)url;

@end

@implementation CDVViewControllerTest

-(CDVViewController*)viewController{
    CDVViewController* viewController = [CDVViewController new];
    return viewController;
}

-(void)doTestInitWithConfigFile:(NSString*)configFile expectedSettingValue:(NSString*)value{
    // Create a CDVViewController
    CDVViewController* viewController = [self viewController];
    if(configFile){
        // Set custom config file
        viewController.configFile = configFile;
    }else{
        // Do not specify config file ==> fallback to default config.xml
    }

    // Trigger -viewDidLoad
    [viewController view];

    // Assert that the proper file was actually loaded, checking the value of a test setting it must contain
    NSString* settingValue = [viewController.settings objectForKey:CDVViewControllerTestSettingKey];
    XCTAssertEqualObjects(settingValue, value);
}

-(void)testInitWithDefaultConfigFile{
    [self doTestInitWithConfigFile:nil expectedSettingValue:CDVViewControllerTestSettingValueDefault];
}

-(void)testInitWithCustomConfigFileAbsolutePath{
    NSString* configFileAbsolutePath = [[NSBundle mainBundle] pathForResource:@"config-custom" ofType:@"xml"];
    [self doTestInitWithConfigFile:configFileAbsolutePath expectedSettingValue:CDVViewControllerTestSettingValueCustom];
}

-(void)testInitWithCustomConfigFileRelativePath{
    NSString* configFileRelativePath = @"config-custom.xml";
    [self doTestInitWithConfigFile:configFileRelativePath expectedSettingValue:CDVViewControllerTestSettingValueCustom];
}

-(void)testIsUrlEmpty{
    CDVViewController* viewController = [self viewController];
    XCTAssertTrue([viewController isUrlEmpty:(id)[NSNull null]]);
    XCTAssertTrue([viewController isUrlEmpty:nil]);
    XCTAssertTrue([viewController isUrlEmpty:[NSURL URLWithString:@""]]);
    XCTAssertTrue([viewController isUrlEmpty:[NSURL URLWithString:@"about:blank"]]);
}

-(void)testIfItLoadsAppUrlIfCurrentViewIsBlank{
    CDVViewController* viewController = [self viewController];

    NSString* appUrl = @"about:blank";
    NSString* html = @"<html><body></body></html>";
    [viewController.webViewEngine loadHTMLString:html baseURL:[NSURL URLWithString:appUrl]];
    XCTAssertFalse([viewController checkAndReinitViewUrl]);

    appUrl = @"https://cordova.apache.org";
    viewController.startPage = appUrl;
    [viewController.webViewEngine loadRequest:[NSURLRequest requestWithURL:[NSURL URLWithString:appUrl]]];
    XCTAssertTrue([viewController checkAndReinitViewUrl]);
}

@end

