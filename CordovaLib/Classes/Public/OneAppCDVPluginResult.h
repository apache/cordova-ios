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
#import "OneAppCDVAvailability.h"

typedef NS_ENUM(NSUInteger, OneAppCDVCommandStatus) {
    OneAppCDVCommandStatus_NO_RESULT NS_SWIFT_NAME(noResult) = 0,
    OneAppCDVCommandStatus_OK NS_SWIFT_NAME(ok),
    OneAppCDVCommandStatus_CLASS_NOT_FOUND_EXCEPTION NS_SWIFT_NAME(classNotFoundException),
    OneAppCDVCommandStatus_ILLEGAL_ACCESS_EXCEPTION NS_SWIFT_NAME(illegalAccessException),
    OneAppCDVCommandStatus_INSTANTIATION_EXCEPTION NS_SWIFT_NAME(instantiationException),
    OneAppCDVCommandStatus_MALFORMED_URL_EXCEPTION NS_SWIFT_NAME(malformedUrlException),
    OneAppCDVCommandStatus_IO_EXCEPTION NS_SWIFT_NAME(ioException),
    OneAppCDVCommandStatus_INVALID_ACTION NS_SWIFT_NAME(invalidAction),
    OneAppCDVCommandStatus_JSON_EXCEPTION NS_SWIFT_NAME(jsonException),
    OneAppCDVCommandStatus_ERROR NS_SWIFT_NAME(error)
};

// This exists to preserve compatibility with early Swift plugins, who are
// using CDVCommandStatus as ObjC-style constants rather than as Swift enum
// values.
// This declares extern'ed constants (implemented in CDVPluginResult.m)
#define SWIFT_ENUM_COMPAT_HACK(enumVal) extern const OneAppCDVCommandStatus SWIFT_##enumVal NS_SWIFT_NAME(enumVal)
SWIFT_ENUM_COMPAT_HACK(OneAppCDVCommandStatus_NO_RESULT);
SWIFT_ENUM_COMPAT_HACK(OneAppCDVCommandStatus_OK);
SWIFT_ENUM_COMPAT_HACK(OneAppCDVCommandStatus_CLASS_NOT_FOUND_EXCEPTION);
SWIFT_ENUM_COMPAT_HACK(OneAppCDVCommandStatus_ILLEGAL_ACCESS_EXCEPTION);
SWIFT_ENUM_COMPAT_HACK(OneAppCDVCommandStatus_INSTANTIATION_EXCEPTION);
SWIFT_ENUM_COMPAT_HACK(OneAppCDVCommandStatus_MALFORMED_URL_EXCEPTION);
SWIFT_ENUM_COMPAT_HACK(OneAppCDVCommandStatus_IO_EXCEPTION);
SWIFT_ENUM_COMPAT_HACK(OneAppCDVCommandStatus_INVALID_ACTION);
SWIFT_ENUM_COMPAT_HACK(OneAppCDVCommandStatus_JSON_EXCEPTION);
SWIFT_ENUM_COMPAT_HACK(OneAppCDVCommandStatus_ERROR);
#undef SWIFT_ENUM_COMPAT_HACK

@interface OneAppCDVPluginResult : NSObject {}

@property (nonatomic, strong, readonly) NSNumber* status;
@property (nonatomic, strong, readonly) id message;
@property (nonatomic, strong)           NSNumber* keepCallback;
// This property can be used to scope the lifetime of another object. For example,
// Use it to store the associated NSData when `message` is created using initWithBytesNoCopy.
@property (nonatomic, strong) id associatedObject;

- (OneAppCDVPluginResult*)init;
+ (OneAppCDVPluginResult*)resultWithStatus:(OneAppCDVCommandStatus)statusOrdinal;
+ (OneAppCDVPluginResult*)resultWithStatus:(OneAppCDVCommandStatus)statusOrdinal messageAsString:(NSString*)theMessage;
+ (OneAppCDVPluginResult*)resultWithStatus:(OneAppCDVCommandStatus)statusOrdinal messageAsArray:(NSArray*)theMessage;
+ (OneAppCDVPluginResult*)resultWithStatus:(OneAppCDVCommandStatus)statusOrdinal messageAsInt:(int)theMessage;
+ (OneAppCDVPluginResult*)resultWithStatus:(OneAppCDVCommandStatus)statusOrdinal messageAsNSInteger:(NSInteger)theMessage;
+ (OneAppCDVPluginResult*)resultWithStatus:(OneAppCDVCommandStatus)statusOrdinal messageAsNSUInteger:(NSUInteger)theMessage;
+ (OneAppCDVPluginResult*)resultWithStatus:(OneAppCDVCommandStatus)statusOrdinal messageAsDouble:(double)theMessage;
+ (OneAppCDVPluginResult*)resultWithStatus:(OneAppCDVCommandStatus)statusOrdinal messageAsBool:(BOOL)theMessage;
+ (OneAppCDVPluginResult*)resultWithStatus:(OneAppCDVCommandStatus)statusOrdinal messageAsDictionary:(NSDictionary*)theMessage;
+ (OneAppCDVPluginResult*)resultWithStatus:(OneAppCDVCommandStatus)statusOrdinal messageAsArrayBuffer:(NSData*)theMessage;
+ (OneAppCDVPluginResult*)resultWithStatus:(OneAppCDVCommandStatus)statusOrdinal messageAsMultipart:(NSArray*)theMessages;
+ (OneAppCDVPluginResult*)resultWithStatus:(OneAppCDVCommandStatus)statusOrdinal messageToErrorObject:(int)errorCode;

+ (void)setVerbose:(BOOL)verbose;
+ (BOOL)isVerbose;

- (void)setKeepCallbackAsBool:(BOOL)bKeepCallback;

- (NSString*)argumentsAsJSON;

@end
