Compass.prototype.start = function(args) {
    PhoneGap.exec("Location.startHeading", args);
};

Compass.prototype.stop = function() {
    PhoneGap.exec("Location.stopHeading");
};

