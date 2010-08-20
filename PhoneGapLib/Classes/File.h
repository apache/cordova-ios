//
//  File.h
//  TestImageSave
//
//  Created by Jesse MacFadyen on 09-11-10.
//  Copyright 2009 Nitobi. All rights reserved.
//

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

- (BOOL) fileExists:(NSString*)fileName;
- (BOOL) directoryExists:(NSString*)dirName;
- (int) writeToFile:(NSString*)fileName withData:(NSString*)data append:(BOOL)shouldAppend;



@property (nonatomic, copy)NSString *appDocsPath;
@property (nonatomic, copy)NSString *appLibraryPath;
@property (nonatomic, copy)NSString *appTempPath;
@property BOOL userHasAllowed;

@end
