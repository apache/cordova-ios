/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2011, IBM Corporation
 */

#import <Foundation/Foundation.h>
#import <MobileCoreServices/MobileCoreServices.h>
#import <AVFoundation/AVFoundation.h>
#import "PGPlugin.h"
#import "File.h"

enum CaptureError {
	CAPTURE_INTERNAL_ERR = 0,
    CAPTURE_APPLICATION_BUSY = 1,
    CAPTURE_INVALID_ARGUMENT = 2,
    CAPTURE_NO_MEDIA_FILES = 3,
    CAPTURE_NOT_SUPPORTED = 20
};
typedef NSUInteger CaptureError;


@interface PGImagePicker : UIImagePickerController
{
	NSString* callbackid;
	NSInteger quality;
    NSString* mimeType;
}
@property (assign) NSInteger quality;
@property (copy)   NSString* callbackId;
@property (copy)   NSString* mimeType;


- (void) dealloc;

@end

@interface PGCapture : PGPlugin<UIImagePickerControllerDelegate, UINavigationControllerDelegate> 
{
    PGImagePicker* pickerController;
    BOOL inUse;
}
@property BOOL inUse;
- (void) captureAudio:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) captureImage:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
-(NSString*) processImage: (UIImage*) image type: (NSString*) mimeType forCallbackId: (NSString*)callbackId;
- (void) captureVideo:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
-(NSString*) processVideo: (NSString*) moviePath forCallbackId: (NSString*) callbackId;
- (void) getMediaModes: (NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) getFormatData: (NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
-(NSDictionary*) getMediaDictionaryFromPath: (NSString*) fullPath ofType: (NSString*) type;
- (void)imagePickerController:(UIImagePickerController*)picker didFinishPickingMediaWithInfo:(NSDictionary*)info;
- (void)imagePickerController:(UIImagePickerController*)picker didFinishPickingImage:(UIImage*)image editingInfo:(NSDictionary*)editingInfo;
- (void)imagePickerControllerDidCancel:(UIImagePickerController*)picker;

- (void) dealloc;
@end
/* AudioRecorderViewController is used to create a simple view for audio recording.
 *  It is created from [Capture captureAudio].  It creates a very simple interface for
 *  recording by presenting just a record/stop button and a Done button to close the view.  
 *  The recording time is displayed and recording for a specified duration is supported. When duration
 *  is specified there is no UI to the user - recording just stops when the specified 
 *  duration is reached.  The UI has been minimized to avoid localization.  
 */
@interface AudioRecorderViewController : UIViewController <AVAudioRecorderDelegate>
{
    CaptureError errorCode;
    NSString* callbackId;
    NSNumber* duration;
    PGCapture* captureCommand;
    UIBarButtonItem* doneButton;
    UIView* recordingView;
    UIButton* recordButton;
    UIImage* recordImage;
    UIImage* stopRecordImage;
    UILabel* timerLabel;
    AVAudioRecorder* avRecorder;
    AVAudioSession *avSession;
    NSString* resultString;
    NSTimer* timer;
    BOOL isTimed;
    
}
@property (nonatomic) CaptureError errorCode;
@property (nonatomic, copy) NSString* callbackId;
@property (nonatomic, copy) NSNumber* duration;
@property (nonatomic, retain) PGCapture* captureCommand;
@property (nonatomic, retain) UIBarButtonItem* doneButton;
@property (nonatomic, retain) UIView* recordingView;
@property (nonatomic, retain) UIButton* recordButton;
@property (nonatomic, retain) UIImage* recordImage;
@property (nonatomic, retain) UIImage* stopRecordImage;
@property (nonatomic, retain) UILabel* timerLabel;
@property (nonatomic, retain) AVAudioRecorder* avRecorder;
@property (nonatomic, retain) AVAudioSession* avSession;
@property (nonatomic, retain) NSString* resultString;
@property (nonatomic, retain) NSTimer* timer;
@property (nonatomic) BOOL isTimed;

- (id) initWithCommand: (PGPlugin*) theCommand duration: (NSNumber*) theDuration callbackId: (NSString*) theCallbackId;
- (void) processButton: (id) sender;
- (void) stopRecordingCleanup;
- (void) dismissAudioView: (id) sender;
- (NSString *) formatTime: (int) interval;
- (void) updateTime;
@end
