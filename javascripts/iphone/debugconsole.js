
DebugConsole.prototype.log = function(message) {
    if (PhoneGap.available)
        PhoneGap.exec('DebugConsole.log', 'LOG', this.processMessage(message));
    else
        console.log(message);
};
DebugConsole.prototype.warn = function(message) {
    if (PhoneGap.available)
        PhoneGap.exec('DebugConsole.log', 'WARN', this.processMessage(message));
    else
        console.error(message);
};
DebugConsole.prototype.error = function(message) {
    if (PhoneGap.available)
        PhoneGap.exec('DebugConsole.log', 'ERROR', this.processMessage(message));
    else
        console.error(message);
};
