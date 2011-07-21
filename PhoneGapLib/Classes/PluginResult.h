/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2011, Nitobi Software Inc.
 * Copyright 2011, IBM.
 */

#import <Foundation/Foundation.h>

typedef enum {
	PGCommandStatus_NO_RESULT = 0,
	PGCommandStatus_OK,
	PGCommandStatus_CLASS_NOT_FOUND_EXCEPTION,
	PGCommandStatus_ILLEGAL_ACCESS_EXCEPTION,
	PGCommandStatus_INSTANTIATION_EXCEPTION,
	PGCommandStatus_MALFORMED_URL_EXCEPTION,
	PGCommandStatus_IO_EXCEPTION,
	PGCommandStatus_INVALID_ACTION,
	PGCommandStatus_JSON_EXCEPTION,
	PGCommandStatus_ERROR
} PGCommandStatus;
	
@interface PluginResult : NSObject {
	NSNumber* status;
	id message;
	NSNumber* keepCallback;
	NSString* cast;
	
}

@property (nonatomic, retain, readonly) NSNumber* status;
@property (nonatomic, retain, readonly) id message;
@property (nonatomic, retain)			NSNumber* keepCallback;
@property (nonatomic, retain, readonly) NSString* cast;

-(PluginResult*) init;
+(void) releaseStatus;
+(PluginResult*) resultWithStatus: (PGCommandStatus) statusOrdinal;
+(PluginResult*) resultWithStatus: (PGCommandStatus) statusOrdinal messageAsString: (NSString*) theMessage;
+(PluginResult*) resultWithStatus: (PGCommandStatus) statusOrdinal messageAsArray: (NSArray*) theMessage;
+(PluginResult*) resultWithStatus: (PGCommandStatus) statusOrdinal messageAsInt: (int) theMessage;
+(PluginResult*) resultWithStatus: (PGCommandStatus) statusOrdinal messageAsDouble: (double) theMessage;
+(PluginResult*) resultWithStatus: (PGCommandStatus) statusOrdinal messageAsDictionary: (NSDictionary*) theMessage;
+(PluginResult*) resultWithStatus: (PGCommandStatus) statusOrdinal messageAsString: (NSString*) theMessage cast: (NSString*) theCast;
+(PluginResult*) resultWithStatus: (PGCommandStatus) statusOrdinal messageAsArray: (NSArray*) theMessage cast: (NSString*) theCast;
+(PluginResult*) resultWithStatus: (PGCommandStatus) statusOrdinal messageAsInt: (int) theMessage cast: (NSString*) theCast;
+(PluginResult*) resultWithStatus: (PGCommandStatus) statusOrdinal messageAsDouble: (double) theMessage cast: (NSString*) theCast;
+(PluginResult*) resultWithStatus: (PGCommandStatus) statusOrdinal messageAsDictionary: (NSDictionary*) theMessage cast: (NSString*) theCast;
+(PluginResult*) resultWithStatus: (PGCommandStatus) statusOrdinal messageToErrorObject: (int) errorCode;


 
-(void) setKeepCallbackAsBool: (BOOL) bKeepCallback;


-(NSString*) toJSONString;
-(NSString*) toSuccessCallbackString: (NSString*) callbackId;
-(NSString*) toErrorCallbackString: (NSString*) callbackId;

-(void) dealloc;
@end
