#import <UIKit/UIKit.h>
#import <CoreLocation/CoreLocation.h>
#import <UIKit/UINavigationController.h>
#import <JSON/JSON.h>

#import "Location.h"
#import "Device.h"
#import "Sound.h"
#import "Contacts.h"
#import "DebugConsole.h"
#import "UIControls.h"
//#import "Image.h"

@class PhoneGapViewController;
@class Sound;
@class Contacts;
@class Console;
//@class Image;

@interface PhoneGapDelegate : NSObject <
    UIApplicationDelegate, 
    UIWebViewDelegate, 
    UIAccelerometerDelegate,
    //UIImagePickerControllerDelegate, 
    UIPickerViewDelegate, 
    UINavigationControllerDelegate
  >
{
	
	IBOutlet UIWindow *window;
	IBOutlet PhoneGapViewController *viewController;
	IBOutlet UIWebView *webView;
	
	IBOutlet UIImageView *imageView;
	IBOutlet UIActivityIndicatorView *activityView;

	UIImagePickerController *picker;	// added by urbian
	NSString *photoUploadUrl;			// added by urbian
	NSString *lastUploadedPhoto;		// added by urbian
	NSURLConnection *conn;				// added by urbian
	NSMutableData *receivedData;		// added by urbian	

	//UIImagePickerController *imagePickerController;
    
    UIInterfaceOrientation orientationType;
    NSDictionary *settings;
    
	NSURLConnection *callBackConnection;
	Sound *sound;
	Contacts *contacts;
    Console *console;
	NSURL* appURL;
    
    NSMutableDictionary *commandObjects;
}

@property (nonatomic, retain) UIWindow *window;
@property (nonatomic, retain) PhoneGapViewController *viewController;
//@property (nonatomic, retain) UIImagePickerController *imagePickerController;
@property (nonatomic, retain) UIActivityIndicatorView *activityView;
@property (nonatomic, retain) NSMutableDictionary *commandObjects;
@property (nonatomic, retain) NSDictionary *settings;

//- (void) imagePickerController:(UIImagePickerController *)picker didFinishPickingImage:(UIImage *)image2 editingInfo:(NSDictionary *)editingInfo;
//- (void) imagePickerControllerDidCancel:(UIImagePickerController *)picker;

-(id) getCommandInstance:(NSString*)className;
- (NSDictionary*)getBundlePlist:(NSString *)plistName;

@end
