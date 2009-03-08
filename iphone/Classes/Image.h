/*
 *  Image.h
 *  PhoneGap
 *
 *  Created by Nitobi on 04/02/09.
 *  Copyright 2009 Nitobi. All rights reserved.
 *
 */

#import <Foundation/Foundation.h>


@interface Image : NSObject {
	IBOutlet UIWindow *window;
	IBOutlet UIWebView *webView;		
	
	UIImagePickerController *picker;	// added by urbian
	NSString *photoUploadUrl;			// added by urbian
	NSString *lastUploadedPhoto;		// added by urbian
	NSURLConnection *conn;				// added by urbian
	NSMutableData *receivedData;		// added by urbian	

}

@property (nonatomic, retain) UIImagePickerController *imagePickerController;
@property (nonatomic, retain) UIWindow *window;

- (void) imagePickerController:(UIImagePickerController *)picker didFinishPickingImage:(UIImage *)image2 editingInfo:(NSDictionary *)editingInfo;
- (void) imagePickerControllerDidCancel:(UIImagePickerController *)picker;

@end
