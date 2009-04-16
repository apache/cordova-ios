//
//  PhoneGapCommand.h
//  PhoneGap
//
//  Created by Michael Nachbaur on 13/04/09.
//  Copyright 2009 Decaf Ninja Software. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

@interface PhoneGapCommand : NSObject {
    UIWebView* webView;
}
@property (nonatomic, retain) UIWebView *webView;

-(PhoneGapCommand*) initWithWebView:(UIWebView*)theWebView;
-(void) setWebView:(UIWebView*) theWebView;

@end
