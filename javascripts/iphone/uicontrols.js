
UIControls.prototype.alert = function(message, title, buttonLabel) {
    var options = {
        title: title,
        buttonLabel: buttonLabel
    };
    if (PhoneGap.available)
        PhoneGap.exec('UIControls.alert', message, options);
    else
        alert(message);
}

UIControls.prototype.activityStart = function() {
    PhoneGap.exec("UIControls.activityStart");
};
UIControls.prototype.activityStop = function() {
    PhoneGap.exec("UIControls.activityStop");
};
