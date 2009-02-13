
#import <UIKit/UIKit.h>
#import <UIKit/UIDevice.h>

@interface Device : NSObject {
	UIDevice *myCurrentDevice;
}

- (Device *) init;
- (NSString *)getDeviceInfo;
- (void) dealloc;

@end