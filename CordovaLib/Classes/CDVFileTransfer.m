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

#import "CDVFileTransfer.h"
#import "CDVFile.h"


@implementation CDVFileTransfer

- (void) upload:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options {
    NSString* callbackId = [arguments objectAtIndex:0];
    NSString* fileKey = (NSString*)[options objectForKey:@"fileKey"];
    NSString* fileName = (NSString*)[options objectForKey:@"fileName"];
    NSString* mimeType = (NSString*)[options objectForKey:@"mimeType"];
    NSMutableDictionary* params = [NSMutableDictionary dictionaryWithDictionary:(NSDictionary*)[options objectForKey:@"params"]];
    NSString* filePath = (NSString*)[options objectForKey:@"filePath"];
    NSString* server = (NSString*)[options objectForKey:@"server"];
    CDVPluginResult* result = nil;
    CDVFileTransferError errorCode = 0;

    
    NSURL* file;
    NSData *fileData = nil;
    
    if ([filePath hasPrefix:@"/"]) {
        file = [NSURL fileURLWithPath:filePath];
    } else {
        file = [NSURL URLWithString:filePath];
    }
    
    NSURL *url = [NSURL URLWithString:server];
    
    
    if (!url) {
        errorCode = INVALID_URL_ERR;
        NSLog(@"File Transfer Error: Invalid server URL");
    } else if(![file isFileURL]) {
        errorCode = FILE_NOT_FOUND_ERR;
        NSLog(@"File Transfer Error: Invalid file path or URL");
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
                NSLog(@"File Transfer Error: Could not read file data");
            }
        }
        [fileMgr release];
    }
    
    if(errorCode > 0) {
        //result = [PluginResult resultWithStatus: PGCommandStatus_OK messageAsInt: INVALID_URL_ERR cast: @"navigator.fileTransfer._castTransferError"];
        
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary: [self createFileTransferError:[NSString stringWithFormat:@"%d", errorCode] AndSource:filePath AndTarget:server]];
        
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
    [postBody appendData:[[NSString stringWithFormat:@"Content-Type: %@\r\n\r\n", mimeType] dataUsingEncoding:NSUTF8StringEncoding]];
    NSLog(@"fileData length: %d", [fileData length]);
	[postBody appendData:fileData];
	[postBody appendData:[[NSString stringWithFormat:@"\r\n--%@--\r\n", boundary] dataUsingEncoding:NSUTF8StringEncoding]];
    
    //[req setValue:[[NSNumber numberWithInteger:[postBody length]] stringValue] forHTTPHeaderField:@"Content-Length"];
	[req setHTTPBody:postBody];
    
	
	CDVFileTransferDelegate* delegate = [[[CDVFileTransferDelegate alloc] init] autorelease];
	delegate.command = self;
    delegate.callbackId = callbackId;
    delegate.source = server;
    delegate.target = filePath;
	
	[NSURLConnection connectionWithRequest:req delegate:delegate];
    
}

- (void) download:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options {
    NSLog(@"File Transfer downloading file...");
    
    [self performSelectorInBackground:@selector(downloadFile:) withObject:arguments];
}

-(void) downloadFile:(NSMutableArray*)arguments {
    NSString * callbackId = [arguments objectAtIndex:0];
    NSString * sourceUrl = [arguments objectAtIndex:1];
    NSString * filePath = [arguments objectAtIndex:2];
    
    NSAutoreleasePool *pool = [[NSAutoreleasePool alloc] init];
    NSData* data = [NSData dataWithContentsOfURL: [NSURL URLWithString:sourceUrl] ];
    NSArray * results = nil;
    
    NSLog(@"Write file %@", filePath);
    NSError *error=[[[NSError alloc]init] autorelease];
    
    @try {
        NSString * parentPath = [ filePath stringByDeletingLastPathComponent ];
        
        // check if the path exists => create directories if needed
        if(![[NSFileManager defaultManager] fileExistsAtPath:parentPath ]) [[NSFileManager defaultManager] createDirectoryAtPath:parentPath withIntermediateDirectories:YES attributes:nil error:nil];
        
    	BOOL response = [data writeToFile:filePath options:NSDataWritingFileProtectionNone error:&error];
        
        if ( response == NO ) {
        	// send our results back to the main thread
            results = [NSArray arrayWithObjects: callbackId, [NSString stringWithFormat:@"%d", INVALID_URL_ERR], sourceUrl, filePath, nil];
        	[self performSelectorOnMainThread:@selector(downloadFail:) withObject:results waitUntilDone:YES];
    	} else {
        	// jump back to main thread
            results = [NSArray arrayWithObjects: callbackId, filePath, nil];
        	[self performSelectorOnMainThread:@selector(downloadSuccess:) withObject:results waitUntilDone:YES];
    	}
    }
    @catch (id exception) {
        // jump back to main thread
        results = [NSArray arrayWithObjects: callbackId, [NSString stringWithFormat:@"%d", FILE_NOT_FOUND_ERR], sourceUrl, filePath, nil];
        [self performSelectorOnMainThread:@selector(downloadFail:) withObject:results waitUntilDone:YES];
    }
    
    [pool drain];
}

-(void) downloadSuccess:(NSMutableArray *)arguments 
{
    NSString * callbackId = [arguments objectAtIndex:0];
    NSString * filePath = [arguments objectAtIndex:1];

    BOOL bDirRequest = NO;

    NSLog(@"File Transfert Download success");
    
    CDVFile * file = [[[CDVFile alloc] init] autorelease];
    
    CDVPluginResult* result = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK messageAsDictionary: [file getDirectoryEntry: filePath isDirectory: bDirRequest] cast: @"window.localFileSystem._castEntry"];
    [self writeJavascript: [result toSuccessCallbackString:callbackId]];
}

-(void) downloadFail:(NSMutableArray *)arguments 
{
    NSString * callbackId = [arguments objectAtIndex:0];
    NSString * code = [arguments objectAtIndex:1];
    NSString * source = [arguments objectAtIndex:2];
    NSString * target = [arguments objectAtIndex:3];

    NSLog(@"File Transfer Error: %@", source);
    
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary: [self createFileTransferError:code AndSource:source AndTarget:target]];
                                    
    [self writeJavascript: [pluginResult toErrorCallbackString:callbackId]];
}

-(NSMutableDictionary*) createFileTransferError:(NSString*)code AndSource:(NSString*)source AndTarget:(NSString*)target
{
    NSMutableDictionary* result = [NSMutableDictionary dictionaryWithCapacity:3];
    [result setObject: code forKey:@"code"];
	[result setObject: source forKey:@"source"];
	[result setObject: target forKey:@"target"];
    
    return result;
}

@end


@implementation CDVFileTransferDelegate

@synthesize callbackId, source, target, responseData, command, bytesWritten;


- (void)connectionDidFinishLoading:(NSURLConnection *)connection 
{
    NSString* response = [[NSString alloc] initWithData:self.responseData encoding:NSUTF8StringEncoding];
    // create dictionary to return FileUploadResult object
    NSMutableDictionary* uploadResult = [NSMutableDictionary dictionaryWithCapacity:3];
    [uploadResult setObject: [response stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding] forKey: @"response"];
    [uploadResult setObject:[NSNumber numberWithInt: self.bytesWritten] forKey:@"bytesSent"];
    [uploadResult setObject:[NSNull null] forKey: @"responseCode"];
    CDVPluginResult* result = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK messageAsDictionary: uploadResult cast: @"navigator.fileTransfer._castUploadResult"];
    [command writeJavascript:[result toSuccessCallbackString: callbackId]];
    [response release];
}

- (void)connection:(NSURLConnection *)connection didFailWithError:(NSError *)error 
{
    CDVPluginResult* result = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK messageAsDictionary: [command createFileTransferError: [NSString stringWithFormat: @"%d", CONNECTION_ERR] AndSource:source AndTarget:target]];
    NSLog(@"File Transfer Error: %@", [error localizedDescription]);
    [command writeJavascript:[result toErrorCallbackString: callbackId]];
}

- (void)connection:(NSURLConnection *)connection didReceiveData:(NSData *)data
{
    [responseData appendData:data];
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
    [callbackId release];
	[responseData release];
	[command release];
    [super dealloc];
}


@end;

