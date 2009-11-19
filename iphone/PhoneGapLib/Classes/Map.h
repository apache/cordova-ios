//
//  Map.h
//  PhoneGap
//
//  Created by Brant Vasilieff on 3/4/09.
//  Copyright 2009 __MyCompanyName__. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "PhoneGapCommand.h"

@interface Map : PhoneGapCommand {
}

- (void)open:(NSArray*)arguments withDict:(NSDictionary*)options;

@end
