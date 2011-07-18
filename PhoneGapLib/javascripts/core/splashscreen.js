if (!PhoneGap.hasResource("splashscreen")) {
	PhoneGap.addResource("splashscreen");

/**
 * This class provides access to the splashscreen
 */
SplashScreen = function() {
};

SplashScreen.prototype.show = function() {
    PhoneGap.exec(null, null, "com.phonegap.splashscreen", "show", []);
};

SplashScreen.prototype.hide = function() {
    PhoneGap.exec(null, null, "com.phonegap.splashscreen", "hide", []);
};

PhoneGap.addConstructor(function() {
    if (typeof navigator.splashscreen == "undefined") navigator.splashscreen = new SplashScreen();
});

};
