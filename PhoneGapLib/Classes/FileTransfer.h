/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2011, Nitobi Software Inc.
 * Copyright (c) 2011, Matt Kane
 * Copyright (c) 2011, IBM Corporation
 */


#import <Foundation/Foundation.h>
#import "PGPlugin.h"

enum FileTransferError {
	FILE_NOT_FOUND_ERR = 1,
    INVALID_URL_ERR = 2,
    CONNECTION_ERR = 3
};
typedef int FileTransferError;

@interface PGFileTransfer : PGPlugin {
    
}

- (void) upload:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) download:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;

-(void) downloadFile:(NSMutableArray*)arguments;
-(void) downloadSuccess:(NSMutableArray*)arguments; 
-(void) downloadFail:(NSMutableArray*)arguments; 
@end


@interface FileTransferDelegate : NSObject {
	PGFileTransfer* command;
	NSString* callbackId;
    NSInteger bytesWritten;
    
}

@property (nonatomic, retain) NSMutableData* responseData;
@property (nonatomic, retain) PGFileTransfer* command;
@property (nonatomic, retain) NSString* callbackId;
@property NSInteger bytesWritten;


@end;