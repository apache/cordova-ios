
#import <UIKit/UIKit.h>

#import <CoreLocation/CoreLocation.h>
#import <UIKit/UINavigationController.h>

@class GlassViewController;

@interface GlassAppDelegate : NSObject <UIApplicationDelegate, UIWebViewDelegate, CLLocationManagerDelegate, UIAccelerometerDelegate> {
	IBOutlet UIWindow *window;
	IBOutlet GlassViewController *viewController;
	IBOutlet UIWebView *webView;
	
	BOOL passPersonalInfo;
    BOOL passGeoData;
	
	CLLocationManager *locationManager;
	CLLocation		  *lastKnownLocation;

	UIImage *image;
    UIImagePickerController *imagePickerController;
	
	NSURLConnection *callBackConnection;
}

@property (nonatomic, retain) CLLocation *lastKnownLocation;
@property (nonatomic, retain) UIWindow *window;
@property (nonatomic, retain) GlassViewController *viewController;
@property (nonatomic, retain) UIImage *image;
@property BOOL passPersonalInfo;
@property BOOL passGeoData;

-(NSURLRequest *)createCallBackRequest:(NSDictionary *)postKeys withData:(NSData *)data;
- (void) imagePickerController:(UIImagePickerController *)picker didFinishPickingImage:(UIImage *)image2 editingInfo:(NSDictionary *)editingInfo;
- (void) imagePickerControllerDidCancel:(UIImagePickerController *)picker;
- (BOOL) sendPhotoToCallback:(NSData *)imageData;

@end