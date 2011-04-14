/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2011, Nitobi Software Inc.
 * Copyright (c) 2011, Matt Kane
 */


#import <Foundation/Foundation.h>
#import "PhoneGapCommand.h"


@interface FileTransfer : PhoneGapCommand {
    
}
- (void) upload:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;

@end


@interface FileTransferDelegate : NSObject {
	FileTransfer* command;
	NSString* callbackId;
}

@property (nonatomic, retain) NSMutableData* responseData;
@property (nonatomic, retain) FileTransfer* command;
@property (nonatomic, retain) NSString* callbackId;

@end;