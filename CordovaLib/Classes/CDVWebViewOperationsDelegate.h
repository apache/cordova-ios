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
#import <UIKit/UIKit.h>

#ifdef __IPHONE_8_0
    #pragma message("For iOS 8 - Please add WebKit.framework into your 'Link Binary with Libraries' Build Phase Project Setting. This will be baked in once Xcode 6 is required.")
#endif /* ifdef __IPHONE_8_0 */

@interface CDVWebViewOperationsDelegate : NSObject {
    @private
    __weak UIView* _webView;
}

- (instancetype)initWithWebView:(UIView*)webView;

- (void)loadRequest:(NSURLRequest*)request;
- (void)loadHTMLString:(NSString*)string baseURL:(NSURL*)baseURL;
- (void)evaluateJavaScript:(NSString*)javaScriptString completionHandler:(void (^)(id, NSError*))completionHandler;
- (void)loadFileURL:(NSURL*)URL allowingReadAccessToURL:(NSURL*)readAccessURL;

@end
