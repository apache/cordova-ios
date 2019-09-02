var cexec = require('cordova/exec');
var WkWebKit = {
    allowsBackForwardNavigationGestures: function (allow) {
        cexec(null, null, 'CDVWKWebViewEngine', 'allowsBackForwardNavigationGestures', [allow]);
    }
};

module.exports = WkWebKit;