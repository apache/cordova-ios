/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 */


#import <Foundation/Foundation.h>
#import "PhoneGapCommand.h"

@interface File : PhoneGapCommand {
	
	NSString *appDocsPath;	
	NSString *appLibraryPath;	
	NSString *appTempPath;	
	
	BOOL userHasAllowed;

}

- (void) readFile:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) write:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) testFileExists:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) testDirectoryExists:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) createDirectory:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) deleteDirectory:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) deleteFile:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) getFreeDiskSpace:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) getFileBasePaths:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) truncateFile:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;


- (BOOL) fileExists:(NSString*)fileName;
- (BOOL) directoryExists:(NSString*)dirName;
- (int) writeToFile:(NSString*)fileName withData:(NSString*)data append:(BOOL)shouldAppend;
- (unsigned long long) truncateFile:(NSString*)filePath atPosition:(unsigned long long)pos;


@property (nonatomic, copy)NSString *appDocsPath;
@property (nonatomic, copy)NSString *appLibraryPath;
@property (nonatomic, copy)NSString *appTempPath;
@property BOOL userHasAllowed;

@end
