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

@implementation CDVFileTransfer

- (NSString*) escapePathComponentForUrlString:(NSString*)urlString
{
    // separate the scheme and location components
    NSArray* schemeAndLocationComponents = [urlString componentsSeparatedByString:@"://"];
    if ([schemeAndLocationComponents count] < 2) {
        return urlString;
    }
    
    // separate the domain and path components
    NSArray* pathComponents = [[schemeAndLocationComponents lastObject] componentsSeparatedByString:@"/"];
    if ([pathComponents count] < 2) {
        return urlString;
    }
    
    NSString* pathComponent = [pathComponents lastObject];
    NSRange rangeOfSubstring = [urlString rangeOfString:pathComponent];
    urlString = [urlString substringToIndex:rangeOfSubstring.location];
    
    pathComponent = [pathComponent stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
    
    return [urlString stringByAppendingString:pathComponent];
}

- (void) upload:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options {
    NSString* callbackId = [arguments objectAtIndex:0];
    
    // arguments order from js: [filePath, server, fileKey, fileName, mimeType, params, debug, chunkedMode]
    // however, params is a JavaScript object and during marshalling is put into the options dict, 
    // thus debug and chunkedMode are the 6th and 7th arguments
    
    NSString* filePath = (NSString*)[arguments objectAtIndex:1];
    NSString* server = (NSString*)[arguments objectAtIndex:2];
    NSString* fileKey = (NSString*)[arguments objectAtIndex:3];
    NSString* fileName = [arguments objectAtIndex:4 withDefault:@"no-filename"];
    NSString* mimeType = [arguments objectAtIndex:5 withDefault:nil];
//  NSString* trustAllHosts = (NSString*)[arguments objectAtIndex:6]; // allow self-signed certs
//  NSString* chunkedMode = (NSString*)[arguments objectAtIndex:7]; // currently unused
    
    NSMutableDictionary* params = options;
    
    CDVPluginResult* result = nil;
    CDVFileTransferError errorCode = 0;

    
    NSURL* file;
    NSData *fileData = nil;
    
    if ([filePath hasPrefix:@"/"]) {
        file = [NSURL fileURLWithPath:filePath];
    } else {
        file = [NSURL URLWithString:filePath];
    }
    
    NSURL *url = [NSURL URLWithString:[self escapePathComponentForUrlString:server]];
    
    
    if (!url) {
        errorCode = INVALID_URL_ERR;
        NSLog(@"File Transfer Error: Invalid server URL %@", server);
    } else if(![file isFileURL]) {
        errorCode = FILE_NOT_FOUND_ERR;
        NSLog(@"File Transfer Error: Invalid file path or URL %@", filePath);
    } else {
        // check that file is valid
        NSFileManager* fileMgr = [[NSFileManager alloc] init];
        BOOL bIsDirectory = NO;
        BOOL bExists = [fileMgr fileExistsAtPath:[file path] isDirectory:&bIsDirectory];
        if (!bExists || bIsDirectory) {
            errorCode = FILE_NOT_FOUND_ERR;
        } else {
            // file exists, make sure we can get the data
            fileData = [NSData dataWithContentsOfURL:file];
            
            if(!fileData) {
                errorCode =  FILE_NOT_FOUND_ERR;
                NSLog(@"File Transfer Error: Could not read file data %@", filePath);
            }
        }
        [fileMgr release];
    }
    
    if(errorCode > 0) {
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary: [self createFileTransferError:errorCode AndSource:filePath AndTarget:server]];
        
        [self writeJavascript:[result toErrorCallbackString:callbackId]];
        return;
    }
    
    NSMutableURLRequest *req = [NSMutableURLRequest requestWithURL:url];
	[req setHTTPMethod:@"POST"];
	
//    Magic value to set a cookie
	if([params objectForKey:@"__cookie"]) {
		[req setValue:[params objectForKey:@"__cookie"] forHTTPHeaderField:@"Cookie"];
		[params removeObjectForKey:@"__cookie"];
		[req setHTTPShouldHandleCookies:NO];
	}
	
	NSString *boundary = @"*****org.apache.cordova.formBoundary";
    
	NSString *contentType = [NSString stringWithFormat:@"multipart/form-data; boundary=%@", boundary];
	[req setValue:contentType forHTTPHeaderField:@"Content-Type"];
    //Content-Type: multipart/form-data; boundary=*****org.apache.cordova.formBoundary
	[req setValue:@"XMLHttpRequest" forHTTPHeaderField:@"X-Requested-With"];
	NSString* userAgent = [[self.webView request] valueForHTTPHeaderField:@"User-agent"];
	if(userAgent) {
		[req setValue: userAgent forHTTPHeaderField:@"User-Agent"];
	}

    
	NSMutableData *postBody = [NSMutableData data];
	
	NSEnumerator *enumerator = [params keyEnumerator];
	id key;
	id val;
	
	while ((key = [enumerator nextObject])) {
		val = [params objectForKey:key];
		if(!val || val == [NSNull null]) {
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
		
		[postBody appendData:[[NSString stringWithFormat:@"--%@\r\n", boundary] dataUsingEncoding:NSUTF8StringEncoding]];
		[postBody appendData:[[NSString stringWithFormat:@"Content-Disposition: form-data; name=\"%@\"\r\n\r\n", key] dataUsingEncoding:NSUTF8StringEncoding]];
		[postBody appendData:[val dataUsingEncoding:NSUTF8StringEncoding]];
		[postBody appendData:[@"\r\n" dataUsingEncoding:NSUTF8StringEncoding]];
	}
    
	[postBody appendData:[[NSString stringWithFormat:@"--%@\r\n", boundary] dataUsingEncoding:NSUTF8StringEncoding]];
	[postBody appendData:[[NSString stringWithFormat:@"Content-Disposition: form-data; name=\"%@\"; filename=\"%@\"\r\n", fileKey, fileName] dataUsingEncoding:NSUTF8StringEncoding]];
    if (mimeType != nil) {
        [postBody appendData:[[NSString stringWithFormat:@"Content-Type: %@\r\n", mimeType] dataUsingEncoding:NSUTF8StringEncoding]];
    }
    [postBody appendData:[[NSString stringWithFormat:@"Content-Length: %d\r\n\r\n", [fileData length]] dataUsingEncoding:NSUTF8StringEncoding]];

    DLog(@"fileData length: %d", [fileData length]);
	[postBody appendData:fileData];
	[postBody appendData:[[NSString stringWithFormat:@"\r\n--%@--\r\n", boundary] dataUsingEncoding:NSUTF8StringEncoding]];
    
    //[req setValue:[[NSNumber numberWithInteger:[postBody length]] stringValue] forHTTPHeaderField:@"Content-Length"];
	[req setHTTPBody:postBody];
    
	
	CDVFileTransferDelegate* delegate = [[[CDVFileTransferDelegate alloc] init] autorelease];
	delegate.command = self;
    delegate.direction = CDV_TRANSFER_UPLOAD;
    delegate.callbackId = callbackId;
    delegate.source = server;
    delegate.target = filePath;
	
	[NSURLConnection connectionWithRequest:req delegate:delegate];
    
}

- (void) download:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options {
    DLog(@"File Transfer downloading file...");
    NSString * callbackId = [arguments objectAtIndex:0];
    NSString * sourceUrl = [arguments objectAtIndex:1];
    NSString * filePath = [arguments objectAtIndex:2];
    CDVPluginResult *result = nil;
    CDVFileTransferError errorCode = 0;

    NSURL* file;
    
    if ([filePath hasPrefix:@"/"]) {
        file = [NSURL fileURLWithPath:filePath];
    } else {
        file = [NSURL URLWithString:filePath];
    }
    
    NSURL *url = [NSURL URLWithString:[self escapePathComponentForUrlString:sourceUrl]];
    
    if (!url) {
        errorCode = INVALID_URL_ERR;
        NSLog(@"File Transfer Error: Invalid server URL %@", sourceUrl);
    } else if(![file isFileURL]) {
        errorCode = FILE_NOT_FOUND_ERR;
        NSLog(@"File Transfer Error: Invalid file path or URL %@", filePath);
    }
    
    if(errorCode > 0) {
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary: [self createFileTransferError:errorCode AndSource:sourceUrl AndTarget:filePath]];
        
        [self writeJavascript:[result toErrorCallbackString:callbackId]];
        return;
    }
    
    NSMutableURLRequest *req = [NSMutableURLRequest requestWithURL:url];

    CDVFileTransferDelegate* delegate = [[[CDVFileTransferDelegate alloc] init] autorelease];
	delegate.command = self;
    delegate.direction = CDV_TRANSFER_DOWNLOAD;
    delegate.callbackId = callbackId;
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
    NSError *error;
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
        error=[[[NSError alloc]init] autorelease];

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
                    
                    file = [[[CDVFile alloc] init] autorelease];
                    
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
    [uploadResponse release];
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

- (void) dealloc
{
    self.callbackId = nil;
    self.responseData = nil;
    self.command = nil;
    self.source = nil;
    self.target = nil;

    [super dealloc];
}


@end;

