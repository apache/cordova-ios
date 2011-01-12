/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2011, Nitobi Software Inc.
 * Copyright 2011, IBM.
 */


#import "PluginResult.h"
#import "JSON.h"
#import "PGDebug.h"

@interface PluginResult()

-(PluginResult*) initWithStatus:(PGCommandStatus)statusOrdinal message: (id) theMessage cast: (NSString*) theCast;

@end


@implementation PluginResult
@synthesize status, message, keepCallback, cast;

static NSArray* com_phonegap_CommandStatusMsgs;

+(void) initialize
{
	com_phonegap_CommandStatusMsgs = [[NSArray alloc] initWithObjects: @"No result",
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
+(void) releaseStatus
{
	if (com_phonegap_CommandStatusMsgs != nil){
		[com_phonegap_CommandStatusMsgs release];
		com_phonegap_CommandStatusMsgs = nil;
	}
}
		
-(PluginResult*) init
{
	return [self initWithStatus: PGCommandStatus_NO_RESULT message: nil cast: nil];
}
-(PluginResult*) initWithStatus:(PGCommandStatus)statusOrdinal message: (id) theMessage cast: (NSString*) theCast{
	self = [super init];
	if(self) {
		status = [NSNumber numberWithInt: statusOrdinal];
		message = theMessage;
		cast = theCast;
		keepCallback = [NSNumber numberWithBool: NO];
	}
	return self;
}		
	
+(PluginResult*) resultWithStatus: (PGCommandStatus) statusOrdinal
{
	return [[[self alloc] initWithStatus: statusOrdinal message: [com_phonegap_CommandStatusMsgs objectAtIndex: statusOrdinal] cast: nil] autorelease];
}
+(PluginResult*) resultWithStatus: (PGCommandStatus) statusOrdinal messageAsString: (NSString*) theMessage
{
	return [[[self alloc] initWithStatus: statusOrdinal message: theMessage cast:nil] autorelease];
}
+(PluginResult*) resultWithStatus: (PGCommandStatus) statusOrdinal messageAsArray: (NSArray*) theMessage
{
	return [[[self alloc] initWithStatus: statusOrdinal message: theMessage cast:nil] autorelease];
}
+(PluginResult*) resultWithStatus: (PGCommandStatus) statusOrdinal messageAsInt: (int) theMessage
{
	return [[[self alloc] initWithStatus: statusOrdinal message: [NSNumber numberWithInt: theMessage] cast:nil] autorelease];
}
+(PluginResult*) resultWithStatus: (PGCommandStatus) statusOrdinal messageAsDouble: (double) theMessage
{
	return [[[self alloc] initWithStatus: statusOrdinal message: [NSNumber numberWithDouble: theMessage] cast:nil] autorelease];
}

+(PluginResult*) resultWithStatus: (PGCommandStatus) statusOrdinal messageAsDictionary: (NSDictionary*) theMessage
{
	return [[[self alloc] initWithStatus: statusOrdinal message: theMessage cast:nil] autorelease];
}
+(PluginResult*) resultWithStatus: (PGCommandStatus) statusOrdinal messageAsString: (NSString*) theMessage cast: (NSString*) theCast
{
	return [[[self alloc] initWithStatus: statusOrdinal message: theMessage cast:theCast] autorelease];
}
+(PluginResult*) resultWithStatus: (PGCommandStatus) statusOrdinal messageAsArray: (NSArray*) theMessage cast: (NSString*) theCast
{
	return [[[self alloc] initWithStatus: statusOrdinal message: theMessage cast:theCast] autorelease];
}

+(PluginResult*) resultWithStatus: (PGCommandStatus) statusOrdinal messageAsInt: (int) theMessage cast: (NSString*) theCast
{
	return [[[self alloc] initWithStatus: statusOrdinal message: [NSNumber numberWithInt: theMessage] cast:theCast] autorelease];
}
+(PluginResult*) resultWithStatus: (PGCommandStatus) statusOrdinal messageAsDouble: (double) theMessage cast: (NSString*) theCast
{
	return [[[self alloc] initWithStatus: statusOrdinal message: [NSNumber numberWithDouble: theMessage] cast:theCast] autorelease];
}
+(PluginResult*) resultWithStatus: (PGCommandStatus) statusOrdinal messageAsDictionary: (NSDictionary*) theMessage cast: (NSString*) theCast
{
	return [[[self alloc] initWithStatus: statusOrdinal message: theMessage cast:theCast] autorelease];
}
+(PluginResult*) resultWithStatus: (PGCommandStatus) statusOrdinal messageToErrorObject: (int) errorCode 
{
    NSDictionary* errDict = [NSDictionary dictionaryWithObject:[NSNumber numberWithInt:errorCode] forKey:@"code"];
	return [[[self alloc] initWithStatus: statusOrdinal message: errDict cast:nil] autorelease];
}


-(void) setKeepCallbackAsBool:(BOOL)bKeepCallback
{
	[self setKeepCallback: [NSNumber numberWithBool:bKeepCallback]];
}

-(NSString*) toJSONString{
	NSString* resultString;
	// create the returned strings properly based on return type.  Assumes that non-strings are to be returned as objects
	if ([self.message isKindOfClass: [NSNumber class]]) {
		// return as number
        if((strcmp([self.message objCType], @encode(int))) == 0) {
            resultString = [NSString stringWithFormat: @"{\"status\": %d, \"message\": %d,\"keepCallback\":%d}", 
							[self.status intValue], [self.message intValue], [self.keepCallback boolValue]];
        } else if((strcmp([self.message objCType], @encode(double))) == 0) {
            resultString = [NSString stringWithFormat: @"{\"status\": %d, \"message\": %f,\"keepCallback\":%d}", 
							[self.status intValue], [self.message doubleValue], [self.keepCallback boolValue]];
        }
	} else if ([self.message isKindOfClass:[NSArray class]]){
		// return as array of strings
		resultString = [NSString stringWithFormat: @"{\"status\": %d, \"message\": [%@],\"keepCallback\":%d}", 
					[self.status intValue], [self.message componentsJoinedByString: @","], [self.keepCallback boolValue]];
	} else if ([self.message isKindOfClass: [NSDictionary class]]) {
		// return as object 
		resultString = [NSString stringWithFormat: @"{\"status\": %d, \"message\": %@,\"keepCallback\":%d}", 
					[self.status intValue], [self.message  JSONRepresentation], [self.keepCallback boolValue]];
	
	}else { 
		// assume NSString - return quoted string
		resultString = [NSString stringWithFormat: @"{\"status\": %d, \"message\": \"%@\",\"keepCallback\":%d}", 
					[self.status intValue], self.message, [self.keepCallback boolValue]];
	}

	DLog(@"PluginResult:toJSONString - %@", resultString);
	return resultString;
}
-(NSString*) toSuccessCallbackString: (NSString*) callbackId
{
	NSString* successCB;
	
	if ([self cast] != nil) {
		successCB = [NSString stringWithFormat: @"var temp = %@(%@);\nPhoneGap.callbackSuccess('%@',temp);", self.cast, [self toJSONString], callbackId];
	}
	else {
		successCB = [NSString stringWithFormat:@"PhoneGap.callbackSuccess('%@',%@);", callbackId, [self toJSONString]];			
	}
	DLog(@"PluginResult toSuccessCallbackString: %@", successCB);
	return successCB;
}
-(NSString*) toErrorCallbackString: (NSString*) callbackId
{
	NSString* errorCB = nil;
	
	if ([self cast] != nil) {
		errorCB = [NSString stringWithFormat: @"var temp = %@(%@);\nPhoneGap.callbackError('%@',temp);", self.cast, [self toJSONString], callbackId];
	}
	else {
		errorCB = [NSString stringWithFormat:@"PhoneGap.callbackError('%@',%@);", callbackId, [self toJSONString]];
	}
	DLog(@"PluginResult toErrorCallbackString: %@", errorCB);
	return errorCB;
}	
										 
-(void) dealloc
{
	status = nil;
	message = nil;
	keepCallback = nil;
	cast = nil;
	
	[super dealloc];
}
@end
