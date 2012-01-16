/*
 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at
 
 http://www.apache.org/licenses/LICENSE-2.0
 
 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
 */

#import <Foundation/Foundation.h>
#import "PGPlugin.h"

enum DestinationType {
	DestinationTypeDataUrl = 0,
	DestinationTypeFileUri
};
typedef NSUInteger DestinationType;

enum EncodingType {
    EncodingTypeJPEG = 0,
    EncodingTypePNG
};
typedef NSUInteger EncodingType;

enum MediaType {
    MediaTypePicture = 0,
    MediaTypeVideo,
    MediaTypeAll
};
typedef NSUInteger MediaType;

@interface CameraPicker : UIImagePickerController
{
}


@property (assign) NSInteger quality;
@property (copy)   NSString* callbackId;
@property (copy)   NSString* postUrl;
@property (nonatomic) enum DestinationType returnType;
@property (nonatomic) enum EncodingType encodingType;
@property (retain) UIPopoverController* popoverController; 
@property (assign) CGSize targetSize;
@property (assign) bool correctOrientation;
@property (assign) bool saveToPhotoAlbum;

- (void) dealloc;

@end

// ======================================================================= //

@interface PGCamera : PGPlugin<UIImagePickerControllerDelegate, 
									UINavigationControllerDelegate,
									UIPopoverControllerDelegate>
{
	CameraPicker* pickerController;
}

@property (retain) CameraPicker* pickerController;

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

- (void)imagePickerController:(UIImagePickerController*)picker didFinishPickingMediaWithInfo:(NSDictionary*)info;
- (void)imagePickerController:(UIImagePickerController*)picker didFinishPickingImage:(UIImage*)image editingInfo:(NSDictionary*)editingInfo;
- (void)imagePickerControllerDidCancel:(UIImagePickerController*)picker;
- (UIImage*)imageByScalingAndCroppingForSize:(UIImage*)anImage toSize:(CGSize)targetSize;
- (UIImage*)imageCorrectedForCaptureOrientation:(UIImage*)anImage;
- (void) dealloc;

@end



