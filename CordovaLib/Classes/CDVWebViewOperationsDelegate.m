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
#import "CDVWebViewOperationsDelegate.h"

@implementation CDVWebViewOperationsDelegate

- (instancetype) initWithWebView:(UIView*)webView
{
    self = [super init];
    if (self) {
        Class wk_class = NSClassFromString(@"WKWebView");
        if ( !([webView isKindOfClass:wk_class] || [webView isKindOfClass:[UIWebView class]] )) {
            return nil;
        }
        _webView = webView;
    }
    
    return self;
}

- (void)loadRequest:(NSURLRequest*)request
{
    SEL selector = NSSelectorFromString(@"loadRequest:");
    if ([_webView respondsToSelector:selector]) {
        // UIKit operations have to be on the main thread. and this method is synchronous
        [_webView performSelectorOnMainThread:selector withObject:request waitUntilDone:YES];
    }
}

- (void)loadHTMLString:(NSString*)string baseURL:(NSURL*)baseURL
{
    SEL selector = NSSelectorFromString(@"loadHTMLString:baseURL:");

    dispatch_block_t invoke = ^(void) {
        ((void (*)(id, SEL, id, id))objc_msgSend)(_webView, selector, string, baseURL);
    };
    
    if ([_webView respondsToSelector:selector]) {
        // UIKit operations have to be on the main thread.
        // perform a synchronous invoke on the main thread without deadlocking
        if ([NSThread isMainThread]) {
            invoke();
        } else {
            dispatch_sync(dispatch_get_main_queue(), invoke);
        }
    }
}

- (void)evaluateJavaScript:(NSString*)javaScriptString completionHandler:(void (^)(id, NSError*))completionHandler
{
    SEL ui_sel = NSSelectorFromString(@"stringByEvaluatingJavaScriptFromString:");
    SEL wk_sel = NSSelectorFromString(@"evaluateJavaScript:completionHandler:");

    // UIKit operations have to be on the main thread. This method does not need to be synchronous
    dispatch_async(dispatch_get_main_queue(), ^{
        if ([_webView respondsToSelector:ui_sel]) {
            NSString* ret = ((NSString* (*)(id, SEL, id))objc_msgSend)(_webView, ui_sel, javaScriptString);
            completionHandler(ret, nil);
        } else if ([_webView respondsToSelector:wk_sel]) {
            ((void (*)(id, SEL, id, id))objc_msgSend)(_webView, wk_sel, javaScriptString, completionHandler);
        }
    });
}

@end
