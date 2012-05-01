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
#import "CDVDebugWebView.h"


@implementation CDVDebugWebSourceData

@synthesize sourceId, sourceLines, fromURL, baseLineNumber;

+ (NSString*) trimFilePathWithURL:(NSURL*)url;
{
    NSString* bundlePath = [[[NSBundle mainBundle] bundlePath] stringByAppendingString:@"/"];
    NSString* urlPath = [url path];
    
    if ([urlPath hasPrefix:bundlePath]) {
        urlPath = [urlPath substringFromIndex:[bundlePath length]];
    }
    
    return urlPath;
}

- (NSString*) trimFilePath
{
    return [[self class] trimFilePathWithURL:self.fromURL];
}

@end

/*
 // in your app's MainViewController.m, override this:
 - (CDVCordovaView*) newCordovaViewWithFrame:(CGRect)bounds
 {
    return [[CDVDebugWebView alloc] initWithFrame:bounds];
 }
 */


@implementation CDVDebugWebDelegate

@synthesize sourceDataDict;

- (id) init
{
    self = [super init];
    if (self) {
        self.sourceDataDict = [NSMutableDictionary dictionaryWithCapacity:3];
    }
    
    return self;
}

// some source was parsed, establishing a "source ID" (>= 0) for future reference
// this delegate method is deprecated, please switch to the new version below
- (void) webView:(WebView *)webView       didParseSource:(NSString *)source
        fromURL:(NSString *)url
       sourceId:(WebSourceId)sid
    forWebFrame:(WebFrame *)webFrame
{
    NSLog(@"deprecated, use newer delegate function webView:didParseSource:baseLineNumber:fromURL:sourceId:forWebFrame"); 
}

// some source was parsed, establishing a "source ID" (>= 0) for future reference
- (void) webView:(WebView *)webView       didParseSource:(NSString *)source
 baseLineNumber:(WebNSUInteger)lineNumber
        fromURL:(NSURL *)url
       sourceId:(WebSourceId)sid
    forWebFrame:(WebFrame *)webFrame
{
    CDVDebugWebSourceData* sourceData = [[[CDVDebugWebSourceData alloc] init] autorelease];
    sourceData.sourceId = sid;
    sourceData.sourceLines = [source componentsSeparatedByCharactersInSet:[NSCharacterSet newlineCharacterSet]];
    sourceData.fromURL = url;
    // this is for example if you have JavaScript in a script tag, the baseLineNumber is the position of this script tag in the html file
    sourceData.baseLineNumber = lineNumber;
    
    [self.sourceDataDict setObject:sourceData forKey:[NSNumber numberWithInt:sid]];
}

// some source failed to parse
- (void) webView:(WebView *)webView  failedToParseSource:(NSString *)source
 baseLineNumber:(WebNSUInteger)lineNumber
        fromURL:(NSURL *)url
      withError:(NSError *)error
    forWebFrame:(WebFrame *)webFrame
{
    NSString* urlStr = url? [CDVDebugWebSourceData trimFilePathWithURL:url] : @"obj-c";                                     
    NSLog(@"JavaScript parse error: (%@) - %@", urlStr, [error description]);
}

// just entered a stack frame (i.e. called a function, or started global scope)
- (void) webView:(WebView *)webView    didEnterCallFrame:(WebScriptCallFrame *)frame
       sourceId:(WebSourceId)sid
           line:(int)lineno
    forWebFrame:(WebFrame *)webFrame
{
    // TODO: do something? perhaps if we had a JS debugger UI thingy with breakpoint support
}

// about to execute some code
- (void) webView:(WebView *)webView willExecuteStatement:(WebScriptCallFrame *)frame
       sourceId:(WebSourceId)sid
           line:(int)lineno
    forWebFrame:(WebFrame *)webFrame
{
    // TODO: do something? perhaps if we had a JS debugger UI thingy with breakpoint support
}

// about to leave a stack frame (i.e. return from a function)
- (void) webView:(WebView *)webView   willLeaveCallFrame:(WebScriptCallFrame *)frame
       sourceId:(WebSourceId)sid
           line:(int)lineno
    forWebFrame:(WebFrame *)webFrame
{
    // TODO: do something? perhaps if we had a JS debugger UI thingy with breakpoint support
}

// exception is being thrown
- (void) webView:(WebView *)webView   exceptionWasRaised:(WebScriptCallFrame *)frame
       sourceId:(WebSourceId)sid
           line:(int)lineno
    forWebFrame:(WebFrame *)webFrame
{
    WebScriptObject* exception = [frame exception]; // this is the bound JavaScript Error object which has two properties: name and message
    
    NSString *exceptionName, *exceptionMessage;
    
    if ([exception isKindOfClass:[NSString class]]) {
        exceptionName = @"string";
        exceptionMessage = (NSString*)exception;
    } else  if ([exception isKindOfClass:[NSNumber class]]) {
        exceptionName = @"number";
        exceptionMessage = [((NSNumber*)exception) stringValue];
    } 
    else {
        // we use KVC to extract the name and message
        @try  {
            exceptionName = [exception valueForKey:@"name"];
            exceptionMessage = [exception valueForKey:@"message"];
        } @catch (NSException* exc) {
            if ([[exc name] isEqualToString:NSUndefinedKeyException]) {
                exceptionName = @"type unknown";
                exceptionMessage = @"(not an exception object)";
            }
        }
    }

    CDVDebugWebSourceData* sourceData = [self.sourceDataDict objectForKey:[NSNumber numberWithInt:sid]];
    
    NSUInteger max_lines = [sourceData.sourceLines count];
    if (lineno > max_lines) {
        lineno = max_lines;
    }
    NSString* url = sourceData.fromURL? [sourceData trimFilePath] : @"obj-c";
    NSString* line = [sourceData.sourceLines objectAtIndex:lineno-1];

    NSLog(@"JavaScript exception: (%@):%d - %@ - %@\n\tFunction name: '%@'\tLine: '%@'", url, lineno, exceptionName, exceptionMessage, [frame functionName], line);
}

@end

@implementation CDVDebugWebView

- (id) initWithFrame:(CGRect)bounds
{
    self = [super initWithFrame:bounds];
    if (self) 
    {
        NSString* message = [NSString stringWithFormat:
                             NSLocalizedString(
                                            @"You are using the %@ class which should not be included in builds for the Apple App Store.",
                                            @"You are using the %@ class which should not be included in builds for the Apple App Store."
                                               ), NSStringFromClass([self class])]; 
        
        UIAlertView* alertView = [[UIAlertView alloc]
                                   initWithTitle:@"WARNING!"
                                   message:message 
                                   delegate:self 
                                   cancelButtonTitle:nil 
                                   otherButtonTitles:@"OK",nil];
        
        [alertView show];
        [alertView release];
    }
    return self;
}

- (void) webView:(id)sender didClearWindowObject:(id)windowObject forFrame:(WebFrame*)frame
{
    if ([sender respondsToSelector:@selector(setScriptDebugDelegate:)]) {
        [sender setScriptDebugDelegate:[[CDVDebugWebDelegate alloc] init]];
    }
}
@end
