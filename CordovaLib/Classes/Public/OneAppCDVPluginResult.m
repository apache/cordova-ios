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

#import "OneAppCDVPluginResult.h"
#import "CDVJSON_private.h"
#import "CDVDebug.h"

// This exists to preserve compatibility with early Swift plugins, who are
// using CDVCommandStatus as ObjC-style constants rather than as Swift enum
// values.
// These constants alias the enum values back to their previous names.
#define SWIFT_ENUM_COMPAT_HACK(enumVal) const OneAppCDVCommandStatus SWIFT_##enumVal NS_SWIFT_NAME(enumVal) = enumVal
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

@interface OneAppCDVPluginResult ()

- (OneAppCDVPluginResult*)initWithStatus:(OneAppCDVCommandStatus)statusOrdinal message:(id)theMessage;

@end

@implementation OneAppCDVPluginResult
@synthesize status, message, keepCallback, associatedObject;

static NSArray* org_apache_cordova_CommandStatusMsgs;

id messageFromArrayBuffer(NSData* data)
{
    return @{
               @"CDVType" : @"ArrayBuffer",
               @"data" :[data base64EncodedStringWithOptions:0]
    };
}

id massageMessage(id message)
{
    if ([message isKindOfClass:[NSData class]]) {
        return messageFromArrayBuffer(message);
    }
    return message;
}

id messageFromMultipart(NSArray* theMessages)
{
    NSMutableArray* messages = [NSMutableArray arrayWithArray:theMessages];

    for (NSUInteger i = 0; i < messages.count; ++i) {
        [messages replaceObjectAtIndex:i withObject:massageMessage([messages objectAtIndex:i])];
    }

    return @{
               @"CDVType" : @"MultiPart",
               @"messages" : messages
    };
}

+ (void)initialize
{
    org_apache_cordova_CommandStatusMsgs = [[NSArray alloc] initWithObjects:@"No result",
        @"OK",
        @"Class not found",
        @"Illegal access",
        @"Instantiation error",
        @"Malformed url",
        @"IO error",
        @"Invalid action",
        @"JSON error",
        @"Error",
        nil];
}

- (OneAppCDVPluginResult*)init
{
    return [self initWithStatus:OneAppCDVCommandStatus_NO_RESULT message:nil];
}

- (OneAppCDVPluginResult*)initWithStatus:(OneAppCDVCommandStatus)statusOrdinal message:(id)theMessage
{
    self = [super init];
    if (self) {
        status = @(statusOrdinal);
        message = theMessage;
        keepCallback = [NSNumber numberWithBool:NO];
    }
    return self;
}

+ (OneAppCDVPluginResult*)resultWithStatus:(OneAppCDVCommandStatus)statusOrdinal
{
    return [[self alloc] initWithStatus:statusOrdinal message:nil];
}

+ (OneAppCDVPluginResult*)resultWithStatus:(OneAppCDVCommandStatus)statusOrdinal messageAsString:(NSString*)theMessage
{
    return [[self alloc] initWithStatus:statusOrdinal message:theMessage];
}

+ (OneAppCDVPluginResult*)resultWithStatus:(OneAppCDVCommandStatus)statusOrdinal messageAsArray:(NSArray*)theMessage
{
    return [[self alloc] initWithStatus:statusOrdinal message:theMessage];
}

+ (OneAppCDVPluginResult*)resultWithStatus:(OneAppCDVCommandStatus)statusOrdinal messageAsInt:(int)theMessage
{
    return [[self alloc] initWithStatus:statusOrdinal message:[NSNumber numberWithInt:theMessage]];
}

+ (OneAppCDVPluginResult*)resultWithStatus:(OneAppCDVCommandStatus)statusOrdinal messageAsNSInteger:(NSInteger)theMessage
{
    return [[self alloc] initWithStatus:statusOrdinal message:[NSNumber numberWithInteger:theMessage]];
}

+ (OneAppCDVPluginResult*)resultWithStatus:(OneAppCDVCommandStatus)statusOrdinal messageAsNSUInteger:(NSUInteger)theMessage
{
    return [[self alloc] initWithStatus:statusOrdinal message:[NSNumber numberWithUnsignedInteger:theMessage]];
}

+ (OneAppCDVPluginResult*)resultWithStatus:(OneAppCDVCommandStatus)statusOrdinal messageAsDouble:(double)theMessage
{
    return [[self alloc] initWithStatus:statusOrdinal message:[NSNumber numberWithDouble:theMessage]];
}

+ (OneAppCDVPluginResult*)resultWithStatus:(OneAppCDVCommandStatus)statusOrdinal messageAsBool:(BOOL)theMessage
{
    return [[self alloc] initWithStatus:statusOrdinal message:[NSNumber numberWithBool:theMessage]];
}

+ (OneAppCDVPluginResult*)resultWithStatus:(OneAppCDVCommandStatus)statusOrdinal messageAsDictionary:(NSDictionary*)theMessage
{
    return [[self alloc] initWithStatus:statusOrdinal message:theMessage];
}

+ (OneAppCDVPluginResult*)resultWithStatus:(OneAppCDVCommandStatus)statusOrdinal messageAsArrayBuffer:(NSData*)theMessage
{
    return [[self alloc] initWithStatus:statusOrdinal message:messageFromArrayBuffer(theMessage)];
}

+ (OneAppCDVPluginResult*)resultWithStatus:(OneAppCDVCommandStatus)statusOrdinal messageAsMultipart:(NSArray*)theMessages
{
    return [[self alloc] initWithStatus:statusOrdinal message:messageFromMultipart(theMessages)];
}

+ (OneAppCDVPluginResult*)resultWithStatus:(OneAppCDVCommandStatus)statusOrdinal messageToErrorObject:(int)errorCode
{
    NSDictionary* errDict = @{@"code" :[NSNumber numberWithInt:errorCode]};

    return [[self alloc] initWithStatus:statusOrdinal message:errDict];
}

- (void)setKeepCallbackAsBool:(BOOL)bKeepCallback
{
    [self setKeepCallback:[NSNumber numberWithBool:bKeepCallback]];
}

- (NSString*)argumentsAsJSON
{
    id arguments = (self.message == nil ? [NSNull null] : self.message);
    NSArray* argumentsWrappedInArray = [NSArray arrayWithObject:arguments];

    NSString* argumentsJSON = [argumentsWrappedInArray cdv_JSONString];

    argumentsJSON = [argumentsJSON substringWithRange:NSMakeRange(1, [argumentsJSON length] - 2)];

    return argumentsJSON;
}

static BOOL gIsVerbose = NO;
+ (void)setVerbose:(BOOL)verbose
{
    gIsVerbose = verbose;
}

+ (BOOL)isVerbose
{
    return gIsVerbose;
}

@end
