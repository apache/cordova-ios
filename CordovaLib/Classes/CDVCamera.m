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

#import "CDVCamera.h"
#import "NSData+Base64.h"
#import "NSDictionary+Extensions.h"
#import <MobileCoreServices/UTCoreTypes.h>

@implementation CDVCamera

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
		CDVPluginResult* result = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK messageAsString: @"no camera available"];
        [self writeJavascript:[result toErrorCallbackString:callbackId]];
        
	} else {
        bool allowEdit = [[options valueForKey:@"allowEdit"] boolValue];
        NSNumber* targetWidth = [options valueForKey:@"targetWidth"];
        NSNumber* targetHeight = [options valueForKey:@"targetHeight"];
        NSNumber* mediaValue = [options valueForKey:@"mediaType"];
        CDVMediaType mediaType = (mediaValue) ? [mediaValue intValue] : MediaTypePicture;
        
        CGSize targetSize = CGSizeMake(0, 0);
        if (targetWidth != nil && targetHeight != nil) {
            targetSize = CGSizeMake([targetWidth floatValue], [targetHeight floatValue]);
        }
        
        
        if (self.pickerController == nil) 
        {
            self.pickerController = [[[CDVCameraPicker alloc] init] autorelease];
        }
        
        self.pickerController.delegate = self;
        self.pickerController.sourceType = sourceType;
        self.pickerController.allowsEditing = allowEdit; // THIS IS ALL IT TAKES FOR CROPPING - jm
        self.pickerController.callbackId = callbackId;
        self.pickerController.targetSize = targetSize;
        self.pickerController.correctOrientation = [[options valueForKey:@"correctOrientation"] boolValue];
        self.pickerController.saveToPhotoAlbum = [[options valueForKey:@"saveToPhotoAlbum"] boolValue];
        self.pickerController.encodingType = [[options valueForKey:@"encodingType"] intValue] || EncodingTypeJPEG;
        
        self.pickerController.quality = [options integerValueForKey:@"quality" defaultValue:100 withRange:NSMakeRange(0, 100)];
        self.pickerController.returnType = (CDVDestinationType)[options integerValueForKey:@"destinationType" defaultValue:1 withRange:NSMakeRange(0, 2)];
       
        if (sourceType == UIImagePickerControllerSourceTypeCamera) {
            // we only allow taking pictures (no video) in this api
            self.pickerController.mediaTypes = [NSArray arrayWithObjects: (NSString*) kUTTypeImage, nil];
        } else if (mediaType == MediaTypeAll) {
            self.pickerController.mediaTypes = [UIImagePickerController availableMediaTypesForSourceType: sourceType];
        } else {
            NSArray* mediaArray = [NSArray arrayWithObjects: (NSString*) (mediaType == MediaTypeVideo ? kUTTypeMovie : kUTTypeImage), nil];
            self.pickerController.mediaTypes = mediaArray;
            
        }
        
        if([self popoverSupported] && sourceType != UIImagePickerControllerSourceTypeCamera)
        {
            if (self.pickerController.popoverController == nil) 
            { 
                self.pickerController.popoverController = [[[NSClassFromString(@"UIPopoverController") alloc] 
                                                           initWithContentViewController:self.pickerController] autorelease]; 
            } 
            self.pickerController.popoverController.delegate = self;
            [ self.pickerController.popoverController presentPopoverFromRect:CGRectMake(0,32,320,480)
                                                                      inView:[self.webView superview]
                                                    permittedArrowDirections:UIPopoverArrowDirectionAny 
                                                                    animated:YES]; 
        }
        else 
        { 
            if ([self.viewController respondsToSelector:@selector(presentViewController:::)]) {
                [self.viewController presentViewController:self.pickerController animated:YES completion:nil];        
            } else {
                [self.viewController presentModalViewController:self.pickerController animated:YES ];
            }              
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
        if ([self.pickerController respondsToSelector:@selector(presentingViewController)]) { 
            [[self.pickerController presentingViewController] dismissModalViewControllerAnimated:YES];
        } else {
            [[self.pickerController parentViewController] dismissModalViewControllerAnimated:YES];
        }        
	}
	NSString* jsString = nil;
    CDVPluginResult* result = nil;
    
	NSString* mediaType = [info objectForKey:UIImagePickerControllerMediaType];
	if ([mediaType isEqualToString:(NSString*)kUTTypeImage])
	{
		
		
		
		// get the image
		UIImage* image = nil;
		if (self.pickerController.allowsEditing && [info objectForKey:UIImagePickerControllerEditedImage]){
			image = [info objectForKey:UIImagePickerControllerEditedImage];
		}else {
			image = [info objectForKey:UIImagePickerControllerOriginalImage];
		}
    if (self.pickerController.saveToPhotoAlbum) {
      UIImageWriteToSavedPhotosAlbum(image, nil, nil, nil);
    }
    
    if (self.pickerController.correctOrientation) {
      image = [self imageCorrectedForCaptureOrientation:image];
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
				result = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK messageAsString: [err localizedDescription]];
				jsString = [result toErrorCallbackString:callbackId];
			}else{
				result = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK messageAsString: [[NSURL fileURLWithPath: filePath] absoluteString]];
				jsString = [result toSuccessCallbackString:callbackId];
			}
			[fileMgr release];
			
		}else{
			result = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK messageAsString: [data base64EncodedString]];
			jsString = [result toSuccessCallbackString:callbackId];
		}
		
		
	} else {
        // was movie type
         NSString *moviePath = [[info objectForKey: UIImagePickerControllerMediaURL] absoluteString];
        result = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK messageAsString: moviePath];
        jsString = [result toSuccessCallbackString:callbackId];
        
    }
    if (jsString) {
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
	
    if ([picker respondsToSelector:@selector(presentingViewController)]) { 
        [[picker presentingViewController] dismissModalViewControllerAnimated:YES];
    } else {
        [[picker parentViewController] dismissModalViewControllerAnimated:YES];
    }        
	
	CDVPluginResult* result = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK messageAsString: @"no image selected"]; // error callback expects string ATM

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

- (UIImage*)imageCorrectedForCaptureOrientation:(UIImage*)anImage
{   
   float rotation_radians = 0;
   bool perpendicular = false;
   switch ([anImage imageOrientation]) {
    case UIImageOrientationUp:
      rotation_radians = 0.0;
      break;
    case UIImageOrientationDown:   
      rotation_radians = M_PI; //don't be scared of radians, if you're reading this, you're good at math
      break;
    case UIImageOrientationRight:
      rotation_radians = M_PI_2;
      perpendicular = true;
      break;
    case UIImageOrientationLeft:
      rotation_radians = -M_PI_2;
      perpendicular = true;
      break;
    default:
      break;
   }
   
   UIGraphicsBeginImageContext(CGSizeMake(anImage.size.width, anImage.size.height));
   CGContextRef context = UIGraphicsGetCurrentContext();
   
   //Rotate around the center point
   CGContextTranslateCTM(context, anImage.size.width/2, anImage.size.height/2);
   CGContextRotateCTM(context, rotation_radians);
   
   CGContextScaleCTM(context, 1.0, -1.0);
   float width = perpendicular ? anImage.size.height : anImage.size.width;
   float height = perpendicular ? anImage.size.width : anImage.size.height;
   CGContextDrawImage(context, CGRectMake(-width / 2, -height / 2, width, height), [anImage CGImage]);
   
   // Move the origin back since the rotation might've change it (if its 90 degrees)
   if (perpendicular) {
     CGContextTranslateCTM(context, -anImage.size.height/2, -anImage.size.width/2);
   }
   
   UIImage *newImage = UIGraphicsGetImageFromCurrentImageContext();
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


@implementation CDVCameraPicker

@synthesize quality, postUrl;
@synthesize returnType;
@synthesize callbackId;
@synthesize popoverController;
@synthesize targetSize;
@synthesize correctOrientation;
@synthesize saveToPhotoAlbum;
@synthesize encodingType;


- (void) dealloc
{
	if (callbackId) {
		[callbackId release];
	}
	
	
	[super dealloc];
}

@end
