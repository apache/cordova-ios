//
//  PGWhitelist.h
//  PhoneGapLib
//
//  Created by Shazron Abdullah on 11-08-25.
//  Copyright 2011 __MyCompanyName__. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface PGWhitelist : NSObject

@property (nonatomic, readonly, retain) NSArray* whitelist;
@property (nonatomic, readonly, retain) NSArray* expandedWhitelist;
@property (nonatomic, readonly, assign) BOOL allowAll;

- (id) initWithArray:(NSArray*)array;
- (BOOL) URLIsAllowed:(NSURL*)url;
- (BOOL) schemeIsAllowed:(NSString*)scheme;
- (NSString*) errorStringForURL:(NSURL*)url;

@end
