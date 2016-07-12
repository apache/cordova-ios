# Setting Delegates, Preferences and Script Message Handlers in the WebView

In cordova-ios-4.0, you would set the delegates of the webview through the `webViewEngine` property of a `CDVPlugin` or your `CDVViewController` subclass.

There are constants in the [`CDVWebViewEngineProtocol`](https://github.com/apache/cordova-ios/blob/master/CordovaLib/Classes/Public/CDVWebViewEngineProtocol.h#L22-L26) (which a webview-engine implements) that you can use to set the delegates and preferences. These values are the constants to be used when setting delegates or preferences in the UIWebView (default in cordova-ios-4.0) or the WKWebView (through installing the [cordova-plugin-wkwebview-engine](https://github.com/apache/cordova-plugin-wkwebview-engine) plugin). You can set one additional thing in the WKWebView, [script message handlers](https://developer.apple.com/library/ios/documentation/WebKit/Reference/WKScriptMessageHandler_Ref/).

For example, to set the `UIWebViewDelegate` in your plugin code:

```
// your UIWebViewDelegate implementation reference
id< UIWebViewDelegate > myUIWebViewDelegate; 

// set it
[self.webViewEngine updateWithInfo:@{
     kCDVWebViewEngineUIWebViewDelegate : myUIWebViewDelegate
}]
```

For example, to set the webview preferences  in your plugin code:

```
// put the preferences in a dictionary
NSDictionary* preferences = @{
    @"EnableViewPortScale" : @YES,
    @"AllowInlineMediaPlayback" : @NO
};

[self.webViewEngine updateWithInfo:@{
     kCDVWebViewEngineWebViewPreferences : preferences
}]
```
If you are using the [cordova-plugin-wkwebview-engine](https://github.com/apache/cordova-plugin-wkwebview-engine) plugin, you can add a [script message handler](https://developer.apple.com/library/ios/documentation/WebKit/Reference/WKScriptMessageHandler_Ref/):
```
// your WKScriptMessageHandler implementation references
id< WKScriptMessageHandler > foo; 
id< WKScriptMessageHandler > bar;

// put the handlers in a dictionary
NSDictionary* scriptMessageHandlers = @{
    @"foo" : foo,
    @"bar" : bar
};

[self.webViewEngine updateWithInfo:@{
     kCDVWebViewEngineScriptMessageHandlers : scriptMessageHandlers
}]
```




