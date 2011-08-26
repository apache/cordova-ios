//
//  PGURLProtocol.h
//  PhoneGapLib
//
//  Created by Shazron Abdullah on 11-08-25.
//  Copyright 2011 Nitobi Sofware Inc. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface PGURLProtocol : NSURLProtocol {
}

+ (void) registerPGHttpURLProtocol;

@end

@interface PGHTTPURLResponse : NSHTTPURLResponse {
} 

- (PGHTTPURLResponse*) initWithUnauthorizedURL:(NSURL*)url;

@end