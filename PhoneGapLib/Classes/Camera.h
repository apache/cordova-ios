/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010, IBM Corporation
 * 
 * DEPRECATED: Use the Media Capture API instead, this will be removed in 1.0
 * add "__attribute__ ((unavailable))" when finally removed.
 */

#import <Foundation/Foundation.h>
#import "PGPlugin.h"

__attribute__ ((deprecated)) enum DestinationType {
	DestinationTypeDataUrl = 0,
	DestinationTypeFileUri
};
typedef NSUInteger DestinationType;


__attribute__ ((deprecated)) @interface CameraPicker : UIImagePickerController
{
	NSString* callbackid;
	NSInteger quality;
	NSString* postUrl;
	enum DestinationType returnType;
	UIPopoverController* popoverController; 
}


@property (assign) NSInteger quality;
@property (copy)   NSString* callbackId;
@property (copy)   NSString* postUrl;
@property (nonatomic) enum DestinationType returnType;
@property (assign) UIPopoverController* popoverController; 

- (void) dealloc;

@end

// ======================================================================= //

__attribute__ ((deprecated)) @interface PGCamera : PGPlugin<UIImagePickerControllerDelegate, 
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

- (void) dealloc;

@end



