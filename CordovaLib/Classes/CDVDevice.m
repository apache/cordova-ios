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


#import "CDVDevice.h"
#import "CDVViewController.h"
#import "UIDevice+Extensions.h"

@interface CDVDevice () {
}
@end


@implementation CDVDevice

- (void)getDeviceInfo:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
    NSString* cbId = [arguments objectAtIndex:0];
	NSDictionary *deviceProperties = [self deviceProperties];
    NSMutableString* result = [[NSMutableString alloc] initWithFormat:@""];
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:deviceProperties];
    
    /* Settings.plist
     * Read the optional Settings.plist file and push these user-defined settings down into the web application.
     * This can be useful for supplying build-time configuration variables down to the app to change its behaviour,
     * such as specifying Full / Lite version, or localization (English vs German, for instance).
     */
    // TODO: turn this into an iOS only plugin
    NSDictionary *temp = [CDVViewController getBundlePlist:@"Settings"];
    if ([temp respondsToSelector:@selector(JSONString)]) {
        [result appendFormat:@"\nwindow.Settings = %@;", [temp JSONString]];
    }
    
    NSString* jsResult = [self.webView stringByEvaluatingJavaScriptFromString:result];
    // if jsResult is not nil nor empty, an error
    if (jsResult != nil && [jsResult length] > 0) {
        NSLog(@"%@", jsResult);
    }
    
    [result release];
    
    [self success:pluginResult callbackId:cbId];

}

- (NSDictionary*) deviceProperties
{
    UIDevice *device = [UIDevice currentDevice];
    NSMutableDictionary *devProps = [NSMutableDictionary dictionaryWithCapacity:4];
    [devProps setObject:[device model] forKey:@"platform"];
    [devProps setObject:[device systemVersion] forKey:@"version"];
    [devProps setObject:[device uniqueAppInstanceIdentifier] forKey:@"uuid"];
    [devProps setObject:[device name] forKey:@"name"];
    [devProps setObject:[[self class] cordovaVersion] forKey:@"cordova"];
    
    NSDictionary *devReturn = [NSDictionary dictionaryWithDictionary:devProps];
    return devReturn;
}

/**
 Returns the current version of Cordova as read from the VERSION file
 This only touches the filesystem once and stores the result in the class variable cdvVersion
 */
static NSString* cdvVersion;
+ (NSString*) cordovaVersion
{
#ifdef CDV_VERSION
    cdvVersion = SYMBOL_TO_NSSTRING(CDV_VERSION);
#else
	
    if (cdvVersion == nil) {
        NSBundle *mainBundle = [NSBundle mainBundle];
        NSString *filename = [mainBundle pathForResource:@"VERSION" ofType:nil];
        // read from the filesystem and save in the variable
        // first, separate by new line
        NSString* fileContents = [NSString stringWithContentsOfFile:filename encoding:NSUTF8StringEncoding error:NULL];
        NSArray* all_lines = [fileContents componentsSeparatedByCharactersInSet:[NSCharacterSet newlineCharacterSet]];
        NSString* first_line = [all_lines objectAtIndex:0];        
        
        cdvVersion = [first_line retain];
    }
#endif
    return cdvVersion;
}


@end
