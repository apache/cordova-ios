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


### Removed:

Methods:

    + (NSData*)dataFromBase64String:(NSString*)aString CDV_DEPRECATED(3.8 .0, "Use cdv_dataFromBase64String");
    - (NSString*)base64EncodedString CDV_DEPRECATED(3.8 .0, "Use [NSData cdv_base64EncodedString]");
    + (NSData*)cdv_dataFromBase64String:(NSString*)aString;
    - (NSString*)cdv_base64EncodedString;
    
### Upgrade Notes:

Plugin authors are encouraged to use [NSJSONSerialization](https://developer.apple.com/library/ios/documentation/Foundation/Reference/NSJSONSerialization_Class/) instead.


