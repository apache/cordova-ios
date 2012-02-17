if (!Cordova.hasResource("splashscreen")) {
	Cordova.addResource("splashscreen");

/**
 * This class provides access to the splashscreen
 */
SplashScreen = function() {
};

SplashScreen.prototype.show = function() {
    Cordova.exec(null, null, "org.apache.cordova.splashscreen", "show", []);
};

SplashScreen.prototype.hide = function() {
    Cordova.exec(null, null, "org.apache.cordova.splashscreen", "hide", []);
};

Cordova.addConstructor(function() {
    if (typeof navigator.splashscreen == "undefined") navigator.splashscreen = new SplashScreen();
});

};
