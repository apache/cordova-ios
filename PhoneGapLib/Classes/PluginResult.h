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
