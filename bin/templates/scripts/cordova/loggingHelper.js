var CordovaLogger = require('cordova-common').CordovaLogger;

module.exports = {
    adjustLoggerLevel: function (opts) {
        if (opts.verbose || (Array.isArray(opts) && opts.indexOf('--verbose') !== -1)) {
            CordovaLogger.get().setLevel('verbose');
        } else if (opts.silent || (Array.isArray(opts) && opts.indexOf('--silent') !== -1)) {
            CordovaLogger.get().setLevel('error');
        }
    }
};
