/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 */

#import <Foundation/Foundation.h>


@interface InvokedUrlCommand : NSObject {
	NSString* command;
	NSString* className;
	NSString* methodName;
	NSMutableArray* arguments;
	NSMutableDictionary* options;
}

@property(retain) NSMutableArray* arguments;
@property(retain) NSMutableDictionary* options;
@property(copy) NSString* command;
@property(copy) NSString* className;
@property(copy) NSString* methodName;

+ (InvokedUrlCommand*) newFromUrl:(NSURL*)url;

- (void) dealloc;

@end
