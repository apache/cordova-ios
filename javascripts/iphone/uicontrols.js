
UIControls.prototype.alert = function(message, title, buttonLabel) {
    if (title == undefined || title == null)
        title = 'Alert';
    if (buttonLabel == undefined || buttonLabel == null)
        buttonLabel = 'OK';
    if (PhoneGap.available)
        PhoneGap.exec('UIControls.alert', message, title, buttonLabel);
    else
        alert(message);
}

UIControls.prototype.activityStart = function() {
    PhoneGap.exec("UIControls.activityStart");
};
UIControls.prototype.activityStop = function() {
    PhoneGap.exec("UIControls.activityStop");
};
