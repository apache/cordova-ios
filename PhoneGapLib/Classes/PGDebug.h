//
//  PGDebug.h
//  PhoneGapLib
//
//  Created by shazron on 11-06-15.
//  Copyright 2011 . All rights reserved.
//
//  
//

#ifdef DEBUG
#    define DLog(...) NSLog(__VA_ARGS__)
#else
#    define DLog(...) /* */
#endif
#define ALog(...) NSLog(__VA_ARGS__)
