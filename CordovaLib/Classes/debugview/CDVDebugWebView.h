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

#import <Cordova/CDVCordovaView.h>

// http://opensource.apple.com/source/WebKit/WebKit-6531.9/mac/WebView/WebScriptDebugDelegate.h
#import "WebScriptDebugDelegate.h"

@interface CDVDebugWebSourceData : NSObject {
}

@property (nonatomic, assign) WebSourceId sourceId;
@property (nonatomic, assign) WebNSUInteger baseLineNumber;
@property (nonatomic, retain) NSURL* fromURL;
@property (nonatomic, retain) NSArray* sourceLines;

+ (NSString*) trimFilePathWithURL:(NSURL*)url;
- (NSString*) trimFilePath;

@end

@interface CDVDebugWebDelegate : NSObject {
}

// key is source id, value is a CDVDebugWebSourceData object
@property (nonatomic, retain) NSMutableDictionary* sourceDataDict;

@end

@interface CDVDebugWebView : CDVCordovaView {
}
@end

@interface WebView {
    
}
- (void) setScriptDebugDelegate:(id)delegate;

@end
