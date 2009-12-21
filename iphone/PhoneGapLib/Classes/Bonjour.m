//
//  Bonjour.m
//  PhoneGap
//
//  Created by Brant Vasilieff on 3/1/09.
//  Copyright 2009 __MyCompanyName__. All rights reserved.
//

#import "Bonjour.h"


@implementation Bonjour

- (void)start:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
}

- (void)stop:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
}

- (id)init
{
    if (self = [super init])
    {
        __identifier = nil;
    }
    return self;
}

- (void)dealloc
{
    [__identifier release];
    [super dealloc];
}

@end
