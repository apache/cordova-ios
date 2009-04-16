
DebugConsole.prototype.log = function(message) {
    if (PhoneGap.available)
        PhoneGap.exec('DebugConsole.log',
            this.processMessage(message),
            { logLevel: 'INFO' }
        );
    else
        console.log(message);
};
DebugConsole.prototype.warn = function(message) {
    if (PhoneGap.available)
        PhoneGap.exec('DebugConsole.log',
            this.processMessage(message),
            { logLevel: 'WARN' }
        );
    else
        console.error(message);
};
DebugConsole.prototype.error = function(message) {
    if (PhoneGap.available)
        PhoneGap.exec('DebugConsole.log',
            this.processMessage(message),
            { logLevel: 'ERROR' }
        );
    else
        console.error(message);
};
