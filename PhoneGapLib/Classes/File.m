//
//  File.m
//  TestImageSave
//
//  Created by Jesse MacFadyen on 09-11-10.
//  Copyright 2009 Nitobi. All rights reserved.
//

#import "File.h"


@implementation File

@synthesize appDocsPath, appLibraryPath, appTempPath, userHasAllowed;



-(id)initWithWebView:(UIWebView *)theWebView
{
	self = (File*)[super initWithWebView:theWebView];
	if(self)
	{
		// get the documents directory path
		NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
		self.appDocsPath = [paths objectAtIndex:0];
		
		paths = NSSearchPathForDirectoriesInDomains(NSLibraryDirectory, NSUserDomainMask, YES);
		self.appLibraryPath = [paths objectAtIndex:0];
		
		self.appTempPath =  NSTemporaryDirectory();
		NSLog(@"Docs Path:%@ Library Path:%@", appDocsPath, appLibraryPath);
	}
	
	return self;
}

- (void) getFileBasePaths:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	
	NSString * jsCallBack = [NSString stringWithFormat:@"navigator.fileMgr._setPaths('%@','%@', '%@');",appDocsPath, appTempPath, appLibraryPath];
	[webView stringByEvaluatingJavaScriptFromString:jsCallBack];
}

// User agents should provide an API exposed to script that exposes the features above. The user is notified by UI anytime interaction with the file 
// system takes place, giving the user full ability to cancel or abort the transaction. The user is notified of any file selections, and can cancel these. 
// No invocations to these APIs occur silently without user intervention.

- (void) readFile:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{

	NSString* argPath = [arguments objectAtIndex:0];
	
	// send back a load start event
	NSString * jsCallBack = [NSString stringWithFormat:@"navigator.fileMgr.reader_onloadstart(\"%@\");",argPath];
    [webView stringByEvaluatingJavaScriptFromString:jsCallBack];
	
// TODO: possibly add user permissions, prompt the user to allow access 
//	if(!userHasAllowed && ! [ self promptUser ])
//	{
//		
//	}
	
	NSString *appFile = [ [ self appDocsPath ] stringByAppendingPathComponent:argPath];
	
	NSInputStream* fileStream = [ NSInputStream inputStreamWithFileAtPath:appFile];
	[ fileStream open ];
	
	uint8_t   buffer[1024 * 512];
	NSInteger len = [ fileStream read:buffer maxLength:sizeof(buffer)];
	
	[ fileStream close ];
	
	CFStringRef pStrBuff = CFStringCreateWithBytes(nil, buffer, len, kCFStringEncodingUTF8, false);
	
	NSString* pNStrBuff = (NSString*)pStrBuff;

	// write back the result
	jsCallBack = [NSString stringWithFormat:@"navigator.fileMgr.reader_onload(\"%@\",\"%@\");",argPath,[ pNStrBuff stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding] ];
    [webView stringByEvaluatingJavaScriptFromString:jsCallBack];
	
	[ pNStrBuff release ];
	 
}

- (void) write:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	NSString* argPath = [arguments objectAtIndex:0];
	NSString* argData = [arguments objectAtIndex:1];
	NSString* strTemp = [arguments objectAtIndex:2];
	
	BOOL bAppend =   [strTemp isEqualToString:@"true" ];
	
	int bytesWritten = 0;
	
	bytesWritten = [ self writeToFile:argPath withData:argData append:bAppend ];
	
	
	NSString * jsCallBack;
	if(bytesWritten == [argData length])
	{
		jsCallBack = [NSString stringWithFormat:@"navigator.fileMgr.writer_oncomplete(\"%@\",%d);",argPath,bytesWritten ] ;
	}
	else 
	{
		jsCallBack = [ NSString stringWithFormat:@"navigator.fileMgr.writer_onerror(\"%@\",%d);",argPath,bytesWritten ];
	}

    [webView stringByEvaluatingJavaScriptFromString:jsCallBack];
}

- (void) testFileExists:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	NSString* argPath = [arguments objectAtIndex:0];
	
	BOOL bExists = [ self fileExists:argPath];
	
	NSString * jsCallBack = [NSString stringWithFormat:@"navigator.fileMgr.successCallback(%s);",( bExists ? "1" : "0" )];
    [webView stringByEvaluatingJavaScriptFromString:jsCallBack];
	
}

- (void) testDirectoryExists:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	NSString* argPath = [arguments objectAtIndex:0];
	
	// build our full file path
	NSString *appFile = [ [ self appDocsPath ] stringByAppendingPathComponent:argPath];
	
	Boolean bExists = [ self directoryExists:appFile ];
	
	NSString * jsCallBack = [NSString stringWithFormat:@"navigator.fileMgr.successCallback(%s);",( bExists ? "1" : "0" )];
    [webView stringByEvaluatingJavaScriptFromString:jsCallBack];
	
}

- (void) createDirectory:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	NSString* argPath = [arguments objectAtIndex:0];
	
	// Get the file manager
	NSFileManager* fMgr = [ NSFileManager defaultManager ];
	
	// build our full file path
	NSString *appFile = [ [ self appDocsPath ] stringByAppendingPathComponent:argPath];
	
	NSError* pError = nil;
	
	BOOL bSuccess = [ fMgr createDirectoryAtPath:appFile withIntermediateDirectories:YES attributes:nil error:&pError];
	
	NSString * jsCallBack = [NSString stringWithFormat:@"navigator.fileMgr.successCallback(%s);",( bSuccess ? "1" : "0" )];
    [webView stringByEvaluatingJavaScriptFromString:jsCallBack];
}

- (void) deleteDirectory:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	NSString* argPath = [arguments objectAtIndex:0];
	
	// Get the file manager
	NSFileManager* fMgr = [ NSFileManager defaultManager ];
	
	// build our full file path
	NSString *appFile = [ [ self appDocsPath ] stringByAppendingPathComponent:argPath];
	
	NSError* pError = nil;
	
	
	BOOL bSuccess = [ fMgr removeItemAtPath:appFile error:&pError];
	
	NSString * jsCallBack = [NSString stringWithFormat:@"navigator.fileMgr.successCallback(%s);",( bSuccess ? "1" : "0" )];
    [webView stringByEvaluatingJavaScriptFromString:jsCallBack];
}

- (void) deleteFile:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	[ self deleteDirectory:arguments withDict:options];
}

// Returns number of bytes available via callback
- (void) getFreeDiskSpace:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	NSFileManager* fMgr = [ NSFileManager defaultManager ];
	
	NSError* pError = nil;
	
	NSDictionary* pDict = [ fMgr attributesOfFileSystemForPath:appDocsPath error:&pError ];
	NSNumber* pNumAvail = (NSNumber*)[ pDict objectForKey:NSFileSystemFreeSize ];
	
	NSString* strFreeSpace = [NSString stringWithFormat:@"%qu", [ pNumAvail unsignedLongLongValue ] ];
	NSLog(@"Free space is %@", strFreeSpace );
	
	NSString * jsCallBack = [NSString stringWithFormat:@"navigator.file._setFreeDiskSpace(%@); navigator.file.successCallback(%@);", 
							 strFreeSpace, 
							 strFreeSpace];

    [webView stringByEvaluatingJavaScriptFromString:jsCallBack];
}

- (BOOL) fileExists:(NSString*)fileName
{
	// Get the file manager
	NSFileManager* fMgr = [ NSFileManager defaultManager ];
	
	// build our full file path
	NSString *appFile = [ [ self appDocsPath ] stringByAppendingPathComponent:fileName];
	
	BOOL exists = [ fMgr fileExistsAtPath:appFile];
	
	return exists;
}

- (BOOL) directoryExists:(NSString*)dirName
{
	// Get the file manager
	NSFileManager* fMgr = [ NSFileManager defaultManager ];
	
	
	// build our full file path
	NSString *appFile = [ [ self appDocsPath ] stringByAppendingPathComponent:dirName];
	NSError* pError = nil;
	
	NSArray* fileList = [ fMgr contentsOfDirectoryAtPath:appFile error:&pError];
	BOOL exists = (fileList != nil );
	
	return exists;
}

- (int) writeToFile:(NSString*)fileName withData:(NSString*)data append:(BOOL)shouldAppend
{	
	NSString *appFile = [ [ self appDocsPath ] stringByAppendingPathComponent:fileName];

	NSOutputStream* fileStream = [ [ NSOutputStream alloc ] initToFileAtPath:appFile append:shouldAppend ];
	NSUInteger len = [ data length ];
	[ fileStream open ];
	
	// HACK: (const uint8_t *) cast risky? -jm
	int bytesWritten = [ fileStream write:(const uint8_t *)[data UTF8String] maxLength:len];

	[ fileStream close ];
	[ fileStream release ];
	return bytesWritten;
}






@end
