//
//  NSMutableArray+QueueAdditions.h
//
//  Created by Shazron Abdullah
//  Copyright 2011 Nitobi Software Inc.
//
#import <Foundation/Foundation.h>


@interface NSMutableArray (QueueAdditions)

- (id) pop;
- (id) queueHead;
- (id) dequeue;
- (void) enqueue:(id)obj;

@end
