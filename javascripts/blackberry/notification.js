Notification.prototype.vibrate = function(mills) {
	PhoneGap.exec("notification/vibrate",[mills*1000]);
};
Notification.prototype.beep = function(count, volume) {
	PhoneGap.exec("notification/beep",[count]);
};