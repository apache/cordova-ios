/*
 *  Location.m
 *
 *  Created by Nitobi on 12/12/08.
 *  Copyright 2008 Nitobi. All rights reserved.
 *
 */

#import "Location.h"

#define LocStr(key) [[NSBundle mainBundle] localizedStringForKey:(key) value:@"" table:nil]

@implementation Location
@synthesize locationManager;
@synthesize lastKnownLocation;

static Location *sharedCLDelegate = nil;

+ (void)get:(NSString*)options forWebView:(UIWebView*)webView
{
    NSString * jsCallBack = [[Location sharedInstance] getPosition];
    
    [webView stringByEvaluatingJavaScriptFromString:jsCallBack];
    [jsCallBack release];
}

+ (void)start:(NSString*)options forWebView:(UIWebView*)webView
{
    [[Location sharedInstance] start];
}


- (id) init {
    self = [super init];
    if (self != nil) {
        self.locationManager = [[[CLLocationManager alloc] init] autorelease];
        self.locationManager.delegate = self; // Tells the location manager to send updates to this object
    }
    return self;
}

- (void)start
{
    [self.locationManager startUpdatingLocation];
    __started = YES;
}

- (void)locationManager:(CLLocationManager *)manager
    didUpdateToLocation:(CLLocation *)newLocation
           fromLocation:(CLLocation *)oldLocation
{
	[lastKnownLocation release];
	lastKnownLocation = newLocation;
	[lastKnownLocation retain];	
}


- (NSString *)getPosition 
{	
    if (!__started)
    {
        [self start];
    }
        
	return [[NSString alloc] initWithFormat:@"var geo={lat:%f,lng:%f,alt:%f};", 
			lastKnownLocation.coordinate.latitude, 
			lastKnownLocation.coordinate.longitude, 
			lastKnownLocation.altitude];	

}

+ (Location *)sharedInstance {
    @synchronized(self) {
        if (sharedCLDelegate == nil) {
            [[self alloc] init]; // assignment not done here
        }
    }
    return sharedCLDelegate;
}

+ (id)allocWithZone:(NSZone *)zone {
    @synchronized(self) {
        if (sharedCLDelegate == nil) {
            sharedCLDelegate = [super allocWithZone:zone];
            return sharedCLDelegate;  // assignment and return on first allocation
        }
    }
    return nil; // on subsequent allocation attempts return nil
}

- (id)copyWithZone:(NSZone *)zone
{
    return self;
}

- (id)retain {
    return self;
}

- (unsigned)retainCount {
    return UINT_MAX;  // denotes an object that cannot be released
}

- (void)release {
    //do nothing
}

- (id)autorelease {
    return self;
}


- (void)dealloc {
    [locationManager release];
	[super dealloc];
}

@end
