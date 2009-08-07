/*
 *  Camera.h
 *
 *  Created by Nitobi on 12/12/08.
 *  Copyright 2008 Nitobi. All rights reserved.
 *
 */

#import <Foundation/Foundation.h>
#import "PhoneGapCommand.h"

@interface CameraPicker : UIImagePickerController
{
	NSString* successCallback;
	NSString* errorCallback;
	NSInteger quality;
}

@property NSInteger quality;
@property (retain) NSString* successCallback;
@property (retain) NSString* errorCallback;

- (void) dealloc;

@end

@interface Camera : PhoneGapCommand<UIImagePickerControllerDelegate, UINavigationControllerDelegate>
{
	CameraPicker* pickerController;
}

/*
 * getPicture
 *
 * arguments:
 *	1: this is the javascript function that will be called with the results, the first parameter passed to the
 *		javascript function is the picture as a Base64 encoded string
 *  2: this is the javascript function to be called if there was an error
 * options:
 *	quality: integer between 1 and 100
 */
- (void) getPicture:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) postImage:(UIImage*)anImage withFilename:(NSString*)filename toUrl:(NSURL*)url;

- (void)imagePickerController:(UIImagePickerController*)picker didFinishPickingImage:(UIImage*)image editingInfo:(NSDictionary*)editingInfo;
- (void)imagePickerControllerDidCancel:(UIImagePickerController*)picker;

- (void) dealloc;

@end



