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

#import "CDV.h"

#include <CFNetwork/CFNetwork.h>

@interface CDVFileTransfer ()
// Sets the requests headers for the request.
- (void)applyRequestHeaders:(NSDictionary*)headers toRequest:(NSMutableURLRequest*)req;
// Creates a delegate to handle an upload.
- (CDVFileTransferDelegate*)delegateForUploadCommand:(CDVInvokedUrlCommand*)command;
// Creates an NSData* for the file for the given upload arguments.
- (NSData*)fileDataForUploadCommand:(CDVInvokedUrlCommand*)command;
@end

// Buffer size to use for streaming uploads.
static const NSUInteger kStreamBufferSize = 32768;
// Magic value within the options dict used to set a cookie.
NSString* const kOptionsKeyCookie = @"__cookie";
// Form boundary for multi-part requests.
NSString* const kFormBoundary = @"*****org.apache.cordova.formBoundary";
  


// Writes the given data to the stream in a blocking way.
// If successful, returns bytesToWrite.
// If the stream was closed on the other end, returns 0.
// If there was an error, returns -1.
static CFIndex WriteDataToStream(NSData* data, CFWriteStreamRef stream) {
    UInt8* bytes = (UInt8*)[data bytes];
    NSUInteger bytesToWrite = [data length];
    NSUInteger totalBytesWritten = 0;
    while (totalBytesWritten < bytesToWrite) {
        CFIndex result = CFWriteStreamWrite(stream,
              bytes + totalBytesWritten,
              bytesToWrite - totalBytesWritten);
        if (result < 0) {
            CFStreamError error = CFWriteStreamGetError(stream);
            NSLog(@"WriteStreamError domain: %ld error: %ld", error.domain, error.error);
            return result;
        } else if (result == 0) {
            return result;
        }
        totalBytesWritten += result;
    }
    return totalBytesWritten;
}

@implementation CDVFileTransfer

- (NSString*) escapePathComponentForUrlString:(NSString*)urlString
{
    NSRange schemeAndHostRange = [urlString rangeOfString:@"://.*?/" options:NSRegularExpressionSearch];
    if (schemeAndHostRange.length == 0) {
        return urlString;
    }

    NSInteger schemeAndHostEndIndex = NSMaxRange(schemeAndHostRange);
    NSString* schemeAndHost = [urlString substringToIndex:schemeAndHostEndIndex];
    NSString* pathComponent = [urlString substringFromIndex:schemeAndHostEndIndex];
    pathComponent = [pathComponent stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
    
    return [schemeAndHost stringByAppendingString:pathComponent];
}

- (void) applyRequestHeaders:(NSDictionary*)headers toRequest:(NSMutableURLRequest*)req {
    [req setValue:@"XMLHttpRequest" forHTTPHeaderField:@"X-Requested-With"];

    NSString* userAgent = [[self.webView request] valueForHTTPHeaderField:@"User-Agent"];    
    if (userAgent) {
        [req setValue: userAgent forHTTPHeaderField:@"User-Agent"];
    }
    
    for (NSString* headerName in headers) {
        id value = [headers objectForKey:headerName];
        if (!value || value == [NSNull null]) {
            value = @"null";
        }

        // First, remove an existing header if one exists.
        [req setValue:nil forHTTPHeaderField:headerName];

        if (![value isKindOfClass:[NSArray class]]) {
            value = [NSArray arrayWithObject:value];
        }
        // Then, append all header values.
        for (id __strong subValue in value) {
            // Convert from an NSNumber -> NSString.
            if ([subValue respondsToSelector:@selector(stringValue)]) {
                subValue = [subValue stringValue];
            }
            if ([subValue isKindOfClass:[NSString class]]) {
                [req addValue:subValue forHTTPHeaderField:headerName];
            }
        }
    }
}

- (NSURLRequest*) requestForUploadCommand:(CDVInvokedUrlCommand *)command fileData:(NSData *)fileData {
    // arguments order from js: [filePath, server, fileKey, fileName, mimeType, params, debug, chunkedMode]
    // however, params is a JavaScript object and during marshalling is put into the options dict, 
    // thus debug and chunkedMode are the 6th and 7th arguments
    NSArray* arguments = command.arguments;
    NSString* target = (NSString*)[arguments objectAtIndex:0];
    NSString* server = (NSString*)[arguments objectAtIndex:1];
    NSString* fileKey = (NSString*)[arguments objectAtIndex:2];
    NSString* fileName = [arguments objectAtIndex:3 withDefault:@"no-filename"];
    NSString* mimeType = [arguments objectAtIndex:4 withDefault:nil];
    NSDictionary* options = [arguments objectAtIndex:5 withDefault:nil];
//  NSString* trustAllHosts = (NSString*)[arguments objectAtIndex:6]; // allow self-signed certs
    BOOL chunkedMode = [[arguments objectAtIndex:7 withDefault:[NSNumber numberWithBool:YES]] boolValue];
    NSDictionary* headers = [arguments objectAtIndex:8 withDefault:nil];

    // CFStreamCreateBoundPair crashes on iOS < 5.
    if (!IsAtLeastiOSVersion(@"5")) {
        // TODO(agrieve): See if it's okay license-wise to include the work-around code from:
        // http://developer.apple.com/library/ios/#samplecode/SimpleURLConnections/Listings/PostController_m.html
        chunkedMode = NO;
    }

    CDVPluginResult* result = nil;
    CDVFileTransferError errorCode = 0;

    // NSURL does not accepts URLs with spaces in the path. We escape the path in order
    // to be more lenient.
    NSURL *url = [NSURL URLWithString:server];
    
    if (!url) {
        errorCode = INVALID_URL_ERR;
        NSLog(@"File Transfer Error: Invalid server URL %@", server);
    } else if (!fileData) {
        errorCode = FILE_NOT_FOUND_ERR;
    }
    
    if(errorCode > 0) {
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary: [self createFileTransferError:errorCode AndSource:target AndTarget:server]];
        
        [self writeJavascript:[result toErrorCallbackString:command.callbackId]];
        return nil;
    }
    
    NSMutableURLRequest *req = [NSMutableURLRequest requestWithURL:url];
	[req setHTTPMethod:@"POST"];
	
//    Magic value to set a cookie
	if([options objectForKey:kOptionsKeyCookie]) {
		[req setValue:[options objectForKey:kOptionsKeyCookie] forHTTPHeaderField:@"Cookie"];
		[req setHTTPShouldHandleCookies:NO];
	}
    
	NSString *contentType = [NSString stringWithFormat:@"multipart/form-data; boundary=%@", kFormBoundary];
	[req setValue:contentType forHTTPHeaderField:@"Content-Type"];
    [self applyRequestHeaders:headers toRequest:req];
    
    NSData* formBoundaryData = [[NSString stringWithFormat:@"--%@\r\n", kFormBoundary] dataUsingEncoding:NSUTF8StringEncoding];
	NSMutableData *postBodyBeforeFile = [NSMutableData data];

	for (NSString* key in options) {
		id val = [options objectForKey:key];
		if(!val || val == [NSNull null] || [key isEqualToString:kOptionsKeyCookie]) {
			continue;	
		}
		// if it responds to stringValue selector (eg NSNumber) get the NSString
		if ([val respondsToSelector:@selector(stringValue)]) {
			val = [val stringValue];
		}
		// finally, check whether it is a NSString (for dataUsingEncoding selector below)
		if (![val isKindOfClass:[NSString class]]) {
			continue;
		}
		
		[postBodyBeforeFile appendData:formBoundaryData];
		[postBodyBeforeFile appendData:[[NSString stringWithFormat:@"Content-Disposition: form-data; name=\"%@\"\r\n\r\n", key] dataUsingEncoding:NSUTF8StringEncoding]];
		[postBodyBeforeFile appendData:[val dataUsingEncoding:NSUTF8StringEncoding]];
		[postBodyBeforeFile appendData:[@"\r\n" dataUsingEncoding:NSUTF8StringEncoding]];
	}
    
	[postBodyBeforeFile appendData:formBoundaryData];
	[postBodyBeforeFile appendData:[[NSString stringWithFormat:@"Content-Disposition: form-data; name=\"%@\"; filename=\"%@\"\r\n", fileKey, fileName] dataUsingEncoding:NSUTF8StringEncoding]];
    if (mimeType != nil) {
        [postBodyBeforeFile appendData:[[NSString stringWithFormat:@"Content-Type: %@\r\n", mimeType] dataUsingEncoding:NSUTF8StringEncoding]];
    }
    [postBodyBeforeFile appendData:[[NSString stringWithFormat:@"Content-Length: %d\r\n\r\n", [fileData length]] dataUsingEncoding:NSUTF8StringEncoding]];

    DLog(@"fileData length: %d", [fileData length]);
 	NSData *postBodyAfterFile = [[NSString stringWithFormat:@"\r\n--%@--\r\n", kFormBoundary] dataUsingEncoding:NSUTF8StringEncoding];

    NSUInteger totalPayloadLength = [postBodyBeforeFile length] + [fileData length] + [postBodyAfterFile length];
    [req setValue:[[NSNumber numberWithInteger:totalPayloadLength] stringValue] forHTTPHeaderField:@"Content-Length"];
	
    
    if (chunkedMode) {
        CFReadStreamRef readStream = NULL;
        CFWriteStreamRef writeStream = NULL;
        CFStreamCreateBoundPair(NULL, &readStream, &writeStream, kStreamBufferSize);
        [req setHTTPBodyStream:CFBridgingRelease(readStream)];

        dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
            if (CFWriteStreamOpen(writeStream)) {
                NSData* chunks[] = { postBodyBeforeFile, fileData, postBodyAfterFile };
                int numChunks = sizeof(chunks) / sizeof(chunks[0]);
                for (int i = 0; i < numChunks; ++i) {
                    CFIndex result = WriteDataToStream(chunks[i], writeStream);
                    if (result <= 0) {
                        break;
                    }
                }
            } else {
                NSLog(@"FileTransfer: Failed to open writeStream");
            }
            CFWriteStreamClose(writeStream);
            CFRelease(writeStream);
        });
    } else {
        [postBodyBeforeFile appendData:fileData];
        [postBodyBeforeFile appendData:postBodyAfterFile];
    	[req setHTTPBody:postBodyBeforeFile];
    }    
	return req;
}

- (CDVFileTransferDelegate*) delegateForUploadCommand:(CDVInvokedUrlCommand *)command {
    NSString* target = [command.arguments objectAtIndex:0];
    NSString* server = [command.arguments objectAtIndex:1];

    CDVFileTransferDelegate* delegate = [[CDVFileTransferDelegate alloc] init];
	delegate.command = self;
    delegate.direction = CDV_TRANSFER_UPLOAD;
    delegate.callbackId = command.callbackId;
    delegate.source = server;
    delegate.target = target;
    return delegate;
}

- (NSData*) fileDataForUploadCommand:(CDVInvokedUrlCommand*)command {
    NSString* target = (NSString*)[command.arguments objectAtIndex:0];
    NSError* __autoreleasing err = nil;
    // Extract the path part out of a file: URL.
    NSString* filePath = [target hasPrefix:@"/"] ? [target copy] : [[NSURL URLWithString:target] path];

    // Memory map the file so that it can be read efficiently even if it is large.
    NSData* fileData = [NSData dataWithContentsOfFile:filePath options:NSDataReadingMappedIfSafe error:&err];
    if (err != nil) {
        NSLog(@"Error opening file %@: %@", target, err);
    }
    return fileData;
}

- (void) upload:(CDVInvokedUrlCommand*)command {
    // fileData and req are split into helper functions to ease the unit testing of delegateForUpload.
    NSData* fileData = [self fileDataForUploadCommand:command];
    NSURLRequest* req = [self requestForUploadCommand:command fileData:fileData];
    if (req != nil) {
        CDVFileTransferDelegate* delegate = [self delegateForUploadCommand:command];
        [NSURLConnection connectionWithRequest:req delegate:delegate];
    }
}

- (void) download:(CDVInvokedUrlCommand*)command {
    DLog(@"File Transfer downloading file...");
    NSString * sourceUrl = [command.arguments objectAtIndex:0];
    NSString * filePath = [command.arguments objectAtIndex:1];
    CDVPluginResult *result = nil;
    CDVFileTransferError errorCode = 0;

    NSURL* file;
    
    if ([filePath hasPrefix:@"/"]) {
        file = [NSURL fileURLWithPath:filePath];
    } else {
        file = [NSURL URLWithString:filePath];
    }
    
    NSURL *url = [NSURL URLWithString:sourceUrl];
    
    if (!url) {
        errorCode = INVALID_URL_ERR;
        NSLog(@"File Transfer Error: Invalid server URL %@", sourceUrl);
    } else if(![file isFileURL]) {
        errorCode = FILE_NOT_FOUND_ERR;
        NSLog(@"File Transfer Error: Invalid file path or URL %@", filePath);
    }
    
    if(errorCode > 0) {
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary: [self createFileTransferError:errorCode AndSource:sourceUrl AndTarget:filePath]];
        
        [self writeJavascript:[result toErrorCallbackString:command.callbackId]];
        return;
    }
    
    NSMutableURLRequest *req = [NSMutableURLRequest requestWithURL:url];
    [self applyRequestHeaders:nil toRequest:req];

    CDVFileTransferDelegate* delegate = [[CDVFileTransferDelegate alloc] init];
	delegate.command = self;
    delegate.direction = CDV_TRANSFER_DOWNLOAD;
    delegate.callbackId = command.callbackId;
    delegate.source = sourceUrl;
    delegate.target = filePath;
	
	[NSURLConnection connectionWithRequest:req delegate:delegate];
}

-(NSMutableDictionary*) createFileTransferError:(int)code AndSource:(NSString*)source AndTarget:(NSString*)target
{
    NSMutableDictionary* result = [NSMutableDictionary dictionaryWithCapacity:3];
    [result setObject: [NSNumber numberWithInt:code] forKey:@"code"];
	[result setObject: source forKey:@"source"];
	[result setObject: target forKey:@"target"];
    NSLog(@"FileTransferError %@", result);
    
    return result;
}

-(NSMutableDictionary*) createFileTransferError:(int)code 
                                      AndSource:(NSString*)source 
                                      AndTarget:(NSString*)target 
                                      AndHttpStatus:(int)httpStatus 
{
    NSMutableDictionary* result = [NSMutableDictionary dictionaryWithCapacity:4];
    [result setObject: [NSNumber numberWithInt:code] forKey:@"code"];
	[result setObject: source forKey:@"source"];
	[result setObject: target forKey:@"target"];
	[result setObject: [NSNumber numberWithInt:httpStatus] forKey:@"http_status"];
    NSLog(@"FileTransferError %@", result);
    
    return result;
}

@end


@implementation CDVFileTransferDelegate

@synthesize callbackId, source, target, responseData, command, bytesWritten, direction, responseCode;


- (void)connectionDidFinishLoading:(NSURLConnection *)connection 
{
    NSString* uploadResponse = nil;
    BOOL downloadResponse;
    NSMutableDictionary* uploadResult;
    CDVPluginResult* result;
    NSError* __autoreleasing error = nil;
    NSString *parentPath;
    BOOL bDirRequest = NO;
    BOOL errored = NO;
    CDVFile * file;
    
    NSLog(@"File Transfer Finished with response code %d", self.responseCode);
        
    if(self.direction == CDV_TRANSFER_UPLOAD)
    {
        if(self.responseCode >= 200 && self.responseCode < 300)
        {
            // create dictionary to return FileUploadResult object
            uploadResponse = [[NSString alloc] initWithData:self.responseData encoding:NSUTF8StringEncoding];
            uploadResult = [NSMutableDictionary dictionaryWithCapacity:3];
            if (uploadResponse != nil) {
                [uploadResult setObject: [uploadResponse stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding] forKey: @"response"];
            }
            [uploadResult setObject:[NSNumber numberWithInt: self.bytesWritten] forKey:@"bytesSent"];
            [uploadResult setObject:[NSNumber numberWithInt:self.responseCode] forKey: @"responseCode"];
            result = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK messageAsDictionary: uploadResult];            
        } 
        else 
        {                  
            result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary: [command createFileTransferError:CONNECTION_ERR AndSource:source AndTarget:target AndHttpStatus: self.responseCode]];
            errored = YES;
        }
    }
    if(self.direction == CDV_TRANSFER_DOWNLOAD)
    {
        DLog(@"Write file %@", target);
        //error=[[NSError alloc]init];

        if(self.responseCode >= 200 && self.responseCode < 300)
        {
            @try {
                parentPath = [ self.target stringByDeletingLastPathComponent ];
                
                // check if the path exists => create directories if needed
                if(![[NSFileManager defaultManager] fileExistsAtPath:parentPath ]) [[NSFileManager defaultManager] createDirectoryAtPath:parentPath withIntermediateDirectories:YES attributes:nil error:nil];
                
                downloadResponse = [self.responseData writeToFile:self.target options:NSDataWritingFileProtectionNone error:&error];
                
                if ( downloadResponse == NO ) {
                    // send our results back
                    result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary: [command createFileTransferError:INVALID_URL_ERR AndSource:source AndTarget:target AndHttpStatus: self.responseCode ]];
                    errored = YES;
                } else {
                    DLog(@"File Transfer Download success");
                    
                    file = [[CDVFile alloc] init];
                    
                    result = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK messageAsDictionary: [file getDirectoryEntry: target isDirectory: bDirRequest]];
                }
            }
            @catch (id exception) {
                // jump back to main thread
                result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary: [command createFileTransferError:FILE_NOT_FOUND_ERR AndSource:source AndTarget:target AndHttpStatus: self.responseCode ]];
                errored = YES;
            }
        } else {
            result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary: [command createFileTransferError:CONNECTION_ERR AndSource:source AndTarget:target AndHttpStatus: self.responseCode]];
            errored = YES;
        }
    }
    
    if(!errored) {
        [self.command writeJavascript:[result toSuccessCallbackString: callbackId]];
    } else {
        [self.command writeJavascript:[result toErrorCallbackString: callbackId]];
    }
}

- (void)connection:(NSURLConnection *)connection didReceiveResponse:(NSURLResponse *)response
{
    NSHTTPURLResponse *httpResponse = (NSHTTPURLResponse *)response;
    self.responseCode = [httpResponse statusCode];
}

- (void)connection:(NSURLConnection *)connection didFailWithError:(NSError *)error 
{
    CDVPluginResult* result = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK messageAsDictionary: [command createFileTransferError: CONNECTION_ERR AndSource:source AndTarget:target AndHttpStatus: self.responseCode]];
    NSLog(@"File Transfer Error: %@", [error localizedDescription]);
    [self.command writeJavascript:[result toErrorCallbackString: callbackId]];
}

- (void)connection:(NSURLConnection *)connection didReceiveData:(NSData *)data
{
    [self.responseData appendData:data];
}
- (void)connection:(NSURLConnection *)connection didSendBodyData:(NSInteger)bytesWritten totalBytesWritten:(NSInteger)totalBytesWritten totalBytesExpectedToWrite:(NSInteger)totalBytesExpectedToWrite
{
    self.bytesWritten = totalBytesWritten;
}
/* TESTING ONLY CODE
// use ONLY for testing with self signed certificates
// uncomment and modify server name in connectiondidReceiveAuthenticationChallenge
- (BOOL)connection:(NSURLConnection *)connection canAuthenticateAgainstProtectionSpace:(NSURLProtectionSpace *)protectionSpace
{
    return [protectionSpace.authenticationMethod isEqualToString:NSURLAuthenticationMethodServerTrust];
}

- (void)connection:(NSURLConnection *) connection didReceiveAuthenticationChallenge:(NSURLAuthenticationChallenge*)challenge
{
	if ([challenge.protectionSpace.authenticationMethod isEqualToString:NSURLAuthenticationMethodServerTrust])
	{
        //NSLog(@"challenge host: %@", challenge.protectionSpace.host);
		// we only trust our own domain
		if ([challenge.protectionSpace.host isEqualToString:@"serverName.domain.com"]){
            NSURLCredential* myCredential = [NSURLCredential credentialForTrust: challenge.protectionSpace.serverTrust];
            
            [challenge.sender useCredential:myCredential forAuthenticationChallenge:challenge];
			
		}
	}
    
	[challenge.sender continueWithoutCredentialForAuthenticationChallenge:challenge];
}
// uncomment the above two methods for testing servers with self signed certificates
// END TESTING ONLY CODE
 */
- (id) init
{
    if ((self = [super init])) {
		self.responseData = [NSMutableData data];
    }
    return self;
}

@end;

