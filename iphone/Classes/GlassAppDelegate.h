
#import <UIKit/UIKit.h>
#import <CoreLocation/CoreLocation.h>
#import <UIKit/UINavigationController.h>

#import "Vibrate.h"
#import "Location.h"
#import "Device.h"

@class GlassViewController;
@class SoundEffect;
@class Contacts;

@interface GlassAppDelegate : NSObject <
    UIApplicationDelegate, 
    UIWebViewDelegate, 
    CLLocationManagerDelegate, 
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
  
	CLLocationManager *locationManager;
	CLLocation		  *lastKnownLocation;

	UIImagePickerController *imagePickerController;
	
	NSURLConnection *callBackConnection;
	SoundEffect *soundEffect;
	Contacts *contacts;
	NSURL* appURL;
}

@property (nonatomic, retain) CLLocation *lastKnownLocation;
@property (nonatomic, retain) UIWindow *window;
@property (nonatomic, retain) GlassViewController *viewController;
@property (nonatomic, retain) UIImagePickerController *imagePickerController;

- (void) imagePickerController:(UIImagePickerController *)picker didFinishPickingImage:(UIImage *)image2 editingInfo:(NSDictionary *)editingInfo;
- (void) imagePickerControllerDidCancel:(UIImagePickerController *)picker;

@end