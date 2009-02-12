
#import <UIKit/UIKit.h>
#import <CoreLocation/CoreLocation.h>
#import <UIKit/UINavigationController.h>

#import "Vibrate.h"
#import "Location.h"
#import "Device.h"
#import "Sound.h"
#import "Contacts.h"
//#import "Image.h"

@class GlassViewController;
@class Sound;
@class Contacts;
//@class Image;

@interface GlassAppDelegate : NSObject <
    UIApplicationDelegate, 
    UIWebViewDelegate, 
    UIAccelerometerDelegate,
    UIImagePickerControllerDelegate, 
    UIPickerViewDelegate, 
    UINavigationControllerDelegate
  >
{
	
	IBOutlet UIWindow *window;
	IBOutlet GlassViewController *viewController;
	IBOutlet UIWebView *webView;
	
	IBOutlet UIImageView *imageView;
	IBOutlet UIActivityIndicatorView *activityView;

	UIImagePickerController *picker;	// added by urbian
	NSString *photoUploadUrl;			// added by urbian
	NSString *lastUploadedPhoto;		// added by urbian
	NSURLConnection *conn;				// added by urbian
	NSMutableData *receivedData;		// added by urbian	

	UIImagePickerController *imagePickerController;
	
	NSURLConnection *callBackConnection;
	Sound *sound;
	Contacts *contacts;
	NSURL* appURL;
}

@property (nonatomic, retain) UIWindow *window;
@property (nonatomic, retain) GlassViewController *viewController;
@property (nonatomic, retain) UIImagePickerController *imagePickerController;

//- (void) imagePickerController:(UIImagePickerController *)picker didFinishPickingImage:(UIImage *)image2 editingInfo:(NSDictionary *)editingInfo;
//- (void) imagePickerControllerDidCancel:(UIImagePickerController *)picker;

@end