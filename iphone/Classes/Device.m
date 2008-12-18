#import "Device.h"


@implementation Device

- (NSString *)init{
	
	jsCallBack = nil;
	myCurrentDevice = [UIDevice currentDevice];
	
	return jsCallBack = [[NSString alloc] initWithFormat:@"\
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
    [jsCallBack release];
	[myCurrentDevice release];
	[super dealloc];
}

@end