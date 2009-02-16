#import "Device.h"


@implementation Device

- (NSString *)getDeviceInfo {
	return [NSString stringWithFormat:@"\
          __gap = true; \
          __gap_version='0.1'; \
          __gap_device_model='%s'; \
          __gap_device_version='%s';\
          __gap_device_uniqueid='%s';",
          [[[UIDevice currentDevice] model] UTF8String],
          [[[UIDevice currentDevice] systemVersion] UTF8String],
          [[[UIDevice currentDevice] uniqueIdentifier] UTF8String]
          ];
}

@end