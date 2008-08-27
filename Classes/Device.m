#import "Device.h"


@implementation Device

- (NSString *)init{
	
	NSString *jsCallBack = nil;
	UIDevice *myCurrentDevice = [UIDevice currentDevice];
	
	return jsCallBack = [[NSString alloc] initWithFormat:@"\
				  __gap = true; \
				  __gap_version='0.1'; \
				  __gap_device_model='%s'; \
				  __gap_device_version='%s';",
				  [[myCurrentDevice model] UTF8String],
				  [[myCurrentDevice systemVersion] UTF8String]
				  ];
	//NSLog(jsCallBack);
}

@end