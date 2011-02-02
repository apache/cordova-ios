/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 */


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
	
	NSString *filePath = [ [ self appDocsPath ] stringByAppendingPathComponent:argPath];

	NSFileHandle* file = [ NSFileHandle fileHandleForReadingAtPath:filePath];
	
	NSData* readData = [ file readDataToEndOfFile];
	
	[file closeFile];
	 
	NSString* pNStrBuff = [[NSString alloc] initWithBytes: [readData bytes] length: [readData length] encoding: NSUTF8StringEncoding];
	
	jsCallBack = [NSString stringWithFormat:@"navigator.fileMgr.reader_onloadend(\"%@\",\"%@\");",argPath, [ pNStrBuff stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding] ];
    [webView stringByEvaluatingJavaScriptFromString:jsCallBack];
	
	// write back the result
	jsCallBack = [NSString stringWithFormat:@"navigator.fileMgr.reader_onload(\"%@\",\"%@\");",argPath, [ pNStrBuff stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding] ];
    [webView stringByEvaluatingJavaScriptFromString:jsCallBack];
	
	[ pNStrBuff release ];
}


- (void) truncateFile:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	NSString* argPath = [arguments objectAtIndex:0];
	
	unsigned long long pos = (unsigned long long)[[arguments objectAtIndex:1 ] longLongValue];
	
	NSString *appFile = [ [ self appDocsPath ] stringByAppendingPathComponent:argPath];
	
	unsigned long long newPos = [ self truncateFile:appFile atPosition:pos];
	
	NSString * jsCallBack;
	
	jsCallBack = [NSString stringWithFormat:@"navigator.fileMgr.writer_oncomplete(\"%@\",%d);",argPath,newPos ];
	
	// how do we detect errors?
	// jsCallBack = [ NSString stringWithFormat:@"navigator.fileMgr.writer_onerror(\"%@\",%d);",argPath,newPos ];

	[webView stringByEvaluatingJavaScriptFromString:jsCallBack];
}

- (unsigned long long) truncateFile:(NSString*)filePath atPosition:(unsigned long long)pos
{
	unsigned long long newPos;
	
	NSFileHandle* file = [ NSFileHandle fileHandleForWritingAtPath:filePath];
	if(file)
	{
		[file truncateFileAtOffset:(unsigned long long)pos];
		newPos = [ file offsetInFile];
		[ file synchronizeFile];
		[ file closeFile];
	}
	return newPos;
}


- (void) write:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	int argc = [arguments count];
	
	NSString* argPath = [arguments objectAtIndex:0];
	NSString* argData = [arguments objectAtIndex:1];
	
	NSString *appFile = [ [ self appDocsPath ] stringByAppendingPathComponent:argPath];
	
	unsigned long long pos = 0UL;
	unsigned long long newPos = 0UL;
	
	if(argc > 2)
	{
		pos = (unsigned long long)[[ arguments objectAtIndex:2] longLongValue];
		if(pos > 0)
		{
			newPos = [ self truncateFile:appFile atPosition:pos];
		}
	}
	
	BOOL bAppend = pos > 0;
	int bytesWritten = 0;
	
	bytesWritten = [ self writeToFile:argPath withData:argData append:bAppend]; 

	NSString * jsCallBack;
	if(bytesWritten >0 ) //== [argData length]) can't compare against original data length due to encoding that happens in writeTofile:
	{
		jsCallBack = [NSString stringWithFormat:@"navigator.fileMgr.writer_oncomplete(\"%@\",%d);",argPath,(pos + bytesWritten ) ] ;
	}
	else 
	{
		jsCallBack = [ NSString stringWithFormat:@"navigator.fileMgr.writer_onerror(\"%@\",%d);",argPath,( pos + bytesWritten ) ];
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
	NSString *filePath = [ [ self appDocsPath ] stringByAppendingPathComponent:fileName];
	NSData* encData = [ data dataUsingEncoding:NSUTF8StringEncoding];
	
	NSOutputStream* fileStream = [NSOutputStream outputStreamToFileAtPath:filePath append:shouldAppend ];
	NSUInteger len = [ encData length ];
	[ fileStream open ];

	int bytesWritten = [ fileStream write:[encData bytes] maxLength:len];

	[ fileStream close ];
	
	return bytesWritten;
}






@end
