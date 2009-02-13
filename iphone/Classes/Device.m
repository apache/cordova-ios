#import "Device.h"


@implementation Device

- (Device *)init {
  if (self = [super init]) {
    myCurrentDevice = [UIDevice currentDevice];
  }
  return self;
}

- (NSString *)getDeviceInfo {
	return [NSString stringWithFormat:@"\
                       __gap = true; \
                       __gap_version='0.1'; \
                       __gap_device_model='%s'; \
                       __gap_device_version='%s';\
                       __gap_device_uniqueid='%s';",
                       [[myCurrentDevice model] UTF8String],
                       [[myCurrentDevice systemVersion] UTF8String],
                       [[myCurrentDevice uniqueIdentifier] UTF8String]
                       ];
}

- (void)dealloc {
  [myCurrentDevice release];
	[super dealloc];
}

@end