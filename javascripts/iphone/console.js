
Console.prototype.log = function(message) {
    if (PhoneGap.available)
        PhoneGap.exec('Console.log', 'LOG', this.processMessage(message));
    else
        console.log(message);
};
Console.prototype.error = function(message) {
    if (PhoneGap.available)
        PhoneGap.exec('Console.log', 'ERR', this.processMessage(message));
    else
        console.error(message);
};
Console.prototype.alert = function(message, title, buttonLabel) {
    if (title == undefined || title == null)
        title = 'Alert';
    if (buttonLabel == undefined || buttonLabel == null)
        buttonLabel = 'OK';
    if (PhoneGap.available)
        PhoneGap.exec('Console.alert', message, title, buttonLabel);
    else
        alert(message);
}

Console.prototype.activityStart = function() {
    PhoneGap.exec("Console.activityStart");
};
Console.prototype.activityStop = function() {
    PhoneGap.exec("Console.activityStop");
};
