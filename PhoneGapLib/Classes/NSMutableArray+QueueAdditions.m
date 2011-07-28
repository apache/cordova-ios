//
//  NSMutableArray+QueueAdditions.h
//
//  Created by Shazron Abdullah
//  Copyright 2011 Nitobi Software Inc.
//

#import "NSMutableArray+QueueAdditions.h"

@implementation NSMutableArray (QueueAdditions)

- (id) queueHead
{
    if ([self count] == 0) {
		return nil;
	}
	
    return [self objectAtIndex:0];
}

- (id) dequeue 
{
    if ([self count] == 0) {
		return nil;
	}
	
    id head = [self objectAtIndex:0];
    if (head != nil) {
        [[head retain] autorelease];
        [self removeObjectAtIndex:0];
    }
	
    return head;
}

- (id) pop
{
	return [self dequeue];
}

- (void) enqueue:(id)object 
{
    [self addObject:object];
}

@end