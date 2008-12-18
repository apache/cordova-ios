
#import "Location.h"


@implementation Location

- (id)init{
	NSLog(@"Gap::Location");
	locationManager = [[CLLocationManager alloc] init];
	[locationManager setDelegate:self];
	return self;
}

- (void)startTracking{
	NSLog(@"starting location tracker");
	[locationManager startUpdatingLocation];
}

- (void)stopTracking{
	NSLog(@"stopping location tracker");
	[locationManager stopUpdatingLocation];
}

- (void)location{
	NSLog(@"location is");
}

- (void)log{
	NSLog(@"the location is...");
}

- (void)dealloc {
    [locationManager release];
	[super dealloc];
}

@end
