
#import <UIKit/UIKit.h>
#import <CoreLocation/CoreLocation.h>


@interface Location : NSObject<CLLocationManagerDelegate> {
	CLLocationManager *locationManager;
}

- (void)startTracking;
- (void)stopTracking;
- (void)location;
- (void)log;

@end