//
//  DebugConsole.h
//  PhoneGap
//
//  Created by Michael Nachbaur on 14/03/09.
//  Copyright 2009 Decaf Ninja Software. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

@interface DebugConsole : NSObject {
}

+ (void)log:(NSString*)options forWebView:(UIWebView*)webView;

@end
