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
#import <Cordova/CDVAvailability.h>

typedef NS_ENUM(NSUInteger, CDVCommandStatus) {
    CDVCommandStatus_NO_RESULT NS_SWIFT_NAME(noResult) = 0,
    CDVCommandStatus_OK NS_SWIFT_NAME(ok),
    CDVCommandStatus_CLASS_NOT_FOUND_EXCEPTION NS_SWIFT_NAME(classNotFoundException),
    CDVCommandStatus_ILLEGAL_ACCESS_EXCEPTION NS_SWIFT_NAME(illegalAccessException),
    CDVCommandStatus_INSTANTIATION_EXCEPTION NS_SWIFT_NAME(instantiationException),
    CDVCommandStatus_MALFORMED_URL_EXCEPTION NS_SWIFT_NAME(malformedUrlException),
    CDVCommandStatus_IO_EXCEPTION NS_SWIFT_NAME(ioException),
    CDVCommandStatus_INVALID_ACTION NS_SWIFT_NAME(invalidAction),
    CDVCommandStatus_JSON_EXCEPTION NS_SWIFT_NAME(jsonException),
    CDVCommandStatus_ERROR NS_SWIFT_NAME(error)
};

#ifdef __swift__
// This exists to preserve compatibility with early Swift plugins, who are
// using CDVCommandStatus as ObjC-style constants rather than as Swift enum
// values.
// This declares extern'ed constants (implemented in CDVPluginResult.m)
// TODO: Remove this in Cordova iOS 9
#define SWIFT_ENUM_COMPAT_HACK(enumVal, replacement) extern const CDVCommandStatus SWIFT_##enumVal NS_SWIFT_NAME(enumVal) CDV_DEPRECATED_WITH_REPLACEMENT(8, "Use the CDVCommandStatus." #replacement " enum value instead", "CDVCommandStatus." #replacement)
SWIFT_ENUM_COMPAT_HACK(CDVCommandStatus_NO_RESULT, noResult);
SWIFT_ENUM_COMPAT_HACK(CDVCommandStatus_OK, ok);
SWIFT_ENUM_COMPAT_HACK(CDVCommandStatus_CLASS_NOT_FOUND_EXCEPTION, classNotFoundException);
SWIFT_ENUM_COMPAT_HACK(CDVCommandStatus_ILLEGAL_ACCESS_EXCEPTION, illegalAccessException);
SWIFT_ENUM_COMPAT_HACK(CDVCommandStatus_INSTANTIATION_EXCEPTION, instantiationException);
SWIFT_ENUM_COMPAT_HACK(CDVCommandStatus_MALFORMED_URL_EXCEPTION, malformedUrlException);
SWIFT_ENUM_COMPAT_HACK(CDVCommandStatus_IO_EXCEPTION, ioException);
SWIFT_ENUM_COMPAT_HACK(CDVCommandStatus_INVALID_ACTION, invalidAction);
SWIFT_ENUM_COMPAT_HACK(CDVCommandStatus_JSON_EXCEPTION, jsonException);
SWIFT_ENUM_COMPAT_HACK(CDVCommandStatus_ERROR, error);
#undef SWIFT_ENUM_COMPAT_HACK
#endif


NS_ASSUME_NONNULL_BEGIN

@interface CDVPluginResult : NSObject {}

@property (nonatomic, strong, readonly) NSNumber *status;
@property (nonatomic, strong, readonly) id message;
@property (nonatomic, strong)           NSNumber *keepCallback;
// This property can be used to scope the lifetime of another object. For example,
// Use it to store the associated NSData when `message` is created using initWithBytesNoCopy.
@property (nonatomic, strong) id associatedObject;

- (instancetype)init;
+ (instancetype)resultWithStatus:(CDVCommandStatus)statusOrdinal;
+ (instancetype)resultWithStatus:(CDVCommandStatus)statusOrdinal messageAsString:(NSString *)theMessage;
+ (instancetype)resultWithStatus:(CDVCommandStatus)statusOrdinal messageAsArray:(NSArray *)theMessage;
+ (instancetype)resultWithStatus:(CDVCommandStatus)statusOrdinal messageAsInt:(int)theMessage;
+ (instancetype)resultWithStatus:(CDVCommandStatus)statusOrdinal messageAsNSInteger:(NSInteger)theMessage;
+ (instancetype)resultWithStatus:(CDVCommandStatus)statusOrdinal messageAsNSUInteger:(NSUInteger)theMessage;
+ (instancetype)resultWithStatus:(CDVCommandStatus)statusOrdinal messageAsDouble:(double)theMessage;
+ (instancetype)resultWithStatus:(CDVCommandStatus)statusOrdinal messageAsBool:(BOOL)theMessage;
+ (instancetype)resultWithStatus:(CDVCommandStatus)statusOrdinal messageAsDictionary:(NSDictionary *)theMessage;
+ (instancetype)resultWithStatus:(CDVCommandStatus)statusOrdinal messageAsArrayBuffer:(NSData *)theMessage;
+ (instancetype)resultWithStatus:(CDVCommandStatus)statusOrdinal messageAsMultipart:(NSArray *)theMessages;
+ (instancetype)resultWithStatus:(CDVCommandStatus)statusOrdinal messageToErrorObject:(int)errorCode;

+ (void)setVerbose:(BOOL)verbose;
+ (BOOL)isVerbose;

- (void)setKeepCallbackAsBool:(BOOL)bKeepCallback;

- (NSString*)argumentsAsJSON;

@end

NS_ASSUME_NONNULL_END
