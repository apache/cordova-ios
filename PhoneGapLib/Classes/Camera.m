//
//  Camera.m
//  PhoneGap
//
//  Created by Shazron Abdullah on 15/07/09.
//  Copyright 2009 Nitobi. All rights reserved.
//

#import "Camera.h"
#import "NSData+Base64.h"
#import "Categories.h"
#import <MobileCoreServices/UTCoreTypes.h>

@implementation Camera

@synthesize pickerController;

- (CameraPicker*) createCameraPicker:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	NSUInteger argc = [arguments count];
	NSString* successCallback = nil, *errorCallback = nil;
	
	if (argc > 0) successCallback = [arguments objectAtIndex:0];
	if (argc > 1) errorCallback = [arguments objectAtIndex:1];
	
	if (argc < 1) {
		NSLog(@"Camera.getPicture: Missing 1st parameter.");
		return nil;
	}
	
	NSString* sourceTypeString = [options valueForKey:@"sourceType"];
	UIImagePickerControllerSourceType sourceType = UIImagePickerControllerSourceTypeCamera; // default
	if (sourceTypeString != nil) {
		sourceType = (UIImagePickerControllerSourceType)[sourceTypeString intValue];
	}
	
	bool hasCamera = [UIImagePickerController isSourceTypeAvailable:sourceType];
	if (!hasCamera) {
		NSLog(@"Camera.getPicture: source type %d not available.", sourceType);
		return nil;
	}
	
	self.pickerController = [[CameraPicker alloc] init];
	
	self.pickerController.delegate = self;
	self.pickerController.sourceType = sourceType;
	self.pickerController.successCallback = successCallback;
	self.pickerController.errorCallback = errorCallback;
	self.pickerController.quality = [options integerValueForKey:@"quality" defaultValue:100 withRange:NSMakeRange(0, 100)];
	self.pickerController.postUrl = nil;
	
	return self.pickerController;
}

- (void) getPicture:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	CameraPicker* picker = [self createCameraPicker:arguments withDict:options];
	if (picker == nil) {
		return;
	}
	
	[[super appViewController] presentModalViewController:picker animated:YES];
}

- (void) postPicture:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
	CameraPicker* picker = [self createCameraPicker:arguments withDict:options];
	if (picker == nil) {
		return;
	}
	
	NSString* postUrlString = [options valueForKey:@"postUrl"];
	if (postUrlString != nil) {
		picker.postUrl = postUrlString;
	} else {
		NSLog(@"Camera.postPicture: postUrl not specified.");
		return;
	}
	
	[[super appViewController] presentModalViewController:picker animated:YES];
}

- (void)imagePickerController:(UIImagePickerController*)picker didFinishPickingMediaWithInfo:(NSDictionary*)info
{
	NSString* mediaType = [info objectForKey:UIImagePickerControllerMediaType];
	if ([mediaType isEqualToString:(NSString*)kUTTypeImage]){
		UIImage* image = [info objectForKey:UIImagePickerControllerOriginalImage];
		[self imagePickerController:picker didFinishPickingImage:image editingInfo:info];
	}
}

- (void)imagePickerController:(UIImagePickerController*)picker didFinishPickingImage:(UIImage*)image editingInfo:(NSDictionary*)editingInfo
{
	CameraPicker* cameraPicker = (CameraPicker*)picker;
	CGFloat quality = (double)cameraPicker.quality / 100.0; 
	NSData* data = UIImageJPEGRepresentation(image, quality);

	[picker dismissModalViewControllerAnimated:YES];
	
	if (cameraPicker.postUrl != nil) {
		//TODO: need loading view here
		BOOL postOk = [self postImage:image withFilename:@"file.png" andQuality:quality toUrl:[NSURL URLWithString:cameraPicker.postUrl]];
		if (cameraPicker.successCallback) {
			NSString* jsString = [[NSString alloc] initWithFormat:@"%@(%@);", cameraPicker.successCallback, postOk? @"true" : @"false"];
			[self writeJavascript:jsString];
			[jsString release];
		}
		
	} else {
		if (cameraPicker.successCallback) {
			NSString* jsString = [[NSString alloc] initWithFormat:@"%@(\"%@\");", cameraPicker.successCallback, [data base64EncodedString]];
			[self writeJavascript:jsString];
			[jsString release];
		}
	}
}

- (void)imagePickerControllerDidCancel:(UIImagePickerController*)picker
{
	[picker dismissModalViewControllerAnimated:YES];
}

- (BOOL) postImage:(UIImage*)anImage withFilename:(NSString*)filename toUrl:(NSURL*)url 
{
	return [self postImage:anImage withFilename:filename andQuality:100.0 toUrl:url];
}

- (BOOL) postImage:(UIImage*)anImage withFilename:(NSString*)filename andQuality:(CGFloat)quality toUrl:(NSURL*)url 
{
	NSString* boundary = @"----BOUNDARY_IS_I";

	NSMutableURLRequest* req = [NSMutableURLRequest requestWithURL:url];
	[req setHTTPMethod:@"POST"];
	
	NSString* contentType = [NSString stringWithFormat:@"multipart/form-data; boundary=%@", boundary];
	[req setValue:contentType forHTTPHeaderField:@"Content-type"];
	
	NSData* imageData = UIImageJPEGRepresentation(anImage, quality);
	
	// adding the body
	NSMutableData *postBody = [NSMutableData data];
	
	// first parameter an image
	[postBody appendData:[[NSString stringWithFormat:@"\r\n--%@\r\n", boundary] dataUsingEncoding:NSUTF8StringEncoding]];
	[postBody appendData:[[NSString stringWithFormat:@"Content-Disposition: form-data; name=\"upload\"; filename=\"%@\"\r\n", filename] dataUsingEncoding:NSUTF8StringEncoding]];
	[postBody appendData:[@"Content-Type: image/jpeg\r\n\r\n" dataUsingEncoding:NSUTF8StringEncoding]];
	[postBody appendData:imageData];
	
//	// second parameter information
//	[postBody appendData:[[NSString stringWithFormat:@"\r\n--%@\r\n", boundary] dataUsingEncoding:NSUTF8StringEncoding]];
//	[postBody appendData:[@"Content-Disposition: form-data; name=\"some_other_name\"\r\n\r\n" dataUsingEncoding:NSUTF8StringEncoding]];
//	[postBody appendData:[@"some_other_value" dataUsingEncoding:NSUTF8StringEncoding]];
//	[postBody appendData:[[NSString stringWithFormat:@"\r\n--%@--\r \n",boundary] dataUsingEncoding:NSUTF8StringEncoding]];
	
	[req setHTTPBody:postBody];
	
	NSURLResponse* response = nil;
	NSError* error = nil;
	[NSURLConnection sendSynchronousRequest:req returningResponse:&response error:&error];

	//NSData* result = [NSURLConnection sendSynchronousRequest:req returningResponse:&response error:&error];
	//NSString* resultStr =  [[[NSString alloc] initWithData:result encoding:NSUTF8StringEncoding] autorelease];
	
	return (error == nil);
}

- (void) dealloc
{
	if (pickerController) {
		[pickerController release];
	}
	
	[super dealloc];
}

@end


@implementation CameraPicker

@synthesize quality, postUrl;
@synthesize successCallback;
@synthesize errorCallback;

- (void) dealloc
{
	self.successCallback = nil;
	self.errorCallback = nil;
	self.postUrl = nil;

	[super dealloc];
}

@end
