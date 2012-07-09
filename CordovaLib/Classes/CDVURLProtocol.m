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

#import "CDVURLProtocol.h"
#import "CDVWhitelist.h"
#import "CDVViewController.h"

static CDVWhitelist* gWhitelist = nil;

@implementation CDVURLProtocol

+ (void) registerPGHttpURLProtocol {
    return [[self class] registerURLProtocol];
}

// Called before any use of the protocol, ensure it is only called once
+ (void) registerURLProtocol {
    static BOOL registered = NO;
    if (!registered) {
        [NSURLProtocol registerClass:[CDVURLProtocol class]];
        registered = YES;
    }
}

+ (BOOL) canInitWithRequest:(NSURLRequest *)theRequest
{
    NSURL* theUrl = [theRequest URL];
    NSString* theScheme = [theUrl scheme];
    
    if (gWhitelist == nil) {
        id<UIApplicationDelegate> delegate = [[UIApplication sharedApplication] delegate];
        
        if ([delegate respondsToSelector:@selector(viewController)]) {
            id vc = [delegate performSelector:@selector(viewController)];
            if ([vc isKindOfClass:[CDVViewController class]]) {
                gWhitelist = [((CDVViewController*)vc).whitelist retain];
            }
        }
    }
    
    // we only care about http and https connections
	if ([gWhitelist schemeIsAllowed:theScheme])
    {
        // if it FAILS the whitelist, we return TRUE, so we can fail the connection later
        return ![gWhitelist URLIsAllowed:theUrl];
    }
    
    return NO;
}

+ (NSURLRequest*) canonicalRequestForRequest:(NSURLRequest*) request 
{
    //NSLog(@"%@ received %@", self, NSStringFromSelector(_cmd));
    return request;
}

- (void) startLoading
{    
    //NSLog(@"%@ received %@ - start", self, NSStringFromSelector(_cmd));
    NSURL* url = [[self request] URL];
    NSString* body = [gWhitelist errorStringForURL:url];

    CDVHTTPURLResponse* response = [[CDVHTTPURLResponse alloc] initWithUnauthorizedURL:url];
    
    [[self client] URLProtocol:self didReceiveResponse:response cacheStoragePolicy:NSURLCacheStorageNotAllowed];
    
    [[self client] URLProtocol:self didLoadData:[body dataUsingEncoding:NSASCIIStringEncoding]];

    [[self client] URLProtocolDidFinishLoading:self];                
    
    [response release];    
}

- (void) stopLoading
{
    // do any cleanup here
}

+ (BOOL) requestIsCacheEquivalent: (NSURLRequest*)requestA toRequest: (NSURLRequest*)requestB 
{
    return NO;
}

@end



@implementation CDVHTTPURLResponse

- (id) initWithUnauthorizedURL:(NSURL*)url
{
    NSInteger statusCode = 401;
    NSDictionary* headerFields = [NSDictionary dictionaryWithObject:@"Digest realm = \"Cordova.plist/ExternalHosts\"" forKey:@"WWW-Authenticate"];
    double requestTime = 1;
    
    SEL selector = NSSelectorFromString(@"initWithURL:statusCode:headerFields:requestTime:");
    NSMethodSignature* signature = [self methodSignatureForSelector:selector];
    
    NSInvocation* inv = [NSInvocation invocationWithMethodSignature:signature];
    [inv setTarget:self];
    [inv setSelector:selector];
    [inv setArgument:&url atIndex:2];
    [inv setArgument:&statusCode atIndex:3];
    [inv setArgument:&headerFields atIndex:4];
    [inv setArgument:&requestTime atIndex:5];
    
    [inv invoke];
    
    return self;
}

@end