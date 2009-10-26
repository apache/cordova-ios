/*
 *  Image.h
 *  PhoneGap
 *
 *  Created by Nitobi on 04/02/09.
 *  Copyright 2009 Nitobi. All rights reserved.
 *
 */

#import <Foundation/Foundation.h>
#import "PhoneGapCommand.h"

@interface Image : PhoneGapCommand {
	IBOutlet UIWindow *window;
	
	UIImagePickerController *picker;	// added by urbian
	NSString *photoUploadUrl;			// added by urbian
	NSString *lastUploadedPhoto;		// added by urbian
	NSURLConnection *conn;				// added by urbian
	NSMutableData *receivedData;		// added by urbian	

}

@property (nonatomic, retain) UIImagePickerController *picker;
@property (nonatomic, retain) UIWindow *window;

- (void) imagePickerController:(UIImagePickerController *)picker didFinishPickingImage:(UIImage *)image2 editingInfo:(NSDictionary *)editingInfo;
- (void) imagePickerControllerDidCancel:(UIImagePickerController *)picker;

@end
