//
//  PGURLProtocol.m
//  PhoneGapLib
//
//  Created by Shazron Abdullah on 11-08-25.
//  Copyright 2011 Nitobi Software Inc. All rights reserved.
//

#import "PGURLProtocol.h"
#import "PGWhitelist.h"
#import  "PhoneGapDelegate.h"

static PGWhitelist* gWhitelist = nil;

@implementation PGURLProtocol

// Called before any use of the protocol, ensure it is only called once
+ (void) registerPGHttpURLProtocol {
    static BOOL registered = NO;
    if (!registered) {
        [NSURLProtocol registerClass:[PGURLProtocol class]];
        registered = YES;
    }
}

+ (BOOL) canInitWithRequest:(NSURLRequest *)theRequest
{
    NSURL* theUrl = [theRequest URL];
    NSString* theScheme = [theUrl scheme];
    
    if (gWhitelist == nil) {
        PhoneGapDelegate* delegate = (PhoneGapDelegate*)[[UIApplication sharedApplication] delegate];
        gWhitelist = [delegate.whitelist retain];
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

    PGHTTPURLResponse* response = [[PGHTTPURLResponse alloc] initWithUnauthorizedURL:url];
    
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



@implementation PGHTTPURLResponse

- (id) initWithUnauthorizedURL:(NSURL*)url
{
    NSInteger statusCode = 401;
    NSDictionary* headerFields = [NSDictionary dictionaryWithObject:@"Digest realm = \"PhoneGap.plist/ExternalHosts\"" forKey:@"WWW-Authenticate"];
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