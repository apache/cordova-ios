
#import <UIKit/UIKit.h>
#import <CoreLocation/CoreLocation.h>

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
}

@property (nonatomic, retain) CLLocation *lastKnownLocation;
@property (nonatomic, retain) UIWindow *window;
@property (nonatomic, retain) GlassViewController *viewController;
@property (nonatomic, retain) UIImage *image;
@property BOOL passPersonalInfo;
@property BOOL passGeoData;


@end