#API Changes

* CDVViewController.h
* CDVPlugin.h


## CDVViewController.h


### Removed:

Methods:

    + (NSDictionary*)getBundlePlist:(NSString*)
    + (NSString*)applicationDocumentsDirectory
    - (void)javascriptAlert:(NSString*)
    - (void)printMultitaskingInfo
    - createGapView

Properties:

    @property BOOL loadFromString

### Added:

Properties:

    @property id<CDVWebViewEngineProtocol> webViewEngine
    @property NSInteger* userAgentLockToken

### Modified:

Methods:

    - (UIView*)newCordovaViewWithFrame:(CGRect)bounds

Properties:

    @property UIView* webView

## CDVPlugin.h

### Removed:

Methods:

    - (CDVPlugin*)initWithWebView:(UIWebView*)
    - (NSString*)writeJavascript:(NSString*)
    - (NSString*)success:(CDVPluginResult*) callbackId:(NSString*)
    - (NSString*)error:(CDVPluginResult*) callbackId:(NSString*)

Properties:

    @property CDVWhitelist* whitelist

### Added:

Methods:

    - (NSURL*)errorURL;
    - (BOOL)shouldAllowRequestForURL:(NSURL*)url
    - (BOOL)shouldAllowNavigationToURL:(NSURL*)url
    - (BOOL)shouldOpenExternalURL:(NSURL*)url

Properties:

    @property id<CDVWebViewEngineProtocol> webViewEngine


### Modified:

    @property UIView* webView


### Optional:

Methods:

    - (BOOL)shouldAllowRequestForURL:(NSURL *)url
    - (BOOL)shouldAllowNavigationToURL:(NSURL *)url
    - (BOOL)shouldOpenExternalURL:(NSURL *)url

## CDVPluginResult.h

### Added:

Methods:

    + (CDVPluginResult*)resultWithStatus:(CDVCommandStatus)statusOrdinal messageAsNSInteger:(NSInteger)theMessage;
    + (CDVPluginResult*)resultWithStatus:(CDVCommandStatus)statusOrdinal messageAsNSUInteger:(NSUInteger)theMessage;


## NSData+Base64.h

This class has been removed.

### Removed:

Methods:

    + (NSData*)dataFromBase64String:(NSString*)aString CDV_DEPRECATED(3.8 .0, "Use cdv_dataFromBase64String");
    - (NSString*)base64EncodedString CDV_DEPRECATED(3.8 .0, "Use [NSData cdv_base64EncodedString]");
    + (NSData*)cdv_dataFromBase64String:(NSString*)aString;
    - (NSString*)cdv_base64EncodedString;
    
### Upgrade Notes:

Plugin authors are encouraged to use the (iOS 7+) base64 encoding and decoding methods available in [NSData](https://developer.apple.com/library/ios/documentation/Cocoa/Reference/Foundation/Classes/NSData_Class/) instead.

    // Decode a Base64 encoded string
    NSData* data = [[NSData alloc] initWithBase64EncodedString:encodedString options:0]
    
    // Encode a string to Base64
    NSString* encodedString = [data base64EncodedStringWithOptions:0];

## CDVAppDelegate.h

This class is new. The default template's AppDelegate class inherits from this now for you to override.
    
### Upgrade Notes:

Apps that add code in the default template's old AppDelegate.m should add the appropriate function override in the new AppDelegate.m. Don't forget to call the superclass' implementation as well in your override.