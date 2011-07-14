/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2011, IBM Corporation
 * Copyright (c) 2011, Ambrose Software, Inc
 *
 */

#import "Camera.h"
#import "NSData+Base64.h"
#import "Categories.h"
#import "PhonegapDelegate.h"
#import <MobileCoreServices/UTCoreTypes.h>

@implementation PGCamera

@synthesize pickerController;

-(BOOL)popoverSupported
{
	return ( NSClassFromString(@"UIPopoverController") != nil) && 
	(UI_USER_INTERFACE_IDIOM() == UIUserInterfaceIdiomPad);
}

- (void) getPicture:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	NSString* callbackId = [arguments objectAtIndex:0];
	
	NSString* sourceTypeString = [options valueForKey:@"sourceType"];
	UIImagePickerControllerSourceType sourceType = UIImagePickerControllerSourceTypeCamera; // default
	if (sourceTypeString != nil) 
	{
		sourceType = (UIImagePickerControllerSourceType)[sourceTypeString intValue];
	}

	bool hasCamera = [UIImagePickerController isSourceTypeAvailable:sourceType];
	if (!hasCamera) {
		NSLog(@"Camera.getPicture: source type %d not available.", sourceType);
		PluginResult* result = [PluginResult resultWithStatus: PGCommandStatus_OK messageAsString: @"no camera available"];
        [self writeJavascript:[result toErrorCallbackString:callbackId]];
        
	} else {
        
        bool allowEdit = [[options valueForKey:@"allowEdit"] boolValue];
        NSNumber* targetWidth = [options valueForKey:@"targetWidth"];
        NSNumber* targetHeight = [options valueForKey:@"targetHeight"];
        
        CGSize targetSize = CGSizeMake(0, 0);
        if (targetWidth != nil && targetHeight != nil) {
            targetSize = CGSizeMake([targetWidth floatValue], [targetHeight floatValue]);
        }
        
        
        if (self.pickerController == nil) 
        {
            self.pickerController = [[CameraPicker alloc] init];
        }
        
        self.pickerController.delegate = self;
        self.pickerController.sourceType = sourceType;
        self.pickerController.allowsEditing = allowEdit; // THIS IS ALL IT TAKES FOR CROPPING - jm
        self.pickerController.callbackId = callbackId;
        self.pickerController.targetSize = targetSize;
        self.pickerController.encodingType = [[options valueForKey:@"encodingType"] intValue] || EncodingTypeJPEG;
        
        self.pickerController.quality = [options integerValueForKey:@"quality" defaultValue:100 withRange:NSMakeRange(0, 100)];
        self.pickerController.returnType = (DestinationType)[options integerValueForKey:@"destinationType" defaultValue:0 withRange:NSMakeRange(0, 2)];
        
        if([self popoverSupported] && sourceType != UIImagePickerControllerSourceTypeCamera)
        {
            if (self.pickerController.popoverController == nil) 
            { 
                self.pickerController.popoverController = [[NSClassFromString(@"UIPopoverController") alloc] 
                                                           initWithContentViewController:self.pickerController]; 
            } 
            self.pickerController.popoverController.delegate = self;
            [ self.pickerController.popoverController presentPopoverFromRect:CGRectMake(0,32,320,480)
                                                                      inView:[self.webView superview]
                                                    permittedArrowDirections:UIPopoverArrowDirectionAny 
                                                                    animated:YES]; 
        }
        else 
        { 
            [[super appViewController] 
             presentModalViewController:self.pickerController animated:YES]; 
        }
    }
}


- (void)popoverControllerDidDismissPopover:(id)popoverController
{
    [ self imagePickerControllerDidCancel:self.pickerController ];	
}

- (void)imagePickerController:(UIImagePickerController*)picker didFinishPickingMediaWithInfo:(NSDictionary*)info
{

	NSString* callbackId =  self.pickerController.callbackId;
	
	if([self popoverSupported] && self.pickerController.popoverController != nil)
	{
		[self.pickerController.popoverController dismissPopoverAnimated:YES]; 
		self.pickerController.popoverController.delegate = nil;
		self.pickerController.popoverController = nil;
	}
	else 
	{
		[self.pickerController dismissModalViewControllerAnimated:YES]; 
	}
	
	NSString* mediaType = [info objectForKey:UIImagePickerControllerMediaType];
	if ([mediaType isEqualToString:(NSString*)kUTTypeImage])
	{
		
		NSString* jsString = NULL;
		PluginResult* result = nil;
		
		// get the image
		UIImage* image = nil;
		if (self.pickerController.allowsEditing && [info objectForKey:UIImagePickerControllerEditedImage]){
			image = [info objectForKey:UIImagePickerControllerEditedImage];
		}else {
			image = [info objectForKey:UIImagePickerControllerOriginalImage];
		}
        
        UIImage *scaledImage = nil;
        
        if (self.pickerController.targetSize.width > 0 && self.pickerController.targetSize.height > 0) {
            scaledImage = [self imageByScalingAndCroppingForSize:image toSize:self.pickerController.targetSize];
        }
        NSData* data = nil;
		if (self.pickerController.encodingType == EncodingTypePNG) {
            data = UIImagePNGRepresentation(scaledImage == nil ? image : scaledImage);
        }
        else {
            data = UIImageJPEGRepresentation(scaledImage == nil ? image : scaledImage, self.pickerController.quality / 100.0f);
		}
        if (self.pickerController.returnType == DestinationTypeFileUri){
			
			// write to temp directory and reutrn URI
			// get the temp directory path
			NSString* docsPath = [NSTemporaryDirectory() stringByStandardizingPath];
			NSError* err = nil;
			NSFileManager* fileMgr = [[NSFileManager alloc] init]; //recommended by apple (vs [NSFileManager defaultManager]) to be theadsafe
			
			// generate unique file name
			NSString* filePath;
			int i=1;
			do {
				filePath = [NSString stringWithFormat:@"%@/photo_%03d.%@", docsPath, i++, self.pickerController.encodingType == EncodingTypePNG ? @"png" : @"jpg"];
			} while([fileMgr fileExistsAtPath: filePath]);
			// save file
			if (![data writeToFile: filePath options: NSAtomicWrite error: &err]){
				result = [PluginResult resultWithStatus: PGCommandStatus_OK messageAsString: [err localizedDescription]];
				jsString = [result toErrorCallbackString:callbackId];
			}else{
				result = [PluginResult resultWithStatus: PGCommandStatus_OK messageAsString: [NSURL fileURLWithPath: filePath]];
				jsString = [result toSuccessCallbackString:callbackId];
			}
			[fileMgr release];
			
		}else{
			result = [PluginResult resultWithStatus: PGCommandStatus_OK messageAsString: [data base64EncodedString]];
			jsString = [result toSuccessCallbackString:callbackId];
		}
		[self.webView stringByEvaluatingJavaScriptFromString:jsString];
		
	}
	
	self.pickerController.delegate = nil;
	self.pickerController = nil;
}

// older api calls newer didFinishPickingMediaWithInfo
- (void)imagePickerController:(UIImagePickerController*)picker didFinishPickingImage:(UIImage*)image editingInfo:(NSDictionary*)editingInfo
{
	NSDictionary* imageInfo = [NSDictionary dictionaryWithObject:image forKey:UIImagePickerControllerOriginalImage];
	[self imagePickerController:picker didFinishPickingMediaWithInfo: imageInfo];
}

- (void)imagePickerControllerDidCancel:(UIImagePickerController*)picker
{	
	NSString* callbackId = self.pickerController.callbackId;
	
	[picker dismissModalViewControllerAnimated:YES];
	
	PluginResult* result = [PluginResult resultWithStatus: PGCommandStatus_OK messageAsString: @"no image selected"]; // error callback expects string ATM

	[self.webView stringByEvaluatingJavaScriptFromString:[result toErrorCallbackString: callbackId]];
	
	if([self popoverSupported] && self.pickerController.popoverController != nil)
	{
		self.pickerController.popoverController.delegate = nil;
		self.pickerController.popoverController = nil;
	}
	
	self.pickerController.delegate = nil;
	self.pickerController = nil;
	
}
- (UIImage*)imageByScalingAndCroppingForSize:(UIImage*)anImage toSize:(CGSize)targetSize
{
    UIImage *sourceImage = anImage;
    UIImage *newImage = nil;        
    CGSize imageSize = sourceImage.size;
    CGFloat width = imageSize.width;
    CGFloat height = imageSize.height;
    CGFloat targetWidth = targetSize.width;
    CGFloat targetHeight = targetSize.height;
    CGFloat scaleFactor = 0.0;
    CGFloat scaledWidth = targetWidth;
    CGFloat scaledHeight = targetHeight;
    CGPoint thumbnailPoint = CGPointMake(0.0,0.0);
    
    if (CGSizeEqualToSize(imageSize, targetSize) == NO) 
    {
        CGFloat widthFactor = targetWidth / width;
        CGFloat heightFactor = targetHeight / height;
        
        if (widthFactor > heightFactor) 
            scaleFactor = widthFactor; // scale to fit height
        else
            scaleFactor = heightFactor; // scale to fit width
        scaledWidth  = width * scaleFactor;
        scaledHeight = height * scaleFactor;
        
        // center the image
        if (widthFactor > heightFactor)
        {
            thumbnailPoint.y = (targetHeight - scaledHeight) * 0.5; 
        }
        else 
            if (widthFactor < heightFactor)
            {
                thumbnailPoint.x = (targetWidth - scaledWidth) * 0.5;
            }
    }       
    
    UIGraphicsBeginImageContext(targetSize); // this will crop
    
    CGRect thumbnailRect = CGRectZero;
    thumbnailRect.origin = thumbnailPoint;
    thumbnailRect.size.width  = scaledWidth;
    thumbnailRect.size.height = scaledHeight;
    
    [sourceImage drawInRect:thumbnailRect];
    
    newImage = UIGraphicsGetImageFromCurrentImageContext();
    if(newImage == nil) 
        NSLog(@"could not scale image");
    
    //pop the context to get back to the default
    UIGraphicsEndImageContext();
    return newImage;
}

- (void) postImage:(UIImage*)anImage withFilename:(NSString*)filename toUrl:(NSURL*)url 
{
	NSString *boundary = @"----BOUNDARY_IS_I";

	NSMutableURLRequest *req = [NSMutableURLRequest requestWithURL:url];
	[req setHTTPMethod:@"POST"];
	
	NSString *contentType = [NSString stringWithFormat:@"multipart/form-data; boundary=%@", boundary];
	[req setValue:contentType forHTTPHeaderField:@"Content-type"];
	
	NSData *imageData = UIImagePNGRepresentation(anImage);
	
	// adding the body
	NSMutableData *postBody = [NSMutableData data];
	
	// first parameter an image
	[postBody appendData:[[NSString stringWithFormat:@"\r\n--%@\r\n", boundary] dataUsingEncoding:NSUTF8StringEncoding]];
	[postBody appendData:[[NSString stringWithFormat:@"Content-Disposition: form-data; name=\"upload\"; filename=\"%@\"\r\n", filename] dataUsingEncoding:NSUTF8StringEncoding]];
	[postBody appendData:[@"Content-Type: image/png\r\n\r\n" dataUsingEncoding:NSUTF8StringEncoding]];
	[postBody appendData:imageData];
	
//	// second parameter information
//	[postBody appendData:[[NSString stringWithFormat:@"\r\n--%@\r\n", boundary] dataUsingEncoding:NSUTF8StringEncoding]];
//	[postBody appendData:[@"Content-Disposition: form-data; name=\"some_other_name\"\r\n\r\n" dataUsingEncoding:NSUTF8StringEncoding]];
//	[postBody appendData:[@"some_other_value" dataUsingEncoding:NSUTF8StringEncoding]];
//	[postBody appendData:[[NSString stringWithFormat:@"\r\n--%@--\r \n",boundary] dataUsingEncoding:NSUTF8StringEncoding]];
	
	[req setHTTPBody:postBody];
	
	NSURLResponse* response;
	NSError* error;
	[NSURLConnection sendSynchronousRequest:req returningResponse:&response error:&error];

//  NSData* result = [NSURLConnection sendSynchronousRequest:req returningResponse:&response error:&error];
//	NSString * resultStr =  [[[NSString alloc] initWithData:result encoding:NSUTF8StringEncoding] autorelease];
}


- (void) dealloc
{
	if (self.pickerController) 
	{
		self.pickerController.delegate = nil;
	}
	self.pickerController = nil;
	[super dealloc];
}

@end


@implementation CameraPicker

@synthesize quality, postUrl;
@synthesize returnType;
@synthesize callbackId;
@synthesize popoverController;
@synthesize targetSize;
@synthesize encodingType;


- (void) dealloc
{
	if (callbackId) {
		[callbackId release];
	}
	
	
	[super dealloc];
}

@end
