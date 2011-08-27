/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 */

#import "InvokedUrlCommand.h"
#import "JSON.h"

@implementation InvokedUrlCommand

@synthesize arguments;
@synthesize options;
@synthesize className;
@synthesize methodName;

+ (InvokedUrlCommand*) commandFromObject:(NSDictionary*)object
{
    InvokedUrlCommand* iuc = [[[InvokedUrlCommand alloc] init] autorelease];
    iuc.className = [object objectForKey:@"className"];
    iuc.methodName = [object objectForKey:@"methodName"];
    iuc.arguments = [object objectForKey:@"arguments"];
    iuc.options = [object objectForKey:@"options"];

    return iuc;
}

- (void) dealloc
{
    [arguments release];
    [options release];
    [className release];
    [methodName release];
    
    [super dealloc];
}

@end
