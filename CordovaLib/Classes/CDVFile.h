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
#import "CDVPlugin.h"

enum CDVFileError {
	NOT_FOUND_ERR = 1,
    SECURITY_ERR = 2,
    ABORT_ERR = 3,
    NOT_READABLE_ERR = 4,
    ENCODING_ERR = 5,
    NO_MODIFICATION_ALLOWED_ERR = 6,
    INVALID_STATE_ERR = 7,
    SYNTAX_ERR = 8,
    INVALID_MODIFICATION_ERR = 9,
    QUOTA_EXCEEDED_ERR = 10,
    TYPE_MISMATCH_ERR = 11,
    PATH_EXISTS_ERR = 12
};
typedef int CDVFileError;

enum CDVFileSystemType {
	TEMPORARY = 0,
	PERSISTENT = 1
};
typedef int CDVFileSystemType;

@interface CDVFile : CDVPlugin {
	
	NSString *appDocsPath;	
	NSString *appLibraryPath;	
	NSString *appTempPath;
	NSString *persistentPath;
	NSString *temporaryPath;
	
	BOOL userHasAllowed;

}
- (NSNumber*) checkFreeDiskSpace: (NSString*) appPath;
-(NSString*) getAppPath: (NSString*)pathFragment;
//-(NSString*) getFullPath: (NSString*)pathFragment;
- (void) requestFileSystem:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
-(NSDictionary*) getDirectoryEntry: (NSString*) fullPath isDirectory: (BOOL) isDir;
- (void) resolveLocalFileSystemURI:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) getDirectory:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) getFile:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) getParent:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) getMetadata:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) removeRecursively:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) remove:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (NSString*) doRemove:(NSString*)fullPath callback: (NSString*)callbackId;
- (void) copyTo:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) moveTo:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
-(BOOL) canCopyMoveSrc: (NSString*) src ToDestination: (NSString*) dest;
- (void) doCopyMove:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options  isCopy:(BOOL)bCopy;
//- (void) toURI:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) getFileMetadata:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) readEntries:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;

// DEPRECATED 
- (void) readFile:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options __attribute__((deprecated));
// DEPRECATED 

- (void) readAsText:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) readAsDataURL:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
-(NSString*) getMimeTypeFromPath: (NSString*) fullPath;
- (void) write:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) testFileExists:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) testDirectoryExists:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
//- (void) createDirectory:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
//- (void) deleteDirectory:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
//- (void) deleteFile:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) getFreeDiskSpace:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
// DEPRECATED 
- (void) truncateFile:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options __attribute__((deprecated));
// DEPRECATED 
- (void) truncate:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;



//- (BOOL) fileExists:(NSString*)fileName;
//- (BOOL) directoryExists:(NSString*)dirName;
- (void) writeToFile:(NSString*)fileName withData:(NSString*)data append:(BOOL)shouldAppend callback: (NSString*) callbackId;
- (unsigned long long) truncateFile:(NSString*)filePath atPosition:(unsigned long long)pos;


@property (nonatomic, retain)NSString *appDocsPath;
@property (nonatomic, retain)NSString *appLibraryPath;
@property (nonatomic, retain)NSString *appTempPath;
@property (nonatomic, retain)NSString *persistentPath;
@property (nonatomic, retain)NSString *temporaryPath;
@property BOOL userHasAllowed;

@end

#define kW3FileTemporary @"temporary"
#define kW3FilePersistent @"persistent"