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

#import <Cordova/CDVAvailabilityDeprecated.h>

@class WKProcessPool;

/**
   Apple has deprecated the WKProcessPool API, saying that it has no effect
   in iOS 15 and newer. As such, the CDVWebViewProcessPoolFactory API is
   marked as deprecated, but still exists to support iOS 13 and 14.

   The CDVWebViewProcessPoolFactory API was also problematic because it
   exposed WebKit-specific API types to the public API interface of Cordova,
   potentially causing issues if those APIs need to change in the future. 
   With this deprecation and eventual removal, Cordova is better insulated
   from upstream WebView changes.
 @Metadata {
    @Available(Cordova, introduced: "6.2.0", deprecated: "8.0.0")
 }
 */
CDV_DEPRECATED(8.0.0, "Apple deprecated the use of WKProcessPool since iOS 15.0")
@interface CDVWebViewProcessPoolFactory : NSObject
@property (nonatomic, retain) WKProcessPool* sharedPool;

+(instancetype) sharedFactory;
-(WKProcessPool*) sharedProcessPool;
@end
