//
//  MockUIWebview.h
//  PhoneGapLib
//
//  Created by Shazron Abdullah on 11-09-08.
//  Copyright 2011 Nitobi Software Inc. All rights reserved.
//

#import <Foundation/Foundation.h>


@interface MockUIWebview : NSObject {
		
}

@property (nonatomic, retain) NSMutableArray* javascriptQueue; // array of JsOperation objects
@property (nonatomic, retain) UIWebView* webView;

@end


@interface JsOperation : NSObject
{
}

- (id) initWithScript:(NSString*)script andResult:(NSString*)result;

@property (nonatomic, copy) NSString* script;
@property (nonatomic, copy) NSString* scriptResult;

@end

