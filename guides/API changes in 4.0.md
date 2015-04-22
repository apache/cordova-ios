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
