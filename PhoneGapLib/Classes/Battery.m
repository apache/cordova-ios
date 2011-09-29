/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2011, IBM Corporation
 */


#import "Battery.h"


@interface PGBattery(PrivateMethods)
- (void) updateOnlineStatus;
@end

@implementation PGBattery

@synthesize state, level, callbackId;


/*  determining type of event occurs on JavaScript side
- (void) updateBatteryLevel:(NSNotification*)notification
{
    // send batterylow event for less than 25% battery
    // send batterycritical  event for less than 10% battery
    // W3c says to send batteryStatus event when batterylevel changes by more than 1% (iOS seems to notify each 5%)
    // always update the navigator.device.battery info
    float currentLevel = [[UIDevice currentDevice] batteryLevel];
    NSString* type = @"";
    // no check for level == -1 since this api is only called when monitoring is enabled so level should be valid
    if (currentLevel < 0.10){
        type = @"batterycritical";
    } else if (currentLevel < 0.25) {
        type = @"batterylow";
    } else {
        float onePercent = 0.1;
        if (self.level >= 0 ){
            onePercent = self.level * 0.01;
        }
        if (fabsf(currentLevel - self.level) > onePercent){
            // issue batteryStatus event
            type = @"batterystatus";
        }
    }
    // update the battery info and fire event
    NSString* jsString = [NSString stringWithFormat:@"navigator.device.battery._status(\"%@\", %@)", type,[[self getBatteryStatus] JSONRepresentation]];
    [super writeJavascript:jsString];
}
 */

- (void) updateBatteryStatus: (NSNotification*)notification
{
    NSDictionary* batteryData = [self getBatteryStatus];
    if (self.callbackId) {
        PluginResult* result = [PluginResult resultWithStatus:PGCommandStatus_OK messageAsDictionary:batteryData];
        [result setKeepCallbackAsBool:YES];
        [super writeJavascript:[result toSuccessCallbackString:self.callbackId]];
    }
       
}
/* Get the current battery status and level.  Status will be unknown and level will be -1.0 if 
 * monitoring is turned off.
 */
- (NSDictionary*) getBatteryStatus
{
    
    UIDevice* currentDevice = [UIDevice currentDevice];
    UIDeviceBatteryState currentState = [currentDevice batteryState];
    
    BOOL isPlugged = FALSE; // UIDeviceBatteryStateUnknown or UIDeviceBatteryStateUnplugged
    if (currentState == UIDeviceBatteryStateCharging || currentState == UIDeviceBatteryStateFull) {
        isPlugged = TRUE;
    }
    float currentLevel = [currentDevice batteryLevel];
    
    if (currentLevel != self.level || currentState != self.state) {
        
        self.level = currentLevel;
        self.state = currentState;
    }
    
    // W3C spec says level must be null if it is unknown
    NSObject* w3cLevel = nil;
    if (currentState == UIDeviceBatteryStateUnknown || currentLevel == -1.0) {
        w3cLevel = [NSNull null];
    }
    else {
        w3cLevel = [NSNumber numberWithFloat:(currentLevel*100)];
    }
    NSMutableDictionary* batteryData = [NSMutableDictionary dictionaryWithCapacity:2];
    [batteryData setObject: [NSNumber numberWithBool: isPlugged] forKey:@"isPlugged"];
    [batteryData setObject: w3cLevel forKey:@"level"];
    return batteryData;
}

/* turn on battery monitoring*/
- (void) start:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
    self.callbackId = [arguments objectAtIndex:0];
    
    if ( [UIDevice currentDevice].batteryMonitoringEnabled == NO) {
        [[UIDevice currentDevice] setBatteryMonitoringEnabled:YES];
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(updateBatteryStatus:) 
												 name:UIDeviceBatteryStateDidChangeNotification object:nil];
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(updateBatteryStatus:) 
												 name:UIDeviceBatteryLevelDidChangeNotification object:nil];
	}
	
}
/* turn off battery monitoring */
- (void) stop:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
    // callback one last time to clear the callback function on JS side
    if (self.callbackId) {
        PluginResult* result = [PluginResult resultWithStatus:PGCommandStatus_OK messageAsDictionary:[self getBatteryStatus]];
        [result setKeepCallbackAsBool:NO];
        [super writeJavascript:[result toSuccessCallbackString:self.callbackId]];
    }
    self.callbackId = nil;
    [[UIDevice currentDevice] setBatteryMonitoringEnabled:NO];
    [[NSNotificationCenter defaultCenter] removeObserver:self name:UIDeviceBatteryStateDidChangeNotification object:nil];
    [[NSNotificationCenter defaultCenter] removeObserver:self name:UIDeviceBatteryLevelDidChangeNotification object:nil];
    
	
}

- (PGPlugin*) initWithWebView:(UIWebView*)theWebView
{
    self = (PGBattery*)[super initWithWebView:theWebView];
    if (self) {
		self.state = UIDeviceBatteryStateUnknown;
        self.level = -1.0;

    }
    return self;
}

- (void)dealloc
{
	[self stop: NULL withDict:NULL]; 
													
    [super dealloc];
}

@end
