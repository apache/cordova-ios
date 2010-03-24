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
	NSString* postUrl;
}

@property (nonatomic, assign) NSInteger quality;
@property (nonatomic, copy) NSString* successCallback;
@property (nonatomic, copy) NSString* errorCallback;
@property (nonatomic, copy) NSString* postUrl;

- (void) dealloc;

@end

@interface Camera : PhoneGapCommand<UIImagePickerControllerDelegate, UINavigationControllerDelegate>
{
	CameraPicker* pickerController;
}

@property (nonatomic, retain) CameraPicker* pickerController;

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
- (BOOL) postImage:(UIImage*)anImage withFilename:(NSString*)filename toUrl:(NSURL*)url;
- (BOOL) postImage:(UIImage*)anImage withFilename:(NSString*)filename andQuality:(CGFloat)quality toUrl:(NSURL*)url;

- (void)imagePickerController:(UIImagePickerController*)picker didFinishPickingImage:(UIImage*)image editingInfo:(NSDictionary*)editingInfo;
- (void)imagePickerControllerDidCancel:(UIImagePickerController*)picker;

- (void) dealloc;

@end



