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

#import "CDVIntentAndNavigationFilter.h"
#import <Cordova/CDVConfigParser.h>

@interface CDVIntentAndNavigationFilter ()

@property (nonatomic, readwrite) NSMutableArray* allowIntents;
@property (nonatomic, readwrite) NSMutableArray* allowNavigations;
@property (nonatomic, readwrite) CDVAllowList* allowIntentsList;
@property (nonatomic, readwrite) CDVAllowList* allowNavigationsList;

@end

@implementation CDVIntentAndNavigationFilter

#pragma mark NSXMLParserDelegate

- (void)parser:(NSXMLParser*)parser didStartElement:(NSString*)elementName namespaceURI:(NSString*)namespaceURI qualifiedName:(NSString*)qualifiedName attributes:(NSDictionary*)attributeDict
{
    if ([elementName isEqualToString:@"allow-navigation"]) {
        [self.allowNavigations addObject:attributeDict[@"href"]];
    }
    if ([elementName isEqualToString:@"allow-intent"]) {
        [self.allowIntents addObject:attributeDict[@"href"]];
    }
}

- (void)parserDidStartDocument:(NSXMLParser*)parser
{
    // file: url <allow-navigations> are added by default
    // navigation to the scheme used by the app is also allowed
    self.allowNavigations = [[NSMutableArray alloc] initWithArray:@[ @"file://"]];

    // If the custom app scheme is defined, append it to the allow navigation as default
    NSString* scheme = ((CDVViewController*)self.viewController).appScheme;
    if (scheme) {
        [self.allowNavigations addObject: [NSString stringWithFormat:@"%@://", scheme]];
    }

    // no intents are added by default
    self.allowIntents = [[NSMutableArray alloc] init];
}

- (void)parserDidEndDocument:(NSXMLParser*)parser
{
    self.allowIntentsList = [[CDVAllowList alloc] initWithArray:self.allowIntents];
    self.allowNavigationsList = [[CDVAllowList alloc] initWithArray:self.allowNavigations];
}

- (void)parser:(NSXMLParser*)parser parseErrorOccurred:(NSError*)parseError
{
    NSAssert(NO, @"config.xml parse error line %ld col %ld", (long)[parser lineNumber], (long)[parser columnNumber]);
}

#pragma mark CDVPlugin

- (void)pluginInitialize
{
    [CDVConfigParser parseConfigFile:self.viewController.configFilePath withDelegate:self];
}

+ (CDVIntentAndNavigationFilterValue) filterUrl:(NSURL*)url allowIntentsList:(CDVAllowList*)allowIntentsList navigationsAllowList:(CDVAllowList*)navigationsAllowList
{
    // a URL can only allow-intent OR allow-navigation, if both are specified,
    // only allow-navigation is allowed

    BOOL allowNavigationsPass = [navigationsAllowList URLIsAllowed:url logFailure:NO];
    BOOL allowIntentPass = [allowIntentsList URLIsAllowed:url logFailure:NO];

    if (allowNavigationsPass && allowIntentPass) {
        return CDVIntentAndNavigationFilterValueNavigationAllowed;
    } else if (allowNavigationsPass) {
        return CDVIntentAndNavigationFilterValueNavigationAllowed;
    } else if (allowIntentPass) {
        return CDVIntentAndNavigationFilterValueIntentAllowed;
    }

    return CDVIntentAndNavigationFilterValueNoneAllowed;
}

- (CDVIntentAndNavigationFilterValue) filterUrl:(NSURL*)url
{
    return [[self class] filterUrl:url allowIntentsList:self.allowIntentsList navigationsAllowList:self.allowNavigationsList];
}

#define CDVWebViewNavigationTypeLinkClicked 0
#define CDVWebViewNavigationTypeLinkOther -1

+ (BOOL)shouldOpenURLRequest:(NSURLRequest*)request navigationType:(CDVWebViewNavigationType)navigationType
{
    BOOL isMainNavigation = [[request.mainDocumentURL absoluteString] isEqualToString:[request.URL absoluteString]];

    return (
        navigationType == CDVWebViewNavigationTypeLinkClicked ||
        (navigationType == CDVWebViewNavigationTypeLinkOther && isMainNavigation)
    );
}

+ (BOOL)shouldOverrideLoadWithRequest:(NSURLRequest*)request navigationType:(CDVWebViewNavigationType)navigationType filterValue:(CDVIntentAndNavigationFilterValue)filterValue
{
    NSString* allowIntents_allowListRejectionFormatString = @"ERROR External navigation rejected - <allow-intent> not set for url='%@'";
    NSString* allowNavigations_allowListRejectionFormatString = @"ERROR Internal navigation rejected - <allow-navigation> not set for url='%@'";

    NSURL* url = [request URL];

    switch (filterValue) {
        case CDVIntentAndNavigationFilterValueNavigationAllowed:
            return YES;
        case CDVIntentAndNavigationFilterValueIntentAllowed:
            // only allow-intent if it's a CDVWebViewNavigationTypeLinkClicked (anchor tag) or CDVWebViewNavigationTypeOther and it's an internal link
            if ([[self class] shouldOpenURLRequest:request navigationType:navigationType]){
                [[UIApplication sharedApplication] openURL:url options:@{} completionHandler:nil];
            }

            // consume the request (i.e. no error) if it wasn't handled above
            return NO;
        case CDVIntentAndNavigationFilterValueNoneAllowed:
            // allow-navigation attempt failed for sure
            NSLog(@"%@", [NSString stringWithFormat:allowNavigations_allowListRejectionFormatString, [url absoluteString]]);
            // anchor tag link means it was an allow-intent attempt that failed as well
            if (CDVWebViewNavigationTypeLinkClicked == navigationType) {
                NSLog(@"%@", [NSString stringWithFormat:allowIntents_allowListRejectionFormatString, [url absoluteString]]);
            }
            return NO;
    }
}

- (BOOL)shouldOverrideLoadWithRequest:(NSURLRequest*)request navigationType:(CDVWebViewNavigationType)navigationType info:(NSDictionary *)navInfo
{
    return [[self class] shouldOverrideLoadWithRequest:request navigationType:navigationType filterValue:[self filterUrl:request.URL]];
}

@end
