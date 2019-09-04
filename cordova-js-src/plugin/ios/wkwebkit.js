var cexec = require('cordova/exec');
var WkWebKit = {
    allowsBackForwardNavigationGestures: function (allow) {
        cexec(null, null, 'CDVIOSWKWebViewEngine', 'allowsBackForwardNavigationGestures', [allow]);
    }
};

module.exports = WkWebKit;