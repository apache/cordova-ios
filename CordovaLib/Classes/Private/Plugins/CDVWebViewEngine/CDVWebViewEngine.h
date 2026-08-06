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

#import <WebKit/WebKit.h>
#import <Cordova/CDVPlugin.h>

@interface CDVWebViewEngine : CDVPlugin <CDVWebViewEngineProtocol, WKScriptMessageHandler, WKNavigationDelegate>

// WKUIDelegate reference for this engine, which can also be set via `updateWithInfo:`
// by a plugin. Additionally it is a helper property to retain the UIDelegate, since
// WKWebView.UIDelegate is weak and would otherwise be deallocated after assignment
// which would cause JavaScript alert/confirm/prompt handling to stop working.
@property (nonatomic, strong, readonly) id <WKUIDelegate> uiDelegate;

- (void)allowsBackForwardNavigationGestures:(CDVInvokedUrlCommand*)command;

@end
