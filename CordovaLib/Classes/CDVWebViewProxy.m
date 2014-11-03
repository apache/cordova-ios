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

#import <objc/message.h>
#import <WebKit/WebKit.h>
#import "CDVWebViewProxy.h"

@interface UIWebView (Extensions)

- (void)evaluateJavaScript:(NSString*)javaScriptString completionHandler:(void (^)(id, NSError*))completionHandler;

@end

@implementation UIWebView (Extensions)

- (void)evaluateJavaScript:(NSString*)javaScriptString completionHandler:(void (^)(id, NSError*))completionHandler
{
    NSString* ret = [self stringByEvaluatingJavaScriptFromString:javaScriptString];

    completionHandler(ret, nil);
}

@end

// see forwardingTargetForSelector: selector comment for the reason for this pragma
#pragma clang diagnostic ignored "-Wincomplete-implementation"

@implementation CDVWebViewProxy

- (instancetype)initWithWebView:(UIView*)webView
{
    self = [super init];
    if (self) {
        if (!([webView isKindOfClass:[WKWebView class]] || [webView isKindOfClass:[UIWebView class]])) {
            return nil;
        }
        _webView = webView;
    }

    return self;
}

// We implement this here because certain versions of iOS 8 do not implement this
// in WKWebView, so we need to test for this during runtime.
// It is speculated that this selector will be available in iOS 8.2 for WKWebView
- (void)loadFileURL:(NSURL*)url allowingReadAccessToURL:(NSURL*)readAccessURL
{
    SEL wk_sel = @selector(loadFileURL:allowingReadAccessToURL:);
    __weak CDVWebViewProxy* weakSelf = self;

    // UIKit operations have to be on the main thread. This method does not need to be synchronous
    dispatch_async(dispatch_get_main_queue(), ^{
            if ([_webView respondsToSelector:wk_sel] && [[url scheme] isEqualToString:@"file"]) {
                ((id (*)(id, SEL, id, id))objc_msgSend)(_webView, wk_sel, url, readAccessURL);
            } else {
                [weakSelf loadRequest:[NSURLRequest requestWithURL:url]];
            }
        });
}

// This forwards the methods that are in the header that are not implemented here.
// Both WKWebView and UIWebView implement the below:
//     loadHTMLString:baseURL:
//     loadRequest:
//     evaluateJavaScript:completionHandler: (UIWebView implements in Category above)
- (id)forwardingTargetForSelector:(SEL)aSelector
{
    return _webView;
}

@end
